import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireSuperAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    await requireSuperAdmin();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const where: any = {};
    if (status) where.status = status;

    const leads = await db.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ leads });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    if (e.message === "FORBIDDEN") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
