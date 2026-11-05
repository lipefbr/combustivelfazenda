"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Truck,
  Fuel,
  Wrench,
  BarChart3,
  MoreHorizontal,
  Bell,
  Fuel as FuelIcon,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Droplets,
  Receipt,
  Users,
  AlertTriangle,
  Droplet,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/use-session";
import { apiFetch } from "@/lib/api-client";
import { ImpersonationBanner } from "@/components/app/impersonation-banner";

const navItems = [
  { href: "/app/inicio", label: "Início", icon: LayoutDashboard },
  { href: "/app/equipamentos", label: "Equipamentos", icon: Truck },
  { href: "/app/abastecimentos", label: "Abastecimentos", icon: Fuel },
  { href: "/app/estoque", label: "Estoque", icon: Droplets },
  { href: "/app/manutencoes", label: "Manutenções", icon: Wrench },
  { href: "/app/despesas", label: "Despesas", icon: Receipt },
  { href: "/app/relatorios", label: "Relatórios", icon: BarChart3 },
];

// Bottom navigation (mobile) com FAB central — igual ao design da imagem
const mobileNav = [
  { href: "/app/inicio", label: "Início", icon: LayoutDashboard },
  { href: "/app/equipamentos", label: "Equipamentos", icon: Truck },
  { href: "/app/abastecimentos/novo", label: "Abastecer", icon: Fuel, primary: true },
  { href: "/app/manutencoes", label: "Manutenções", icon: Wrench },
  { href: "/app/relatorios", label: "Relatórios", icon: BarChart3 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: alertsData } = useApi<{ alerts: any[] }>("/api/alerts");
  const { data: session } = useApi<{ user: any }>("/api/auth/me");

  const alertCount = alertsData?.alerts?.length || 0;

  const isPublicRoute =
    pathname === "/app/login" || pathname === "/app/cadastro";

  useEffect(() => {
    if (
      !isPublicRoute &&
      session?.user &&
      session.user.role === "super_admin" &&
      !session.impersonatedBy
    ) {
      router.replace("/admin");
    }
  }, [session, isPublicRoute, router]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  async function logout() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    router.push("/app/login");
    router.refresh();
  }

  // Rotas públicas (login, cadastro): renderiza sem shell
  if (isPublicRoute) {
    return <>{children}</>;
  }

  const userInitial = session?.user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-emerald-50/30 flex">
      <ImpersonationBanner />

      {/* Sidebar desktop (mantém para telas grandes) */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-emerald-100 fixed inset-y-0 left-0 z-30">
        <div className="flex h-16 items-center gap-2 px-6 border-b border-emerald-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
            <FuelIcon className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-bold block leading-none">FuelGest</span>
            <span className="text-[10px] text-emerald-600 font-medium">
              Gestão de Combustível
            </span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scroll">
          {navItems.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  active
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-200"
                    : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
          {session?.user?.role === "manager" && (
            <Link
              href="/app/usuarios"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                pathname === "/app/usuarios"
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-200"
                  : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
              )}
            >
              <Users className="h-5 w-5" />
              Usuários
            </Link>
          )}
          <Link
            href="/app/mais"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
              pathname === "/app/mais"
                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-200"
                : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
            )}
          >
            <MoreHorizontal className="h-5 w-5" />
            Mais
          </Link>
        </nav>

        <div className="p-3 border-t border-emerald-100">
          <div
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-emerald-50 cursor-pointer"
            onClick={logout}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-slate-700">
                {session?.user?.name || "Usuário"}
              </p>
              <p className="text-xs text-slate-400 truncate">Sair</p>
            </div>
            <LogOut className="h-4 w-4 text-slate-400" />
          </div>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen bg-slate-50">
        {/* Header mobile (igual ao design da imagem: fundo verde escuro) */}
        <header className="lg:hidden sticky top-0 z-20 bg-gradient-to-br from-emerald-700 to-emerald-800 text-white px-4 pt-3 pb-6 rounded-b-[2rem] shadow-md shadow-emerald-900/20 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white relative overflow-hidden shadow-md">
                <Droplet className="h-7 w-7 text-emerald-600 absolute -top-0.5" fill="currentColor" />
                <FuelIcon className="h-5 w-5 text-emerald-700 absolute bottom-1" />
              </div>
              <div className="leading-tight">
                <span className="font-bold text-lg block">
                  Fuel<span className="text-emerald-200">Gest</span>
                </span>
                <span className="text-[10px] text-emerald-100 font-medium">
                  Gestão Inteligente de Combustível
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/app/alertas" className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur hover:bg-white/25 transition-colors">
                  <Bell className="h-5 w-5" />
                </div>
                {alertCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold ring-2 ring-emerald-700">
                    {alertCount}
                  </span>
                )}
              </Link>
              <Link href="/app/mais">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-sm font-bold ring-2 ring-white/30">
                  {userInitial}
                </div>
              </Link>
            </div>
          </div>

          {/* Seletor de empresa (pill branco compacto — igual ao design) */}
          <Link
            href="/app/mais"
            className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-emerald-800 shadow-sm text-sm font-semibold"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-600 text-white">
              <Truck className="h-3 w-3" />
            </div>
            <span className="max-w-[180px] truncate">{session?.user?.companyName || "Minha Empresa"}</span>
            <ChevronDown className="h-3.5 w-3.5 text-emerald-700" />
          </Link>

          {/* Curva decorativa na borda inferior */}
          <svg
            className="absolute bottom-0 left-0 right-0 w-full h-3 text-emerald-50"
            viewBox="0 0 100 4"
            preserveAspectRatio="none"
          >
            <path d="M0,4 Q50,0 100,4 L100,4 L0,4 Z" fill="currentColor" />
          </svg>
        </header>

        {/* Header desktop */}
        <header className="hidden lg:flex sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-emerald-100 px-6 h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-base font-semibold text-slate-700">
              {session?.user?.companyName || ""}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-sm text-slate-500">
              {session?.user?.role === "manager" ? "Gestor" : "Operador"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/app/alertas">
              <div className="relative">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-emerald-50">
                  <Bell className="h-5 w-5 text-emerald-700" />
                </Button>
                {alertCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold ring-2 ring-white">
                    {alertCount}
                  </span>
                )}
              </div>
            </Link>
            <Link href="/app/mais">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">
                  {userInitial}
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {session?.user?.name}
                </span>
              </div>
            </Link>
          </div>
        </header>

        {/* Conteúdo principal — fundo cinza muito claro (igual ao design) */}
        <main className="flex-1 p-4 sm:p-6 pb-32 lg:pb-8 -mt-3 lg:mt-0">{children}</main>
      </div>

      {/* Bottom navigation (mobile) com FAB central — igual ao design */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-emerald-100 pb-safe shadow-[0_-4px_12px_rgba(16,185,129,0.04)]">
        <div className="grid grid-cols-5 h-16">
          {mobileNav.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/app/inicio" && pathname.startsWith(item.href));
            if (item.primary) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center justify-center -mt-6"
                >
                  <div
                    className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg shadow-emerald-300/40 transition-colors",
                      active
                        ? "bg-emerald-700 text-white"
                        : "bg-emerald-600 text-white"
                    )}
                  >
                    <item.icon className="h-7 w-7" />
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                    {item.label}
                  </span>
                </Link>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 transition-colors",
                  active ? "text-emerald-700" : "text-slate-400"
                )}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-emerald-600" />
                )}
                <item.icon className={cn("h-5 w-5", active && "text-emerald-700")} />
                <span className={cn("text-[10px] font-medium", active && "text-emerald-700")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Drawer mobile para menu completo */}
      {drawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="absolute left-0 top-0 bottom-0 w-72 bg-white border-r border-emerald-100 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="font-bold text-lg">Menu</span>
              <button onClick={() => setDrawerOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium",
                      active
                        ? "bg-emerald-600 text-white"
                        : "text-slate-600 hover:bg-emerald-50"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-5 w-5" />
                Sair
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
