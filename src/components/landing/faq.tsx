"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Funciona offline?",
    a: "O app funciona em campo mesmo com internet instável. Os formulários são rápidos e enviam os dados assim que a conexão melhora. Para uso 100% offline, é necessário plano Empresarial.",
  },
  {
    q: "Posso usar para equipamentos de terceiros?",
    a: "Sim. No cadastro de equipamentos você marca a origem como 'De terceiros' e informa o proprietário. Os equipamentos de terceiros aparecem em filtros e relatórios próprios, mas podem ser abastecidos normalmente.",
  },
  {
    q: "Como funciona o alerta de manutenção?",
    a: "Para cada item de manutenção (troca de óleo, filtros, graxa etc.) você informa o intervalo em horas ou km. A partir de 90% do intervalo, o alerta fica amarelo. Ao atingir o limite, fica vermelho (vencido). Ao registrar a manutenção, o contador zera.",
  },
  {
    q: "Posso cadastrar vários reservatórios?",
    a: "Sim, sem limite no plano Empresarial. Cada reservatório tem capacidade, tipo de combustível, nível atual e nível mínimo (em litros ou percentual). Alerta de estoque baixo é automático.",
  },
  {
    q: "Tem relatório em PDF?",
    a: "Sim. Todos os relatórios exportam em PDF, Excel/CSV. Você pode filtrar por período, equipamento, operador, origem (fazenda ou terceiros) e reservatório.",
  },
  {
    q: "Como é o suporte?",
    a: "Plano Básico: e-mail. Profissional: e-mail + WhatsApp, resposta em 24h úteis. Empresarial: gerente de conta dedicado + treinamento personalizado + SLA garantido.",
  },
  {
    q: "Consigo importar dados de outra planilha?",
    a: "No plano Profissional e Empresarial, oferecemos importação de equipamentos via CSV. Fale com o suporte para ajudar no processo.",
  },
  {
    q: "Meus dados ficam isolados de outras empresas?",
    a: "Sim. Cada empresa tem seus dados totalmente isolados, em estrutura multi-tenant. Somente o Super Admin (equipe FuelGest) tem visão global para suporte.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 sm:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <div className="text-center mb-12">
          <span className="inline-block rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-sm font-medium mb-4">
            Perguntas frequentes
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ainda tem dúvidas?
          </h2>
          <p className="text-muted-foreground text-lg">
            As perguntas mais comuns antes de começar a usar o FuelGest.
          </p>
        </div>
        <div className="space-y-2">
          {faqs.map((item, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-emerald-50/30 transition-colors"
              >
                <span className="font-semibold">{item.q}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-emerald-600 transition-transform flex-shrink-0",
                    open === i && "rotate-180"
                  )}
                />
              </button>
              <div
                className={cn(
                  "grid transition-all",
                  open === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
              >
                <div className="overflow-hidden">
                  <p className="p-4 pt-0 text-muted-foreground text-sm leading-relaxed">
                    {item.a}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
