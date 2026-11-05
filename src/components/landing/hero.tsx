"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Fuel, Droplet, Wrench, AlertTriangle, TrendingUp } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28 bg-gradient-to-b from-emerald-50/50 via-background to-background">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.92_0.01_145)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.92_0.01_145)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-sm font-medium mb-6 animate-fade-in-up">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Para fazendas, usinas, construtoras e transportadoras
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1] mb-6 animate-fade-in-up">
              Controle total do{" "}
              <span className="text-emerald-600">combustível</span> e da{" "}
              <span className="text-emerald-600">manutenção</span> da sua frota
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0 animate-fade-in-up">
              Registre entrada, abastecimento e manutenção em poucos toques,
              pelo celular, no campo. Menos desperdício, mais rastreabilidade —
              tudo num só lugar.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start animate-fade-in-up">
              <Link href="/app/cadastro">
                <Button
                  size="lg"
                  className="bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-lg shadow-amber-500/20"
                >
                  Começar agora
                </Button>
              </Link>
              <Link href="#como-funciona">
                <Button size="lg" variant="outline" className="font-semibold">
                  Ver como funciona
                </Button>
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground justify-center lg:justify-start">
              <div>
                <span className="font-bold text-foreground">14 dias</span> grátis
              </div>
              <div className="h-1 w-1 rounded-full bg-muted-foreground/40" />
              <div>Sem cartão de crédito</div>
            </div>
          </div>

          {/* Mobile mockup */}
          <div className="relative mx-auto max-w-sm">
            <PhoneMockup />
            {/* Floating cards */}
            <div className="absolute -top-4 -left-8 sm:-left-12 bg-white rounded-2xl shadow-xl border border-emerald-100 p-3 animate-float">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100">
                  <Droplet className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Litros abastecidos</p>
                  <p className="font-bold text-foreground">300 L</p>
                </div>
              </div>
            </div>

            <div
              className="absolute top-1/2 -right-4 sm:-right-10 bg-white rounded-2xl shadow-xl border border-amber-100 p-3 animate-float"
              style={{ animationDelay: "0.5s" }}
            >
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100">
                  <Wrench className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Troca de óleo</p>
                  <p className="font-bold text-amber-600">em 12 h</p>
                </div>
              </div>
            </div>

            <div
              className="absolute -bottom-4 -left-4 sm:-left-12 bg-white rounded-2xl shadow-xl border border-red-100 p-3 animate-float"
              style={{ animationDelay: "1s" }}
            >
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Estoque</p>
                  <p className="font-bold text-red-600">baixo</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Highlights strip */}
        <div className="mt-16 sm:mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: TrendingUp, label: "Menos desperdício", color: "text-emerald-600" },
            { icon: Fuel, label: "100% rastreável", color: "text-emerald-600" },
            { icon: AlertTriangle, label: "Alertas em tempo real", color: "text-amber-600" },
            { icon: Droplet, label: "Controle de reservatórios", color: "text-emerald-600" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border"
            >
              <item.icon className={`h-6 w-6 ${item.color}`} />
              <span className="font-semibold text-sm">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[280px] h-[560px] bg-slate-900 rounded-[2.5rem] p-2.5 shadow-2xl">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-10" />
      <div className="relative w-full h-full bg-gradient-to-b from-emerald-50 to-white rounded-[2rem] overflow-hidden">
        <div className="px-4 pt-8 pb-3 bg-white border-b border-emerald-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white text-xs font-bold">
                F
              </div>
              <span className="font-bold text-sm">FuelGest</span>
            </div>
            <div className="text-xs text-muted-foreground">Fazenda São João</div>
          </div>
        </div>
        <div className="p-3 space-y-2.5">
          {/* Cards */}
          <div className="grid grid-cols-2 gap-2">
            <Card label="Estoque" value="12.500 L" trend="↑15%" />
            <Card label="Litros/mês" value="28.750 L" trend="↑12%" />
            <Card label="Custo/mês" value="R$ 87.540" trend="↑8%" />
            <Card label="Alertas" value="3" color="text-amber-600" />
          </div>

          <div className="bg-white p-3 rounded-xl border border-emerald-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold">Consumo médio</span>
              <span className="text-xs text-emerald-600 font-bold">6.8 km/L</span>
            </div>
            <svg viewBox="0 0 200 60" className="w-full">
              <polyline
                points="0,50 25,45 50,40 75,38 100,28 125,22 150,18 175,12 200,8"
                fill="none"
                stroke="#10B981"
                strokeWidth="2"
              />
              <polyline
                points="0,50 25,45 50,40 75,38 100,28 125,22 150,18 175,12 200,8 200,60 0,60"
                fill="url(#grad-em)"
                opacity="0.2"
              />
              <defs>
                <linearGradient id="grad-em" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="#10B981" />
                  <stop offset="1" stopColor="#10B981" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="bg-white p-3 rounded-xl border border-amber-200">
            <div className="flex items-center gap-2 mb-1">
              <Wrench className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-xs font-semibold">Troca de óleo</span>
            </div>
            <p className="text-xs text-muted-foreground">Faltam 12h · Caminhão #1</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ label, value, trend, color }: { label: string; value: string; trend?: string; color?: string }) {
  return (
    <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
      <p className="text-[10px] text-muted-foreground mb-0.5">{label}</p>
      <p className={`text-sm font-bold ${color || ""}`}>{value}</p>
      {trend && <p className="text-[10px] text-emerald-600 mt-0.5">{trend}</p>}
    </div>
  );
}
