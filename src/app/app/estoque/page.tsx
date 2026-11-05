"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useApi } from "@/hooks/use-session";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";
import {
  Droplet,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ArrowUpCircle,
  ArrowDownCircle,
  History,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  DEFAULT_FUEL_TYPES,
  formatBRL,
  formatNumber,
  formatDate,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

type Reservoir = {
  id: string;
  name: string;
  capacity: number;
  fuelType: string;
  currentLevel: number;
  minLevel: number;
  minLevelType: "liters" | "percent";
  notes?: string | null;
  active: boolean;
};

export default function EstoquePage() {
  const { data, error, loading, refetch } = useApi<{ reservoirs: Reservoir[] }>(
    "/api/reservoirs"
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Reservoir | null>(null);
  const [saving, setSaving] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Reservoir | null>(null);
  const [deleting, setDeleting] = useState(false);

  const reservoirs = data?.reservoirs || [];
  const totalLiters = reservoirs.reduce((s, r) => s + r.currentLevel, 0);
  const totalCapacity = reservoirs.reduce((s, r) => s + r.capacity, 0);

  function openNew() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(r: Reservoir) {
    setEditing(r);
    setDialogOpen(true);
  }

  async function handleDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/reservoirs/${toDelete.id}`, { method: "DELETE" });
      toast.success("Reservatório excluído");
      setToDelete(null);
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Erro ao excluir");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Estoque</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Reservatórios de combustível da fazenda.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/app/estoque/entrada">
            <Button
              variant="outline"
              className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 gap-2"
            >
              <ArrowUpCircle className="h-4 w-4" /> Entrada
            </Button>
          </Link>
          <Button
            onClick={openNew}
            className="bg-emerald-600 hover:bg-emerald-700 gap-2"
          >
            <Plus className="h-4 w-4" /> Novo Reservatório
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card className="p-4 gap-2">
          <p className="text-xs text-muted-foreground">Reservatórios</p>
          <p className="text-xl font-bold">{reservoirs.length}</p>
        </Card>
        <Card className="p-4 gap-2">
          <p className="text-xs text-muted-foreground">Total em estoque</p>
          <p className="text-xl font-bold">{formatNumber(totalLiters)} L</p>
        </Card>
        <Card className="p-4 gap-2 col-span-2 sm:col-span-1">
          <p className="text-xs text-muted-foreground">Capacidade total</p>
          <p className="text-xl font-bold">{formatNumber(totalCapacity)} L</p>
        </Card>
      </div>

      {/* Lista */}
      {loading ? (
        <LoadingState label="Carregando reservatórios..." />
      ) : error ? (
        <ErrorState message={error} />
      ) : reservoirs.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon={Droplet}
            title="Nenhum reservatório cadastrado"
            description="Cadastre seus tanques de combustível para acompanhar o estoque."
            ctaHref={undefined}
            ctaLabel={undefined}
          />
          <div className="text-center">
            <Button
              onClick={openNew}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4 mr-2" /> Cadastrar reservatório
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {reservoirs.map((r) => {
            const percent =
              r.capacity > 0 ? (r.currentLevel / r.capacity) * 100 : 0;
            const minLiters =
              r.minLevelType === "percent"
                ? (r.capacity * r.minLevel) / 100
                : r.minLevel;
            const isLow = r.currentLevel < minLiters;
            return (
              <Card key={r.id} className="p-4 gap-3 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{r.name}</p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {r.fuelType}
                    </Badge>
                  </div>
                  {isLow && (
                    <Badge variant="destructive" className="text-[10px]">
                      BAIXO
                    </Badge>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Nível atual</span>
                    <span className="font-medium">
                      {formatNumber(r.currentLevel)} / {formatNumber(r.capacity)} L
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        isLow
                          ? "bg-red-500"
                          : percent > 50
                            ? "bg-emerald-500"
                            : "bg-amber-500"
                      )}
                      style={{ width: `${Math.min(100, percent)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {percent.toFixed(0)}% · mínimo: {formatNumber(minLiters)} L
                  </p>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDetailId(r.id)}
                    className="flex-1 gap-1"
                  >
                    <History className="h-3.5 w-3.5" /> Histórico
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(r)}
                    className="gap-1"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setToDelete(r)}
                    className="text-red-600 hover:bg-red-50 gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog Novo/Editar */}
      <ReservoirDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        saving={saving}
        setSaving={setSaving}
        onSaved={() => {
          setDialogOpen(false);
          refetch();
        }}
      />

      {/* Detail Sheet */}
      <ReservoirDetailSheet
        reservoirId={detailId}
        onOpenChange={(o) => !o && setDetailId(null)}
      />

      {/* Delete confirm */}
      <AlertDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir reservatório?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Esta ação removerá o reservatório <strong>{toDelete?.name}</strong>{" "}
            e todo o seu histórico de entradas e saídas.
          </AlertDialogDescription>
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

function ReservoirDialog({
  open,
  onOpenChange,
  editing,
  saving,
  setSaving,
  onSaved,
}: any) {
  const [form, setForm] = useState<any>({
    name: "",
    capacity: "",
    fuelType: DEFAULT_FUEL_TYPES[0],
    currentLevel: "",
    minLevel: "",
    minLevelType: "liters",
    notes: "",
  });

  useEffect(() => {
    if (open) {
      if (editing) {
        setForm({
          name: editing.name,
          capacity: String(editing.capacity),
          fuelType: editing.fuelType,
          currentLevel: String(editing.currentLevel),
          minLevel: String(editing.minLevel),
          minLevelType: editing.minLevelType,
          notes: editing.notes || "",
        });
      } else {
        setForm({
          name: "",
          capacity: "",
          fuelType: DEFAULT_FUEL_TYPES[0],
          currentLevel: "",
          minLevel: "",
          minLevelType: "liters",
          notes: "",
        });
      }
    }
  }, [open, editing]);

  async function save() {
    if (!form.name || form.name.length < 2) {
      toast.error("Informe o nome do reservatório");
      return;
    }
    if (!form.capacity || Number(form.capacity) <= 0) {
      toast.error("Informe a capacidade (maior que zero)");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        capacity: Number(form.capacity),
        fuelType: form.fuelType,
        currentLevel: Number(form.currentLevel) || 0,
        minLevel: Number(form.minLevel) || 0,
        minLevelType: form.minLevelType,
        notes: form.notes || null,
      };
      if (editing) {
        await apiFetch(`/api/reservoirs/${editing.id}`, {
          method: "PATCH",
          json: payload,
        });
        toast.success("Reservatório atualizado!");
      } else {
        await apiFetch("/api/reservoirs", { method: "POST", json: payload });
        toast.success("Reservatório cadastrado!");
      }
      onSaved();
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editing ? "Editar reservatório" : "Novo reservatório"}
          </DialogTitle>
          <DialogDescription>
            Configure o tanque e seus limites de alerta.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>Nome</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Tanque principal"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Capacidade (L)</Label>
              <Input
                type="number"
                value={form.capacity}
                onChange={(e) =>
                  setForm({ ...form, capacity: e.target.value })
                }
                placeholder="5000"
              />
            </div>
            <div>
              <Label>Tipo de combustível</Label>
              <Select
                value={form.fuelType}
                onValueChange={(v) => setForm({ ...form, fuelType: v })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEFAULT_FUEL_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Nível atual (L)</Label>
            <Input
              type="number"
              value={form.currentLevel}
              onChange={(e) =>
                setForm({ ...form, currentLevel: e.target.value })
              }
              placeholder="0"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Nível mínimo</Label>
              <Input
                type="number"
                value={form.minLevel}
                onChange={(e) =>
                  setForm({ ...form, minLevel: e.target.value })
                }
                placeholder="0"
              />
            </div>
            <div>
              <Label>Tipo de mínimo</Label>
              <Select
                value={form.minLevelType}
                onValueChange={(v) =>
                  setForm({ ...form, minLevelType: v })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="liters">Em litros</SelectItem>
                  <SelectItem value="percent">Em percentual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Observações</Label>
            <Textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            onClick={save}
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {editing ? "Salvar" : "Cadastrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReservoirDetailSheet({
  reservoirId,
  onOpenChange,
}: {
  reservoirId: string | null;
  onOpenChange: (o: boolean) => void;
}) {
  const { data, loading } = useApi<{ reservoir: any }>(
    reservoirId ? `/api/reservoirs/${reservoirId}` : null
  );

  return (
    <Sheet open={!!reservoirId} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Histórico do reservatório</SheetTitle>
        </SheetHeader>
        <div className="p-4 space-y-4">
          {loading ? (
            <LoadingState label="Carregando histórico..." />
          ) : !data?.reservoir ? (
            <p className="text-sm text-muted-foreground">Sem dados.</p>
          ) : (
            <>
              <div className="p-3 rounded-xl bg-muted/40">
                <p className="font-semibold">{data.reservoir.name}</p>
                <p className="text-xs text-muted-foreground">
                  {data.reservoir.fuelType} ·{" "}
                  {formatNumber(data.reservoir.currentLevel)} /{" "}
                  {formatNumber(data.reservoir.capacity)} L
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUpCircle className="h-4 w-4 text-emerald-600" />
                  <h3 className="font-semibold text-sm">Entradas</h3>
                </div>
                {data.reservoir.fuelEntries?.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">
                    Nenhuma entrada registrada.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {data.reservoir.fuelEntries?.map((e: any) => (
                      <div
                        key={e.id}
                        className="p-3 rounded-lg bg-emerald-50 border border-emerald-200"
                      >
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">
                            {formatDate(e.entryDate)}
                          </span>
                          <span className="font-bold text-emerald-700">
                            +{formatNumber(e.liters)} L
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatBRL(e.totalAmount)} ·{" "}
                          {e.supplier || "—"}
                          {e.invoiceNumber ? ` · NF ${e.invoiceNumber}` : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ArrowDownCircle className="h-4 w-4 text-amber-600" />
                  <h3 className="font-semibold text-sm">Saídas (abastecimentos)</h3>
                </div>
                {data.reservoir.refuelings?.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">
                    Nenhuma saída registrada.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {data.reservoir.refuelings?.map((r: any) => (
                      <div
                        key={r.id}
                        className="p-3 rounded-lg bg-amber-50 border border-amber-200"
                      >
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">
                            {formatDate(r.refuelDate)}
                          </span>
                          <span className="font-bold text-amber-700">
                            -{formatNumber(r.liters)} L
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {r.equipment?.name || "Equipamento removido"} ·{" "}
                          {r.operatorName}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
