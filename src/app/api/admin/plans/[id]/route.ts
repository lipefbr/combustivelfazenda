import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();
    const { id } = await params;
    const body = await req.json();

    const plan = await db.plan.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        monthlyPrice: Number(body.monthlyPrice),
        yearlyPrice: Number(body.yearlyPrice),
        maxEquipments: Number(body.maxEquipments),
        maxUsers: Number(body.maxUsers),
        features: JSON.stringify(body.features || []),
        highlighted: Boolean(body.highlighted),
        order: Number(body.order),
        active: body.active,
      },
    });
    return NextResponse.json({ plan });
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
    await db.plan.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
