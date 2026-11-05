"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api-client";
import { Send, Check } from "lucide-react";
import { toast } from "sonner";

export function FinalCTA() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    if (!data.name) {
      toast.error("Informe seu nome");
      return;
    }
    setLoading(true);
    try {
      await apiFetch("/api/leads", {
        method: "POST",
        json: {
          ...data,
          equipmentCount: Number(data.equipmentCount) || undefined,
          source: "landing_cta",
        },
      });
      setDone(true);
      toast.success("Recebemos seu contato! Em breve falaremos com você.");
    } catch (e: any) {
      toast.error(e.message || "Erro ao enviar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-20 sm:py-24 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Pronto para assumir o controle da sua frota?
            </h2>
            <p className="text-emerald-50 text-lg mb-8">
              Comece hoje com 14 dias grátis. Sem cartão de crédito. Em poucos
              minutos sua operação está no sistema.
            </p>
            <a
              href="/app/cadastro"
              className="inline-block px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-lg transition-colors"
            >
              Criar minha conta
            </a>
          </div>

          <div className="bg-white rounded-2xl p-6 text-foreground shadow-xl">
            {done ? (
              <div className="text-center py-10">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
                  <Check className="h-8 w-8" />
                </div>
                <h3 className="font-bold text-xl mb-2">Obrigado!</h3>
                <p className="text-muted-foreground">
                  Recebemos seu contato. Nossa equipe vai falar com você em
                  breve.
                </p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                <h3 className="font-bold text-lg mb-2">Fale com a gente</h3>
                <div>
                  <Label htmlFor="name" className="text-xs">Nome*</Label>
                  <Input id="name" name="name" placeholder="Seu nome" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="company" className="text-xs">Empresa</Label>
                    <Input id="company" name="company" placeholder="Empresa" />
                  </div>
                  <div>
                    <Label htmlFor="equipmentCount" className="text-xs">Equipamentos</Label>
                    <Input
                      id="equipmentCount"
                      name="equipmentCount"
                      type="number"
                      placeholder="10"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="whatsapp" className="text-xs">WhatsApp</Label>
                    <Input id="whatsapp" name="whatsapp" placeholder="(11) 98888-7777" />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-xs">E-mail</Label>
                    <Input id="email" name="email" type="email" placeholder="voce@empresa.com" />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  {loading ? "Enviando..." : "Enviar"}
                  {!loading && <Send className="ml-2 h-4 w-4" />}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Ou cadastre-se agora mesmo e comece a usar.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
