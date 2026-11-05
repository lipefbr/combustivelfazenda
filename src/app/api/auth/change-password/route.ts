import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, hashPassword, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8, "Nova senha deve ter no mínimo 8 caracteres"),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const data = schema.safeParse(body);
    if (!data.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const u = await db.user.findUnique({ where: { id: user.id } });
    if (!u) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    const ok = await verifyPassword(data.data.currentPassword, u.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 });
    }

    const newHash = await hashPassword(data.data.newPassword);
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash, forcePasswordChange: false },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
