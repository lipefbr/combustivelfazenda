import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, requireCompanyUser } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({
  equipmentId: z.string().optional().nullable(),
  category: z.string(),
  description: z.string().min(2),
  amount: z.number().positive(),
  expenseDate: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const equipmentId = searchParams.get("equipmentId");

    const where: any = {};
    if (user.role !== "super_admin") {
      where.companyId = user.companyId;
    } else if (searchParams.get("companyId")) {
      where.companyId = searchParams.get("companyId")!;
    }
    if (equipmentId) where.equipmentId = equipmentId;

    const expenses = await db.expense.findMany({
      where,
      include: { equipment: true, registeredBy: true },
      orderBy: { expenseDate: "desc" },
      take: 500,
    });
    return NextResponse.json({ expenses });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireCompanyUser();
    const body = await req.json();
    const data = schema.parse(body);

    const expense = await db.expense.create({
      data: {
        companyId: user.companyId,
        equipmentId: data.equipmentId || null,
        registeredById: user.id,
        category: data.category,
        description: data.description,
        amount: data.amount,
        expenseDate: data.expenseDate ? new Date(data.expenseDate) : new Date(),
      },
    });

    return NextResponse.json({ expense });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
