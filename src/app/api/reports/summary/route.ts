import { NextRequest, NextResponse } from "next/server";
import { requireCompanyUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { maintenanceStatus } from "@/lib/constants";

export async function GET(req: NextRequest) {
  try {
    const user = await requireCompanyUser();
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const equipmentId = searchParams.get("equipmentId");
    const operatorId = searchParams.get("operatorId");
    const source = searchParams.get("source");
    const reservoirId = searchParams.get("reservoirId");
    const origin = searchParams.get("origin");

    const refWhere: any = { companyId: user.companyId };
    if (startDate || endDate) {
      refWhere.refuelDate = {};
      if (startDate) refWhere.refuelDate.gte = new Date(startDate);
      if (endDate) refWhere.refuelDate.lte = new Date(endDate);
    }
    if (equipmentId) refWhere.equipmentId = equipmentId;
    if (operatorId) refWhere.operatorId = operatorId;
    if (source) refWhere.source = source;
    if (reservoirId) refWhere.reservoirId = reservoirId;
    if (origin === "company" || origin === "third_party") {
      refWhere.equipment = { origin };
    }

    const [refuelings, equipments, entries, expenses, maintenances] =
      await Promise.all([
        db.refueling.findMany({
          where: refWhere,
          include: { equipment: true, operator: true, reservoir: true },
          orderBy: { refuelDate: "desc" },
        }),
        db.equipment.findMany({
          where: { companyId: user.companyId },
          include: { maintenanceItems: true },
        }),
        db.fuelEntry.findMany({
          where: { companyId: user.companyId },
          include: { reservoir: true },
          orderBy: { entryDate: "desc" },
        }),
        db.expense.findMany({
          where: { companyId: user.companyId },
          include: { equipment: true },
          orderBy: { expenseDate: "desc" },
        }),
        db.maintenance.findMany({
          where: { companyId: user.companyId },
          include: { equipment: true },
          orderBy: { maintenanceDate: "desc" },
        }),
      ]);

    // Resumo
    const totalLiters = refuelings.reduce((s, r) => s + r.liters, 0);
    const totalCost = refuelings.reduce((s, r) => s + r.totalAmount, 0);
    const totalEntriesLiters = entries.reduce((s, e) => s + e.liters, 0);
    const totalEntriesCost = entries.reduce((s, e) => s + e.totalAmount, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const totalMaintenanceCost = maintenances.reduce((s, m) => s + m.cost, 0);

    // Consumo por equipamento
    const consumptionByEquipment = equipments.map((e) => {
      const refs = refuelings.filter((r) => r.equipmentId === e.id);
      const liters = refs.reduce((s, r) => s + r.liters, 0);
      const cost = refs.reduce((s, r) => s + r.totalAmount, 0);
      const withConsumption = refs.filter((r) => r.consumption != null);
      const avg =
        withConsumption.length > 0
          ? withConsumption.reduce((s, r) => s + (r.consumption || 0), 0) /
            withConsumption.length
          : null;
      return {
        equipmentId: e.id,
        name: e.name,
        type: e.type,
        origin: e.origin,
        controlType: e.controlType,
        liters,
        cost,
        avgConsumption: avg,
        refuelingCount: refs.length,
      };
    });

    // Abastecimentos por operador
    const byOperator = new Map<string, { liters: number; cost: number; count: number }>();
    for (const r of refuelings) {
      const op = r.operatorName;
      if (!byOperator.has(op)) byOperator.set(op, { liters: 0, cost: 0, count: 0 });
      const item = byOperator.get(op)!;
      item.liters += r.liters;
      item.cost += r.totalAmount;
      item.count += 1;
    }

    // Manutenções pendentes
    const maintenancePending: any[] = [];
    for (const e of equipments) {
      for (const item of e.maintenanceItems) {
        const status = maintenanceStatus(
          item.lastReading,
          e.currentReading,
          item.interval
        );
        if (status.level !== "ok") {
          maintenancePending.push({
            equipmentId: e.id,
            equipmentName: e.name,
            itemId: item.id,
            itemName: item.name,
            level: status.level,
            remaining: status.remaining,
            percent: status.percent,
            interval: item.interval,
            lastReading: item.lastReading,
            currentReading: e.currentReading,
            controlType: e.controlType,
          });
        }
      }
    }

    // Equipamentos por origem
    const companyEquip = equipments.filter((e) => e.origin === "company");
    const thirdPartyEquip = equipments.filter((e) => e.origin === "third_party");

    // Entradas vs Saídas por reservatório
    const reservoirs = await db.reservoir.findMany({
      where: { companyId: user.companyId },
    });
    const byReservoir = reservoirs.map((r) => {
      const refs = refuelings.filter((rf) => rf.reservoirId === r.id);
      const entrs = entries.filter((en) => en.reservoirId === r.id);
      const saidasLiters = refs.reduce((s, x) => s + x.liters, 0);
      const entradasLiters = entrs.reduce((s, x) => s + x.liters, 0);
      return {
        reservoirId: r.id,
        name: r.name,
        fuelType: r.fuelType,
        capacity: r.capacity,
        currentLevel: r.currentLevel,
        entradasLiters,
        saidasLiters,
        entradasCount: entrs.length,
        saidasCount: refs.length,
      };
    });

    return NextResponse.json({
      summary: {
        totalLiters,
        totalCost,
        totalEntriesLiters,
        totalEntriesCost,
        totalExpenses,
        totalMaintenanceCost,
        refuelingCount: refuelings.length,
        equipmentCount: equipments.length,
        companyEquipmentCount: companyEquip.length,
        thirdPartyEquipmentCount: thirdPartyEquip.length,
      },
      consumptionByEquipment,
      byOperator: Array.from(byOperator.entries()).map(([name, v]) => ({
        name,
        ...v,
      })),
      maintenancePending,
      maintenanceDone: maintenances,
      byReservoir,
      companyEquipment: companyEquip,
      thirdPartyEquipment: thirdPartyEquip,
      refuelings,
      entries,
      expenses,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
