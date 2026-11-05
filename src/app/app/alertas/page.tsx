"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useApi } from "@/hooks/use-session";
import {
  Bell,
  AlertTriangle,
  Wrench,
  Droplet,
  Info,
  CircleAlert,
  ChevronRight,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingState, ErrorState, EmptyState } from "@/components/app/states";

import { formatDateTime } from "@/lib/constants";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<string, string> = {
  maintenance: "Manutenção",
  stock: "Estoque",
  system: "Sistema",
};

const TYPE_ICONS: Record<string, any> = {
  maintenance: Wrench,
  stock: Droplet,
  system: Info,
};

const LEVEL_LABELS: Record<string, string> = {
  info: "Informação",
  warning: "Atenção",
  danger: "Urgente",
};

const LEVEL_STYLES: Record<string, string> = {
  info: "bg-blue-50 border-blue-200 text-blue-700",
  warning: "bg-amber-50 border-amber-200 text-amber-700",
  danger: "bg-red-50 border-red-200 text-red-700",
};

const LEVEL_BADGES: Record<string, string> = {
  info: "bg-blue-100 text-blue-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
};

export default function AlertasPage() {
  const { data, error, loading } = useApi<{ alerts: any[] }>("/api/alerts");

  const [filters, setFilters] = useState({
    type: "all",
    level: "all",
  });

  const filtered = useMemo(() => {
    if (!data?.alerts) return [];
    return data.alerts.filter((a) => {
      if (filters.type !== "all" && a.type !== filters.type) return false;
      if (filters.level !== "all" && a.level !== filters.level) return false;
      return true;
    });
  }, [data, filters]);

  const counts = useMemo(() => {
    const c = { danger: 0, warning: 0, info: 0 };
    for (const a of data?.alerts || []) c[a.level as keyof typeof c]++;
    return c;
  }, [data]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Central de Alertas</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Todos os alertas ativos da empresa em um só lugar.
        </p>
      </div>

      {/* Cards por nível */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 gap-2 border-red-200 bg-red-50">
          <div className="flex items-center justify-between">
            <CircleAlert className="h-5 w-5 text-red-600" />
            <span className="text-2xl font-bold text-red-700">
              {counts.danger}
            </span>
          </div>
          <p className="text-xs text-red-700 font-medium">Urgentes</p>
        </Card>
        <Card className="p-4 gap-2 border-amber-200 bg-amber-50">
          <div className="flex items-center justify-between">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <span className="text-2xl font-bold text-amber-700">
              {counts.warning}
            </span>
          </div>
          <p className="text-xs text-amber-700 font-medium">Atenção</p>
        </Card>
        <Card className="p-4 gap-2 border-blue-200 bg-blue-50">
          <div className="flex items-center justify-between">
            <Info className="h-5 w-5 text-blue-600" />
            <span className="text-2xl font-bold text-blue-700">
              {counts.info}
            </span>
          </div>
          <p className="text-xs text-blue-700 font-medium">Informação</p>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="p-4 gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Select
            value={filters.type}
            onValueChange={(v) => setFilters({ ...filters, type: v })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="maintenance">Manutenção</SelectItem>
              <SelectItem value="stock">Estoque</SelectItem>
              <SelectItem value="system">Sistema</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.level}
            onValueChange={(v) => setFilters({ ...filters, level: v })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Nível" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os níveis</SelectItem>
              <SelectItem value="danger">Urgentes</SelectItem>
              <SelectItem value="warning">Atenção</SelectItem>
              <SelectItem value="info">Informação</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Lista de alertas */}
      {loading ? (
        <LoadingState label="Carregando alertas..." />
      ) : error ? (
        <ErrorState message={error} />
      ) : filtered.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon={Bell}
            title="Nenhum alerta ativo"
            description="Tudo sob controle! Não há alertas pendentes para os filtros aplicados."
          />
        </Card>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((a) => {
            const Icon = TYPE_ICONS[a.type] || Bell;
            const styles = LEVEL_STYLES[a.level];
            const hasEquipment = a.equipmentId;
            const hasReservoir = a.reservoirId;
            return (
              <Card
                key={a.id}
                className={cn("p-4 border-2 gap-3", styles)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/60 flex-shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{a.title}</p>
                      <Badge
                        className={`text-[10px] ${LEVEL_BADGES[a.level]}`}
                      >
                        {LEVEL_LABELS[a.level]}
                      </Badge>
                    </div>
                    <p className="text-sm mt-1">{a.message}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-[10px]">
                        {TYPE_LABELS[a.type] || a.type}
                      </Badge>
                      <span>{formatDateTime(a.createdAt)}</span>
                    </div>
                  </div>
                  {(hasEquipment || hasReservoir) && (
                    <Link
                      href={
                        hasEquipment
                          ? `/app/equipamentos/${a.equipmentId}`
                          : `/app/estoque`
                      }
                      className="flex-shrink-0"
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white/60 hover:bg-white h-8 w-8 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
