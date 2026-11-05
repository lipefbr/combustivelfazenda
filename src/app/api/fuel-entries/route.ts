import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireCompanyUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { createAlert, checkAlerts } from "@/lib/alerts";

const schema = z.object({
  reservoirId: z.string(),
  liters: z.number().positive(),
  pricePerLiter: z.number().positive(),
  totalAmount: z.number().optional(),
  supplier: z.string().optional(),
  invoiceNumber: z.string().optional(),
  invoicePhoto: z.string().optional().nullable(),
  entryDate: z.string().optional(),
  notes: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireCompanyUser();
    const { searchParams } = new URL(req.url);
    const reservoirId = searchParams.get("reservoirId");

    const where: any = { companyId: user.companyId };
    if (reservoirId) where.reservoirId = reservoirId;

    const entries = await db.fuelEntry.findMany({
      where,
      include: { reservoir: true },
      orderBy: { entryDate: "desc" },
      take: 200,
    });
    return NextResponse.json({ entries });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireCompanyUser();
    const body = await req.json();
    const data = schema.parse(body);

    const reservoir = await db.reservoir.findUnique({
      where: { id: data.reservoirId },
    });
    if (!reservoir || reservoir.companyId !== user.companyId) {
      return NextResponse.json({ error: "Reservatório inválido" }, { status: 400 });
    }

    const total = data.totalAmount || data.liters * data.pricePerLiter;
    const entryDate = data.entryDate ? new Date(data.entryDate) : new Date();

    // Cria a entrada
    const entry = await db.fuelEntry.create({
      data: {
        companyId: user.companyId,
        reservoirId: data.reservoirId,
        liters: data.liters,
        pricePerLiter: data.pricePerLiter,
        totalAmount: total,
        supplier: data.supplier || null,
        invoiceNumber: data.invoiceNumber || null,
        invoicePhoto: data.invoicePhoto || null,
        entryDate,
        notes: data.notes,
      },
    });

    // Atualiza nível do reservatório
    const newLevel = reservoir.currentLevel + data.liters;
    await db.reservoir.update({
      where: { id: data.reservoirId },
      data: { currentLevel: newLevel },
    });

    // Reavalia alertas de estoque (se estava abaixo, agora pode estar ok)
    await checkAlerts(user.companyId);

    await db.auditLog.create({
      data: {
        userId: user.id,
        companyId: user.companyId,
        action: "create",
        entity: "fuel_entry",
        entityId: entry.id,
        details: `Entrada de ${data.liters} L no reservatório ${reservoir.name}`,
      },
    });

    return NextResponse.json({ entry, newLevel });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
