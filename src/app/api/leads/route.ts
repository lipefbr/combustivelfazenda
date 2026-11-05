import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  name: z.string().min(2),
  company: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  equipmentCount: z.number().optional(),
  message: z.string().optional(),
  source: z.string().optional().default("landing"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.safeParse(body);
    if (!data.success) {
      return NextResponse.json(
        { error: "Dados inválidos" },
        { status: 400 }
      );
    }

    const lead = await db.lead.create({
      data: {
        name: data.data.name,
        company: data.data.company,
        whatsapp: data.data.whatsapp,
        email: data.data.email,
        equipmentCount: data.data.equipmentCount,
        message: data.data.message,
        source: data.data.source || "landing",
        status: "new",
      },
    });

    return NextResponse.json({ lead });
  } catch (e) {
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
  }
}
