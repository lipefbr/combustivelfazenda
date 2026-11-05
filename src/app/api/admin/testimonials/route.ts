import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSuperAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    await requireSuperAdmin();
    const testimonials = await db.testimonial.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ testimonials });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

const schema = z.object({
  name: z.string().min(2),
  company: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  content: z.string().min(2),
  rating: z.number().min(1).max(5).default(5),
  avatar: z.string().optional().nullable(),
  active: z.boolean().default(true),
  order: z.number().default(0),
});

export async function POST(req: NextRequest) {
  try {
    await requireSuperAdmin();
    const body = await req.json();
    const data = schema.parse(body);
    const testimonial = await db.testimonial.create({
      data: {
        name: data.name,
        company: data.company,
        role: data.role,
        content: data.content,
        rating: data.rating,
        avatar: data.avatar,
        active: data.active,
        order: data.order,
      },
    });
    return NextResponse.json({ testimonial });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
