// Helper para gerenciar alertas (estoque baixo + manutenção)
import { db } from "@/lib/db";
import { maintenanceStatus } from "@/lib/constants";

export async function createAlert(data: {
  companyId: string;
  equipmentId?: string;
  reservoirId?: string;
  type: "maintenance" | "stock" | "system";
  level: "info" | "warning" | "danger";
  title: string;
  message: string;
}) {
  // Verifica se já existe alerta ativo similar (para não duplicar)
  const existing = await db.alert.findFirst({
    where: {
      companyId: data.companyId,
      equipmentId: data.equipmentId || undefined,
      reservoirId: data.reservoirId || undefined,
      type: data.type,
      level: data.level,
      status: "active",
    },
  });

  if (existing) {
    // Atualiza mensagem e mantém
    return db.alert.update({
      where: { id: existing.id },
      data: { title: data.title, message: data.message },
    });
  }

  return db.alert.create({ data: { ...data, status: "active" } });
}

export async function checkAlerts(companyId: string) {
  // 1. Alertas de estoque baixo
  const reservoirs = await db.reservoir.findMany({
    where: { companyId, active: true },
  });

  for (const r of reservoirs) {
    const minLiters =
      r.minLevelType === "percent"
        ? (r.capacity * r.minLevel) / 100
        : r.minLevel;

    if (r.currentLevel < minLiters) {
      await createAlert({
        companyId,
        reservoirId: r.id,
        type: "stock",
        level: "danger",
        title: `Estoque baixo: ${r.name}`,
        message: `${r.currentLevel.toFixed(0)} L disponíveis (mínimo ${minLiters.toFixed(0)} L)`,
      });
    } else {
      // Remove alertas de estoque ativos se já não está baixo
      await db.alert.updateMany({
        where: {
          companyId,
          reservoirId: r.id,
          type: "stock",
          status: "active",
        },
        data: { status: "dismissed" },
      });
    }
  }

  // 2. Alertas de manutenção
  const equipments = await db.equipment.findMany({
    where: { companyId, active: true },
    include: { maintenanceItems: true },
  });

  for (const e of equipments) {
    for (const item of e.maintenanceItems) {
      const status = maintenanceStatus(
        item.lastReading,
        e.currentReading,
        item.interval
      );
      if (status.level === "ok") continue;

      await createAlert({
        companyId,
        equipmentId: e.id,
        type: "maintenance",
        level: status.level === "danger" ? "danger" : "warning",
        title: `${item.name}: ${e.name}`,
        message:
          status.level === "danger"
            ? `Vencido há ${Math.abs(status.remaining).toFixed(0)} ${
                e.controlType === "hours" ? "h" : "km"
              }. Última: ${item.lastReading.toFixed(0)}.`
            : `Faltam ${status.remaining.toFixed(0)} ${
                e.controlType === "hours" ? "h" : "km"
              } para ${item.name}.`,
      });
    }
  }
}
