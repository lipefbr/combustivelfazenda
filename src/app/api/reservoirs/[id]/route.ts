import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireCompanyUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireCompanyUser();
    const { id } = await params;
    const reservoir = await db.reservoir.findUnique({
      where: { id },
      include: {
        fuelEntries: { orderBy: { entryDate: "desc" }, take: 50 },
        refuelings: {
          orderBy: { refuelDate: "desc" },
          take: 50,
        },
      },
    });
    if (!reservoir || reservoir.companyId !== user.companyId) {
      return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    }
    return NextResponse.json({ reservoir });
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
    const r = await db.reservoir.findUnique({ where: { id } });
    if (!r || r.companyId !== user.companyId) {
      return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    }

    const body = await req.json();
    const data = z
      .object({
        name: z.string().optional(),
        capacity: z.number().positive().optional(),
        fuelType: z.string().optional(),
        currentLevel: z.number().optional(),
        minLevel: z.number().optional(),
        minLevelType: z.enum(["liters", "percent"]).optional(),
        notes: z.string().optional().nullable(),
        active: z.boolean().optional(),
      })
      .parse(body);

    const reservoir = await db.reservoir.update({ where: { id }, data });
    return NextResponse.json({ reservoir });
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
    const r = await db.reservoir.findUnique({ where: { id } });
    if (!r || r.companyId !== user.companyId) {
      return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    }
    await db.reservoir.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
