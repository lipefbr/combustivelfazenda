import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    await requireSuperAdmin();
    const content = await db.landingContent.findMany();
    const contentMap: Record<string, any> = {};
    for (const c of content) {
      try {
        contentMap[c.section] = JSON.parse(c.content);
      } catch {
        contentMap[c.section] = c.content;
      }
    }
    return NextResponse.json({ content: contentMap });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await requireSuperAdmin();
    const body = await req.json();
    // body = { section: "hero", content: {...} } ou array
    const items = Array.isArray(body) ? body : [body];

    for (const item of items) {
      const { section, content } = item;
      if (!section) continue;
      await db.landingContent.upsert({
        where: { section },
        update: { content: JSON.stringify(content) },
        create: { section, content: JSON.stringify(content) },
      });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
