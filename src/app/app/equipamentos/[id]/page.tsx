"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-session";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";
import {
  ArrowLeft,
  Truck,
  Pencil,
  Trash2,
  Fuel,
  Wrench,
  Calendar,
  Gauge,
  Coins,
  TrendingUp,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  CircleAlert,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { LoadingState, ErrorState } from "@/components/app/states";

import {
  EQUIPMENT_TYPE_LABELS,
  CONTROL_TYPE_LABELS,
  ORIGIN_LABELS,
  REFUEL_SOURCE_LABELS,
  formatBRL,
  formatNumber,
  formatDate,
  formatDateTime,
  maintenanceStatus,
} from "@/lib/constants";

export default function EquipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data, error, loading, refetch } = useApi<{ equipment: any }>(
    `/api/equipments/${id}`
  );
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (loading) return <LoadingState label="Carregando equipamento..." />;
  if (error) return <ErrorState message={error} />;
  if (!data?.equipment)
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">Equipamento não encontrado.</p>
        <Link
          href="/app/equipamentos"
          className="text-emerald-600 text-sm hover:underline"
        >
          Voltar para a lista
        </Link>
      </Card>
    );

  const e = data.equipment;
  const unit = e.controlType === "hours" ? "h" : "km";

  const refuelings = e.refuelings || [];
  const maintenances = e.maintenances || [];

  // Stats
  const totalLiters = refuelings.reduce((s: number, r: any) => s + r.liters, 0);
  const totalCost = refuelings.reduce(
    (s: number, r: any) => s + r.totalAmount,
    0
  );
  const maintCost = maintenances.reduce(
    (s: number, m: any) => s + m.cost,
    0
  );
  const withConsumption = refuelings.filter((r: any) => r.consumption != null);
  const avgConsumption =
    withConsumption.length > 0
      ? withConsumption.reduce(
          (s: number, r: any) => s + (r.consumption || 0),
          0
        ) / withConsumption.length
      : null;

  async function handleDelete() {
    setDeleting(true);
    try {
      await apiFetch(`/api/equipments/${id}`, { method: "DELETE" });
      toast.success("Equipamento excluído");
      router.push("/app/equipamentos");
    } catch (e: any) {
      toast.error(e.message || "Erro ao excluir");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Top */}
      <div className="flex items-center gap-2">
        <Link href="/app/equipamentos">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
        </Link>
      </div>

      {/* Header card */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 overflow-hidden flex-shrink-0">
            {e.photo ? (
              <img
                src={e.photo}
                alt={e.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Truck className="h-10 w-10" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold">{e.name}</h1>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <Badge variant="outline">
                {EQUIPMENT_TYPE_LABELS[e.type]}
              </Badge>
              <Badge
                className={
                  e.origin === "company"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }
              >
                {ORIGIN_LABELS[e.origin]}
              </Badge>
              {e.origin === "third_party" && e.ownerName && (
                <Badge variant="secondary">{e.ownerName}</Badge>
              )}
              {e.active ? (
                <Badge className="bg-emerald-600">Ativo</Badge>
              ) : (
                <Badge variant="secondary">Inativo</Badge>
              )}
            </div>
            {e.notes && (
              <p className="text-sm text-muted-foreground mt-3">{e.notes}</p>
            )}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Link href={`/app/equipamentos?edit=${e.id}`}>
              <Button variant="outline" size="sm" className="gap-1">
                <Pencil className="h-3.5 w-3.5" /> Editar
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmDelete(true)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-1"
            >
              <Trash2 className="h-3.5 w-3.5" /> Excluir
            </Button>
          </div>
        </div>
      </Card>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Gauge}
          label={`Leitura atual (${unit})`}
          value={formatNumber(e.currentReading)}
          color="emerald"
        />
        <StatCard
          icon={Fuel}
          label="Abastecimentos"
          value={String(refuelings.length)}
          color="emerald"
        />
        <StatCard
          icon={Coins}
          label="Custo total"
          value={formatBRL(totalCost + maintCost)}
          color="amber"
        />
        <StatCard
          icon={TrendingUp}
          label="Consumo médio"
          value={
            avgConsumption != null
              ? `${avgConsumption.toFixed(1)} ${
                  e.controlType === "hours" ? "L/h" : "km/L"
                }`
              : "—"
          }
          color="emerald"
        />
      </div>

      {/* Dados */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h2 className="font-bold mb-4">Dados do equipamento</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <DataRow label="Tipo" value={EQUIPMENT_TYPE_LABELS[e.type]} />
            <DataRow
              label="Controle"
              value={CONTROL_TYPE_LABELS[e.controlType]}
            />
            <DataRow label="Placa" value={e.plate || "—"} />
            <DataRow label="Patrimônio" value={e.assetNumber || "—"} />
            <DataRow
              label="Leitura inicial"
              value={`${formatNumber(e.initialReading)} ${unit}`}
            />
            <DataRow
              label="Leitura atual"
              value={`${formatNumber(e.currentReading)} ${unit}`}
            />
            <DataRow label="Valor" value={formatBRL(e.value)} />
            <DataRow
              label="Origem"
              value={ORIGIN_LABELS[e.origin]}
            />
            {e.ownerName && (
              <DataRow label="Proprietário" value={e.ownerName} />
            )}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-bold mb-4">Itens de manutenção</h2>
          {e.maintenanceItems?.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum item de manutenção cadastrado.
            </p>
          ) : (
            <div className="space-y-2.5">
              {e.maintenanceItems?.map((item: any) => {
                const st = maintenanceStatus(
                  item.lastReading,
                  e.currentReading,
                  item.interval
                );
                const colorClass =
                  st.level === "danger"
                    ? "border-l-red-500 bg-red-50"
                    : st.level === "warning"
                      ? "border-l-amber-500 bg-amber-50"
                      : "border-l-emerald-500 bg-emerald-50";
                const badge =
                  st.level === "danger" ? (
                    <Badge variant="destructive" className="text-[10px]">
                      VENCIDO
                    </Badge>
                  ) : st.level === "warning" ? (
                    <Badge className="bg-amber-500 text-[10px]">PRÓXIMO</Badge>
                  ) : (
                    <Badge className="bg-emerald-500 text-[10px]">OK</Badge>
                  );
                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border-l-4 ${colorClass}`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Intervalo: {formatNumber(item.interval)} {unit}
                          {" · "}
                          Última: {formatNumber(item.lastReading)} {unit}
                        </p>
                        {st.level !== "ok" && (
                          <p className="text-xs mt-1 font-medium">
                            {st.level === "danger"
                              ? `Vencido há ${Math.abs(st.remaining).toFixed(0)} ${unit}`
                              : `Faltam ${st.remaining.toFixed(0)} ${unit}`}
                          </p>
                        )}
                      </div>
                      {badge}
                    </div>
                    <div className="h-1.5 rounded-full bg-white/50 mt-2 overflow-hidden">
                      <div
                        className={`h-full ${
                          st.level === "danger"
                            ? "bg-red-500"
                            : st.level === "warning"
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                        }`}
                        style={{ width: `${st.percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Histórico de abastecimentos */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">Histórico de abastecimentos</h2>
          <Link href="/app/abastecimentos/novo">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 gap-1">
              <Fuel className="h-3.5 w-3.5" /> Novo
            </Button>
          </Link>
        </div>
        {refuelings.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Nenhum abastecimento registrado para este equipamento.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {refuelings.map((r: any) => (
              <div
                key={r.id}
                className="py-3 flex items-center gap-3 first:pt-0 last:pb-0"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Fuel className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {formatDateTime(r.refuelDate)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {r.operatorName} ·{" "}
                    {r.source === "reservoir"
                      ? r.reservoir?.name || "Reservatório"
                      : `Posto: ${r.externalStation || "—"}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {formatNumber(r.liters)} L
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatBRL(r.totalAmount)}
                  </p>
                </div>
                <div className="text-right text-xs">
                  <p>Leitura: {formatNumber(r.reading)} {unit}</p>
                  {r.consumption != null && (
                    <p className="text-muted-foreground">
                      {r.consumption.toFixed(1)}{" "}
                      {e.controlType === "hours" ? "L/h" : "km/L"}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Histórico de manutenções */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">Histórico de manutenções</h2>
          <Link href="/app/manutencoes">
            <Button size="sm" variant="outline" className="gap-1">
              <Wrench className="h-3.5 w-3.5" /> Manutenções
            </Button>
          </Link>
        </div>
        {maintenances.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Nenhuma manutenção registrada.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {maintenances.map((m: any) => (
              <div
                key={m.id}
                className="py-3 flex items-center gap-3 first:pt-0 last:pb-0"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <Wrench className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{m.itemName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(m.maintenanceDate)} ·{" "}
                    {m.shopOrResponsible || "—"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatBRL(m.cost)}</p>
                  <p className="text-xs text-muted-foreground">
                    Leitura: {formatNumber(m.readingAtMaintenance)} {unit}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <AlertDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir equipamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{e.name}</strong>?
              Esta ação removerá todo o histórico relacionado.
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

function StatCard({
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

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
