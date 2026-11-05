import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSuperAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();
    const { id } = await params;
    const body = await req.json();
    const data = z
      .object({
        name: z.string().optional(),
        company: z.string().optional().nullable(),
        role: z.string().optional().nullable(),
        content: z.string().optional(),
        rating: z.number().min(1).max(5).optional(),
        avatar: z.string().optional().nullable(),
        active: z.boolean().optional(),
        order: z.number().optional(),
      })
      .parse(body);

    const testimonial = await db.testimonial.update({ where: { id }, data });
    return NextResponse.json({ testimonial });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();
    const { id } = await params;
    await db.testimonial.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
