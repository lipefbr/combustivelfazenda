"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-session";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  Save,
  Droplet,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/app/image-upload";

import { formatBRL, formatNumber } from "@/lib/constants";

export default function EntradaCombustivelPage() {
  const router = useRouter();
  const { data: reservoirsData } = useApi<{ reservoirs: any[] }>(
    "/api/reservoirs"
  );
  const reservoirs = reservoirsData?.reservoirs || [];

  const [form, setForm] = useState({
    reservoirId: "",
    liters: "",
    pricePerLiter: "",
    totalAmount: "",
    supplier: "",
    invoiceNumber: "",
    entryDate: new Date().toISOString().slice(0, 10),
    invoicePhoto: null as string | null,
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const liters = Number(form.liters) || 0;
  const price = Number(form.pricePerLiter) || 0;
  const total =
    form.totalAmount && Number(form.totalAmount) > 0
      ? Number(form.totalAmount)
      : liters * price;

  const selectedReservoir = useMemo(
    () => reservoirs.find((r) => r.id === form.reservoirId),
    [reservoirs, form.reservoirId]
  );

  async function save() {
    if (!form.reservoirId) {
      toast.error("Selecione o reservatório de destino");
      return;
    }
    if (liters <= 0) {
      toast.error("Informe os litros");
      return;
    }
    if (price <= 0) {
      toast.error("Informe o preço por litro");
      return;
    }
    setSaving(true);
    try {
      await apiFetch("/api/fuel-entries", {
        method: "POST",
        json: {
          reservoirId: form.reservoirId,
          liters,
          pricePerLiter: price,
          totalAmount: total,
          supplier: form.supplier || undefined,
          invoiceNumber: form.invoiceNumber || undefined,
          invoicePhoto: form.invoicePhoto,
          entryDate: new Date(form.entryDate).toISOString(),
          notes: form.notes || undefined,
        },
      });
      toast.success("Entrada registrada! Estoque atualizado.");
      router.push("/app/estoque");
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div className="flex items-center gap-2">
        <Link href="/app/estoque">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Entrada de Combustível</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Registre a compra de combustível para o estoque.
        </p>
      </div>

      <Card className="p-5 sm:p-6 space-y-4">
        <div>
          <Label>Reservatório de destino *</Label>
          <Select
            value={form.reservoirId}
            onValueChange={(v) =>
              setForm({ ...form, reservoirId: v })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione o reservatório" />
            </SelectTrigger>
            <SelectContent>
              {reservoirs.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name} · {r.fuelType} (atual: {formatNumber(r.currentLevel)} L)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedReservoir && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="flex items-center gap-2">
              <Droplet className="h-4 w-4 text-emerald-600" />
              <p className="text-sm font-medium text-emerald-800">
                {selectedReservoir.name}
              </p>
            </div>
            <p className="text-xs text-emerald-700 mt-1">
              Nível atual: {formatNumber(selectedReservoir.currentLevel)} L →{" "}
              <strong>
                {formatNumber(selectedReservoir.currentLevel + liters)} L
              </strong>{" "}
              após entrada
            </p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label>Litros *</Label>
            <Input
              type="number"
              step="0.01"
              value={form.liters}
              onChange={(e) =>
                setForm({ ...form, liters: e.target.value, totalAmount: "" })
              }
              placeholder="0"
            />
          </div>
          <div>
            <Label>Preço por litro (R$) *</Label>
            <Input
              type="number"
              step="0.01"
              value={form.pricePerLiter}
              onChange={(e) =>
                setForm({ ...form, pricePerLiter: e.target.value, totalAmount: "" })
              }
              placeholder="0,00"
            />
          </div>
        </div>

        <div>
          <Label>Valor total (R$) — opcional</Label>
          <Input
            type="number"
            step="0.01"
            value={form.totalAmount}
            onChange={(e) =>
              setForm({ ...form, totalAmount: e.target.value })
            }
            placeholder={String(liters * price)}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Se informar, sobrescreve o cálculo ({formatBRL(liters * price)}).
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label>Fornecedor</Label>
            <Input
              value={form.supplier}
              onChange={(e) =>
                setForm({ ...form, supplier: e.target.value })
              }
              placeholder="Ex: Distribuidora X"
            />
          </div>
          <div>
            <Label>Número da nota</Label>
            <Input
              value={form.invoiceNumber}
              onChange={(e) =>
                setForm({ ...form, invoiceNumber: e.target.value })
              }
              placeholder="NF-e"
            />
          </div>
        </div>

        <div>
          <Label>Data</Label>
          <Input
            type="date"
            value={form.entryDate}
            onChange={(e) => setForm({ ...form, entryDate: e.target.value })}
          />
        </div>

        <ImageUpload
          label="Foto da nota (opcional)"
          subdir="invoices"
          value={form.invoicePhoto}
          onChange={(url) => setForm({ ...form, invoicePhoto: url })}
        />

        {/* Resumo */}
        {liters > 0 && price > 0 && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex justify-between items-center">
            <div>
              <p className="text-xs text-emerald-700">Valor total</p>
              <p className="text-xs text-muted-foreground">
                {formatNumber(liters)} L × {formatBRL(price)}
              </p>
            </div>
            <span className="font-bold text-emerald-700 text-lg">
              {formatBRL(total)}
            </span>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Link href="/app/estoque" className="flex-1">
            <Button variant="outline" className="w-full">
              Cancelar
            </Button>
          </Link>
          <Button
            onClick={save}
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-700 flex-1 gap-2"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Salvando..." : "Registrar entrada"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
