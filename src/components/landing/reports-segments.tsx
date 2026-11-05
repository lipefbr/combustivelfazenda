"use client";

import { BarChart3, TrendingUp, FileText, FileSpreadsheet } from "lucide-react";

export function ReportsPreview() {
  return (
    <section id="relatorios" className="py-20 sm:py-24 bg-slate-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block rounded-full bg-emerald-500/20 text-emerald-400 px-3 py-1 text-sm font-medium mb-4">
              Relatórios completos
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Decisões com dados, não com achismo
            </h2>
            <p className="text-slate-300 text-lg mb-8">
              Cada litro, cada real, cada hora — registrado e exportável.
              Relatórios prontos para gestão, contador e auditoria.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {[
                "Consumo por equipamento (L/h, km/L)",
                "Abastecimentos por operador",
                "Fazenda x Terceiros",
                "Entradas x Saídas por reservatório",
                "Custo por equipamento",
                "Manutenções realizadas e vencidas",
              ].map((label, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-3 rounded-xl bg-slate-800/50 border border-slate-700"
                >
                  <BarChart3 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-sm text-slate-200">{label}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600">
                <FileText className="h-4 w-4" />
                <span className="font-semibold text-sm">Exportar PDF</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500">
                <FileSpreadsheet className="h-4 w-4" />
                <span className="font-semibold text-sm">Exportar Excel/CSV</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Consumo mensal</h3>
                <span className="flex items-center gap-1 text-emerald-400 text-sm font-semibold">
                  <TrendingUp className="h-4 w-4" /> +12% este mês
                </span>
              </div>
              <div className="flex items-end gap-2 h-40">
                {[60, 75, 50, 90, 70, 100, 85, 95, 60, 80, 90, 110].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-slate-400">
                <span>Jan</span>
                <span>Dez</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700">
                <p className="text-xs text-slate-400 mb-1">Custo total (mês)</p>
                <p className="text-2xl font-bold">R$ 87.540</p>
                <p className="text-xs text-emerald-400">↑8% vs mês anterior</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700">
                <p className="text-xs text-slate-400 mb-1">Litros abastecidos</p>
                <p className="text-2xl font-bold">28.750 L</p>
                <p className="text-xs text-emerald-400">↑12%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Segments() {
  const items = [
    {
      title: "Agronegócio",
      desc: "Fazendas, haras, lavouras — controle de tratores, colhadeiras e caminhões por horímetro.",
      emoji: "🌾",
    },
    {
      title: "Construção civil",
      desc: "Caminhões, escavadeiras, pá carregadeira — equipamentos próprios e de terceiros.",
      emoji: "🏗️",
    },
    {
      title: "Mineração",
      desc: "Operação intensa, alto consumo. Controle de manutenção crítica com alertas.",
      emoji: "⛏️",
    },
    {
      title: "Transportadoras",
      desc: "Frota de caminhões por hodômetro, controle por rota, relatórios para gestão.",
      emoji: "🚛",
    },
    {
      title: "Prefeituras",
      desc: "Prestação de contas simplificada com relatórios em PDF e rastreabilidade total.",
      emoji: "🏛️",
    },
    {
      title: "Usinas",
      desc: "Operação 24/7, múltiplas máquinas, controle de custo por equipamento.",
      emoji: "🏭",
    },
  ];
  return (
    <section className="py-20 sm:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Para quem é</h2>
          <p className="text-muted-foreground text-lg">
            Qualquer operação que dependa de frota, máquinas pesadas e combustível.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-card border border-border hover:border-emerald-300 hover:shadow-lg transition-all"
            >
              <div className="text-4xl mb-3">{item.emoji}</div>
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
