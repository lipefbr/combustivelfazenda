import { NextResponse } from "next/server";
import { getSession, clearImpersonationCookie, setSessionCookie } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST() {
  try {
    const session = await getSession();
    if (!session?.impersonatedBy) {
      return NextResponse.json({ error: "Sem impersonação ativa" }, { status: 400 });
    }

    const admin = await db.user.findUnique({
      where: { id: session.impersonatedBy },
    });
    if (!admin || admin.role !== "super_admin") {
      return NextResponse.json({ error: "Inválido" }, { status: 400 });
    }

    const adminSession = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };
    await setSessionCookie(adminSession as any);
    await clearImpersonationCookie();

    return NextResponse.json({ user: adminSession });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
