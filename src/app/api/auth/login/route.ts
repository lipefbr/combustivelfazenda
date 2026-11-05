import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  authenticateUser,
  setSessionCookie,
  checkRateLimit,
  resetRateLimit,
} from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
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

    const { email, password } = data.data;
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    const rl = checkRateLimit(`login:${ip}:${email}`);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Muitas tentativas. Tente novamente em 5 minutos." },
        { status: 429 }
      );
    }

    const user = await authenticateUser(email, password);
    if (!user) {
      return NextResponse.json(
        { error: "E-mail ou senha incorretos." },
        { status: 401 }
      );
    }

    resetRateLimit(`login:${ip}:${email}`);
    await setSessionCookie(user);

    return NextResponse.json({ user });
  } catch (e) {
    return NextResponse.json(
      { error: "Erro ao processar login" },
      { status: 500 }
    );
  }
}
