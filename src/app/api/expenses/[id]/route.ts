import { NextRequest, NextResponse } from "next/server";
import { requireCompanyUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireCompanyUser();
    const { id } = await params;
    const e = await db.expense.findUnique({ where: { id } });
    if (!e || e.companyId !== user.companyId) {
      return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    }
    await db.expense.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
