import { NextRequest, NextResponse } from "next/server";
import { requireCompanyUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { maintenanceStatus } from "@/lib/constants";

export async function GET() {
  try {
    const user = await requireCompanyUser();

    const now = new Date();
    // "Mês" = últimos 30 dias (igual ao gráfico), para manter consistência visual
    const firstOfMonth = new Date(now);
    firstOfMonth.setDate(now.getDate() - 30);
    const lastOfMonth = now;

    // Busca todos os dados necessários em paralelo
    const [reservoirs, refuelingsMonth, refuelingsAll, equipments, expensesMonth, maintenances, alerts] =
      await Promise.all([
        db.reservoir.findMany({
          where: { companyId: user.companyId },
          orderBy: { name: "asc" },
        }),
        db.refueling.findMany({
          where: {
            companyId: user.companyId,
            refuelDate: { gte: firstOfMonth, lte: lastOfMonth },
          },
          include: { equipment: true, operator: true },
          orderBy: { refuelDate: "desc" },
        }),
        db.refueling.findMany({
          where: { companyId: user.companyId },
          orderBy: { refuelDate: "desc" },
          take: 5,
          include: { equipment: true, operator: true },
        }),
        db.equipment.findMany({
          where: { companyId: user.companyId },
          include: { maintenanceItems: true },
        }),
        db.expense.aggregate({
          _sum: { amount: true },
          where: {
            companyId: user.companyId,
            expenseDate: { gte: firstOfMonth, lte: lastOfMonth },
          },
        }),
        db.maintenance.findMany({
          where: { companyId: user.companyId },
          orderBy: { maintenanceDate: "desc" },
          take: 5,
          include: { equipment: true },
        }),
        db.alert.findMany({
          where: { companyId: user.companyId, status: "active" },
          include: { equipment: true, reservoir: true },
          orderBy: { createdAt: "desc" },
        }),
      ]);

    // Cards do dashboard
    const totalStock = reservoirs.reduce((s, r) => s + r.currentLevel, 0);
    const litersMonth = refuelingsMonth.reduce((s, r) => s + r.liters, 0);
    const costMonth =
      refuelingsMonth.reduce((s, r) => s + r.totalAmount, 0) +
      (expensesMonth._sum.amount || 0);

    // Manutenções pendentes
    const maintenanceAlerts: any[] = [];
    for (const e of equipments) {
      for (const item of e.maintenanceItems) {
        const status = maintenanceStatus(
          item.lastReading,
          e.currentReading,
          item.interval
        );
        if (status.level !== "ok") {
          maintenanceAlerts.push({
            equipmentId: e.id,
            equipmentName: e.name,
            itemId: item.id,
            itemName: item.name,
            level: status.level,
            remaining: status.remaining,
            percent: status.percent,
            currentReading: e.currentReading,
            controlType: e.controlType,
          });
        }
      }
    }

    // Consumo por equipamento
    const consumptionByEquipment = equipments.map((e) => {
      const refs = refuelingsMonth.filter((r) => r.equipmentId === e.id);
      const liters = refs.reduce((s, r) => s + r.liters, 0);
      const cost = refs.reduce((s, r) => s + r.totalAmount, 0);
      // Calcula consumo médio
      const withConsumption = refs.filter((r) => r.consumption != null);
      const avgConsumption =
        withConsumption.length > 0
          ? withConsumption.reduce((s, r) => s + (r.consumption || 0), 0) /
            withConsumption.length
          : null;
      return {
        equipmentId: e.id,
        name: e.name,
        type: e.type,
        controlType: e.controlType,
        liters,
        cost,
        avgConsumption,
        refuelingCount: refs.length,
      };
    });

    return NextResponse.json({
      cards: {
        totalStock,
        litersMonth,
        costMonth,
        activeAlertsCount: alerts.length,
        equipmentCount: equipments.length,
        reservoirCount: reservoirs.length,
      },
      reservoirs,
      recentRefuelings: refuelingsAll,
      monthRefuelings: refuelingsMonth,
      maintenanceAlerts,
      alerts,
      consumptions: consumptionByEquipment,
      recentMaintenances: maintenances,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
