"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Plan = {
  id: string;
  name: string;
  description?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  maxEquipments: number;
  maxUsers: number;
  features: string;
  highlighted: boolean;
};

export function Plans({ plans }: { plans: Plan[] }) {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="planos" className="py-20 sm:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-sm font-medium mb-4">
            Planos e preços
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Preços simples, sem surpresas
          </h2>
          <p className="text-muted-foreground text-lg">
            Escolha o plano ideal para o tamanho da sua operação.
          </p>

          <div className="inline-flex items-center gap-3 mt-6 p-1 bg-muted rounded-full">
            <button
              onClick={() => setAnnual(false)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                !annual ? "bg-emerald-600 text-white shadow" : "text-muted-foreground"
              )}
            >
              Mensal
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                annual ? "bg-emerald-600 text-white shadow" : "text-muted-foreground"
              )}
            >
              Anual <span className="text-emerald-400">-17%</span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const price = annual ? plan.yearlyPrice : plan.monthlyPrice;
            const features = JSON.parse(plan.features || "[]");
            return (
              <div
                key={plan.id}
                className={cn(
                  "relative p-6 rounded-2xl bg-card border transition-all",
                  plan.highlighted
                    ? "border-emerald-500 shadow-2xl lg:-translate-y-4"
                    : "border-border hover:border-emerald-300"
                )}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full">
                    MAIS ESCOLHIDO
                  </div>
                )}
                <h3 className="font-bold text-xl mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">
                  {plan.description}
                </p>
                <div className="mb-1">
                  <span className="text-4xl font-bold">
                    R$ {price.toLocaleString("pt-BR")}
                  </span>
                  <span className="text-muted-foreground text-sm">/mês</span>
                </div>
                <p className="text-xs text-muted-foreground mb-6">
                  {annual ? "cobrado anualmente" : "sem compromisso"}
                </p>
                <Link href="/app/cadastro" className="block mb-6">
                  <Button
                    className={cn(
                      "w-full",
                      plan.highlighted
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-amber-500 hover:bg-amber-600 text-white"
                    )}
                  >
                    Assinar {plan.name}
                  </Button>
                </Link>
                <ul className="space-y-3">
                  {features.map((f: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
