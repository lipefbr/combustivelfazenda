import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSuperAdmin, slugify, hashPassword } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({
  name: z.string().min(2),
  responsibleName: z.string().min(2),
  email: z.string().email(),
  whatsapp: z.string().optional(),
  phone: z.string().optional(),
  document: z.string().optional().nullable(),
  status: z.enum(["trial", "active", "overdue", "blocked"]).default("active"),
  planId: z.string().optional(),
  managerPassword: z.string().min(6).optional(),
});

export async function GET(req: NextRequest) {
  try {
    await requireSuperAdmin();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { responsibleName: { contains: search } },
      ];
    }

    const companies = await db.company.findMany({
      where,
      include: {
        plan: true,
        _count: {
          select: { users: true, equipments: true, reservoirs: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ companies });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireSuperAdmin();
    const body = await req.json();
    const data = schema.parse(body);

    let slug = slugify(data.name);
    let suffix = 0;
    while (await db.company.findUnique({ where: { slug } })) {
      suffix++;
      slug = `${slugify(data.name)}-${suffix}`;
    }

    const plan = data.planId
      ? await db.plan.findUnique({ where: { id: data.planId } })
      : await db.plan.findFirst({ where: { highlighted: true } });

    const company = await db.company.create({
      data: {
        name: data.name,
        slug,
        responsibleName: data.responsibleName,
        email: data.email.toLowerCase(),
        whatsapp: data.whatsapp,
        phone: data.phone,
        document: data.document,
        status: data.status,
        planId: plan?.id,
        trialEndsAt:
          data.status === "trial"
            ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
            : null,
      },
    });

    // Cria gestor padrão
    if (data.managerPassword) {
      const passwordHash = await hashPassword(data.managerPassword);
      await db.user.create({
        data: {
          name: data.responsibleName,
          email: data.email.toLowerCase(),
          passwordHash,
          role: "manager",
          companyId: company.id,
        },
      });
    }

    return NextResponse.json({ company });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
