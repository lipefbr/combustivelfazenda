import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSuperAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();
    const { id } = await params;
    const company = await db.company.findUnique({
      where: { id },
      include: {
        plan: true,
        subscription: { include: { plan: true, payments: true } },
        users: true,
        equipments: { include: { maintenanceItems: true } },
        reservoirs: true,
        _count: {
          select: { refuelings: true, maintenances: true, expenses: true },
        },
      },
    });
    if (!company) return NextResponse.json({ error: "Não encontrada" }, { status: 404 });
    return NextResponse.json({ company });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();
    const { id } = await params;
    const body = await req.json();
    const data = z
      .object({
        name: z.string().optional(),
        responsibleName: z.string().optional(),
        email: z.string().email().optional(),
        whatsapp: z.string().optional(),
        phone: z.string().optional(),
        document: z.string().optional().nullable(),
        status: z.enum(["trial", "active", "overdue", "blocked"]).optional(),
        planId: z.string().optional().nullable(),
        trialEndsAt: z.string().optional().nullable(),
      })
      .parse(body);

    const update: any = { ...data };
    if (data.trialEndsAt) {
      update.trialEndsAt = data.trialEndsAt === "" ? null : new Date(data.trialEndsAt);
    }

    const company = await db.company.update({ where: { id }, data: update });
    return NextResponse.json({ company });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();
    const { id } = await params;
    await db.company.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
