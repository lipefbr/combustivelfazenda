import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin, setImpersonationCookie, setSessionCookie } from "@/lib/auth";
import { db } from "@/lib/db";
// Force recompile: v3

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireSuperAdmin();
    const { id } = await params;

    const company = await db.company.findUnique({
      where: { id },
      include: { users: { where: { role: "manager" }, take: 1 } },
    });

    if (!company) {
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
    }

    const manager = company.users[0];
    if (!manager) {
      return NextResponse.json(
        { error: "Empresa sem gestor. Impossível impersonar." },
        { status: 400 }
      );
    }

    // Salva sessão do admin em cookie separado e seta sessão como o gestor
    await setImpersonationCookie(admin);

    const sessionUser = {
      id: manager.id,
      name: manager.name,
      email: manager.email,
      role: manager.role,
      companyId: company.id,
      companyName: company.name,
    };
    await setSessionCookie(sessionUser as any);

    // Log de auditoria
    await db.auditLog.create({
      data: {
        userId: admin.id,
        impersonatedById: admin.id,
        companyId: company.id,
        action: "impersonate",
        entity: "company",
        entityId: company.id,
        details: `Super Admin ${admin.email} iniciou sessão como empresa ${company.name}`,
      },
    });

    return NextResponse.json({ user: sessionUser, company });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
