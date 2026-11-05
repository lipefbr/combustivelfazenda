"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Truck,
  Fuel,
  Wrench,
  Receipt,
  BarChart3,
  Droplets,
  MoreHorizontal,
  Users,
  LogOut,
  Bell,
  Fuel as FuelIcon,
  Menu,
  X,
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

const mobileNav = [
  { href: "/app/inicio", label: "Início", icon: LayoutDashboard },
  { href: "/app/equipamentos", label: "Equipamentos", icon: Truck },
  { href: "/app/abastecimentos/novo", label: "Abastecer", icon: Fuel, primary: true },
  { href: "/app/manutencoes", label: "Manutenções", icon: Wrench },
  { href: "/app/mais", label: "Mais", icon: MoreHorizontal },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: alertsData } = useApi<{ alerts: any[] }>("/api/alerts");
  const { data: session } = useApi<{ user: any }>("/api/auth/me");

  const alertCount = alertsData?.alerts?.length || 0;

  // Detecta rotas públicas dentro de /app (não renderizam o shell nem exigem auth)
  const isPublicRoute =
    pathname === "/app/login" || pathname === "/app/cadastro";

  // Redirect de super_admin para /admin se estiver em rota protegida
  useEffect(() => {
    if (!isPublicRoute && session?.user && session.user.role === "super_admin" && !session.impersonatedBy) {
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

  return (
    <div className="min-h-screen bg-background flex">
      <ImpersonationBanner />
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-card fixed inset-y-0 left-0 z-30">
        <div className="flex h-16 items-center gap-2 px-6 border-b border-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
            <FuelIcon className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold">FuelGest</span>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scroll">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  active
                    ? "bg-emerald-600 text-white"
                    : "text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700"
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
                  ? "bg-emerald-600 text-white"
                  : "text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700"
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
                ? "bg-emerald-600 text-white"
                : "text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700"
            )}
          >
            <MoreHorizontal className="h-5 w-5" />
            Mais
          </Link>
        </nav>

        <div className="p-3 border-t border-border">
          <div
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-emerald-50 cursor-pointer"
            onClick={logout}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">
              {session?.user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {session?.user?.name || "Usuário"}
              </p>
              <p className="text-xs text-muted-foreground truncate">Sair</p>
            </div>
            <LogOut className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </aside>

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="lg:hidden sticky top-0 z-20 bg-card border-b border-border px-4 h-14 flex items-center justify-between">
          <button onClick={() => setDrawerOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
              <FuelIcon className="h-4 w-4" />
            </div>
            <span className="font-bold">FuelGest</span>
          </div>
          <Link href="/app/alertas">
            <div className="relative">
              <Bell className="h-6 w-6" />
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                  {alertCount}
                </span>
              )}
            </div>
          </Link>
        </header>

        <header className="hidden lg:flex sticky top-0 z-20 bg-card/95 backdrop-blur border-b border-border px-6 h-16 items-center justify-between">
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {session?.user?.companyName || ""}
            </span>
            <span className="mx-2">·</span>
            {session?.user?.role === "manager" ? "Gestor" : "Operador"}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/app/alertas">
              <div className="relative">
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>
                {alertCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                    {alertCount}
                  </span>
                )}
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                {session?.user?.name?.charAt(0) || "U"}
              </div>
              <span className="text-sm font-medium">
                {session?.user?.name}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 pb-24 lg:pb-6">{children}</main>
      </div>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border pb-safe">
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
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] text-emerald-600 font-medium mt-0.5">
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
                  "flex flex-col items-center justify-center gap-0.5",
                  active ? "text-emerald-600" : "text-muted-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {drawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="absolute left-0 top-0 bottom-0 w-72 bg-card border-r border-border p-4"
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
                        : "text-muted-foreground hover:bg-emerald-50"
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
