import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DashboardClient } from "./dashboard-client";

// T406: sem sessao ativa, /app/inicio manda direto pro /app/login
export const dynamic = "force-dynamic";

export default async function InicioPage() {
  const session = await getSession();
  if (!session) redirect("/app/login");
  return <DashboardClient />;
}
