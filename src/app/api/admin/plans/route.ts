import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    await requireSuperAdmin();
    const plans = await db.plan.findMany({ orderBy: { order: "asc" } });
    return NextResponse.json({ plans });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireSuperAdmin();
    const body = await req.json();
    const plan = await db.plan.create({
      data: {
        name: body.name,
        description: body.description || "",
        monthlyPrice: Number(body.monthlyPrice),
        yearlyPrice: Number(body.yearlyPrice),
        maxEquipments: Number(body.maxEquipments || 10),
        maxUsers: Number(body.maxUsers || 5),
        features: JSON.stringify(body.features || []),
        highlighted: Boolean(body.highlighted),
        order: Number(body.order || 0),
        active: body.active !== false,
      },
    });
    return NextResponse.json({ plan });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
