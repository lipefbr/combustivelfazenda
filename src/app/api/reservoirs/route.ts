import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireCompanyUser, requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({
  name: z.string().min(2),
  capacity: z.number().positive(),
  fuelType: z.string(),
  currentLevel: z.number().default(0),
  minLevel: z.number().default(0),
  minLevelType: z.enum(["liters", "percent"]).default("liters"),
  notes: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const user = await requireAuth();
    if (user.role === "super_admin") {
      const reservoirs = await db.reservoir.findMany({
        include: { company: true },
        orderBy: { name: "asc" },
      });
      return NextResponse.json({ reservoirs });
    }
    if (!user.companyId) {
      return NextResponse.json({ error: "Sem empresa" }, { status: 400 });
    }
    const reservoirs = await db.reservoir.findMany({
      where: { companyId: user.companyId },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ reservoirs });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireCompanyUser();
    const body = await req.json();
    const data = schema.parse(body);

    const reservoir = await db.reservoir.create({
      data: {
        companyId: user.companyId,
        name: data.name,
        capacity: data.capacity,
        fuelType: data.fuelType,
        currentLevel: data.currentLevel,
        minLevel: data.minLevel,
        minLevelType: data.minLevelType,
        notes: data.notes,
      },
    });

    await db.auditLog.create({
      data: {
        userId: user.id,
        companyId: user.companyId,
        action: "create",
        entity: "reservoir",
        entityId: reservoir.id,
        details: `Reservatório ${reservoir.name} criado`,
      },
    });

    return NextResponse.json({ reservoir });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
