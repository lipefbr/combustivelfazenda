"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Fuel, Loader2, ArrowLeft, Building2, User, Phone, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";

export default function CadastroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    responsibleName: "",
    email: "",
    whatsapp: "",
    password: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiFetch("/api/auth/register", {
        method: "POST",
        json: form,
      });
      toast.success(`Conta criada! Bem-vindo, ${data.user.name}.`);
      router.push("/app/inicio");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Erro ao cadastrar");
    } finally {
      setLoading(false);
    }
  }

  function set(key: string, val: string) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 sm:px-6 h-14 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
            <Fuel className="h-4 w-4" />
          </div>
          <span className="font-bold">
            Fuel<span className="text-emerald-600">Gest</span>
          </span>
        </Link>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-emerald-600 mb-4">
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Voltar ao site
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Criar minha conta</h1>
        <p className="text-muted-foreground mb-2">
          Comece agora com 14 dias grátis. Sem cartão de crédito.
        </p>

        <div className="mt-4 mb-8 inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-sm font-medium">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Plano Profissional — Teste de 14 dias
        </div>

        <form onSubmit={submit} className="space-y-5 bg-card border border-border rounded-2xl p-6">
          <div>
            <Label htmlFor="companyName" className="mb-1.5 block">
              Nome da empresa *
            </Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="companyName"
                placeholder="Fazenda São João, Construtora Horizonte..."
                value={form.companyName}
                onChange={(e) => set("companyName", e.target.value)}
                className="pl-10"
                required
                autoFocus
              />
            </div>
          </div>

          <div>
            <Label htmlFor="responsibleName" className="mb-1.5 block">
              Nome do responsável *
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="responsibleName"
                placeholder="João Pereira"
                value={form.responsibleName}
                onChange={(e) => set("responsibleName", e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email" className="mb-1.5 block">E-mail *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="voce@empresa.com"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="whatsapp" className="mb-1.5 block">WhatsApp *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="whatsapp"
                  placeholder="(11) 98888-7777"
                  value={form.whatsapp}
                  onChange={(e) => set("whatsapp", e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="password" className="mb-1.5 block">Senha *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                className="pl-10"
                required
                minLength={6}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {loading ? "Criando conta..." : "Criar conta e começar"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Ao criar a conta, você aceita nossos{" "}
            <a href="/termos" className="text-emerald-600 hover:underline">Termos</a> e{" "}
            <a href="/privacidade" className="text-emerald-600 hover:underline">Privacidade</a>.
          </p>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link href="/app/login" className="text-emerald-600 hover:underline font-medium">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
}
