import { NextRequest, NextResponse } from "next/server";
import { requireCompanyUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export async function GET() {
  try {
    const user = await requireCompanyUser();
    const company = await db.company.findUnique({
      where: { id: user.companyId },
      include: {
        plan: true,
        subscription: { include: { plan: true } },
        _count: {
          select: {
            users: true,
            equipments: true,
            reservoirs: true,
          },
        },
      },
    });
    if (!company) {
      return NextResponse.json({ error: "Não encontrada" }, { status: 404 });
    }
    return NextResponse.json({ company });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireCompanyUser();
    const body = await req.json();
    const data = z
      .object({
        name: z.string().optional(),
        responsibleName: z.string().optional(),
        whatsapp: z.string().optional(),
        phone: z.string().optional(),
        document: z.string().optional().nullable(),
        address: z.string().optional().nullable(),
        city: z.string().optional().nullable(),
        state: z.string().optional().nullable(),
        zipCode: z.string().optional().nullable(),
      })
      .parse(body);

    const company = await db.company.update({
      where: { id: user.companyId },
      data,
    });
    return NextResponse.json({ company });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
