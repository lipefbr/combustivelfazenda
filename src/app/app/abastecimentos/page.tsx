"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useApi } from "@/hooks/use-session";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";
import {
  Fuel,
  Plus,
  Trash2,
  Loader2,
  Calendar,
  Filter,
  Search,
  Droplet,
  ExternalLink,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LoadingState, ErrorState, EmptyState } from "@/components/app/states";

import {
  REFUEL_SOURCE_LABELS,
  formatBRL,
  formatNumber,
  formatDateTime,
} from "@/lib/constants";

export default function AbastecimentosPage() {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    equipmentId: "all",
    source: "all",
    reservoirId: "all",
  });
  const [confirmDelete, setConfirmDelete] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  // Build query string
  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.startDate) params.set("startDate", filters.startDate);
    if (filters.endDate) params.set("endDate", filters.endDate);
    if (filters.equipmentId !== "all")
      params.set("equipmentId", filters.equipmentId);
    if (filters.source !== "all") params.set("source", filters.source);
    if (filters.reservoirId !== "all")
      params.set("reservoirId", filters.reservoirId);
    return params.toString();
  }, [filters]);

  const { data, error, loading, refetch } = useApi<{ refuelings: any[] }>(
    `/api/refuelings${query ? `?${query}` : ""}`
  );
  const { data: equipmentsData } = useApi<{ equipments: any[] }>(
    "/api/equipments"
  );
  const { data: reservoirsData } = useApi<{ reservoirs: any[] }>(
    "/api/reservoirs"
  );

  const refuelings = data?.refuelings || [];
  const equipments = equipmentsData?.equipments || [];
  const reservoirs = reservoirsData?.reservoirs || [];

  const totalLiters = refuelings.reduce((s, r) => s + r.liters, 0);
  const totalCost = refuelings.reduce((s, r) => s + r.totalAmount, 0);

  async function handleDelete() {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/refuelings/${confirmDelete.id}`, {
        method: "DELETE",
      });
      toast.success("Abastecimento excluído");
      setConfirmDelete(null);
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Erro ao excluir");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Abastecimentos</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Histórico completo de abastecimentos da fazenda e de terceiros.
          </p>
        </div>
        <Link href="/app/abastecimentos/novo">
          <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
            <Plus className="h-4 w-4" /> Novo Abastecimento
          </Button>
        </Link>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card className="p-4 gap-2">
          <p className="text-xs text-muted-foreground">Registros</p>
          <p className="text-xl font-bold">{refuelings.length}</p>
        </Card>
        <Card className="p-4 gap-2">
          <p className="text-xs text-muted-foreground">Total de litros</p>
          <p className="text-xl font-bold">{formatNumber(totalLiters)} L</p>
        </Card>
        <Card className="p-4 gap-2 col-span-2 sm:col-span-1">
          <p className="text-xs text-muted-foreground">Custo total</p>
          <p className="text-xl font-bold">{formatBRL(totalCost)}</p>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="p-4 gap-4">
        <div className="flex items-center gap-2 mb-1">
          <Filter className="h-4 w-4 text-emerald-600" />
          <h3 className="text-sm font-semibold">Filtros</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Data início
            </label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Data fim
            </label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Equipamento
            </label>
            <Select
              value={filters.equipmentId}
              onValueChange={(v) =>
                setFilters({ ...filters, equipmentId: v })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {equipments.map((eq) => (
                  <SelectItem key={eq.id} value={eq.id}>
                    {eq.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Origem
            </label>
            <Select
              value={filters.source}
              onValueChange={(v) => setFilters({ ...filters, source: v })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="reservoir">
                  Reservatório da fazenda
                </SelectItem>
                <SelectItem value="external">Posto externo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Reservatório
            </label>
            <Select
              value={filters.reservoirId}
              onValueChange={(v) =>
                setFilters({ ...filters, reservoirId: v })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos" />
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
        </div>
      </Card>

      {/* Lista */}
      {loading ? (
        <LoadingState label="Carregando abastecimentos..." />
      ) : error ? (
        <ErrorState message={error} />
      ) : refuelings.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon={Fuel}
            title="Nenhum abastecimento encontrado"
            description="Ajuste os filtros ou registre o primeiro abastecimento da sua operação."
            ctaHref="/app/abastecimentos/novo"
            ctaLabel="Registrar abastecimento"
          />
        </Card>
      ) : (
        <Card className="p-0 gap-0">
          {/* Desktop: tabela */}
          <div className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="text-left">
                    <th className="p-3 font-semibold">Data</th>
                    <th className="p-3 font-semibold">Equipamento</th>
                    <th className="p-3 font-semibold">Origem</th>
                    <th className="p-3 text-right font-semibold">Litros</th>
                    <th className="p-3 text-right font-semibold">Valor</th>
                    <th className="p-3 font-semibold">Operador</th>
                    <th className="p-3 font-semibold">Leitura</th>
                    <th className="p-3 font-semibold">Consumo</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {refuelings.map((r) => (
                    <tr
                      key={r.id}
                      className="border-t hover:bg-muted/30"
                    >
                      <td className="p-3 whitespace-nowrap">
                        {formatDateTime(r.refuelDate)}
                      </td>
                      <td className="p-3">
                        <Link
                          href={`/app/equipamentos/${r.equipmentId}`}
                          className="hover:text-emerald-700 font-medium"
                        >
                          {r.equipment?.name}
                        </Link>
                        {r.equipment?.plate && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({r.equipment.plate})
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <Badge
                          variant="outline"
                          className={
                            r.source === "reservoir"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }
                        >
                          {r.source === "reservoir"
                            ? r.reservoir?.name || "Reservatório"
                            : r.externalStation || "Posto externo"}
                        </Badge>
                      </td>
                      <td className="p-3 text-right font-semibold">
                        {formatNumber(r.liters)} L
                      </td>
                      <td className="p-3 text-right">
                        {formatBRL(r.totalAmount)}
                      </td>
                      <td className="p-3">{r.operatorName || "—"}</td>
                      <td className="p-3 text-right">
                        {formatNumber(r.reading)}
                      </td>
                      <td className="p-3 text-right">
                        {r.consumption != null
                          ? r.consumption.toFixed(1)
                          : "—"}
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setConfirmDelete(r)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile: cards */}
          <div className="md:hidden divide-y divide-border">
            {refuelings.map((r) => (
              <div key={r.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/app/equipamentos/${r.equipmentId}`}
                      className="font-semibold hover:text-emerald-700 block truncate"
                    >
                      {r.equipment?.name}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDateTime(r.refuelDate)} · {r.operatorName || "—"}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirmDelete(r)}
                    className="text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={
                      r.source === "reservoir"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }
                  >
                    {r.source === "reservoir"
                      ? r.reservoir?.name || "Reservatório"
                      : r.externalStation || "Posto"}
                  </Badge>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Litros</p>
                    <p className="font-semibold">{formatNumber(r.liters)} L</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Valor</p>
                    <p className="font-semibold">{formatBRL(r.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Leitura</p>
                    <p className="font-semibold">{formatNumber(r.reading)}</p>
                  </div>
                </div>
                {r.consumption != null && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Consumo: {r.consumption.toFixed(1)}{" "}
                    {r.equipment?.controlType === "hours" ? "L/h" : "km/L"}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <AlertDialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir abastecimento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Se o abastecimento veio de um
              reservatório, os litros serão devolvidos ao estoque.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
