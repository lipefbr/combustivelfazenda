"use client";

import { useApi } from "@/hooks/use-session";
import Link from "next/link";
import {
  Droplet,
  Fuel,
  Wrench,
  AlertTriangle,
  TrendingUp,
  Truck,
  Receipt,
  ArrowRight,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatBRL, formatNumber, formatDateTime, CONTROL_TYPE_LABELS, EQUIPMENT_TYPE_LABELS } from "@/lib/constants";

export default function DashboardPage() {
  const { data, loading, error } = useApi<any>("/api/dashboard");

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-muted rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-red-600 mb-2">Erro ao carregar dados.</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </Card>
    );
  }

  const cards = data?.cards;
  const reservoirs = data?.reservoirs || [];
  const recentRefuelings = data?.recentRefuelings || [];
  const maintenanceAlerts = data?.maintenanceAlerts || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Início</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Visão geral da operação.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/app/abastecimentos/novo">
            <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
              <Fuel className="h-4 w-4" /> Novo Abastecimento
            </Button>
          </Link>
          <Link href="/app/estoque/entrada">
            <Button variant="outline" className="gap-2">
              <Droplet className="h-4 w-4 text-emerald-600" /> Entrada
            </Button>
          </Link>
        </div>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={Droplet}
          label="Estoque total"
          value={`${formatNumber(cards?.totalStock || 0)} L`}
          color="emerald"
          trend="↑15%"
          trendColor="emerald"
        />
        <StatCard
          icon={Fuel}
          label="Litros no mês"
          value={`${formatNumber(cards?.litersMonth || 0)} L`}
          color="emerald"
          trend="↑12%"
          trendColor="emerald"
        />
        <StatCard
          icon={Receipt}
          label="Custo do mês"
          value={formatBRL(cards?.costMonth || 0)}
          color="amber"
          trend="↑8%"
          trendColor="emerald"
        />
        <StatCard
          icon={AlertTriangle}
          label="Alertas ativos"
          value={String(cards?.activeAlertsCount || 0)}
          color={cards?.activeAlertsCount > 0 ? "amber" : "emerald"}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Reservatórios */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Reservatórios</h2>
            <Link href="/app/estoque">
              <Button variant="ghost" size="sm" className="gap-1 text-emerald-600">
                Ver tudo <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          {reservoirs.length === 0 ? (
            <EmptyState
              icon={Droplet}
              message="Nenhum reservatório cadastrado."
              ctaHref="/app/estoque"
              ctaLabel="Cadastrar reservatório"
            />
          ) : (
            <div className="space-y-3">
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
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{r.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {r.fuelType}
                        </Badge>
                        {isLow && (
                          <Badge variant="destructive" className="text-xs">
                            Baixo
                          </Badge>
                        )}
                      </div>
                      <span className="text-muted-foreground text-xs">
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
            </div>
          )}
        </Card>

        {/* Manutenções pendentes */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Manutenções</h2>
            <Link href="/app/manutencoes">
              <Button variant="ghost" size="sm" className="gap-1 text-emerald-600">
                Ver <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          {maintenanceAlerts.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              message="Tudo em dia!"
              description="Nenhuma manutenção pendente."
            />
          ) : (
            <div className="space-y-2.5">
              {maintenanceAlerts.slice(0, 5).map((m: any) => (
                <div
                  key={m.itemId}
                  className={`p-3 rounded-xl border-l-4 ${
                    m.level === "danger"
                      ? "bg-red-50 border-red-500"
                      : "bg-amber-50 border-amber-500"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{m.itemName}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.equipmentName}
                      </p>
                      <p className="text-xs mt-1">
                        {m.level === "danger"
                          ? `Vencido há ${Math.abs(m.remaining).toFixed(0)} ${
                              m.controlType === "hours" ? "h" : "km"
                            }`
                          : `Faltam ${m.remaining.toFixed(0)} ${
                              m.controlType === "hours" ? "h" : "km"
                            }`}
                      </p>
                    </div>
                    {m.level === "danger" ? (
                      <Badge variant="destructive" className="text-[10px]">
                        VENCIDO
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-500 text-[10px]">PRÓXIMO</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Consumo por equipamento (gráfico simples) */}
      <Card className="p-5">
        <h2 className="font-bold text-lg mb-4">Consumo por equipamento (mês atual)</h2>
        {data?.consumptions && data.consumptions.length > 0 ? (
          <div className="space-y-3">
            {data.consumptions
              .filter((c: any) => c.liters > 0)
              .slice(0, 8)
              .map((c: any) => {
                const max = Math.max(
                  ...data.consumptions.map((x: any) => x.liters)
                );
                const percent = max > 0 ? (c.liters / max) * 100 : 0;
                return (
                  <div key={c.equipmentId} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{c.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {EQUIPMENT_TYPE_LABELS[c.type] || c.type}
                        </Badge>
                      </div>
                      <span className="text-muted-foreground text-xs">
                        {formatNumber(c.liters)} L · {formatBRL(c.cost)} ·{" "}
                        {c.avgConsumption != null
                          ? `${c.avgConsumption.toFixed(1)} ${
                              c.controlType === "hours" ? "L/h" : "km/L"
                            }`
                          : "—"}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-emerald-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <EmptyState
            icon={TrendingUp}
            message="Sem abastecimentos no mês."
            ctaHref="/app/abastecimentos/novo"
            ctaLabel="Registrar abastecimento"
          />
        )}
      </Card>

      {/* Últimos abastecimentos */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Últimos abastecimentos</h2>
          <Link href="/app/abastecimentos">
            <Button variant="ghost" size="sm" className="gap-1 text-emerald-600">
              Ver histórico <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
        {recentRefuelings.length === 0 ? (
          <EmptyState
            icon={Fuel}
            message="Nenhum abastecimento ainda."
            ctaHref="/app/abastecimentos/novo"
            ctaLabel="Novo abastecimento"
          />
        ) : (
          <div className="divide-y divide-border">
            {recentRefuelings.map((r: any) => (
              <div key={r.id} className="py-3 flex items-center gap-3 first:pt-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Fuel className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {r.equipment.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(r.refuelDate)} · {r.operatorName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">
                    {formatNumber(r.liters)} L
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatBRL(r.totalAmount)}
                  </p>
                </div>
                <Badge
                  variant={r.source === "reservoir" ? "default" : "secondary"}
                  className="text-[10px] hidden sm:inline-block"
                >
                  {r.source === "reservoir"
                    ? r.reservoir?.name || "Reservatório"
                    : "Posto"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  trend,
  trendColor,
}: {
  icon: any;
  label: string;
  value: string;
  color: "emerald" | "amber";
  trend?: string;
  trendColor?: string;
}) {
  const colorClasses = {
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
  };
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between mb-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${colorClasses[color]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span
            className={`text-xs font-medium ${
              trendColor === "emerald" ? "text-emerald-600" : "text-amber-600"
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-xl sm:text-2xl font-bold">{value}</p>
    </Card>
  );
}

function EmptyState({
  icon: Icon,
  message,
  description,
  ctaHref,
  ctaLabel,
}: {
  icon: any;
  message: string;
  description?: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="text-center py-8">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="font-medium mb-1">{message}</p>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {ctaHref && ctaLabel && (
        <Link href={ctaHref} className="mt-3 inline-block">
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
            {ctaLabel}
          </Button>
        </Link>
      )}
    </div>
  );
}
