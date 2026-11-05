"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useApi } from "@/hooks/use-session";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Filter,
  Calendar,
  Coins,
  User,
  Trash2,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ImageUpload } from "@/components/app/image-upload";
import { LoadingState, ErrorState, EmptyState } from "@/components/app/states";

import {
  formatBRL,
  formatNumber,
  formatDate,
  maintenanceStatus,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function ManutencoesPage() {
  const { data: dashboardData } = useApi<any>("/api/dashboard");
  const { data: equipData } = useApi<{ equipments: any[] }>("/api/equipments");
  const { data: maintData, refetch: refetchMaint } = useApi<{ maintenances: any[] }>(
    "/api/maintenances"
  );

  const [filterEquip, setFilterEquip] = useState("all");
  const [registerDialog, setRegisterDialog] = useState<any>(null);
  const [deleteDialog, setDeleteDialog] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  const equipments = equipData?.equipments || [];
  const maintenances = maintData?.maintenances || [];

  const pendingAlerts = useMemo(() => {
    let list = dashboardData?.maintenanceAlerts || [];
    if (filterEquip !== "all") {
      list = list.filter((a: any) => a.equipmentId === filterEquip);
    }
    return list;
  }, [dashboardData, filterEquip]);

  const filteredMaintenances = useMemo(() => {
    if (filterEquip === "all") return maintenances;
    return maintenances.filter((m) => m.equipmentId === filterEquip);
  }, [maintenances, filterEquip]);

  async function handleDelete() {
    if (!deleteDialog) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/maintenances/${deleteDialog.id}`, {
        method: "DELETE",
      });
      toast.success("Manutenção removida");
      setDeleteDialog(null);
      refetchMaint();
    } catch (e: any) {
      toast.error(e.message || "Erro ao excluir");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Manutenções</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Alertas pendentes e histórico de manutenções realizadas.
        </p>
      </div>

      {/* Filtro */}
      <Card className="p-4 gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-emerald-600" />
          <h3 className="text-sm font-semibold">Filtrar por equipamento</h3>
        </div>
        <Select value={filterEquip} onValueChange={setFilterEquip}>
          <SelectTrigger className="w-full sm:max-w-md">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os equipamentos</SelectItem>
            {equipments.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      {/* Alertas pendentes */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">Alertas pendentes</h2>
          <Badge variant="secondary">{pendingAlerts.length}</Badge>
        </div>
        {pendingAlerts.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="Tudo em dia!"
            description="Nenhuma manutenção pendente para os filtros aplicados."
          />
        ) : (
          <div className="space-y-2.5">
            {pendingAlerts.map((m: any) => (
              <div
                key={m.itemId}
                className={cn(
                  "p-4 rounded-xl border-l-4",
                  m.level === "danger"
                    ? "bg-red-50 border-red-500"
                    : "bg-amber-50 border-amber-500"
                )}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{m.itemName}</p>
                      {m.level === "danger" ? (
                        <Badge variant="destructive" className="text-[10px]">
                          VENCIDO
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500 text-[10px]">
                          PRÓXIMO
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {m.equipmentName}
                    </p>
                    <p className="text-sm mt-1">
                      {m.level === "danger"
                        ? `Vencido há ${Math.abs(m.remaining).toFixed(0)} ${
                            m.controlType === "hours" ? "h" : "km"
                          }`
                        : `Faltam ${m.remaining.toFixed(0)} ${
                            m.controlType === "hours" ? "h" : "km"
                          }`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Última leitura: {formatNumber(m.lastReading)} · Atual:{" "}
                      {formatNumber(m.currentReading)} · Intervalo:{" "}
                      {formatNumber(m.interval)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() =>
                      setRegisterDialog({
                        equipmentId: m.equipmentId,
                        itemId: m.itemId,
                        itemName: m.itemName,
                        reading: m.currentReading,
                      })
                    }
                    className="bg-emerald-600 hover:bg-emerald-700 gap-1"
                  >
                    <Wrench className="h-3.5 w-3.5" /> Registrar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Histórico de manutenções */}
      <Card className="p-5">
        <h2 className="font-bold mb-4">Histórico de manutenções</h2>
        {filteredMaintenances.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="Nenhuma manutenção registrada"
            description="Registre a primeira manutenção quando um alerta aparecer."
          />
        ) : (
          <div className="divide-y divide-border">
            {filteredMaintenances.map((m) => (
              <div
                key={m.id}
                className="py-3 flex items-start gap-3 first:pt-0 last:pb-0"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 flex-shrink-0">
                  <Wrench className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{m.itemName}</p>
                  <Link
                    href={`/app/equipamentos/${m.equipmentId}`}
                    className="text-xs text-emerald-700 hover:underline"
                  >
                    {m.equipment?.name}
                  </Link>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDate(m.maintenanceDate)} ·{" "}
                    {m.shopOrResponsible || "—"}
                  </div>
                  {m.notes && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {m.notes}
                    </p>
                  )}
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <p className="font-semibold text-sm">{formatBRL(m.cost)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(m.readingAtMaintenance)}{" "}
                    {m.equipment?.controlType === "hours" ? "h" : "km"}
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteDialog(m)}
                    className="text-red-600 hover:bg-red-50 h-7 w-7 p-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Dialog Registrar Manutenção */}
      <RegisterMaintenanceDialog
        data={registerDialog}
        onClose={() => setRegisterDialog(null)}
        onSaved={() => {
          setRegisterDialog(null);
          refetchMaint();
        }}
      />

      {/* Delete confirm */}
      <AlertDialog
        open={!!deleteDialog}
        onOpenChange={(o) => !o && setDeleteDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir manutenção?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá o registro de manutenção. O item de
              manutenção não será resetado.
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

function RegisterMaintenanceDialog({
  data,
  onClose,
  onSaved,
}: {
  data: any;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { data: equipData } = useApi<{ equipments: any[] }>("/api/equipments");
  const equipments = equipData?.equipments || [];

  const [form, setForm] = useState<any>({
    equipmentId: "",
    itemId: null,
    itemName: "",
    cost: "",
    readingAtMaintenance: "",
    shopOrResponsible: "",
    notes: "",
    maintenanceDate: new Date().toISOString().slice(0, 10),
    photo: null,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({
        equipmentId: data.equipmentId || "",
        itemId: data.itemId || null,
        itemName: data.itemName || "",
        cost: "",
        readingAtMaintenance: String(data.reading || ""),
        shopOrResponsible: "",
        notes: "",
        maintenanceDate: new Date().toISOString().slice(0, 10),
        photo: null,
      });
    }
  }, [data]);

  const selectedEquipment = equipments.find(
    (e) => e.id === form.equipmentId
  );
  const isHours = selectedEquipment?.controlType === "hours";

  async function save() {
    if (!form.equipmentId) {
      toast.error("Selecione o equipamento");
      return;
    }
    if (!form.itemName) {
      toast.error("Informe o item de manutenção");
      return;
    }
    setSaving(true);
    try {
      await apiFetch("/api/maintenances", {
        method: "POST",
        json: {
          equipmentId: form.equipmentId,
          itemId: form.itemId,
          itemName: form.itemName,
          cost: Number(form.cost) || 0,
          readingAtMaintenance: Number(form.readingAtMaintenance) || 0,
          shopOrResponsible: form.shopOrResponsible || null,
          notes: form.notes || null,
          photo: form.photo,
          maintenanceDate: new Date(form.maintenanceDate).toISOString(),
        },
      });
      toast.success("Manutenção registrada!");
      onSaved();
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={!!data} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar manutenção realizada</DialogTitle>
          <DialogDescription>
            Informe os detalhes da manutenção feita.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>Equipamento *</Label>
            <Select
              value={form.equipmentId}
              onValueChange={(v) => setForm({ ...form, equipmentId: v, itemId: null })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {equipments.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedEquipment && (
            <div>
              <Label>Item de manutenção *</Label>
              <Select
                value={form.itemId || ""}
                onValueChange={(v) => {
                  const item = selectedEquipment.maintenanceItems?.find(
                    (i: any) => i.id === v
                  );
                  setForm({
                    ...form,
                    itemId: v,
                    itemName: item?.name || form.itemName,
                  });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o item" />
                </SelectTrigger>
                <SelectContent>
                  {selectedEquipment.maintenanceItems?.map((i: any) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                className="mt-2"
                value={form.itemName}
                onChange={(e) =>
                  setForm({ ...form, itemName: e.target.value, itemId: null })
                }
                placeholder="Ou digite o nome do item"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Leitura ({isHours ? "horas" : "km"})</Label>
              <Input
                type="number"
                value={form.readingAtMaintenance}
                onChange={(e) =>
                  setForm({ ...form, readingAtMaintenance: e.target.value })
                }
                placeholder="0"
              />
            </div>
            <div>
              <Label>Custo (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: e.target.value })}
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Data</Label>
              <Input
                type="date"
                value={form.maintenanceDate}
                onChange={(e) =>
                  setForm({ ...form, maintenanceDate: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Oficina / Responsável</Label>
              <Input
                value={form.shopOrResponsible}
                onChange={(e) =>
                  setForm({ ...form, shopOrResponsible: e.target.value })
                }
                placeholder="Ex: Mecânica central"
              />
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

          <ImageUpload
            label="Foto (opcional)"
            subdir="maintenance"
            value={form.photo}
            onChange={(url) => setForm({ ...form, photo: url })}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={save}
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Registrar manutenção
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
