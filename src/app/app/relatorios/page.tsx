"use client";

import { useState, useMemo, useEffect } from "react";
import { useApi } from "@/hooks/use-session";
import { apiDownload } from "@/lib/api-client";
import { toast } from "sonner";
import {
  BarChart3,
  Filter,
  Download,
  FileText,
  FileSpreadsheet,
  File as FileIcon,
  Loader2,
  TrendingUp,
  Fuel,
  Droplet,
  Wrench,
  Receipt,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { LoadingState, ErrorState, EmptyState } from "@/components/app/states";

import {
  EQUIPMENT_TYPE_LABELS,
  CONTROL_TYPE_LABELS,
  ORIGIN_LABELS,
  formatBRL,
  formatNumber,
} from "@/lib/constants";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function RelatoriosPage() {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    equipmentId: "all",
    type: "all",
    origin: "all",
    operatorId: "all",
    reservoirId: "all",
    source: "all",
  });
  const [viewTogether, setViewTogether] = useState(false);

  const { data: equipData } = useApi<{ equipments: any[] }>("/api/equipments");
  const { data: resData } = useApi<{ reservoirs: any[] }>("/api/reservoirs");
  const { data: usersData } = useApi<{ users: any[] }>("/api/users");
  const { data: dashboardData } = useApi<any>("/api/dashboard");

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (filters.startDate) p.set("startDate", filters.startDate);
    if (filters.endDate) p.set("endDate", filters.endDate);
    if (filters.equipmentId !== "all")
      p.set("equipmentId", filters.equipmentId);
    if (filters.operatorId !== "all")
      p.set("operatorId", filters.operatorId);
    if (filters.reservoirId !== "all")
      p.set("reservoirId", filters.reservoirId);
    if (filters.source !== "all") p.set("source", filters.source);
    if (filters.origin !== "all") p.set("origin", filters.origin);
    return p.toString();
  }, [filters]);

  const { data, error, loading } = useApi<any>(
    `/api/reports/summary?${query}`
  );

  const equipments = equipData?.equipments || [];
  const reservoirs = resData?.reservoirs || [];
  const users = usersData?.users || [];

  // Filter equipments by type/origin (frontend filter for chart)
  const filteredConsumption = useMemo(() => {
    if (!data?.consumptionByEquipment) return [];
    let list = data.consumptionByEquipment;
    if (filters.type !== "all") {
      list = list.filter((c: any) => c.type === filters.type);
    }
    if (!viewTogether && filters.origin !== "all") {
      list = list.filter((c: any) => c.origin === filters.origin);
    }
    return list;
  }, [data, filters, viewTogether]);

  async function exportReport(format: "pdf" | "xlsx" | "csv") {
    const types = ["summary", "consumption", "refuelings", "entries", "maintenance"];
    toast.loading("Gerando relatórios...", { id: "export" });
    try {
      for (const type of types) {
        const p = new URLSearchParams();
        if (filters.startDate) p.set("startDate", filters.startDate);
        if (filters.endDate) p.set("endDate", filters.endDate);
        if (filters.equipmentId !== "all")
          p.set("equipmentId", filters.equipmentId);
        if (filters.operatorId !== "all")
          p.set("operatorId", filters.operatorId);
        if (filters.reservoirId !== "all")
          p.set("reservoirId", filters.reservoirId);
        if (filters.source !== "all") p.set("source", filters.source);
        if (filters.origin !== "all") p.set("origin", filters.origin);
        p.set("format", format);
        p.set("type", type);
        await apiDownload(
          `/api/reports/export?${p.toString()}`,
          `fuelgest-${type}.${format}`
        );
      }
      toast.success(`${format.toUpperCase()} exportado! 5 arquivos.`, {
        id: "export",
      });
    } catch (e: any) {
      toast.error(e.message || "Erro ao exportar", { id: "export" });
    }
  }

  const summary = data?.summary || {};

  // Monthly chart from refuelings
  const monthlyData = useMemo(() => {
    const refs = data?.refuelings || [];
    const map = new Map<string, { liters: number; cost: number }>();
    for (const r of refs) {
      const d = new Date(r.refuelDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!map.has(key))
        map.set(key, { liters: 0, cost: 0 });
      const item = map.get(key)!;
      item.liters += r.liters;
      item.cost += r.totalAmount;
    }
    return Array.from(map.entries())
      .map(([k, v]) => ({
        month: k.slice(5) + "/" + k.slice(2, 4),
        ...v,
      }))
      .sort()
      .slice(-12);
  }, [data]);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Análise completa da operação com exportação.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => exportReport("pdf")}
            className="gap-2 border-red-200 text-red-700 hover:bg-red-50"
          >
            <FileText className="h-4 w-4" /> PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => exportReport("xlsx")}
            className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
          >
            <FileSpreadsheet className="h-4 w-4" /> Excel
          </Button>
          <Button
            variant="outline"
            onClick={() => exportReport("csv")}
            className="gap-2 border-amber-200 text-amber-700 hover:bg-amber-50"
          >
            <FileIcon className="h-4 w-4" /> CSV
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="p-4 gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-emerald-600" />
          <h3 className="text-sm font-semibold">Filtros do relatório</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <Label className="text-xs">Data início</Label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
            />
          </div>
          <div>
            <Label className="text-xs">Data fim</Label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
            />
          </div>
          <div>
            <Label className="text-xs">Equipamento</Label>
            <Select
              value={filters.equipmentId}
              onValueChange={(v) =>
                setFilters({ ...filters, equipmentId: v })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {equipments.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Tipo</Label>
            <Select
              value={filters.type}
              onValueChange={(v) => setFilters({ ...filters, type: v })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {Object.entries(EQUIPMENT_TYPE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Origem</Label>
            <Select
              value={filters.origin}
              onValueChange={(v) => setFilters({ ...filters, origin: v })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="company">Da fazenda/empresa</SelectItem>
                <SelectItem value="third_party">De terceiros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Operador</Label>
            <Select
              value={filters.operatorId}
              onValueChange={(v) =>
                setFilters({ ...filters, operatorId: v })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Reservatório</Label>
            <Select
              value={filters.reservoirId}
              onValueChange={(v) =>
                setFilters({ ...filters, reservoirId: v })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {reservoirs.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Fonte</Label>
            <Select
              value={filters.source}
              onValueChange={(v) => setFilters({ ...filters, source: v })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="reservoir">Reservatório</SelectItem>
                <SelectItem value="external">Posto externo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Conteúdo */}
      {loading ? (
        <LoadingState label="Carregando relatório..." />
      ) : error ? (
        <ErrorState message={error} />
      ) : !data ? null : (
        <>
          {/* Cards resumo */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <SummaryCard
              icon={Droplet}
              label="Total litros"
              value={`${formatNumber(summary.totalLiters)} L`}
              color="emerald"
            />
            <SummaryCard
              icon={Receipt}
              label="Custo total"
              value={formatBRL(summary.totalCost)}
              color="amber"
            />
            <SummaryCard
              icon={TrendingUp}
              label="Entradas vs Saídas"
              value={`${formatNumber(summary.totalEntriesLiters)} / ${formatNumber(summary.totalLiters)} L`}
              color="emerald"
            />
            <SummaryCard
              icon={Wrench}
              label="Manutenções"
              value={String(
                (data.maintenanceDone?.length || 0) +
                  (data.maintenancePending?.length || 0)
              )}
              color="emerald"
            />
          </div>

          {/* Gráfico mensal */}
          <Card className="p-5">
            <h2 className="font-bold mb-4">Consumo mensal (litros)</h2>
            {monthlyData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Sem dados suficientes para o gráfico.
              </p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip
                      formatter={(v: number) => [`${formatNumber(v)} L`, "Litros"]}
                      labelStyle={{ fontSize: 12 }}
                    />
                    <Bar
                      dataKey="liters"
                      fill="#10B981"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          <Tabs defaultValue="consumption">
            <TabsList className="w-full justify-start flex-wrap h-auto">
              <TabsTrigger value="consumption">Consumo</TabsTrigger>
              <TabsTrigger value="operator">Operadores</TabsTrigger>
              <TabsTrigger value="equipments">Equipamentos</TabsTrigger>
              <TabsTrigger value="reservoirs">Reservatórios</TabsTrigger>
              <TabsTrigger value="cost">Custos</TabsTrigger>
              <TabsTrigger value="maintenance">Manutenções</TabsTrigger>
            </TabsList>

            {/* Consumo por equipamento */}
            <TabsContent value="consumption">
              <Card className="p-0 gap-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40">
                      <tr className="text-left">
                        <th className="p-3 font-semibold">Equipamento</th>
                        <th className="p-3 font-semibold">Tipo</th>
                        <th className="p-3 font-semibold">Origem</th>
                        <th className="p-3 text-right font-semibold">Litros</th>
                        <th className="p-3 text-right font-semibold">Consumo</th>
                        <th className="p-3 text-right font-semibold">Custo</th>
                        <th className="p-3 text-right font-semibold">Abast.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredConsumption.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="p-6 text-center text-muted-foreground"
                          >
                            Nenhum dado para os filtros aplicados.
                          </td>
                        </tr>
                      ) : (
                        filteredConsumption.map((c: any) => (
                          <tr key={c.equipmentId} className="border-t hover:bg-muted/30">
                            <td className="p-3 font-medium">{c.name}</td>
                            <td className="p-3">
                              <Badge variant="outline" className="text-xs">
                                {EQUIPMENT_TYPE_LABELS[c.type]}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <Badge
                                className={
                                  c.origin === "company"
                                    ? "bg-emerald-100 text-emerald-700 text-xs"
                                    : "bg-amber-100 text-amber-700 text-xs"
                                }
                              >
                                {c.origin === "company" ? "Fazenda" : "Terceiros"}
                              </Badge>
                            </td>
                            <td className="p-3 text-right font-semibold">
                              {formatNumber(c.liters)} L
                            </td>
                            <td className="p-3 text-right">
                              {c.avgConsumption != null
                                ? `${c.avgConsumption.toFixed(2)} ${
                                    c.controlType === "hours" ? "L/h" : "km/L"
                                  }`
                                : "—"}
                            </td>
                            <td className="p-3 text-right">
                              {formatBRL(c.cost)}
                            </td>
                            <td className="p-3 text-right">{c.refuelingCount}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            {/* Por operador */}
            <TabsContent value="operator">
              <Card className="p-0 gap-0">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr className="text-left">
                      <th className="p-3 font-semibold">Operador</th>
                      <th className="p-3 text-right font-semibold">Abastecimentos</th>
                      <th className="p-3 text-right font-semibold">Litros</th>
                      <th className="p-3 text-right font-semibold">Custo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.byOperator || []).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-muted-foreground">
                          Nenhum dado.
                        </td>
                      </tr>
                    ) : (
                      data.byOperator.map((o: any) => (
                        <tr key={o.name} className="border-t hover:bg-muted/30">
                          <td className="p-3 font-medium">{o.name}</td>
                          <td className="p-3 text-right">{o.count}</td>
                          <td className="p-3 text-right font-semibold">
                            {formatNumber(o.liters)} L
                          </td>
                          <td className="p-3 text-right">{formatBRL(o.cost)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </Card>
            </TabsContent>

            {/* Equipamentos: fazenda vs terceiros */}
            <TabsContent value="equipments">
              <Card className="p-5 gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">Equipamentos por origem</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Ver juntos
                    </span>
                    <Switch
                      checked={viewTogether}
                      onCheckedChange={setViewTogether}
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <p className="text-xs font-medium text-emerald-700 mb-1">
                      DA FAZENDA
                    </p>
                    <p className="text-2xl font-bold">
                      {summary.companyEquipmentCount || 0}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      equipamentos próprios
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <p className="text-xs font-medium text-amber-700 mb-1">
                      DE TERCEIROS
                    </p>
                    <p className="text-2xl font-bold">
                      {summary.thirdPartyEquipmentCount || 0}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      equipamentos de terceiros
                    </p>
                  </div>
                </div>
                {viewTogether && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/40">
                        <tr className="text-left">
                          <th className="p-3 font-semibold">Equipamento</th>
                          <th className="p-3 font-semibold">Origem</th>
                          <th className="p-3 font-semibold">Controle</th>
                          <th className="p-3 text-right font-semibold">Litros</th>
                          <th className="p-3 text-right font-semibold">Custo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredConsumption.map((c: any) => (
                          <tr key={c.equipmentId} className="border-t">
                            <td className="p-3 font-medium">{c.name}</td>
                            <td className="p-3">
                              <Badge
                                className={
                                  c.origin === "company"
                                    ? "bg-emerald-100 text-emerald-700 text-xs"
                                    : "bg-amber-100 text-amber-700 text-xs"
                                }
                              >
                                {c.origin === "company" ? "Fazenda" : "Terceiros"}
                              </Badge>
                            </td>
                            <td className="p-3">
                              {CONTROL_TYPE_LABELS[c.controlType]}
                            </td>
                            <td className="p-3 text-right">
                              {formatNumber(c.liters)} L
                            </td>
                            <td className="p-3 text-right">
                              {formatBRL(c.cost)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Reservatórios: entradas vs saídas */}
            <TabsContent value="reservoirs">
              <Card className="p-0 gap-0">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr className="text-left">
                      <th className="p-3 font-semibold">Reservatório</th>
                      <th className="p-3 font-semibold">Combustível</th>
                      <th className="p-3 text-right font-semibold">Capacidade</th>
                      <th className="p-3 text-right font-semibold">Nível</th>
                      <th className="p-3 text-right font-semibold">Entradas</th>
                      <th className="p-3 text-right font-semibold">Saídas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.byReservoir || []).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-muted-foreground">
                          Nenhum dado.
                        </td>
                      </tr>
                    ) : (
                      data.byReservoir.map((r: any) => (
                        <tr key={r.reservoirId} className="border-t hover:bg-muted/30">
                          <td className="p-3 font-medium">{r.name}</td>
                          <td className="p-3">{r.fuelType}</td>
                          <td className="p-3 text-right">
                            {formatNumber(r.capacity)} L
                          </td>
                          <td className="p-3 text-right">
                            {formatNumber(r.currentLevel)} L
                          </td>
                          <td className="p-3 text-right text-emerald-700 font-medium">
                            +{formatNumber(r.entradasLiters)} L
                            <div className="text-xs text-muted-foreground">
                              {r.entradasCount} entradas
                            </div>
                          </td>
                          <td className="p-3 text-right text-amber-700 font-medium">
                            -{formatNumber(r.saidasLiters)} L
                            <div className="text-xs text-muted-foreground">
                              {r.saidasCount} abastec.
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </Card>
            </TabsContent>

            {/* Custos */}
            <TabsContent value="cost">
              <Card className="p-0 gap-0">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr className="text-left">
                      <th className="p-3 font-semibold">Equipamento</th>
                      <th className="p-3 font-semibold">Tipo</th>
                      <th className="p-3 font-semibold">Origem</th>
                      <th className="p-3 text-right font-semibold">Custo combustível</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.consumptionByEquipment || [])
                      .filter((c: any) => c.cost > 0)
                      .length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-muted-foreground">
                          Nenhum custo registrado.
                        </td>
                      </tr>
                    ) : (
                      (data.consumptionByEquipment || [])
                        .filter((c: any) => c.cost > 0)
                        .sort((a: any, b: any) => b.cost - a.cost)
                        .map((c: any) => (
                          <tr key={c.equipmentId} className="border-t hover:bg-muted/30">
                            <td className="p-3 font-medium">{c.name}</td>
                            <td className="p-3">
                              <Badge variant="outline" className="text-xs">
                                {EQUIPMENT_TYPE_LABELS[c.type]}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <Badge
                                className={
                                  c.origin === "company"
                                    ? "bg-emerald-100 text-emerald-700 text-xs"
                                    : "bg-amber-100 text-amber-700 text-xs"
                                }
                              >
                                {c.origin === "company" ? "Fazenda" : "Terceiros"}
                              </Badge>
                            </td>
                            <td className="p-3 text-right font-bold">
                              {formatBRL(c.cost)}
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </Card>
            </TabsContent>

            {/* Manutenções */}
            <TabsContent value="maintenance">
              <div className="space-y-3">
                <Card className="p-5">
                  <h3 className="font-bold mb-3 text-red-600">
                    Manutenções vencidas/pendentes ({data.maintenancePending?.length || 0})
                  </h3>
                  {(data.maintenancePending || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma manutenção pendente. Tudo em dia!
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/40">
                          <tr className="text-left">
                            <th className="p-3 font-semibold">Equipamento</th>
                            <th className="p-3 font-semibold">Item</th>
                            <th className="p-3 font-semibold">Status</th>
                            <th className="p-3 text-right font-semibold">Restante</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.maintenancePending.map((m: any, i: number) => (
                            <tr key={i} className="border-t">
                              <td className="p-3 font-medium">
                                {m.equipmentName}
                              </td>
                              <td className="p-3">{m.itemName}</td>
                              <td className="p-3">
                                <Badge
                                  variant={
                                    m.level === "danger" ? "destructive" : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {m.level === "danger" ? "VENCIDO" : "PRÓXIMO"}
                                </Badge>
                              </td>
                              <td className="p-3 text-right">
                                {m.remaining.toFixed(0)}{" "}
                                {m.controlType === "hours" ? "h" : "km"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>

                <Card className="p-5">
                  <h3 className="font-bold mb-3 text-emerald-700">
                    Manutenções realizadas ({data.maintenanceDone?.length || 0})
                  </h3>
                  {(data.maintenanceDone || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma manutenção registrada.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/40">
                          <tr className="text-left">
                            <th className="p-3 font-semibold">Equipamento</th>
                            <th className="p-3 font-semibold">Item</th>
                            <th className="p-3 font-semibold">Data</th>
                            <th className="p-3 text-right font-semibold">Custo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.maintenanceDone.map((m: any) => (
                            <tr key={m.id} className="border-t">
                              <td className="p-3 font-medium">
                                {m.equipment?.name || "—"}
                              </td>
                              <td className="p-3">{m.itemName}</td>
                              <td className="p-3">
                                {new Date(m.maintenanceDate).toLocaleDateString("pt-BR")}
                              </td>
                              <td className="p-3 text-right">
                                {formatBRL(m.cost)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  color: "emerald" | "amber";
}) {
  const colorClasses = {
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
  };
  return (
    <Card className="p-4 gap-2">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg ${colorClasses[color]}`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </Card>
  );
}
