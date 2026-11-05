import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    await requireSuperAdmin();
    const settings = await db.platformSetting.findMany();
    const settingsMap: Record<string, string> = {};
    for (const s of settings) settingsMap[s.key] = s.value;

    // Inclui tipos de combustível e itens de manutenção padrão
    const [fuelTypes, maintenanceItems] = await Promise.all([
      db.fuelType.findMany({ orderBy: { order: "asc" } }),
      db.maintenanceItemTemplate.findMany({ orderBy: { order: "asc" } }),
    ]);

    return NextResponse.json({
      settings: settingsMap,
      fuelTypes,
      maintenanceItems,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireSuperAdmin();
    const body = await req.json();
    // body = { settings: {...}, fuelTypes: [...], maintenanceItems: [...] }

    if (body.settings) {
      for (const [key, value] of Object.entries(body.settings)) {
        await db.platformSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        });
      }
    }

    if (body.fuelTypes && Array.isArray(body.fuelTypes)) {
      for (const ft of body.fuelTypes) {
        if (ft.id) {
          await db.fuelType.update({
            where: { id: ft.id },
            data: { name: ft.name, active: Boolean(ft.active), order: Number(ft.order || 0) },
          });
        } else {
          await db.fuelType.create({
            data: { name: ft.name, active: true, order: Number(ft.order || 0) },
          });
        }
      }
    }

    if (body.maintenanceItems && Array.isArray(body.maintenanceItems)) {
      for (const mi of body.maintenanceItems) {
        if (mi.id) {
          await db.maintenanceItemTemplate.update({
            where: { id: mi.id },
            data: {
              name: mi.name,
              defaultInterval: Number(mi.defaultInterval),
              controlType: mi.controlType,
              active: Boolean(mi.active),
              order: Number(mi.order || 0),
            },
          });
        } else {
          await db.maintenanceItemTemplate.create({
            data: {
              name: mi.name,
              defaultInterval: Number(mi.defaultInterval),
              controlType: mi.controlType,
              active: true,
              order: Number(mi.order || 0),
            },
          });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
