import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    await requireSuperAdmin();

    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    // Cards
    const [companies, users, equipments, monthRefuelings, expensesMonth, leadsNew, activeCompanies] =
      await Promise.all([
        db.company.count(),
        db.user.count({ where: { role: { not: "super_admin" } } }),
        db.equipment.count(),
        db.refueling.findMany({
          where: { refuelDate: { gte: firstOfMonth, lte: lastOfMonth } },
        }),
        db.expense.aggregate({
          _sum: { amount: true },
          where: { expenseDate: { gte: firstOfMonth, lte: lastOfMonth } },
        }),
        db.lead.count({ where: { status: "new" } }),
        db.company.count({ where: { status: "active" } }),
      ]);

    const litersMonth = monthRefuelings.reduce((s, r) => s + r.liters, 0);
    const costMonth = monthRefuelings.reduce((s, r) => s + r.totalAmount, 0) +
      (expensesMonth._sum.amount || 0);

    // Receita recorrente (somatório das assinaturas ativas)
    const subs = await db.subscription.findMany({
      where: { status: "active" },
      include: { plan: true },
    });
    const recurringRevenue = subs.reduce(
      (s, sub) => s + (sub.plan?.monthlyPrice || 0),
      0
    );

    // Consumo mensal últimos 12 meses (todas as empresas)
    const refuelings12 = await db.refueling.findMany({
      where: { refuelDate: { gte: twelveMonthsAgo } },
      select: { liters: true, totalAmount: true, refuelDate: true, companyId: true },
    });
    const monthlyData: { month: string; liters: number; cost: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const dStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const dEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const monthLabel = dStart.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
      const refsInMonth = refuelings12.filter((r) => r.refuelDate >= dStart && r.refuelDate <= dEnd);
      monthlyData.push({
        month: monthLabel,
        liters: refsInMonth.reduce((s, r) => s + r.liters, 0),
        cost: refsInMonth.reduce((s, r) => s + r.totalAmount, 0),
      });
    }

    // Top 10 empresas por consumo (litros do mês)
    const companiesWithConsumption = new Map();
    for (const r of monthRefuelings) {
      if (!companiesWithConsumption.has(r.companyId)) {
        companiesWithConsumption.set(r.companyId, {
          companyId: r.companyId,
          liters: 0,
          cost: 0,
          refuelings: 0,
        });
      }
      const item = companiesWithConsumption.get(r.companyId);
      item.liters += r.liters;
      item.cost += r.totalAmount;
      item.refuelings += 1;
    }
    const topCompaniesIds = Array.from(companiesWithConsumption.values())
      .sort((a, b) => b.liters - a.liters)
      .slice(0, 10);
    const topCompaniesInfo = await db.company.findMany({
      where: { id: { in: topCompaniesIds.map((c) => c.companyId) } },
    });
    const topCompanies = topCompaniesIds.map((c) => {
      const info = topCompaniesInfo.find((x) => x.id === c.companyId);
      return { ...c, companyName: info?.name || "—" };
    });

    // Top 10 equipamentos por consumo
    const equipConsumption = new Map();
    for (const r of monthRefuelings) {
      if (!equipConsumption.has(r.equipmentId)) {
        equipConsumption.set(r.equipmentId, {
          equipmentId: r.equipmentId,
          liters: 0,
          cost: 0,
          refuelings: 0,
        });
      }
      const item = equipConsumption.get(r.equipmentId);
      item.liters += r.liters;
      item.cost += r.totalAmount;
      item.refuelings += 1;
    }
    const topEquipIds = Array.from(equipConsumption.values())
      .sort((a, b) => b.liters - a.liters)
      .slice(0, 10);
    const topEquipInfo = await db.equipment.findMany({
      where: { id: { in: topEquipIds.map((e) => e.equipmentId) } },
    });
    const topEquipments = topEquipIds.map((e) => {
      const info = topEquipInfo.find((x) => x.id === e.equipmentId);
      return { ...e, equipmentName: info?.name || "—" };
    });

    // Cadastros por mês (últimos 12)
    const registrations = await db.company.findMany({
      where: { createdAt: { gte: twelveMonthsAgo } },
      select: { createdAt: true },
    });
    const registrationData: { month: string; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const dStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const dEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const count = registrations.filter(
        (c) => c.createdAt >= dStart && c.createdAt <= dEnd
      ).length;
      registrationData.push({
        month: dStart.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
        count,
      });
    }

    // Alertas globais
    const [stockAlerts, maintenanceAlerts] = await Promise.all([
      db.alert.count({ where: { type: "stock", status: "active" } }),
      db.alert.count({ where: { type: "maintenance", status: "active" } }),
    ]);

    return NextResponse.json({
      cards: {
        companies,
        activeCompanies,
        users,
        equipments,
        litersMonth,
        costMonth,
        recurringRevenue,
        leadsNew,
      },
      monthlyData,
      topCompanies,
      topEquipments,
      registrationData,
      alerts: { stock: stockAlerts, maintenance: maintenanceAlerts },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
