import { NextResponse } from "next/server";
import { clearSessionCookie, clearImpersonationCookie } from "@/lib/auth";

export async function POST() {
  await clearSessionCookie();
  await clearImpersonationCookie();
  return NextResponse.json({ ok: true });
}
