import { AppShell } from "@/components/app/shell";

// T406: area autenticada — sempre dinamica (evita erro de prerender com useSearchParams)
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
