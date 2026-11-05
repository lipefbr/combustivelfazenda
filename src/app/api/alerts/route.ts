import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await requireAuth();
    if (user.role === "super_admin") {
      const alerts = await db.alert.findMany({
        where: { status: "active" },
        include: { equipment: true, reservoir: true, company: true },
        orderBy: { createdAt: "desc" },
        take: 200,
      });
      return NextResponse.json({ alerts });
    }
    const alerts = await db.alert.findMany({
      where: { companyId: user.companyId, status: "active" },
      include: { equipment: true, reservoir: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ alerts });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
