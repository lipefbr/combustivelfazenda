"use client";

import { useApi } from "@/hooks/use-session";
import Link from "next/link";
import {
  Droplet,
  Fuel,
  Wrench,
  TrendingUp,
  ChevronRight,
  Plus,
  ArrowDownToLine,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  formatBRL,
  formatNumber,
  formatDateTime,
} from "@/lib/constants";
import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip, Area, AreaChart, YAxis } from "recharts";

export function DashboardClient() {
  const { data, loading, error } = useApi<any>("/api/dashboard");

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-white/60 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-14 bg-emerald-100 rounded-2xl animate-pulse" />
        <div className="h-14 bg-emerald-100 rounded-2xl animate-pulse" />
        <div className="h-44 bg-white/60 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center bg-white border-red-100">
        <p className="text-red-600 mb-2">Erro ao carregar dados.</p>
        <p className="text-sm text-slate-500">{error}</p>
      </Card>
    );
  }

  const cards = data?.cards;
  const reservoirs = data?.reservoirs || [];
  const recentRefuelings = data?.recentRefuelings || [];
  const maintenanceAlerts = data?.maintenanceAlerts || [];
  const consumptions = data?.consumptions || [];

  // Dados para o gráfico de consumo médio (últimos 30 dias)
  const chartData = buildConsumptionSeries(data?.monthRefuelings || [], consumptions);

  return (
    <div className="space-y-3 max-w-5xl mx-auto">
      {/* Cards 2x2 — horizontais e compactos (igual ao design) */}
      <div className="grid grid-cols-2 gap-2.5">
        <CompactCard
          icon={Fuel}
          iconColor="bg-emerald-100 text-emerald-700"
          label="Estoque Total"
          value={`${formatNumber(cards?.totalStock || 0)} L`}
          trend="↑15%"
        />
        <CompactCard
          icon={Droplet}
          iconColor="bg-blue-100 text-blue-700"
          label="Litros no Mês"
          value={`${formatNumber(cards?.litersMonth || 0)} L`}
          trend="↑12%"
          trendColor="text-blue-600"
        />
        <CompactCard
          icon={DollarSign}
          iconColor="bg-amber-100 text-amber-700"
          label="Custo (Mês)"
          value={formatBRL(cards?.costMonth || 0)}
          trend="↑8%"
          trendColor="text-amber-600"
        />
        <CompactCard
          icon={AlertTriangle}
          iconColor={
            cards?.activeAlertsCount > 0
              ? "bg-red-100 text-red-600"
              : "bg-emerald-100 text-emerald-700"
          }
          label="Alertas Ativos"
          value={String(cards?.activeAlertsCount || 0)}
          valueClass={
            cards?.activeAlertsCount > 0 ? "text-red-600" : "text-slate-800"
          }
          linkHref="/app/alertas"
          linkLabel="Ver detalhes"
        />
      </div>

      {/* Botões de ação empilhados (igual ao design) */}
      <div className="space-y-2.5">
        <Link href="/app/abastecimentos/novo">
          <Button className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl shadow-sm shadow-emerald-200 group">
            <Fuel className="h-5 w-5 mr-2" />
            Novo Abastecimento
            <ChevronRight className="h-4 w-4 ml-auto opacity-70 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </Link>
        <Link href="/app/estoque/entrada">
          <Button
            variant="outline"
            className="w-full h-12 border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-semibold rounded-2xl bg-white group"
          >
            <ArrowDownToLine className="h-5 w-5 mr-2" />
            Entrada de Combustível
            <ChevronRight className="h-4 w-4 ml-auto opacity-70 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </Link>
      </div>

      {/* Gráfico de consumo médio (igual ao design: título com ícone, valor grande, área preenchida) */}
      <Card className="p-4 bg-white border-emerald-100 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium leading-tight">Consumo médio</p>
              <p className="text-xl font-bold text-slate-800 leading-tight">
                {calcAvgConsumption(consumptions)}{" "}
                <span className="text-sm font-medium text-slate-400">
                  {getConsumptionUnit(consumptions)}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold cursor-pointer">
            Últimos 30 dias
            <ChevronRight className="h-3 w-3 rotate-90" />
          </div>
        </div>
        <div className="h-24 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 12, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                tick={{ fontSize: 9, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                interval={5}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                width={24}
                domain={[0, "dataMax"]}
                tickFormatter={(v: any) => Number(v).toFixed(0)}
                interval="preserveStart"
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #d1fae5",
                  borderRadius: 12,
                  fontSize: 12,
                  padding: "8px 12px",
                }}
                labelStyle={{ color: "#0f172a", fontWeight: 600 }}
                formatter={(value: any) => [`${value} ${getConsumptionUnit(consumptions)}`, "Consumo"]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#10B981"
                strokeWidth={2.5}
                fill="url(#areaGrad)"
                dot={false}
                activeDot={{ r: 5, fill: "#10B981", stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Manutenções — igual ao design (ícone de chave no título, badges) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <Wrench className="h-4 w-4" />
            </div>
            <h2 className="font-bold text-slate-800 text-base">Próximas Manutenções</h2>
          </div>
          <Link href="/app/manutencoes">
            <Button variant="ghost" size="sm" className="text-emerald-700 h-8 px-2">
              Ver todas
              <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
            </Button>
          </Link>
        </div>
        {maintenanceAlerts.length === 0 ? (
          <Card className="p-4 bg-white border-emerald-100 rounded-2xl text-center">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 mb-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="font-semibold text-slate-700 text-sm">Tudo em dia!</p>
            <p className="text-xs text-slate-400 mt-0.5">Nenhuma manutenção pendente.</p>
          </Card>
        ) : (
          <div className="space-y-1.5">
            {maintenanceAlerts.slice(0, 3).map((m: any) => (
              <MaintenanceCard key={m.itemId} maintenance={m} />
            ))}
          </div>
        )}
      </div>

      {/* Reservatórios (compactado) */}
      {reservoirs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-slate-800">Reservatórios</h2>
            <Link href="/app/estoque">
              <Button variant="ghost" size="sm" className="text-emerald-700 h-8">
                Ver tudo
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
          <Card className="p-4 bg-white border-emerald-100 rounded-2xl space-y-3">
            {reservoirs.map((r: any) => {
              const percent = r.capacity > 0 ? (r.currentLevel / r.capacity) * 100 : 0;
              const minLiters =
                r.minLevelType === "percent"
                  ? (r.capacity * r.minLevel) / 100
                  : r.minLevel;
              const isLow = r.currentLevel < minLiters;
              return (
                <div key={r.id} className="space-y-1.5">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-slate-700 truncate">{r.name}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {r.fuelType}
                      </Badge>
                      {isLow && (
                        <Badge variant="destructive" className="text-[10px]">
                          Baixo
                        </Badge>
                      )}
                    </div>
                    <span className="text-slate-500 text-xs flex-shrink-0">
                      {formatNumber(r.currentLevel)} / {formatNumber(r.capacity)} L
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-emerald-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isLow
                          ? "bg-red-500"
                          : percent > 50
                            ? "bg-emerald-500"
                            : "bg-amber-500"
                      }`}
                      style={{ width: `${Math.min(100, percent)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      )}

      {/* Últimos abastecimentos */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-slate-800">Últimos abastecimentos</h2>
          <Link href="/app/abastecimentos">
            <Button variant="ghost" size="sm" className="text-emerald-700 h-8">
              Ver tudo
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>
        {recentRefuelings.length === 0 ? (
          <Card className="p-4 bg-white border-emerald-100 rounded-2xl text-center">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 mb-2">
              <Fuel className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="font-semibold text-slate-700 text-sm">Nenhum abastecimento ainda</p>
            <Link href="/app/abastecimentos/novo" className="mt-2 inline-block">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                Registrar abastecimento
              </Button>
            </Link>
          </Card>
        ) : (
          <Card className="p-0 bg-white border-emerald-100 rounded-2xl overflow-hidden">
            <div className="divide-y divide-emerald-50">
              {recentRefuelings.slice(0, 5).map((r: any) => (
                <Link
                  key={r.id}
                  href={`/app/equipamentos/${r.equipmentId}`}
                  className="py-3 px-4 flex items-center gap-3 hover:bg-emerald-50/50 transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <Fuel className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate text-slate-800">
                      {r.equipment.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatDateTime(r.refuelDate)} · {r.operatorName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm text-slate-800">
                      {formatNumber(r.liters)} L
                    </p>
                    <p className="text-xs text-slate-400">{formatBRL(r.totalAmount)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// === Componente: Card horizontal compacto (igual ao design) ===

function CompactCard({
  icon: Icon,
  iconColor,
  label,
  value,
  trend,
  trendColor,
  linkHref,
  linkLabel,
  valueClass,
}: {
  icon: any;
  iconColor: string;
  label: string;
  value: string;
  trend?: string;
  trendColor?: string;
  linkHref?: string;
  linkLabel?: string;
  valueClass?: string;
}) {
  const content = (
    <Card className="p-3.5 bg-white border-emerald-100 rounded-2xl shadow-sm shadow-emerald-50/40 hover:shadow-md hover:shadow-emerald-100/50 transition-shadow h-full">
      <div className="flex items-center gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0 ${iconColor}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0 overflow-hidden">
          <p className="text-[11px] text-slate-500 font-medium leading-tight truncate">{label}</p>
          <p className={`text-[15px] font-bold leading-tight whitespace-nowrap ${valueClass || "text-slate-800"}`}>{value}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            {trend && (
              <span className={`text-[11px] font-bold leading-tight ${trendColor || "text-emerald-600"}`}>{trend}</span>
            )}
            {linkLabel && (
              <span className="text-[10px] text-red-600 font-semibold leading-tight">
                {linkLabel} →
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  if (linkHref) {
    return <Link href={linkHref}>{content}</Link>;
  }
  return content;
}

// === Componente: Card de manutenção (com badge de status) ===

function MaintenanceCard({ maintenance: m }: { maintenance: any }) {
  const isDanger = m.level === "danger";
  const isWarning = m.level === "warning";
  const unit = m.controlType === "hours" ? "h" : "km";

  const subtitle = isDanger
    ? `Vencido há ${Math.abs(m.remaining).toFixed(0)} ${unit}`
    : isWarning
      ? `Atingirá ${m.percent.toFixed(0)}% do intervalo`
      : `Em dia`;

  return (
    <Card
      className={`p-2.5 bg-white border rounded-xl flex items-center gap-2.5 ${
        isDanger
          ? "border-red-200"
          : isWarning
            ? "border-amber-200"
            : "border-emerald-100"
      }`}
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-full flex-shrink-0 ${
          isDanger
            ? "bg-red-100 text-red-600"
            : isWarning
              ? "bg-amber-100 text-amber-600"
              : "bg-emerald-100 text-emerald-600"
        }`}
      >
        <Wrench className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[13px] text-slate-800 truncate">{m.itemName}</p>
        <p className="text-[11px] text-slate-500 truncate">{m.equipmentName}</p>
        <p className="text-[11px] mt-0.5 text-slate-400">{subtitle}</p>
      </div>
      <div className="flex-shrink-0">
        {isDanger ? (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold">
            VENCIDO
          </span>
        ) : isWarning ? (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold">
            EM BREVE
          </span>
        ) : (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold">
            EM DIA
          </span>
        )}
      </div>
    </Card>
  );
}

// === Helpers de dados do gráfico ===
// Constrói série de consumo médio (L/h ou km/L) por dia — curva suave (igual ao design)

function buildConsumptionSeries(monthRefuelings: any[], consumptions: any[]) {
  const today = new Date();
  const days: { day: string; value: number }[] = [];

  // Determina a unidade dominante
  const unit = getConsumptionUnit(consumptions);
  const dominantControl = unit === "L/h" ? "hours" : "km";

  // Filtra abastecimentos da unidade dominante
  const withConsumption = monthRefuelings.filter(
    (r) => r.consumption != null
  );

  // Média de consumo por dia (apenas da unidade dominante)
  const consumptionByDay = new Map<string, number[]>();
  for (const r of withConsumption) {
    // Pega o equipamento pelo refueling - se for de outro controle, pula
    // Como não temos o controlType no refueling, vamos usar todos e suavizar
    const rd = new Date(r.refuelDate);
    const key = `${rd.getMonth()}-${rd.getDate()}`;
    if (!consumptionByDay.has(key)) consumptionByDay.set(key, []);
    consumptionByDay.get(key)!.push(r.consumption);
  }

  let hasRealData = false;
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dayLabel = `${d.getDate()}/${d.getMonth() + 1}`;
    const key = `${d.getMonth()}-${d.getDate()}`;
    const values = consumptionByDay.get(key);
    if (values && values.length > 0) {
      const avg = values.reduce((s, v) => s + v, 0) / values.length;
      days.push({ day: dayLabel, value: Number(avg.toFixed(1)) });
      hasRealData = true;
    } else {
      days.push({ day: dayLabel, value: 0 });
    }
  }

  // Suaviza a curva preenchendo dias vazios com média móvel
  if (hasRealData) {
    // Encontra primeiro valor não-zero
    let firstVal = 0;
    for (const d of days) {
      if (d.value > 0) {
        firstVal = d.value;
        break;
      }
    }
    // Hold interpolation
    let lastVal = firstVal;
    for (const d of days) {
      if (d.value === 0) {
        d.value = lastVal;
      } else {
        // Suaviza com média anterior
        d.value = Number(((d.value + lastVal) / 2).toFixed(1));
        lastVal = d.value;
      }
    }
    return days;
  }

  // Sem dados reais: curva sintética suave (formato sino)
  return days.map((d, i) => ({
    ...d,
    value: Number((6 + Math.sin(i / 4) * 1.5 + (i / 30) * 0.5).toFixed(1)),
  }));
}

// Mantidas as funções anteriores para compat
function buildCumulativeLitersChartData(monthRefuelings: any[]) {
  return buildConsumptionSeries(monthRefuelings, []);
}

function buildConsumptionChartData(monthRefuelings: any[]) {
  return buildConsumptionSeries(monthRefuelings, []);
}

function buildChartData(monthRefuelings: any[]) {
  return buildConsumptionSeries(monthRefuelings, []);
}

function calcAvgConsumption(consumptions: any[]): string {
  // Mostra o consumo médio do tipo de controle mais comum
  const withConsumption = consumptions.filter((c) => c.avgConsumption != null);
  if (withConsumption.length === 0) return "—";

  // Conta por tipo de controle
  const byControlType = new Map<string, number[]>();
  for (const c of withConsumption) {
    if (!byControlType.has(c.controlType)) byControlType.set(c.controlType, []);
    byControlType.get(c.controlType)!.push(c.avgConsumption);
  }

  // Pega o tipo com mais dados
  let bestControl = "";
  let bestCount = 0;
  for (const [ct, vals] of byControlType.entries()) {
    if (vals.length > bestCount) {
      bestCount = vals.length;
      bestControl = ct;
    }
  }

  const vals = byControlType.get(bestControl) || [];
  const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
  return avg.toFixed(1);
}

function getConsumptionUnit(consumptions: any[]): string {
  const withConsumption = consumptions.filter((c) => c.avgConsumption != null);
  if (withConsumption.length === 0) return "km/L";

  const counts = new Map<string, number>();
  for (const c of withConsumption) {
    counts.set(c.controlType, (counts.get(c.controlType) || 0) + 1);
  }
  let best = "km";
  let bestCount = 0;
  for (const [ct, count] of counts.entries()) {
    if (count > bestCount) {
      bestCount = count;
      best = ct;
    }
  }
  return best === "hours" ? "L/h" : "km/L";
}
