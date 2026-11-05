import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireManager, hashPassword } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await requireManager();
    const users = await db.user.findMany({
      where: { companyId: user.companyId },
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
  role: z.enum(["manager", "operator"]).default("operator"),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireManager();
    const body = await req.json();
    const data = schema.parse(body);

    // Limite do plano
    const company = await db.company.findUnique({
      where: { id: user.companyId },
      include: { plan: true },
    });
    const count = await db.user.count({ where: { companyId: user.companyId } });
    const max = company?.plan?.maxUsers ?? 999;
    if (count >= max) {
      return NextResponse.json(
        { error: `Limite de usuários do plano atingido (${max}).` },
        { status: 403 }
      );
    }

    const existing = await db.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (existing) {
      return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 400 });
    }

    const passwordHash = await hashPassword(data.password);
    const newUser = await db.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash,
        phone: data.phone,
        role: data.role,
        companyId: user.companyId,
      },
    });

    return NextResponse.json({ user: newUser });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
