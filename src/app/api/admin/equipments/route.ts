import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    await requireSuperAdmin();
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    const where: any = {};
    if (companyId) where.companyId = companyId;

    const equipments = await db.equipment.findMany({
      where,
      include: { company: true },
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    return NextResponse.json({ equipments });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
