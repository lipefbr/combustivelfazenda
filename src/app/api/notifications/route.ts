import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await requireAuth();
    if (user.role === "super_admin") {
      return NextResponse.json({ notifications: [] });
    }
    const notifications = await db.notification.findMany({
      where: {
        companyId: user.companyId,
        OR: [{ userId: null }, { userId: user.id }],
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ notifications });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
