import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  // Busca conteúdo editável + depoimentos + config WhatsApp
  const [content, testimonials, settings] = await Promise.all([
    db.landingContent.findMany(),
    db.testimonial.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    }),
    db.platformSetting.findMany(),
  ]);

  const contentMap: Record<string, any> = {};
  for (const c of content) {
    try {
      contentMap[c.section] = JSON.parse(c.content);
    } catch {
      contentMap[c.section] = c.content;
    }
  }

  const settingsMap: Record<string, string> = {};
  for (const s of settings) {
    settingsMap[s.key] = s.value;
  }

  return NextResponse.json({
    content: contentMap,
    testimonials,
    settings: settingsMap,
  });
}
