"use client";

import { useState } from "react";
import { Home, Droplet, Wrench, BarChart3, Fuel } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppDemo() {
  const [tab, setTab] = useState(0);
  const tabs = [
    { name: "Início", icon: Home },
    { name: "Abastecer", icon: Fuel },
    { name: "Manutenção", icon: Wrench },
    { name: "Relatórios", icon: BarChart3 },
  ];

  return (
    <section className="py-20 sm:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Veja o app na prática
          </h2>
          <p className="text-muted-foreground text-lg">
            Simule as telas principais que você e sua equipe vão usar no dia a dia.
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {tabs.map((t, i) => (
            <button
              key={t.name}
              onClick={() => setTab(i)}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                tab === i
                  ? "bg-emerald-600 text-white shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700"
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.name}
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          {tab === 0 && <DashboardScreen />}
          {tab === 1 && <NewRefuelScreen />}
          {tab === 2 && <MaintenanceScreen />}
          {tab === 3 && <ReportsScreen />}
        </div>
      </div>
    </section>
  );
}

function PhoneShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-[300px] h-[600px] bg-slate-900 rounded-[2.5rem] p-2.5 shadow-2xl">
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
          </div>
        </div>
        <div className="h-[calc(100%-72px)] overflow-hidden p-3">{children}</div>
      </div>
    </div>
  );
}

function DashboardScreen() {
  return (
    <PhoneShell>
      <div className="space-y-2.5 text-sm">
        <p className="text-xs text-muted-foreground">Fazenda São João</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
            <p className="text-[10px] text-muted-foreground">Total em estoque</p>
            <p className="text-sm font-bold">12.500 L</p>
            <p className="text-[10px] text-emerald-600">↑15%</p>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
            <p className="text-[10px] text-muted-foreground">Litros no mês</p>
            <p className="text-sm font-bold">28.750 L</p>
            <p className="text-[10px] text-emerald-600">↑12%</p>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
            <p className="text-[10px] text-muted-foreground">Custo do mês</p>
            <p className="text-sm font-bold">R$ 87.540</p>
            <p className="text-[10px] text-emerald-600">↑8%</p>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-amber-200">
            <p className="text-[10px] text-muted-foreground">Alertas</p>
            <p className="text-sm font-bold text-amber-600">3 ativos</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-emerald-600 p-3 rounded-xl text-white text-center font-semibold">
            <Fuel className="h-5 w-5 mx-auto mb-1" />
            Novo
          </div>
          <div className="bg-white border border-emerald-200 p-3 rounded-xl text-emerald-700 text-center font-semibold">
            <Droplet className="h-5 w-5 mx-auto mb-1" />
            Entrada
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-emerald-100">
          <div className="flex justify-between mb-1">
            <span className="text-xs font-semibold">Consumo médio</span>
            <span className="text-xs text-emerald-600 font-bold">6.8 km/L</span>
          </div>
          <svg viewBox="0 0 200 50" className="w-full">
            <polyline
              points="0,40 25,35 50,30 75,28 100,18 125,12 150,8 175,5 200,2"
              fill="none"
              stroke="#10B981"
              strokeWidth="2"
            />
          </svg>
        </div>
        <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
          <div className="flex items-center gap-2 mb-1">
            <Wrench className="h-3.5 w-3.5 text-amber-600" />
            <span className="text-xs font-semibold">Troca de óleo do motor</span>
          </div>
          <p className="text-xs text-muted-foreground">Caminhão #1 · faltam 12 h</p>
        </div>
      </div>
    </PhoneShell>
  );
}

function NewRefuelScreen() {
  return (
    <PhoneShell>
      <div className="space-y-3 text-sm">
        <div className="text-center py-2">
          <p className="text-xs text-muted-foreground">Etapa 1 de 5</p>
          <p className="font-bold">Origem do abastecimento</p>
        </div>
        <div className="space-y-2">
          <button className="w-full p-3 rounded-xl bg-emerald-600 text-white text-left font-semibold">
            <Droplet className="h-5 w-5 inline mr-2" />
            Do reservatório da fazenda
          </button>
          <button className="w-full p-3 rounded-xl bg-white border border-emerald-200 text-left">
            <Fuel className="h-5 w-5 inline mr-2 text-emerald-600" />
            Posto externo
          </button>
        </div>
        <div className="bg-white p-3 rounded-xl border border-emerald-100">
          <p className="text-xs font-semibold mb-2">Reservatórios disponíveis</p>
          <div className="flex justify-between text-xs">
            <span>Reservatório 1</span>
            <span className="font-bold">8.200 L</span>
          </div>
          <div className="h-1.5 bg-emerald-100 rounded-full mt-1">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: "65%" }} />
          </div>
        </div>
        <button className="w-full py-2.5 bg-amber-500 text-white rounded-xl font-semibold">
          Avançar
        </button>
      </div>
    </PhoneShell>
  );
}

function MaintenanceScreen() {
  return (
    <PhoneShell>
      <div className="space-y-2 text-sm">
        <p className="font-bold text-sm mb-2">Manutenções e alertas</p>
        <div className="bg-red-50 p-3 rounded-xl border-l-4 border-red-500">
          <div className="flex justify-between">
            <span className="font-semibold text-xs">Filtro de óleo</span>
            <span className="text-[10px] bg-red-600 text-white px-1.5 rounded">VENCIDO</span>
          </div>
          <p className="text-[10px] text-muted-foreground">Trator MF · 28 h atrás</p>
        </div>
        <div className="bg-amber-50 p-3 rounded-xl border-l-4 border-amber-500">
          <div className="flex justify-between">
            <span className="font-semibold text-xs">Troca de óleo do motor</span>
            <span className="text-[10px] bg-amber-600 text-white px-1.5 rounded">12 H</span>
          </div>
          <p className="text-[10px] text-muted-foreground">Caminhão #1 · faltam 12 h</p>
        </div>
        <div className="bg-emerald-50 p-3 rounded-xl border-l-4 border-emerald-500">
          <div className="flex justify-between">
            <span className="font-semibold text-xs">Filtro de combustível</span>
            <span className="text-[10px] bg-emerald-600 text-white px-1.5 rounded">EM DIA</span>
          </div>
          <p className="text-[10px] text-muted-foreground">Escavadeira · 150 h restantes</p>
        </div>
        <button className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-semibold mt-3">
          Registrar manutenção realizada
        </button>
      </div>
    </PhoneShell>
  );
}

function ReportsScreen() {
  return (
    <PhoneShell>
      <div className="space-y-2 text-sm">
        <p className="font-bold text-sm">Relatórios</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            "Consumo por equipamento",
            "Abastecimentos por operador",
            "Fazenda x Terceiros",
            "Entradas x Saídas",
            "Custo por equipamento",
            "Manutenções",
          ].map((label, i) => (
            <div
              key={i}
              className="p-2.5 bg-white border border-emerald-100 rounded-xl"
            >
              <BarChart3 className="h-4 w-4 text-emerald-600 mb-1" />
              <p className="text-[11px] font-medium leading-tight">{label}</p>
            </div>
          ))}
        </div>
        <div className="bg-white p-3 rounded-xl border border-emerald-100 mt-2">
          <p className="text-xs font-semibold mb-1">Consumo por equipamento</p>
          <div className="space-y-1.5">
            <div>
              <div className="flex justify-between text-[10px]">
                <span>Caminhão #1</span>
                <span className="font-bold">2.400 L</span>
              </div>
              <div className="h-1.5 bg-emerald-100 rounded-full">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "85%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px]">
                <span>Trator MF</span>
                <span className="font-bold">1.800 L</span>
              </div>
              <div className="h-1.5 bg-emerald-100 rounded-full">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "65%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px]">
                <span>Escavadeira</span>
                <span className="font-bold">1.200 L</span>
              </div>
              <div className="h-1.5 bg-emerald-100 rounded-full">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "45%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PhoneShell>
  );
}
