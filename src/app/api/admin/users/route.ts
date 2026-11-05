import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSuperAdmin, hashPassword } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    await requireSuperAdmin();
    const users = await db.user.findMany({
      include: { company: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ users });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  role: z.enum(["manager", "operator", "super_admin"]).default("operator"),
  companyId: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    await requireSuperAdmin();
    const body = await req.json();
    const data = schema.parse(body);

    const existing = await db.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 400 });
    }

    const passwordHash = await hashPassword(data.password);
    const user = await db.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash,
        phone: data.phone,
        role: data.role,
        companyId: data.role === "super_admin" ? null : data.companyId,
      },
      include: { company: true },
    });

    return NextResponse.json({ user });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
