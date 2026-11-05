import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireManager } from "@/lib/auth";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireManager();
    const { id } = await params;
    const target = await db.user.findUnique({ where: { id } });
    if (!target || target.companyId !== user.companyId) {
      return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    }

    const body = await req.json();
    const data = z
      .object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        role: z.enum(["manager", "operator"]).optional(),
        active: z.boolean().optional(),
        password: z.string().optional(),
      })
      .parse(body);

    const update: any = {};
    if (data.name) update.name = data.name;
    if (data.email) update.email = data.email.toLowerCase();
    if (data.phone !== undefined) update.phone = data.phone;
    if (data.role && target.id !== user.id) update.role = data.role;
    if (data.active !== undefined && target.id !== user.id)
      update.active = data.active;
    if (data.password) update.passwordHash = await hashPassword(data.password);

    const updated = await db.user.update({ where: { id }, data: update });
    return NextResponse.json({ user: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireManager();
    const { id } = await params;
    const target = await db.user.findUnique({ where: { id } });
    if (!target || target.companyId !== user.companyId) {
      return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    }
    if (target.id === user.id) {
      return NextResponse.json(
        { error: "Você não pode excluir a si mesmo" },
        { status: 400 }
      );
    }
    await db.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
