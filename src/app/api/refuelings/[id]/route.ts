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
    const ref = await db.refueling.findUnique({
      where: { id },
      include: { reservoir: true },
    });
    if (!ref || ref.companyId !== user.companyId) {
      return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    }

    if (ref.source === "reservoir" && ref.reservoirId) {
      const r = await db.reservoir.findUnique({ where: { id: ref.reservoirId } });
      if (r) {
        await db.reservoir.update({
          where: { id: r.id },
          data: { currentLevel: r.currentLevel + ref.liters },
        });
      }
    }

    await db.refueling.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
