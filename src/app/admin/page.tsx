"use client";

import { useApi } from "@/hooks/use-session";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  Truck,
  Fuel,
  DollarSign,
  TrendingUp,
  MessageSquare,
  AlertTriangle,
  Wrench,
  Droplets,
  Activity,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  formatBRL,
  formatNumber,
  formatDate,
} from "@/lib/constants";

export default function AdminDashboardPage() {
  const { data, loading, error } = useApi<any>("/api/admin/dashboard");

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-red-600 mb-1">Erro ao carregar o dashboard.</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </Card>
    );
  }

  const cards = data?.cards || {};
  const monthlyData = data?.monthlyData || [];
  const topCompanies = data?.topCompanies || [];
  const topEquipments = data?.topEquipments || [];
  const registrationData = data?.registrationData || [];
  const alerts = data?.alerts || { stock: 0, maintenance: 0 };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visão geral da plataforma FuelGest.
        </p>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={Building2}
          label="Empresas ativas"
          value={String(cards.activeCompanies ?? 0)}
          sub={`${cards.companies ?? 0} no total`}
          color="emerald"
        />
        <StatCard
          icon={Users}
          label="Usuários"
          value={formatNumber(cards.users ?? 0)}
          sub="todos os perfis"
          color="sky"
        />
        <StatCard
          icon={Truck}
          label="Equipamentos"
          value={formatNumber(cards.equipments ?? 0)}
          sub="em uso"
          color="violet"
        />
        <StatCard
          icon={Fuel}
          label="Litros no mês"
          value={`${formatNumber(cards.litersMonth ?? 0, 0)} L`}
          sub="todas as empresas"
          color="emerald"
        />
        <StatCard
          icon={DollarSign}
          label="Custo do mês"
          value={formatBRL(cards.costMonth ?? 0)}
          sub="combustível + despesas"
          color="amber"
        />
        <StatCard
          icon={TrendingUp}
          label="Receita recorrente"
          value={formatBRL(cards.recurringRevenue ?? 0)}
          sub="assinaturas ativas"
          color="emerald"
        />
        <StatCard
          icon={MessageSquare}
          label="Novos leads"
          value={String(cards.leadsNew ?? 0)}
          sub="aguardando contato"
          color="sky"
        />
        <StatCard
          icon={AlertTriangle}
          label="Alertas ativos"
          value={String((alerts.stock || 0) + (alerts.maintenance || 0))}
          sub={`${alerts.stock} estoque · ${alerts.maintenance} manutenção`}
          color="red"
        />
      </div>

      {/* Gráfico de consumo mensal */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-lg">Consumo mensal — últimas 12 safras</h2>
            <p className="text-xs text-muted-foreground">
              Litros e custo agregados de todas as empresas
            </p>
          </div>
          <Badge variant="outline" className="gap-1">
            <Activity className="h-3 w-3" /> Litros
          </Badge>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                stroke="#94a3b8"
              />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip
                formatter={(v: any, name: any) =>
                  name === "liters"
                    ? [`${formatNumber(v, 0)} L`, "Litros"]
                    : [formatBRL(v), "Custo"]
                }
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar
                dataKey="liters"
                name="Litros"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="cost"
                name="Custo"
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Top empresas */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Top 10 empresas (mês)</h2>
            <Building2 className="h-5 w-5 text-emerald-600" />
          </div>
          {topCompanies.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Sem abastecimentos neste mês.
            </p>
          ) : (
            <div className="space-y-2">
              {topCompanies.map((c: any, i: number) => {
                const max = topCompanies[0].liters || 1;
                const pct = (c.liters / max) * 100;
                return (
                  <div
                    key={c.companyId}
                    className="space-y-1"
                  >
                    <div className="flex items-center justify-between text-sm gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100 text-emerald-700 text-xs font-bold shrink-0">
                          {i + 1}
                        </span>
                        <span className="font-medium truncate">
                          {c.companyName}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatNumber(c.liters, 0)} L · {formatBRL(c.cost)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden ml-8">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Top equipamentos */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Top 10 equipamentos (mês)</h2>
            <Truck className="h-5 w-5 text-emerald-600" />
          </div>
          {topEquipments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Sem abastecimentos neste mês.
            </p>
          ) : (
            <div className="space-y-2">
              {topEquipments.map((e: any, i: number) => {
                const max = topEquipments[0].liters || 1;
                const pct = (e.liters / max) * 100;
                return (
                  <div key={e.equipmentId} className="space-y-1">
                    <div className="flex items-center justify-between text-sm gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100 text-emerald-700 text-xs font-bold shrink-0">
                          {i + 1}
                        </span>
                        <span className="font-medium truncate">
                          {e.equipmentName}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatNumber(e.liters, 0)} L · {formatBRL(e.cost)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden ml-8">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Cadastros por mês */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-lg">Cadastros por mês</h2>
            <p className="text-xs text-muted-foreground">
              Novas empresas nos últimos 12 meses
            </p>
          </div>
          <TrendingUp className="h-5 w-5 text-emerald-600" />
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={registrationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#94a3b8"
                allowDecimals={false}
              />
              <Tooltip
                formatter={(v: any) => [v, "Empresas"]}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                name="Empresas"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4, fill: "#10b981" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Alertas globais */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="p-5 border-l-4 border-l-amber-500">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 shrink-0">
              <Droplets className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-lg">{alerts.stock}</p>
              <p className="text-sm text-muted-foreground">
                Alertas de estoque baixo (global)
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5 border-l-4 border-l-red-500">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-700 shrink-0">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-lg">{alerts.maintenance}</p>
              <p className="text-sm text-muted-foreground">
                Manutenções vencidas/próximas (global)
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  sub?: string;
  color: "emerald" | "amber" | "sky" | "violet" | "red";
}) {
  const colorClasses: Record<string, string> = {
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    sky: "bg-sky-100 text-sky-700",
    violet: "bg-violet-100 text-violet-700",
    red: "bg-red-100 text-red-700",
  };
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between mb-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${colorClasses[color]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-xl sm:text-2xl font-bold leading-tight">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>}
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-72" />
      <div className="grid lg:grid-cols-2 gap-4">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}
