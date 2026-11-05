import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, requireCompanyUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const equipment = await db.equipment.findUnique({
      where: { id },
      include: {
        maintenanceItems: true,
        refuelings: {
          orderBy: { refuelDate: "desc" },
          take: 50,
        },
        maintenances: {
          orderBy: { maintenanceDate: "desc" },
          take: 50,
        },
      },
    });

    if (!equipment) {
      return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    }

    if (user.role !== "super_admin" && equipment.companyId !== user.companyId) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    return NextResponse.json({ equipment });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireCompanyUser();
    const { id } = await params;
    const equipment = await db.equipment.findUnique({ where: { id } });
    if (!equipment || equipment.companyId !== user.companyId) {
      return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    }

    const body = await req.json();
    const data = z
      .object({
        name: z.string().optional(),
        type: z.enum(["truck", "light_vehicle", "heavy_machine", "other"]).optional(),
        plate: z.string().optional().nullable(),
        assetNumber: z.string().optional().nullable(),
        value: z.number().optional().nullable(),
        photo: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
        origin: z.enum(["company", "third_party"]).optional(),
        ownerName: z.string().optional().nullable(),
        controlType: z.enum(["hours", "km"]).optional(),
        currentReading: z.number().optional(),
        active: z.boolean().optional(),
        maintenanceItems: z
          .array(
            z.object({
              id: z.string().optional(),
              name: z.string(),
              interval: z.number(),
              lastReading: z.number().default(0),
            })
          )
          .optional(),
      })
      .parse(body);

    const updated = await db.equipment.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        plate: data.plate,
        assetNumber: data.assetNumber,
        value: data.value,
        photo: data.photo,
        notes: data.notes,
        origin: data.origin,
        ownerName: data.ownerName,
        controlType: data.controlType,
        currentReading: data.currentReading,
        active: data.active,
      },
    });

    if (data.maintenanceItems) {
      for (const item of data.maintenanceItems) {
        if (item.id) {
          await db.maintenanceItem.update({
            where: { id: item.id },
            data: {
              name: item.name,
              interval: item.interval,
              lastReading: item.lastReading,
            },
          });
        } else {
          await db.maintenanceItem.create({
            data: {
              equipmentId: id,
              name: item.name,
              interval: item.interval,
              lastReading: item.lastReading,
            },
          });
        }
      }
    }

    await db.auditLog.create({
      data: {
        userId: user.id,
        companyId: user.companyId,
        action: "update",
        entity: "equipment",
        entityId: id,
        details: `Equipamento ${updated.name} atualizado`,
      },
    });

    const full = await db.equipment.findUnique({
      where: { id },
      include: { maintenanceItems: true },
    });
    return NextResponse.json({ equipment: full });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireCompanyUser();
    const { id } = await params;
    const equipment = await db.equipment.findUnique({ where: { id } });
    if (!equipment || equipment.companyId !== user.companyId) {
      return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    }

    await db.equipment.delete({ where: { id } });
    await db.auditLog.create({
      data: {
        userId: user.id,
        companyId: user.companyId,
        action: "delete",
        entity: "equipment",
        entityId: id,
        details: `Equipamento ${equipment.name} removido`,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
