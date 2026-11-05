import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { saveUpload } from "@/lib/upload";

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const subdir = (formData.get("subdir") as string) || "refuelings";

    if (!file) {
      return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 });
    }

    const url = await saveUpload(
      file,
      subdir as "equipments" | "invoices" | "refuelings" | "maintenance"
    );
    return NextResponse.json({ url });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
