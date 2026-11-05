"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useApi } from "@/hooks/use-session";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";
import {
  Receipt,
  Plus,
  Trash2,
  Loader2,
  Filter,
  Coins,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { LoadingState, ErrorState, EmptyState } from "@/components/app/states";

import { formatBRL, formatDate } from "@/lib/constants";

const CATEGORIES = [
  { value: "peças", label: "Peças" },
  { value: "serviços", label: "Serviços" },
  { value: "pneus", label: "Pneus" },
  { value: "outros", label: "Outros" },
];

const CATEGORY_LABELS: Record<string, string> = {
  peças: "Peças",
  serviços: "Serviços",
  pneus: "Pneus",
  outros: "Outros",
};

const CATEGORY_COLORS: Record<string, string> = {
  peças: "bg-emerald-100 text-emerald-700",
  serviços: "bg-amber-100 text-amber-700",
  pneus: "bg-blue-100 text-blue-700",
  outros: "bg-muted text-muted-foreground",
};

export default function DespesasPage() {
  const { data: expData, error, loading, refetch } = useApi<{ expenses: any[] }>(
    "/api/expenses"
  );
  const { data: equipData } = useApi<{ equipments: any[] }>("/api/equipments");

  const [filters, setFilters] = useState({
    category: "all",
    equipmentId: "all",
    startDate: "",
    endDate: "",
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toDelete, setToDelete] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  const expenses = expData?.expenses || [];
  const equipments = equipData?.equipments || [];

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      if (filters.category !== "all" && e.category !== filters.category)
        return false;
      if (filters.equipmentId !== "all" && e.equipmentId !== filters.equipmentId)
        return false;
      if (filters.startDate && new Date(e.expenseDate) < new Date(filters.startDate))
        return false;
      if (filters.endDate && new Date(e.expenseDate) > new Date(filters.endDate + "T23:59:59"))
        return false;
      return true;
    });
  }, [expenses, filters]);

  // Totais
  const now = new Date();
  const monthExpenses = expenses.filter((e) => {
    const d = new Date(e.expenseDate);
    return (
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  });
  const monthTotal = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const byCategory = CATEGORIES.map((c) => {
    const total = filtered
      .filter((e) => e.category === c.value)
      .reduce((s, e) => s + e.amount, 0);
    return { ...c, total };
  });

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Despesas</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Despesas da frota: peças, serviços, pneus e outros.
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 gap-2"
        >
          <Plus className="h-4 w-4" /> Nova Despesa
        </Button>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4 gap-2">
          <p className="text-xs text-muted-foreground">Despesas do mês</p>
          <p className="text-xl font-bold">{formatBRL(monthTotal)}</p>
          <p className="text-xs text-muted-foreground">
            {monthExpenses.length} registros
          </p>
        </Card>
        {byCategory.map((c) => (
          <Card key={c.value} className="p-4 gap-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <Badge
                className={`text-[10px] ${CATEGORY_COLORS[c.value]}`}
                variant="outline"
              >
                {filtered.filter((e) => e.category === c.value).length}
              </Badge>
            </div>
            <p className="text-lg font-bold">{formatBRL(c.total)}</p>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <Card className="p-4 gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-emerald-600" />
          <h3 className="text-sm font-semibold">Filtros</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Select
            value={filters.category}
            onValueChange={(v) => setFilters({ ...filters, category: v })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.equipmentId}
            onValueChange={(v) => setFilters({ ...filters, equipmentId: v })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Equipamento" />
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
          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
          />
          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
          />
        </div>
      </Card>

      {/* Lista */}
      {loading ? (
        <LoadingState label="Carregando despesas..." />
      ) : error ? (
        <ErrorState message={error} />
      ) : filtered.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon={Receipt}
            title="Nenhuma despesa encontrada"
            description="Registre despesas com peças, serviços, pneus e outros custos da frota."
            ctaHref={undefined}
            ctaLabel={undefined}
          />
          <div className="text-center">
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4 mr-2" /> Registrar despesa
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-0 gap-0">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-left">
                  <th className="p-3 font-semibold">Data</th>
                  <th className="p-3 font-semibold">Categoria</th>
                  <th className="p-3 font-semibold">Descrição</th>
                  <th className="p-3 font-semibold">Equipamento</th>
                  <th className="p-3 text-right font-semibold">Valor</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} className="border-t hover:bg-muted/30">
                    <td className="p-3 whitespace-nowrap">
                      {formatDate(e.expenseDate)}
                    </td>
                    <td className="p-3">
                      <Badge
                        className={`text-xs ${CATEGORY_COLORS[e.category]}`}
                        variant="outline"
                      >
                        {CATEGORY_LABELS[e.category]}
                      </Badge>
                    </td>
                    <td className="p-3">{e.description}</td>
                    <td className="p-3">
                      {e.equipment?.name || (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-3 text-right font-semibold">
                      {formatBRL(e.amount)}
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setToDelete(e)}
                        className="text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-border">
            {filtered.map((e) => (
              <div key={e.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{e.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        className={`text-[10px] ${CATEGORY_COLORS[e.category]}`}
                        variant="outline"
                      >
                        {CATEGORY_LABELS[e.category]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(e.expenseDate)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatBRL(e.amount)}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setToDelete(e)}
                      className="text-red-600 hover:bg-red-50 h-7 w-7 p-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                {e.equipment?.name && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Equipamento: {e.equipment.name}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Dialog Nova Despesa */}
      <NewExpenseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={() => {
          setDialogOpen(false);
          refetch();
        }}
      />

      {/* Delete confirm */}
      <AlertDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir despesa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!toDelete) return;
                setDeleting(true);
                try {
                  await apiFetch(`/api/expenses/${toDelete.id}`, {
                    method: "DELETE",
                  });
                  toast.success("Despesa excluída");
                  setToDelete(null);
                  refetch();
                } catch (e: any) {
                  toast.error(e.message || "Erro ao excluir");
                } finally {
                  setDeleting(false);
                }
              }}
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

function NewExpenseDialog({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSaved: () => void;
}) {
  const { data: equipData } = useApi<{ equipments: any[] }>("/api/equipments");
  const equipments = equipData?.equipments || [];

  const [form, setForm] = useState({
    category: "peças",
    description: "",
    amount: "",
    equipmentId: "",
    expenseDate: new Date().toISOString().slice(0, 10),
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        category: "peças",
        description: "",
        amount: "",
        equipmentId: "",
        expenseDate: new Date().toISOString().slice(0, 10),
      });
    }
  }, [open]);

  async function save() {
    if (!form.description || form.description.length < 2) {
      toast.error("Informe a descrição");
      return;
    }
    if (Number(form.amount) <= 0) {
      toast.error("Informe o valor");
      return;
    }
    setSaving(true);
    try {
      await apiFetch("/api/expenses", {
        method: "POST",
        json: {
          category: form.category,
          description: form.description,
          amount: Number(form.amount),
          equipmentId: form.equipmentId || null,
          expenseDate: new Date(form.expenseDate).toISOString(),
        },
      });
      toast.success("Despesa registrada!");
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
          <DialogTitle>Nova despesa</DialogTitle>
          <DialogDescription>
            Registre um custo da frota que não seja abastecimento ou
            manutenção.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>Categoria</Label>
            <Select
              value={form.category}
              onValueChange={(v) => setForm({ ...form, category: v })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Descrição *</Label>
            <Textarea
              rows={2}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Ex: Troca de pneu dianteiro"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Valor (R$) *</Label>
              <Input
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0,00"
              />
            </div>
            <div>
              <Label>Data</Label>
              <Input
                type="date"
                value={form.expenseDate}
                onChange={(e) =>
                  setForm({ ...form, expenseDate: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <Label>Equipamento (opcional)</Label>
            <Select
              value={form.equipmentId || "none"}
              onValueChange={(v) =>
                setForm({ ...form, equipmentId: v === "none" ? "" : v })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sem equipamento vinculado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {equipments.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            Registrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
