import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireCompanyUser, requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { DEFAULT_MAINTENANCE_ITEMS } from "@/lib/constants";
import { saveUpload } from "@/lib/upload";

const schema = z.object({
  name: z.string().min(2),
  type: z.enum(["truck", "light_vehicle", "heavy_machine", "other"]),
  plate: z.string().optional().nullable(),
  assetNumber: z.string().optional().nullable(),
  value: z.number().optional().nullable(),
  photo: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  origin: z.enum(["company", "third_party"]),
  ownerName: z.string().optional().nullable(),
  controlType: z.enum(["hours", "km"]),
  initialReading: z.number().default(0),
  maintenanceItems: z
    .array(
      z.object({
        name: z.string(),
        interval: z.number(),
        lastReading: z.number().default(0),
      })
    )
    .optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (user.role === "super_admin") {
      // Admin vê todos
      const { searchParams } = new URL(req.url);
      const companyId = searchParams.get("companyId");
      const where: any = {};
      if (companyId) where.companyId = companyId;
      const equipments = await db.equipment.findMany({
        where,
        include: { company: true },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ equipments });
    }
    if (!user.companyId) {
      return NextResponse.json({ error: "Sem empresa vinculada" }, { status: 400 });
    }
    const { searchParams } = new URL(req.url);
    const origin = searchParams.get("origin");
    const type = searchParams.get("type");
    const where: any = { companyId: user.companyId };
    if (origin) where.origin = origin;
    if (type) where.type = type;

    const equipments = await db.equipment.findMany({
      where,
      include: { maintenanceItems: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ equipments });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED")
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireCompanyUser();
    const body = await req.json();

    // Suporta foto como base64 ou URL
    let photoUrl: string | null = null;
    if (body.photoBase64) {
      // Salva base64 como arquivo
      const matches = body.photoBase64.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        const ext = matches[1].includes("png") ? "png" : "jpg";
        const buffer = Buffer.from(matches[2], "base64");
        const { randomUUID } = await import("crypto");
        const { promises: fs } = await import("fs");
        const path = await import("path");
        const dir = path.join(process.cwd(), "public", "uploads", "equipments");
        await fs.mkdir(dir, { recursive: true });
        const filename = `${randomUUID()}.${ext}`;
        await fs.writeFile(path.join(dir, filename), buffer);
        photoUrl = `/uploads/equipments/${filename}`;
      }
    } else if (typeof body.photo === "string") {
      photoUrl = body.photo;
    }

    const data = schema.parse({ ...body, photo: photoUrl });

    // Limites do plano
    const company = await db.company.findUnique({
      where: { id: user.companyId },
      include: { plan: true },
    });
    if (!company) {
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
    }

    const count = await db.equipment.count({
      where: { companyId: user.companyId },
    });
    const max = company.plan?.maxEquipments ?? 999;
    if (count >= max) {
      return NextResponse.json(
        { error: `Limite de equipamentos do plano atingido (${max}).` },
        { status: 403 }
      );
    }

    const equipment = await db.equipment.create({
      data: {
        companyId: user.companyId,
        name: data.name,
        type: data.type,
        plate: data.plate || null,
        assetNumber: data.assetNumber || null,
        value: data.value ?? null,
        photo: photoUrl,
        notes: data.notes || null,
        origin: data.origin,
        ownerName: data.ownerName || null,
        controlType: data.controlType,
        initialReading: data.initialReading,
        currentReading: data.initialReading,
      },
    });

    // Cria itens de manutenção padrão + personalizados
    const itemsToCreate = data.maintenanceItems && data.maintenanceItems.length > 0
      ? data.maintenanceItems
      : DEFAULT_MAINTENANCE_ITEMS.map((item) => ({
          name: item.name,
          interval: item.defaultInterval,
          lastReading: data.initialReading,
        }));

    await db.maintenanceItem.createMany({
      data: itemsToCreate.map((item) => ({
        equipmentId: equipment.id,
        name: item.name,
        interval: item.interval,
        lastReading: item.lastReading || data.initialReading,
      })),
    });

    // Log
    await db.auditLog.create({
      data: {
        userId: user.id,
        companyId: user.companyId,
        action: "create",
        entity: "equipment",
        entityId: equipment.id,
        details: `Equipamento ${equipment.name} criado`,
      },
    });

    const full = await db.equipment.findUnique({
      where: { id: equipment.id },
      include: { maintenanceItems: true },
    });
    return NextResponse.json({ equipment: full });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
