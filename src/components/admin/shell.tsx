"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard,
  Building2,
  Users,
  Truck,
  Fuel,
  Wrench,
  CreditCard,
  MessageSquare,
  FileText,
  Settings,
  ScrollText,
  UserCircle,
  Bell,
  Menu,
  Search,
  LogOut,
  Sun,
  Moon,
  ChevronLeft,
  Fuel as FuelIcon,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApi } from "@/hooks/use-session";
import { apiFetch } from "@/lib/api-client";
import { useTheme } from "next-themes";
import { toast } from "sonner";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/empresas", label: "Empresas", icon: Building2 },
  { href: "/admin/usuarios", label: "Usuários", icon: Users },
  { href: "/admin/equipamentos", label: "Equipamentos", icon: Truck },
  { href: "/admin/abastecimentos", label: "Abastecimentos", icon: Fuel },
  { href: "/admin/manutencoes", label: "Manutenções", icon: Wrench },
  { href: "/admin/planos", label: "Planos", icon: CreditCard },
  { href: "/admin/leads", label: "Leads", icon: MessageSquare },
  { href: "/admin/conteudo", label: "Conteúdo", icon: FileText },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
  { href: "/admin/logs", label: "Logs", icon: ScrollText },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

function Logo() {
  return (
    <div className="flex h-16 items-center gap-2.5 px-5 border-b border-slate-800 shrink-0">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md">
        <FuelIcon className="h-5 w-5" />
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-base font-bold text-white">FuelGest</span>
        <span className="text-[10px] text-slate-400 uppercase tracking-widest">
          Admin Panel
        </span>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { data: session } = useApi<{ user: any; impersonatedBy?: string }>(
    "/api/auth/me"
  );
  const { data: alertsData } = useApi<{ alerts: any[] }>("/api/alerts");
  const { theme, setTheme } = useTheme();

  const alertCount = alertsData?.alerts?.length || 0;

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  async function logout() {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    router.push("/admin/login");
    router.refresh();
  }

  const pageTitle = useMemo(() => {
    const item = navItems.find((i) => isActive(pathname, i.href, i.exact));
    if (item) return item.label;
    if (pathname === "/admin/perfil") return "Meu Perfil";
    if (pathname.startsWith("/admin/empresas/")) return "Detalhe da Empresa";
    return "Admin";
  }, [pathname]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Sidebar Desktop (escuro) */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 bg-slate-900 border-r border-slate-800 transition-[width] duration-200",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        <div className={cn("flex", collapsed && "justify-center px-0")}>
          {collapsed ? (
            <div className="flex h-16 w-full items-center justify-center border-b border-slate-800">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md">
                <FuelIcon className="h-5 w-5" />
              </div>
            </div>
          ) : (
            <Logo />
          )}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 custom-scroll">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  collapsed && "justify-center px-0",
                  active
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    active
                      ? "text-white"
                      : "text-slate-400 group-hover:text-emerald-400"
                  )}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
          <div className="pt-2 mt-2 border-t border-slate-800" />
          <Link
            href="/admin/perfil"
            title={collapsed ? "Meu Perfil" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
              collapsed && "justify-center px-0",
              pathname === "/admin/perfil"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            )}
          >
            <UserCircle
              className={cn(
                "h-5 w-5 shrink-0",
                pathname === "/admin/perfil"
                  ? "text-white"
                  : "text-slate-400 group-hover:text-emerald-400"
              )}
            />
            {!collapsed && <span className="truncate">Meu Perfil</span>}
          </Link>
        </nav>

        {/* Footer do sidebar */}
        <div className="border-t border-slate-800 p-3">
          <button
            onClick={() => setCollapsed((v) => !v)}
            className={cn(
              "w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-400 hover:bg-slate-800 hover:text-white transition",
              collapsed && "justify-center"
            )}
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform",
                collapsed && "rotate-180"
              )}
            />
            {!collapsed && <span>Recolher menu</span>}
          </button>
        </div>
      </aside>

      {/* Conteúdo */}
      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-[margin] duration-200",
          collapsed ? "lg:ml-[72px]" : "lg:ml-64"
        )}
      >
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 h-16 flex items-center gap-3 px-4 sm:px-6">
          {/* Mobile menu button */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="bg-slate-900 border-slate-800 p-0 w-72 max-w-[85%] flex flex-col"
            >
              <div className="flex items-center justify-between">
                <Logo />
                <SheetClose className="text-slate-400 mr-4" />
              </div>
              <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 custom-scroll">
                {navItems.map((item) => {
                  const active = isActive(pathname, item.href, item.exact);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                        active
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5 shrink-0",
                          active
                            ? "text-white"
                            : "text-slate-400 group-hover:text-emerald-400"
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
                <div className="pt-2 mt-2 border-t border-slate-800" />
                <Link
                  href="/admin/perfil"
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    pathname === "/admin/perfil"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <UserCircle className="h-5 w-5 shrink-0" />
                  <span className="truncate">Meu Perfil</span>
                </Link>
              </nav>
              <div className="border-t border-slate-800 p-3">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-white truncate">
                    {session?.user?.name || "Super Admin"}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {session?.user?.email}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="w-full mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-300 hover:bg-red-900/40 hover:text-red-200 transition"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </div>
            </SheetContent>
          </Sheet>

          <div className="hidden sm:block">
            <h1 className="text-lg font-bold">{pageTitle}</h1>
          </div>

          {/* Busca global */}
          <div className="flex-1 max-w-md ml-auto sm:ml-6 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar empresa, usuário, equipamento..."
                className="pl-9 h-9 bg-slate-100 dark:bg-slate-800 border-0"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.target as HTMLInputElement).value) {
                    router.push(
                      `/admin/empresas?search=${encodeURIComponent(
                        (e.target as HTMLInputElement).value
                      )}`
                    );
                  }
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 ml-auto md:ml-0">
            {/* Notificações */}
            <Link href="/admin/manutencoes" className="relative">
              <Button variant="ghost" size="icon" aria-label="Notificações">
                <Bell className="h-5 w-5" />
                {alertCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                    {alertCount > 99 ? "99+" : alertCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Tema */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Alternar tema"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 dark:hidden" />
              <Moon className="h-5 w-5 hidden dark:block" />
            </Button>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 px-1.5 py-1 transition">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 text-sm font-bold">
                    {session?.user?.name?.charAt(0)?.toUpperCase() || "A"}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold leading-tight">
                      {session?.user?.name || "Super Admin"}
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      Super Admin
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-semibold">{session?.user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {session?.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/perfil" className="cursor-pointer">
                    <UserCircle className="h-4 w-4 mr-2" /> Meu Perfil
                  </Link>
                </DropdownMenuItem>
                {session?.user?.forcePasswordChange && (
                  <div className="px-2 py-2">
                    <Badge variant="destructive" className="text-[10px] gap-1">
                      <ShieldAlert className="h-3 w-3" />
                      Trocar senha obrigatório
                    </Badge>
                  </div>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={logout}
                  className="cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>

        <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 px-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} FuelGest · Painel Administrativo ·
          Todos os direitos reservados
        </footer>
      </div>
    </div>
  );
}
