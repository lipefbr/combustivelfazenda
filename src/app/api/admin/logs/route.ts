import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    await requireSuperAdmin();
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const limit = Number(searchParams.get("limit") || 100);

    const where: any = {};
    if (action) where.action = action;

    const logs = await db.auditLog.findMany({
      where,
      include: { user: true, company: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ logs });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
