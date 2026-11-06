"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Fuel, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const data = await apiFetch<{ user: any }>("/api/auth/login", {
        method: "POST",
        json: { email, password },
      });
      toast.success(`Bem-vindo, ${data.user.name}!`);
      if (data.user.role === "super_admin") {
        router.push("/admin");
      } else {
        router.push("/app/inicio");
      }
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Erro ao entrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Lado esquerdo - branding */}
      <div className="hidden lg:flex bg-gradient-to-br from-emerald-600 to-emerald-800 p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:48px_48px]" />
        <Link href="/" className="flex items-center gap-2 relative">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
            <Fuel className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold">FuelGest</span>
        </Link>
        <div className="relative">
          <h2 className="text-4xl font-bold mb-4">
            Controle total da sua frota,
            <br /> no celular ou computador.
          </h2>
          <p className="text-emerald-50 text-lg mb-8 max-w-md">
            Combustível, abastecimento, manutenção e relatórios — tudo num só lugar.
          </p>
          <div className="space-y-3">
            {[
              "Abastecimento em poucos toques, no campo",
              "Alertas de manutenção automáticos",
              "Relatórios em PDF e Excel/CSV",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                  <ArrowRight className="h-3 w-3" />
                </div>
                <span className="text-emerald-50">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-emerald-100 text-sm relative">© {new Date().getFullYear()} FuelGest</p>
      </div>

      {/* Lado direito - formulário */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-sm">
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
              <Fuel className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">
              Fuel<span className="text-emerald-600">Gest</span>
            </span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Entrar</h1>
          <p className="text-muted-foreground mb-8">
            Acesse o painel da sua empresa.
          </p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="mb-1.5 block">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="voce@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="mb-1.5 block">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              size="lg"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Não tem conta?{" "}
            <Link href="/app/cadastro" className="text-emerald-600 hover:underline font-medium">
              Criar conta grátis
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
