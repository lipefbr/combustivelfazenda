import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  hashPassword,
  setSessionCookie,
  slugify,
  checkRateLimit,
} from "@/lib/auth";
import { PLAN_DEFAULTS } from "@/lib/constants";

const schema = z.object({
  companyName: z.string().min(2, "Nome da empresa é obrigatório"),
  responsibleName: z.string().min(2, "Nome do responsável é obrigatório"),
  email: z.string().email("E-mail inválido"),
  whatsapp: z.string().min(8, "WhatsApp inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  phone: z.string().optional(),
  document: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.safeParse(body);
    if (!data.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: data.error.flatten() },
        { status: 400 }
      );
    }

    const { companyName, responsibleName, email, whatsapp, password, phone, document } =
      data.data;

    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const rl = checkRateLimit(`register:${ip}`, 3, 60 * 60 * 1000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Muitas tentativas. Aguarde uma hora." },
        { status: 429 }
      );
    }

    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "E-mail já cadastrado. Faça login." },
        { status: 400 }
      );
    }

    let slug = slugify(companyName);
    let suffix = 0;
    while (await db.company.findUnique({ where: { slug } })) {
      suffix++;
      slug = `${slugify(companyName)}-${suffix}`;
    }

    const trialPlan =
      (await db.plan.findFirst({ where: { highlighted: true } })) ||
      (await db.plan.findFirst({ orderBy: { order: "asc" } }));

    if (!trialPlan) {
      return NextResponse.json(
        { error: "Plano de teste indisponível. Contate o suporte." },
        { status: 500 }
      );
    }

    const trialDays = Number(
      process.env.TRIAL_DAYS || PLAN_DEFAULTS.trialDays
    );
    const trialEndsAt = new Date(
      Date.now() + trialDays * 24 * 60 * 60 * 1000
    );

    const passwordHash = await hashPassword(password);

    const company = await db.company.create({
      data: {
        name: companyName,
        slug,
        responsibleName,
        email: email.toLowerCase(),
        whatsapp,
        phone,
        document,
        status: "trial",
        trialEndsAt,
        planId: trialPlan.id,
      },
    });

    const user = await db.user.create({
      data: {
        name: responsibleName,
        email: email.toLowerCase(),
        passwordHash,
        role: "manager",
        companyId: company.id,
        phone: whatsapp,
        active: true,
      },
    });

    await db.subscription.create({
      data: {
        companyId: company.id,
        planId: trialPlan.id,
        billingCycle: "monthly",
        status: "active",
        currentEnd: trialEndsAt,
        amount: 0,
      },
    });

    await db.auditLog.create({
      data: {
        userId: user.id,
        companyId: company.id,
        action: "register",
        details: `Empresa ${companyName} criada (plano teste)`,
        ip,
      },
    });

    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: "manager",
      companyId: company.id,
      companyName: company.name,
    };

    await setSessionCookie(sessionUser as any);

    return NextResponse.json({ user: sessionUser, company });
  } catch (e) {
    return NextResponse.json(
      { error: "Erro ao criar conta" },
      { status: 500 }
    );
  }
}
