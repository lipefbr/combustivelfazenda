"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Fuel, Mail, Lock, Loader2, ShieldCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ user: any }>("/api/auth/login", {
        method: "POST",
        json: { email, password },
      });
      if (data.user.role !== "super_admin") {
        setError("Acesso restrito a administradores.");
        // Faz logout para limpar cookie de sessão comum
        try {
          await apiFetch("/api/auth/logout", { method: "POST" });
        } catch {}
        setLoading(false);
        return;
      }
      toast.success(`Bem-vindo, ${data.user.name}!`);
      router.push("/admin");
      router.refresh();
    } catch (e: any) {
      setError(e.message || "Erro ao entrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-stretch bg-slate-950">
      {/* Painel esquerdo — branding escuro */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:48px_48px]" />
        <Link href="/" className="flex items-center gap-2 relative z-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/20 backdrop-blur ring-1 ring-emerald-500/30">
            <Fuel className="h-6 w-6 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold">
            Fuel<span className="text-emerald-400">Gest</span>
          </span>
        </Link>

        <div className="relative z-10 max-w-md">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600/20 ring-1 ring-emerald-500/30 px-3 py-1 mb-6 text-emerald-300 text-xs font-medium">
            <ShieldCheck className="h-3.5 w-3.5" />
            Painel do Super Admin
          </div>
          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Controle total da plataforma FuelGest.
          </h2>
          <p className="text-slate-300 text-lg mb-8">
            Gerencie empresas, planos, leads, conteúdo e configurações globais
            da plataforma SaaS.
          </p>
          <div className="space-y-3">
            {[
              "Gestão de empresas e assinaturas",
              "Métricas globais de consumo e faturamento",
              "Impersonação para suporte ao cliente",
              "Logs de auditoria e configurações",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 ring-1 ring-emerald-500/30">
                  <ShieldCheck className="h-3 w-3 text-emerald-400" />
                </div>
                <span className="text-slate-200">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-400 text-sm relative z-10">
          © {new Date().getFullYear()} FuelGest — Todos os direitos reservados
        </p>
      </div>

      {/* Lado direito — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-slate-50">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-emerald-600 mb-2"
            >
              <ArrowLeft className="h-3 w-3" />
              Voltar para o site
            </Link>
          </div>
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
              <Fuel className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">
              Fuel<span className="text-emerald-600">Gest</span>
            </span>
          </Link>

          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-1">Acesso administrativo</h1>
            <p className="text-sm text-muted-foreground">
              Entre com a conta de Super Admin.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:border-red-900 dark:text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="mb-1.5 block">
                E-mail
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@fuelgest.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="mb-1.5 block">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 h-11 text-base"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {loading ? "Entrando..." : "Entrar no painel"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Acesso exclusivo para administradores da plataforma.
            <br />
            Não tem conta de admin?{" "}
            <Link
              href="/app/login"
              className="text-emerald-600 hover:underline font-medium"
            >
              Acessar como gestor
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
