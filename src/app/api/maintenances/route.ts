import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, requireCompanyUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkAlerts } from "@/lib/alerts";

const schema = z.object({
  equipmentId: z.string(),
  itemId: z.string().optional().nullable(),
  itemName: z.string(),
  cost: z.number().default(0),
  readingAtMaintenance: z.number(),
  shopOrResponsible: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  photo: z.string().optional().nullable(),
  maintenanceDate: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const equipmentId = searchParams.get("equipmentId");

    const where: any = {};
    if (user.role !== "super_admin") {
      where.companyId = user.companyId;
    } else if (searchParams.get("companyId")) {
      where.companyId = searchParams.get("companyId")!;
    }
    if (equipmentId) where.equipmentId = equipmentId;

    const maintenances = await db.maintenance.findMany({
      where,
      include: { equipment: true, performedBy: true },
      orderBy: { maintenanceDate: "desc" },
      take: 500,
    });
    return NextResponse.json({ maintenances });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireCompanyUser();
    const body = await req.json();
    const data = schema.parse(body);

    const equipment = await db.equipment.findUnique({
      where: { id: data.equipmentId },
      include: { maintenanceItems: true },
    });
    if (!equipment || equipment.companyId !== user.companyId) {
      return NextResponse.json({ error: "Equipamento inválido" }, { status: 400 });
    }

    const maintenanceDate = data.maintenanceDate
      ? new Date(data.maintenanceDate)
      : new Date();

    const maintenance = await db.maintenance.create({
      data: {
        companyId: user.companyId,
        equipmentId: data.equipmentId,
        itemId: data.itemId || null,
        itemName: data.itemName,
        performedById: user.id,
        cost: data.cost,
        readingAtMaintenance: data.readingAtMaintenance,
        shopOrResponsible: data.shopOrResponsible,
        notes: data.notes,
        photo: data.photo,
        maintenanceDate,
      },
    });

    // Zera o contador do item
    if (data.itemId) {
      await db.maintenanceItem.update({
        where: { id: data.itemId },
        data: { lastReading: data.readingAtMaintenance },
      });
    } else {
      // Tenta achar por nome
      const item = equipment.maintenanceItems.find(
        (i) => i.name.toLowerCase() === data.itemName.toLowerCase()
      );
      if (item) {
        await db.maintenanceItem.update({
          where: { id: item.id },
          data: { lastReading: data.readingAtMaintenance },
        });
      }
    }

    // Atualiza leitura atual do equipamento (se a leitura informada for maior)
    if (data.readingAtMaintenance > equipment.currentReading) {
      await db.equipment.update({
        where: { id: data.equipmentId },
        data: { currentReading: data.readingAtMaintenance },
      });
    }

    // Reavalia alertas
    await checkAlerts(user.companyId);

    return NextResponse.json({ maintenance });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
