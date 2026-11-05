"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApi } from "@/hooks/use-session";
import { apiFetch, apiUpload } from "@/lib/api-client";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  ArrowRightCircle,
  Check,
  CheckCircle2,
  ChevronLeft,
  Droplet,
  Fuel,
  Loader2,
  Search,
  Store,
  Truck,
  AlertTriangle,
  Camera,
  Calendar,
  ClipboardList,
  User,
  ImagePlus,
  X,
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
import { ImageUpload } from "@/components/app/image-upload";
import {
  ORIGIN_LABELS,
  EQUIPMENT_TYPE_LABELS,
  CONTROL_TYPE_LABELS,
  DEFAULT_FUEL_TYPES,
  REFUEL_SOURCE_LABELS,
  formatBRL,
  formatNumber,
  calculateConsumption,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

const STEPS = [
  { num: 1, label: "Origem", icon: Droplet },
  { num: 2, label: "Equipamento", icon: Truck },
  { num: 3, label: "Leitura", icon: Fuel },
  { num: 4, label: "Serviço", icon: ClipboardList },
  { num: 5, label: "Confirmar", icon: Check },
];

export default function NovoAbastecimentoPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const { data: session } = useApi<{ user: any }>("/api/auth/me");
  const { data: reservoirsData } = useApi<{ reservoirs: any[] }>(
    "/api/reservoirs"
  );
  const { data: equipmentsData } = useApi<{ equipments: any[] }>(
    "/api/equipments"
  );

  const reservoirs = reservoirsData?.reservoirs || [];
  const allEquipments = equipmentsData?.equipments || [];

  const [form, setForm] = useState<any>({
    source: "reservoir",
    reservoirId: "",
    // external
    externalStation: "",
    externalPricePerLiter: "",
    externalTotalAmount: "",
    externalInvoicePhoto: null,
    // equipamento
    equipmentId: "",
    equipmentSearch: "",
    equipmentOriginFilter: "all",
    liters: "",
    fuelType: DEFAULT_FUEL_TYPES[0],
    pricePerLiter: "",
    // leitura
    reading: "",
    refuelDate: new Date().toISOString().slice(0, 16),
    confirmedLowReading: false,
    // serviço
    service: "",
    notes: "",
    photo: null,
    // operador
    operatorName: "",
  });

  // Set operator name from session
  useEffect(() => {
    if (session?.user?.name && !form.operatorName) {
      setForm((f: any) => ({ ...f, operatorName: session.user.name }));
    }
  }, [session]);

  // Default reservoir if only one available
  useEffect(() => {
    if (
      form.source === "reservoir" &&
      !form.reservoirId &&
      reservoirs.length === 1
    ) {
      setForm((f: any) => ({
        ...f,
        reservoirId: reservoirs[0].id,
      }));
    }
  }, [reservoirs, form.source, form.reservoirId]);

  const selectedEquipment = useMemo(
    () => allEquipments.find((e) => e.id === form.equipmentId),
    [allEquipments, form.equipmentId]
  );

  const selectedReservoir = useMemo(
    () => reservoirs.find((r) => r.id === form.reservoirId),
    [reservoirs, form.reservoirId]
  );

  // Auto-fill price per liter from latest fuel entry for the reservoir
  useEffect(() => {
    async function fetchDefaultPrice() {
      if (
        form.source === "reservoir" &&
        form.reservoirId &&
        !form.pricePerLiter
      ) {
        try {
          const data = await apiFetch<{ entries: any[] }>(
            `/api/fuel-entries?reservoirId=${form.reservoirId}`
          );
          const latest = data.entries?.[0];
          if (latest?.pricePerLiter) {
            setForm((f: any) => ({
              ...f,
              pricePerLiter: String(latest.pricePerLiter),
            }));
          }
        } catch {
          // ignore
        }
      }
    }
    fetchDefaultPrice();
  }, [form.source, form.reservoirId]);

  const filteredEquipments = useMemo(() => {
    let list = allEquipments;
    if (form.equipmentOriginFilter !== "all") {
      list = list.filter((e) => e.origin === form.equipmentOriginFilter);
    }
    if (form.equipmentSearch) {
      const q = form.equipmentSearch.toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          (e.plate || "").toLowerCase().includes(q) ||
          (e.assetNumber || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [allEquipments, form.equipmentOriginFilter, form.equipmentSearch]);

  const liters = Number(form.liters) || 0;
  const pricePerLiter =
    form.source === "external"
      ? Number(form.externalPricePerLiter) || 0
      : Number(form.pricePerLiter) || 0;
  const totalAmount =
    form.source === "external" && form.externalTotalAmount
      ? Number(form.externalTotalAmount)
      : liters * pricePerLiter;

  const readingNum = Number(form.reading) || 0;
  const previousReading = selectedEquipment?.currentReading || 0;
  const readingLow = selectedEquipment && readingNum < previousReading;

  const consumption = selectedEquipment
    ? calculateConsumption(
        previousReading,
        readingNum,
        liters,
        selectedEquipment.controlType
      )
    : null;
  const consumptionLabel = selectedEquipment
    ? selectedEquipment.controlType === "hours"
      ? "L/h"
      : "km/L"
    : "";

  function canNextStep(current: number): boolean {
    if (current === 1) {
      if (form.source === "reservoir") return !!form.reservoirId;
      return (
        !!form.externalStation &&
        Number(form.externalPricePerLiter) > 0
      );
    }
    if (current === 2) {
      return !!form.equipmentId && Number(form.liters) > 0;
    }
    if (current === 3) {
      return (
        Number(form.reading) >= 0 && form.refuelDate && form.operatorName
      );
    }
    if (current === 4) return true; // opcional
    return true;
  }

  function next() {
    if (step === 3 && readingLow && !form.confirmedLowReading) {
      toast.error("Confirme a leitura menor que a anterior para continuar.");
      return;
    }
    if (step < 5) setStep(step + 1);
  }
  function back() {
    if (step > 1) setStep(step - 1);
  }

  async function save() {
    if (!form.equipmentId) {
      toast.error("Selecione um equipamento");
      setStep(2);
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        equipmentId: form.equipmentId,
        operatorName: form.operatorName,
        source: form.source,
        liters: Number(form.liters),
        fuelType: form.fuelType,
        pricePerLiter,
        totalAmount,
        reading: Number(form.reading),
        previousReading,
        service: form.service || null,
        notes: form.notes || null,
        photo: form.photo,
        refuelDate: new Date(form.refuelDate).toISOString(),
      };

      if (form.source === "reservoir") {
        payload.reservoirId = form.reservoirId;
      } else {
        payload.externalStation = form.externalStation;
        payload.externalPricePerLiter = Number(form.externalPricePerLiter);
        payload.externalTotalAmount = totalAmount;
        payload.externalInvoicePhoto = form.externalInvoicePhoto;
      }

      await apiFetch("/api/refuelings", { method: "POST", json: payload });
      toast.success("Abastecimento registrado com sucesso!");
      router.push("/app/abastecimentos");
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar abastecimento");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* Top */}
      <div className="flex items-center gap-2">
        <Link href="/app/abastecimentos">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Cancelar
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Novo Abastecimento</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Siga os passos para registrar o abastecimento.
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between gap-1">
        {STEPS.map((s, i) => (
          <div key={s.num} className="flex-1 flex items-center">
            <div
              className={cn(
                "flex flex-col items-center gap-1.5 flex-shrink-0",
                i === STEPS.length - 1 ? "flex-1" : ""
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all",
                  step > s.num
                    ? "bg-emerald-600 text-white"
                    : step === s.num
                      ? "bg-emerald-600 text-white ring-4 ring-emerald-200"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {step > s.num ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <s.icon className="h-4 w-4" />
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] sm:text-xs font-medium",
                  step >= s.num
                    ? "text-emerald-700"
                    : "text-muted-foreground"
                )}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 mb-5 rounded",
                  step > s.num ? "bg-emerald-500" : "bg-border"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <Card className="p-5 sm:p-6">
        {step === 1 && (
          <Step1Origin
            form={form}
            setForm={setForm}
            reservoirs={reservoirs}
            liters={liters}
            pricePerLiter={pricePerLiter}
            totalAmount={totalAmount}
          />
        )}
        {step === 2 && (
          <Step2Equipment
            form={form}
            setForm={setForm}
            equipments={filteredEquipments}
            allEquipments={allEquipments}
            selectedEquipment={selectedEquipment}
          />
        )}
        {step === 3 && (
          <Step3Reading
            form={form}
            setForm={setForm}
            selectedEquipment={selectedEquipment}
            readingLow={readingLow}
            previousReading={previousReading}
            consumption={consumption}
            consumptionLabel={consumptionLabel}
            liters={liters}
          />
        )}
        {step === 4 && (
          <Step4Service form={form} setForm={setForm} />
        )}
        {step === 5 && (
          <Step5Confirm
            form={form}
            setForm={setForm}
            selectedEquipment={selectedEquipment}
            selectedReservoir={selectedReservoir}
            liters={liters}
            pricePerLiter={pricePerLiter}
            totalAmount={totalAmount}
            readingNum={readingNum}
            previousReading={previousReading}
            consumption={consumption}
            consumptionLabel={consumptionLabel}
          />
        )}
      </Card>

      {/* Navigation */}
      <div className="flex justify-between gap-3">
        <Button
          variant="outline"
          onClick={back}
          disabled={step === 1 || saving}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" /> Voltar
        </Button>
        {step < 5 ? (
          <Button
            onClick={next}
            disabled={!canNextStep(step)}
            className="bg-emerald-600 hover:bg-emerald-700 gap-1 min-w-[140px]"
          >
            Avançar <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={save}
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-700 gap-1 min-w-[140px]"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Salvando..." : "Salvar"}
            {!saving && <Check className="h-4 w-4" />}
          </Button>
        )}
      </div>
    </div>
  );
}

/* ---------------- Step 1 ---------------- */
function Step1Origin({
  form,
  setForm,
  reservoirs,
  liters,
  pricePerLiter,
  totalAmount,
}: any) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-bold text-lg mb-1">De onde vem o combustível?</h2>
        <p className="text-sm text-muted-foreground">
          Escolha entre o reservatório da fazenda ou um posto externo.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setForm((f: any) => ({ ...f, source: "reservoir" }))}
          className={cn(
            "p-4 rounded-2xl border-2 text-left transition-all",
            form.source === "reservoir"
              ? "border-emerald-600 bg-emerald-50"
              : "border-border hover:border-emerald-300"
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Droplet className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Do reservatório</p>
              <p className="text-xs text-muted-foreground">da fazenda</p>
            </div>
            {form.source === "reservoir" && (
              <Check className="h-5 w-5 text-emerald-600" />
            )}
          </div>
        </button>
        <button
          type="button"
          onClick={() => setForm((f: any) => ({ ...f, source: "external" }))}
          className={cn(
            "p-4 rounded-2xl border-2 text-left transition-all",
            form.source === "external"
              ? "border-emerald-600 bg-emerald-50"
              : "border-border hover:border-emerald-300"
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Store className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Posto externo</p>
              <p className="text-xs text-muted-foreground">compra direta</p>
            </div>
            {form.source === "external" && (
              <Check className="h-5 w-5 text-emerald-600" />
            )}
          </div>
        </button>
      </div>

      {form.source === "reservoir" && (
        <div className="space-y-3">
          <div>
            <Label>Reservatório</Label>
            <Select
              value={form.reservoirId}
              onValueChange={(v) =>
                setForm((f: any) => ({ ...f, reservoirId: v }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o reservatório" />
              </SelectTrigger>
              <SelectContent>
                {reservoirs.map((r: any) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name} · {r.fuelType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {form.reservoirId && (
            <ReservoirInfo reservoirId={form.reservoirId} reservoirs={reservoirs} />
          )}
          <div>
            <Label>Preço por litro (custo médio R$)</Label>
            <Input
              type="number"
              step="0.01"
              value={form.pricePerLiter}
              onChange={(e) =>
                setForm((f: any) => ({ ...f, pricePerLiter: e.target.value }))
              }
              placeholder="0,00"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Preenchido automaticamente com o preço da última entrada. Edite
              se necessário.
            </p>
          </div>
          {liters > 0 && Number(form.pricePerLiter) > 0 && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex justify-between items-center">
              <span className="text-sm font-medium">Custo estimado</span>
              <span className="font-bold text-emerald-700">
                {formatBRL(totalAmount)}
              </span>
            </div>
          )}
        </div>
      )}

      {form.source === "external" && (
        <div className="space-y-3">
          <div>
            <Label>Posto / Fornecedor</Label>
            <Input
              value={form.externalStation}
              onChange={(e) =>
                setForm((f: any) => ({ ...f, externalStation: e.target.value }))
              }
              placeholder="Ex: Posto Esquina"
            />
          </div>
          <div>
            <Label>Preço por litro (R$)</Label>
            <Input
              type="number"
              step="0.01"
              value={form.externalPricePerLiter}
              onChange={(e) =>
                setForm((f: any) => ({
                  ...f,
                  externalPricePerLiter: e.target.value,
                  externalTotalAmount: "",
                }))
              }
              placeholder="0,00"
            />
          </div>
          <div>
            <Label>Valor total (R$) — opcional</Label>
            <Input
              type="number"
              step="0.01"
              value={form.externalTotalAmount}
              onChange={(e) =>
                setForm((f: any) => ({
                  ...f,
                  externalTotalAmount: e.target.value,
                }))
              }
              placeholder={
                liters > 0
                  ? String(liters * pricePerLiter)
                  : "Será calculado após informar litros"
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Se informar, sobrescreve o cálculo automático (litros × preço/L).
            </p>
          </div>
          <ImageUpload
            label="Foto da nota fiscal (opcional)"
            subdir="invoices"
            value={form.externalInvoicePhoto}
            onChange={(url) =>
              setForm((f: any) => ({ ...f, externalInvoicePhoto: url }))
            }
          />
          {liters > 0 && pricePerLiter > 0 && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex justify-between items-center">
              <span className="text-sm font-medium">Valor do abastecimento</span>
              <span className="font-bold text-amber-700">
                {formatBRL(totalAmount)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReservoirInfo({
  reservoirId,
  reservoirs,
}: {
  reservoirId: string;
  reservoirs: any[];
}) {
  const r = reservoirs.find((x) => x.id === reservoirId);
  if (!r) return null;
  const percent = r.capacity > 0 ? (r.currentLevel / r.capacity) * 100 : 0;
  const minLiters =
    r.minLevelType === "percent"
      ? (r.capacity * r.minLevel) / 100
      : r.minLevel;
  const isLow = r.currentLevel < minLiters;
  return (
    <div className="p-3 rounded-xl bg-muted/40">
      <div className="flex justify-between items-center mb-2">
        <div>
          <p className="font-semibold text-sm">{r.name}</p>
          <p className="text-xs text-muted-foreground">{r.fuelType}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-sm">
            {formatNumber(r.currentLevel)} L
          </p>
          <p className="text-xs text-muted-foreground">
            de {formatNumber(r.capacity)} L
          </p>
        </div>
      </div>
      <div className="h-2 rounded-full bg-white overflow-hidden">
        <div
          className={cn(
            "h-full",
            isLow
              ? "bg-red-500"
              : percent > 50
                ? "bg-emerald-500"
                : "bg-amber-500"
          )}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
      {isLow && (
        <p className="text-xs text-red-600 mt-1.5 font-medium">
          Estoque abaixo do mínimo!
        </p>
      )}
    </div>
  );
}

/* ---------------- Step 2 ---------------- */
function Step2Equipment({
  form,
  setForm,
  equipments,
  selectedEquipment,
}: any) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-bold text-lg mb-1">Equipamento e litros</h2>
        <p className="text-sm text-muted-foreground">
          Selecione o equipamento que foi abastecido.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, placa, patrimônio..."
            value={form.equipmentSearch}
            onChange={(e) =>
              setForm((f: any) => ({ ...f, equipmentSearch: e.target.value }))
            }
            className="pl-9"
          />
        </div>
        <Select
          value={form.equipmentOriginFilter}
          onValueChange={(v) =>
            setForm((f: any) => ({ ...f, equipmentOriginFilter: v }))
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as origens</SelectItem>
            <SelectItem value="company">Da fazenda/empresa</SelectItem>
            <SelectItem value="third_party">De terceiros</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {equipments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhum equipamento encontrado.
          </p>
        ) : (
          equipments.map((e: any) => (
            <button
              key={e.id}
              type="button"
              onClick={() =>
                setForm((f: any) => ({ ...f, equipmentId: e.id }))
              }
              className={cn(
                "w-full p-3 rounded-xl border-2 text-left flex items-center gap-3 transition-all",
                form.equipmentId === e.id
                  ? "border-emerald-600 bg-emerald-50"
                  : "border-border hover:border-emerald-300"
              )}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 overflow-hidden">
                {e.photo ? (
                  <img
                    src={e.photo}
                    alt={e.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Truck className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{e.name}</p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {e.plate && (
                    <Badge variant="outline" className="text-[10px]">
                      {e.plate}
                    </Badge>
                  )}
                  <Badge
                    className={
                      e.origin === "company"
                        ? "bg-emerald-100 text-emerald-700 text-[10px]"
                        : "bg-amber-100 text-amber-700 text-[10px]"
                    }
                  >
                    {e.origin === "company" ? "Fazenda" : "Terceiros"}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {EQUIPMENT_TYPE_LABELS[e.type]}
                  </Badge>
                </div>
              </div>
              <div className="text-right text-xs">
                <p className="text-muted-foreground">Leitura atual</p>
                <p className="font-semibold">
                  {formatNumber(e.currentReading)}{" "}
                  {e.controlType === "hours" ? "h" : "km"}
                </p>
              </div>
              {form.equipmentId === e.id && (
                <Check className="h-5 w-5 text-emerald-600 ml-1" />
              )}
            </button>
          ))
        )}
      </div>

      {/* Litros + combustível */}
      <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t">
        <div>
          <Label>Litros *</Label>
          <Input
            type="number"
            step="0.01"
            value={form.liters}
            onChange={(e) =>
              setForm((f: any) => ({ ...f, liters: e.target.value }))
            }
            placeholder="0"
          />
        </div>
        <div>
          <Label>Tipo de combustível</Label>
          <Select
            value={form.fuelType}
            onValueChange={(v) =>
              setForm((f: any) => ({ ...f, fuelType: v }))
            }
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

      {selectedEquipment && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
          <p className="text-sm font-medium text-emerald-800">
            Equipamento selecionado: {selectedEquipment.name}
          </p>
          <p className="text-xs text-emerald-700 mt-0.5">
            {EQUIPMENT_TYPE_LABELS[selectedEquipment.type]} ·{" "}
            {CONTROL_TYPE_LABELS[selectedEquipment.controlType]} ·{" "}
            {ORIGIN_LABELS[selectedEquipment.origin]}
          </p>
        </div>
      )}
    </div>
  );
}

/* ---------------- Step 3 ---------------- */
function Step3Reading({
  form,
  setForm,
  selectedEquipment,
  readingLow,
  previousReading,
  consumption,
  consumptionLabel,
  liters,
}: any) {
  if (!selectedEquipment) {
    return (
      <div className="text-center text-muted-foreground py-6">
        Volte e selecione um equipamento.
      </div>
    );
  }
  const isHours = selectedEquipment.controlType === "hours";
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-bold text-lg mb-1">Leitura e data</h2>
        <p className="text-sm text-muted-foreground">
          Informe a leitura atual do{" "}
          {isHours ? "horímetro (horas)" : "hodômetro (km)"}.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label>Leitura atual ({isHours ? "horas" : "km"})</Label>
          <Input
            type="number"
            step="0.01"
            value={form.reading}
            onChange={(e) =>
              setForm((f: any) => ({
                ...f,
                reading: e.target.value,
                confirmedLowReading: false,
              }))
            }
            placeholder="0"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Última leitura: {formatNumber(previousReading)}{" "}
            {isHours ? "h" : "km"}
          </p>
        </div>
        <div>
          <Label>Data e hora</Label>
          <Input
            type="datetime-local"
            value={form.refuelDate}
            onChange={(e) =>
              setForm((f: any) => ({ ...f, refuelDate: e.target.value }))
            }
          />
        </div>
      </div>

      {readingLow && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">
              Leitura menor que a anterior
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Você informou {form.reading} {isHours ? "h" : "km"}, mas a última
              leitura era {formatNumber(previousReading)}{" "}
              {isHours ? "h" : "km"}. Confirme se está correto.
            </p>
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.confirmedLowReading}
                onChange={(e) =>
                  setForm((f: any) => ({
                    ...f,
                    confirmedLowReading: e.target.checked,
                  }))
                }
                className="h-4 w-4 accent-amber-600"
              />
              <span className="text-sm font-medium">
                Sim, confirmo a leitura
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Preview consumo */}
      {consumption != null && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-emerald-800">
                Consumo calculado
              </p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Diferença:{" "}
                {formatNumber(Number(form.reading) - previousReading)}{" "}
                {isHours ? "h" : "km"}
                {" · "}
                {formatNumber(liters)} L
              </p>
            </div>
            <p className="text-2xl font-bold text-emerald-700">
              {consumption.toFixed(2)}{" "}
              <span className="text-sm">{consumptionLabel}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Step 4 ---------------- */
function Step4Service({ form, setForm }: any) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-bold text-lg mb-1">Serviço e observações</h2>
        <p className="text-sm text-muted-foreground">
          Informe o serviço realizado e observações (opcional).
        </p>
      </div>

      <div>
        <Label>Serviço realizado</Label>
        <Input
          value={form.service}
          onChange={(e) =>
            setForm((f: any) => ({ ...f, service: e.target.value }))
          }
          placeholder="Ex: Roçada talhão 3"
        />
      </div>
      <div>
        <Label>Observações</Label>
        <Textarea
          rows={3}
          value={form.notes}
          onChange={(e) =>
            setForm((f: any) => ({ ...f, notes: e.target.value }))
          }
          placeholder="Anote detalhes do abastecimento..."
        />
      </div>
      <ImageUpload
        label="Foto do abastecimento (opcional)"
        subdir="refuelings"
        value={form.photo}
        onChange={(url) => setForm((f: any) => ({ ...f, photo: url }))}
      />
    </div>
  );
}

/* ---------------- Step 5 ---------------- */
function Step5Confirm({
  form,
  setForm,
  selectedEquipment,
  selectedReservoir,
  liters,
  pricePerLiter,
  totalAmount,
  readingNum,
  previousReading,
  consumption,
  consumptionLabel,
}: any) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-bold text-lg mb-1">Confirmação</h2>
        <p className="text-sm text-muted-foreground">
          Confira os dados e finalize o registro.
        </p>
      </div>

      <div className="space-y-3">
        <SummaryRow
          label="Origem"
          value={
            form.source === "reservoir"
              ? `Reservatório · ${selectedReservoir?.name || ""}`
              : `Posto externo · ${form.externalStation || ""}`
          }
        />
        <SummaryRow
          label="Equipamento"
          value={
            selectedEquipment
              ? `${selectedEquipment.name}${
                  selectedEquipment.plate ? ` (${selectedEquipment.plate})` : ""
                }`
              : "—"
          }
        />
        <SummaryRow label="Litros" value={`${formatNumber(liters)} L`} />
        <SummaryRow
          label="Combustível"
          value={form.fuelType}
        />
        <SummaryRow
          label="Preço/L"
          value={formatBRL(pricePerLiter)}
        />
        <SummaryRow
          label="Valor total"
          value={formatBRL(totalAmount)}
          highlight
        />
        <SummaryRow
          label="Leitura"
          value={`${formatNumber(readingNum)} ${
            selectedEquipment?.controlType === "hours" ? "h" : "km"
          }`}
        />
        {consumption != null && (
          <SummaryRow
            label="Consumo"
            value={`${consumption.toFixed(2)} ${consumptionLabel}`}
          />
        )}
        <SummaryRow
          label="Data e hora"
          value={new Date(form.refuelDate).toLocaleString("pt-BR")}
        />
        {form.service && (
          <SummaryRow label="Serviço" value={form.service} />
        )}
        {form.notes && (
          <SummaryRow label="Observações" value={form.notes} />
        )}
      </div>

      <div>
        <Label>Operador</Label>
        <Input
          value={form.operatorName}
          onChange={(e) =>
            setForm((f: any) => ({ ...f, operatorName: e.target.value }))
          }
          placeholder="Nome do operador"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Preenchido automaticamente com o usuário logado. Edite se outro
          operador fez o abastecimento.
        </p>
      </div>

      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
        <p className="text-sm text-emerald-800">
          Tudo pronto! Toque em <strong>Salvar</strong> para registrar.
        </p>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between items-center py-2 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-sm font-medium text-right",
          highlight && "font-bold text-emerald-700"
        )}
      >
        {value}
      </span>
    </div>
  );
}
