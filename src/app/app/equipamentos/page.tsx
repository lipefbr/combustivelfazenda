"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useApi } from "@/hooks/use-session";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";
import {
  Truck,
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  Filter,
  Camera,
  X,
  GripVertical,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/app/image-upload";
import { EmptyState, LoadingState, ErrorState } from "@/components/app/states";

import {
  EQUIPMENT_TYPE_LABELS,
  CONTROL_TYPE_LABELS,
  ORIGIN_LABELS,
  DEFAULT_MAINTENANCE_ITEMS,
  formatBRL,
  formatNumber,
} from "@/lib/constants";

type Equipment = {
  id: string;
  name: string;
  type: "truck" | "light_vehicle" | "heavy_machine" | "other";
  plate?: string | null;
  assetNumber?: string | null;
  value?: number | null;
  photo?: string | null;
  notes?: string | null;
  origin: "company" | "third_party";
  ownerName?: string | null;
  controlType: "hours" | "km";
  initialReading: number;
  currentReading: number;
  active: boolean;
  maintenanceItems: any[];
};

const TYPES = [
  { value: "truck", label: "Caminhão" },
  { value: "light_vehicle", label: "Veículo leve" },
  { value: "heavy_machine", label: "Máquina pesada" },
  { value: "other", label: "Outro" },
];

export default function EquipamentosPage() {
  const { data, error, loading, refetch } = useApi<{ equipments: Equipment[] }>(
    "/api/equipments"
  );

  const [filters, setFilters] = useState({
    origin: "all",
    type: "all",
    search: "",
  });

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Equipment | null>(null);
  const [saving, setSaving] = useState(false);

  // Delete state
  const [toDelete, setToDelete] = useState<Equipment | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Open edit dialog if ?edit=ID is in URL
  const searchParams = useSearchParams();
  useEffect(() => {
    const editId = searchParams?.get("edit");
    if (editId && data?.equipments) {
      const target = data.equipments.find((e) => e.id === editId);
      if (target) {
        setEditing(target);
        setDialogOpen(true);
      }
    }
  }, [searchParams, data]);

  const filtered = useMemo(() => {
    if (!data?.equipments) return [];
    return data.equipments.filter((e) => {
      if (filters.origin !== "all" && e.origin !== filters.origin) return false;
      if (filters.type !== "all" && e.type !== filters.type) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !e.name.toLowerCase().includes(q) &&
          !(e.plate || "").toLowerCase().includes(q) &&
          !(e.assetNumber || "").toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [data, filters]);

  function openNew() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(e: Equipment) {
    setEditing(e);
    setDialogOpen(true);
  }

  async function handleDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/equipments/${toDelete.id}`, { method: "DELETE" });
      toast.success("Equipamento excluído");
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
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Equipamentos</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Caminhões, veículos e máquinas da fazenda e de terceiros.
          </p>
        </div>
        <Button
          onClick={openNew}
          className="bg-emerald-600 hover:bg-emerald-700 gap-2"
        >
          <Plus className="h-4 w-4" /> Novo Equipamento
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 gap-4">
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, placa, patrimônio..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="pl-9"
            />
          </div>
          <Select
            value={filters.origin}
            onValueChange={(v) => setFilters({ ...filters, origin: v })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Origem" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as origens</SelectItem>
              <SelectItem value="company">Da fazenda/empresa</SelectItem>
              <SelectItem value="third_party">De terceiros</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.type}
            onValueChange={(v) => setFilters({ ...filters, type: v })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="truck">Caminhão</SelectItem>
              <SelectItem value="light_vehicle">Veículo leve</SelectItem>
              <SelectItem value="heavy_machine">Máquina pesada</SelectItem>
              <SelectItem value="other">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Content */}
      {loading ? (
        <LoadingState label="Carregando equipamentos..." />
      ) : error ? (
        <ErrorState message={error} />
      ) : filtered.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon={Truck}
            title="Nenhum equipamento encontrado"
            description="Cadastre caminhões, veículos e máquinas para começar a registrar abastecimentos e manutenções."
            ctaHref={undefined}
            ctaLabel={undefined}
          />
          <div className="text-center">
            <Button
              onClick={openNew}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4 mr-2" /> Cadastrar equipamento
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((e) => (
            <EquipmentCard
              key={e.id}
              equipment={e}
              onEdit={() => openEdit(e)}
              onDelete={() => setToDelete(e)}
            />
          ))}
        </div>
      )}

      {/* Dialog Novo/Editar */}
      <EquipmentDialog
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

      {/* Confirmação de exclusão */}
      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir equipamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{toDelete?.name}</strong>?
              Esta ação não pode ser desfeita e removerá todo o histórico
              relacionado (abastecimentos e manutenções).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EquipmentCard({
  equipment,
  onEdit,
  onDelete,
}: {
  equipment: Equipment;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const unit = equipment.controlType === "hours" ? "h" : "km";
  return (
    <Card className="p-4 gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 overflow-hidden flex-shrink-0">
          {equipment.photo ? (
            <img
              src={equipment.photo}
              alt={equipment.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <Truck className="h-7 w-7" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <Link href={`/app/equipamentos/${equipment.id}`}>
            <p className="font-semibold truncate hover:text-emerald-700">
              {equipment.name}
            </p>
          </Link>
          <div className="flex flex-wrap gap-1.5 mt-1">
            <Badge variant="outline" className="text-xs">
              {EQUIPMENT_TYPE_LABELS[equipment.type]}
            </Badge>
            <Badge
              className={
                equipment.origin === "company"
                  ? "bg-emerald-100 text-emerald-700 text-xs"
                  : "bg-amber-100 text-amber-700 text-xs"
              }
            >
              {equipment.origin === "company" ? "Fazenda" : "Terceiros"}
            </Badge>
            {!equipment.active && (
              <Badge variant="secondary" className="text-xs">
                Inativo
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Placa</p>
          <p className="font-medium">{equipment.plate || "—"}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Patrimônio</p>
          <p className="font-medium">{equipment.assetNumber || "—"}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Controle</p>
          <p className="font-medium">
            {CONTROL_TYPE_LABELS[equipment.controlType]}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Leitura atual</p>
          <p className="font-medium">
            {formatNumber(equipment.currentReading)} {unit}
          </p>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button
          size="sm"
          variant="outline"
          onClick={onEdit}
          className="flex-1 gap-1"
        >
          <Pencil className="h-3.5 w-3.5" /> Editar
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onDelete}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-1"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  );
}

interface EquipmentDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: Equipment | null;
  saving: boolean;
  setSaving: (b: boolean) => void;
  onSaved: () => void;
}

function EquipmentDialog({
  open,
  onOpenChange,
  editing,
  saving,
  setSaving,
  onSaved,
}: EquipmentDialogProps) {
  const defaultItems = DEFAULT_MAINTENANCE_ITEMS.map((item, i) => ({
    tempId: `temp-${i}`,
    name: item.name,
    interval: item.defaultInterval,
    lastReading: 0,
  }));

  const [form, setForm] = useState<any>({
    name: "",
    type: "truck",
    plate: "",
    assetNumber: "",
    value: "",
    photo: null,
    notes: "",
    origin: "company",
    ownerName: "",
    controlType: "km",
    initialReading: 0,
    maintenanceItems: defaultItems,
  });

  // Re-sync when dialog opens
  useEffect(() => {
    if (open) {
      if (editing) {
        setForm({
          name: editing.name,
          type: editing.type,
          plate: editing.plate || "",
          assetNumber: editing.assetNumber || "",
          value: editing.value ?? "",
          photo: editing.photo || null,
          notes: editing.notes || "",
          origin: editing.origin,
          ownerName: editing.ownerName || "",
          controlType: editing.controlType,
          initialReading: editing.initialReading,
          maintenanceItems: (editing.maintenanceItems || []).map(
            (i: any, idx: number) => ({
              tempId: `temp-${idx}`,
              id: i.id,
              name: i.name,
              interval: i.interval,
              lastReading: i.lastReading,
            })
          ),
        });
      } else {
        setForm({
          name: "",
          type: "truck",
          plate: "",
          assetNumber: "",
          value: "",
          photo: null,
          notes: "",
          origin: "company",
          ownerName: "",
          controlType: "km",
          initialReading: 0,
          maintenanceItems: defaultItems,
        });
      }
    }
  }, [open, editing]);

  function changeType(type: string) {
    // Default controlType por tipo
    const defaultControl = type === "heavy_machine" ? "hours" : "km";
    setForm({ ...form, type, controlType: defaultControl });
  }

  function updateItem(tempId: string, field: string, value: any) {
    setForm({
      ...form,
      maintenanceItems: form.maintenanceItems.map((it: any) =>
        it.tempId === tempId ? { ...it, [field]: value } : it
      ),
    });
  }

  function addItem() {
    setForm({
      ...form,
      maintenanceItems: [
        ...form.maintenanceItems,
        {
          tempId: `temp-${Date.now()}`,
          name: "",
          interval: 250,
          lastReading: 0,
        },
      ],
    });
  }

  function removeItem(tempId: string) {
    setForm({
      ...form,
      maintenanceItems: form.maintenanceItems.filter(
        (it: any) => it.tempId !== tempId
      ),
    });
  }

  function resetDefault() {
    setForm({ ...form, maintenanceItems: defaultItems });
  }

  async function save() {
    if (!form.name || form.name.length < 2) {
      toast.error("Informe o nome/modelo do equipamento");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        type: form.type,
        plate: form.plate || null,
        assetNumber: form.assetNumber || null,
        value: form.value === "" ? null : Number(form.value),
        photo: form.photo,
        notes: form.notes || null,
        origin: form.origin,
        ownerName: form.origin === "third_party" ? form.ownerName : null,
        controlType: form.controlType,
        initialReading: Number(form.initialReading) || 0,
        maintenanceItems: form.maintenanceItems
          .filter((i: any) => i.name)
          .map((i: any) => ({
            id: i.id,
            name: i.name,
            interval: Number(i.interval) || 0,
            lastReading: Number(i.lastReading) || 0,
          })),
      };

      if (editing) {
        await apiFetch(`/api/equipments/${editing.id}`, {
          method: "PATCH",
          json: payload,
        });
        toast.success("Equipamento atualizado!");
      } else {
        await apiFetch("/api/equipments", { method: "POST", json: payload });
        toast.success("Equipamento cadastrado!");
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Editar equipamento" : "Novo equipamento"}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do equipamento. Itens de manutenção são criados
            automaticamente com base nos padrões sugeridos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Identificação */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-emerald-700">
              Identificação
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <Label>Nome / Modelo *</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="Ex: Caminhão Scania R450"
                />
              </div>
              <div>
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={changeType}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Placa</Label>
                <Input
                  value={form.plate}
                  onChange={(e) =>
                    setForm({ ...form, plate: e.target.value.toUpperCase() })
                  }
                  placeholder="ABC-1234"
                />
              </div>
              <div>
                <Label>Patrimônio</Label>
                <Input
                  value={form.assetNumber}
                  onChange={(e) =>
                    setForm({ ...form, assetNumber: e.target.value })
                  }
                  placeholder="Nº patrimônio"
                />
              </div>
              <div>
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.value}
                  onChange={(e) =>
                    setForm({ ...form, value: e.target.value })
                  }
                  placeholder="0,00"
                />
              </div>
            </div>
            <ImageUpload
              label="Foto do equipamento (opcional)"
              subdir="equipments"
              value={form.photo}
              onChange={(url) => setForm({ ...form, photo: url })}
            />
          </div>

          {/* Origem */}
          <div className="space-y-3 pt-2 border-t">
            <h3 className="text-sm font-semibold text-emerald-700">Origem</h3>
            <Select
              value={form.origin}
              onValueChange={(v) => setForm({ ...form, origin: v })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="company">Da fazenda/empresa</SelectItem>
                <SelectItem value="third_party">De terceiros</SelectItem>
              </SelectContent>
            </Select>
            {form.origin === "third_party" && (
              <div>
                <Label>Nome do proprietário</Label>
                <Input
                  value={form.ownerName}
                  onChange={(e) =>
                    setForm({ ...form, ownerName: e.target.value })
                  }
                  placeholder="Ex: Fazenda São João"
                />
              </div>
            )}
          </div>

          {/* Controle */}
          <div className="space-y-3 pt-2 border-t">
            <h3 className="text-sm font-semibold text-emerald-700">
              Tipo de controle
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label>Controle</Label>
                <Select
                  value={form.controlType}
                  onValueChange={(v) =>
                    setForm({ ...form, controlType: v })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hours">
                      Horímetro (horas)
                    </SelectItem>
                    <SelectItem value="km">Hodômetro (km)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Leitura inicial</Label>
                <Input
                  type="number"
                  value={form.initialReading}
                  onChange={(e) =>
                    setForm({ ...form, initialReading: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Itens de manutenção */}
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-emerald-700">
                Itens de manutenção
              </h3>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={resetDefault}
                className="text-xs"
              >
                Restaurar padrão
              </Button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {form.maintenanceItems.map((item: any) => (
                <div
                  key={item.tempId}
                  className="grid grid-cols-12 gap-1.5 items-end p-2 bg-muted/40 rounded-lg"
                >
                  <div className="col-span-12 sm:col-span-5">
                    <Label className="text-xs">Item</Label>
                    <Input
                      value={item.name}
                      onChange={(e) =>
                        updateItem(item.tempId, "name", e.target.value)
                      }
                      placeholder="Ex: Troca de óleo"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="col-span-5 sm:col-span-3">
                    <Label className="text-xs">Intervalo</Label>
                    <Input
                      type="number"
                      value={item.interval}
                      onChange={(e) =>
                        updateItem(
                          item.tempId,
                          "interval",
                          e.target.value
                        )
                      }
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="col-span-5 sm:col-span-3">
                    <Label className="text-xs">Última leitura</Label>
                    <Input
                      type="number"
                      value={item.lastReading}
                      onChange={(e) =>
                        updateItem(
                          item.tempId,
                          "lastReading",
                          e.target.value
                        )
                      }
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1 flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeItem(item.tempId)}
                      className="text-red-600 h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addItem}
              className="gap-1"
            >
              <Plus className="h-3.5 w-3.5" /> Adicionar item
            </Button>
          </div>

          {/* Observações */}
          <div className="space-y-3 pt-2 border-t">
            <h3 className="text-sm font-semibold text-emerald-700">
              Observações
            </h3>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Anotações sobre o equipamento..."
              rows={2}
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
            {editing ? "Salvar alterações" : "Cadastrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
