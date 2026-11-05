import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSuperAdmin, hashPassword } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();
    const { id } = await params;
    const body = await req.json();
    const data = z
      .object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        role: z.enum(["manager", "operator", "super_admin"]).optional(),
        active: z.boolean().optional(),
        password: z.string().optional(),
        companyId: z.string().optional().nullable(),
      })
      .parse(body);

    const update: any = {};
    if (data.name) update.name = data.name;
    if (data.email) update.email = data.email.toLowerCase();
    if (data.phone !== undefined) update.phone = data.phone;
    if (data.role) {
      update.role = data.role;
      if (data.role === "super_admin") update.companyId = null;
    }
    if (data.active !== undefined) update.active = data.active;
    if (data.companyId !== undefined) update.companyId = data.companyId;
    if (data.password) update.passwordHash = await hashPassword(data.password);

    const user = await db.user.update({ where: { id }, data: update, include: { company: true } });
    return NextResponse.json({ user });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();
    const { id } = await params;
    await db.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
