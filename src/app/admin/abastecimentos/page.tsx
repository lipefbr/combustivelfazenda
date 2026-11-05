"use client";

import { useState } from "react";
import { useApi } from "@/hooks/use-session";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { Fuel, ExternalLink, Eye } from "lucide-react";
import { AdminDataTable, type Column } from "@/components/admin/data-table";
import {
  REFUEL_SOURCE_LABELS,
  formatBRL,
  formatDateTime,
  formatNumber,
} from "@/lib/constants";

type Refueling = {
  id: string;
  companyId: string;
  equipmentId: string;
  equipment?: { id: string; name: string; type: string } | null;
  company?: { id: string; name: string } | null;
  reservoir?: { id: string; name: string } | null;
  operatorName: string;
  source: string;
  externalStation?: string | null;
  externalInvoicePhoto?: string | null;
  liters: number;
  fuelType: string;
  pricePerLiter: number;
  totalAmount: number;
  reading: number;
  refuelDate: string;
};

export default function AdminRefuelingsPage() {
  const [companyFilter, setCompanyFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [invoicePhoto, setInvoicePhoto] = useState<string | null>(null);

  const { data: companiesData } = useApi<{ companies: any[] }>(
    "/api/admin/companies"
  );

  const apiPath =
    companyFilter !== "all"
      ? `/api/admin/refuelings?companyId=${companyFilter}`
      : "/api/admin/refuelings";

  const { data, loading, error } = useApi<{ refuelings: Refueling[] }>(
    apiPath
  );

  function inPeriod(date: Date): boolean {
    if (periodFilter === "all") return true;
    const now = new Date();
    const d = new Date(date);
    if (periodFilter === "today") {
      return d.toDateString() === now.toDateString();
    }
    if (periodFilter === "7d") {
      return d >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    if (periodFilter === "30d") {
      return d >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    return true;
  }

  const refuelings = (data?.refuelings || []).filter((r) => {
    if (sourceFilter !== "all" && r.source !== sourceFilter) return false;
    if (!inPeriod(new Date(r.refuelDate))) return false;
    if (search) {
      const q = search.toLowerCase();
      const txt = `${r.equipment?.name || ""} ${r.company?.name || ""} ${r.operatorName} ${r.fuelType}`.toLowerCase();
      if (!txt.includes(q)) return false;
    }
    return true;
  });

  const columns: Column<Refueling>[] = [
    {
      key: "company",
      header: "Empresa",
      sortable: true,
      sortValue: (r) => r.company?.name || "",
      cell: (r) => (
        <span className="text-sm font-medium truncate">
          {r.company?.name || "—"}
        </span>
      ),
    },
    {
      key: "refuelDate",
      header: "Data",
      sortable: true,
      sortValue: (r) => new Date(r.refuelDate).getTime(),
      cell: (r) => (
        <span className="text-sm">{formatDateTime(r.refuelDate)}</span>
      ),
    },
    {
      key: "equipment",
      header: "Equipamento",
      sortable: true,
      sortValue: (r) => r.equipment?.name || "",
      cell: (r) => (
        <span className="text-sm font-medium truncate">
          {r.equipment?.name || "—"}
        </span>
      ),
    },
    {
      key: "fuelType",
      header: "Combust.",
      cell: (r) => (
        <Badge variant="outline" className="text-xs">
          {r.fuelType}
        </Badge>
      ),
    },
    {
      key: "liters",
      header: "Litros",
      sortable: true,
      sortValue: (r) => r.liters,
      cell: (r) => (
        <span className="text-sm font-medium">
          {formatNumber(r.liters, 1)} L
        </span>
      ),
    },
    {
      key: "pricePerLiter",
      header: "Preço/L",
      cell: (r) => (
        <span className="text-sm">{formatBRL(r.pricePerLiter)}</span>
      ),
    },
    {
      key: "totalAmount",
      header: "Valor",
      sortable: true,
      sortValue: (r) => r.totalAmount,
      cell: (r) => (
        <span className="text-sm font-semibold">{formatBRL(r.totalAmount)}</span>
      ),
    },
    {
      key: "reading",
      header: "Leitura",
      cell: (r) => (
        <span className="text-sm">{formatNumber(r.reading, 0)}</span>
      ),
    },
    {
      key: "source",
      header: "Origem",
      sortable: true,
      sortValue: (r) => r.source,
      cell: (r) => (
        <div className="min-w-0">
          <Badge
            variant={r.source === "reservoir" ? "default" : "secondary"}
            className="text-xs"
          >
            {REFUEL_SOURCE_LABELS[r.source] || r.source}
          </Badge>
          {r.source === "external" && r.externalStation && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {r.externalStation}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "operatorName",
      header: "Operador",
      cell: (r) => (
        <span className="text-sm text-muted-foreground truncate">
          {r.operatorName}
        </span>
      ),
    },
    {
      key: "invoice",
      header: "Nota",
      width: "1%",
      cell: (r) =>
        r.externalInvoicePhoto ? (
          <Button
            variant="ghost"
            size="icon"
            title="Ver nota"
            onClick={(e) => {
              e.stopPropagation();
              setInvoicePhoto(r.externalInvoicePhoto!);
            }}
          >
            <Eye className="h-4 w-4 text-emerald-600" />
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Abastecimentos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Histórico global de abastecimentos de todas as empresas.
        </p>
      </div>

      <Card className="p-4">
        <AdminDataTable
          columns={columns}
          rows={refuelings}
          loading={loading}
          error={error}
          searchFields={(r) =>
            `${r.equipment?.name || ""} ${r.company?.name || ""} ${r.operatorName} ${r.fuelType} ${r.externalStation || ""}`
          }
          searchPlaceholder="Buscar por equipamento, operador, empresa..."
          filters={[
            {
              label: "Empresa",
              value: companyFilter,
              onChange: setCompanyFilter,
              options: (companiesData?.companies || []).map((c) => ({
                value: c.id,
                label: c.name,
              })),
            },
            {
              label: "Origem",
              value: sourceFilter,
              onChange: setSourceFilter,
              options: Object.entries(REFUEL_SOURCE_LABELS).map(
                ([value, label]) => ({ value, label })
              ),
            },
            {
              label: "Período",
              value: periodFilter,
              onChange: setPeriodFilter,
              options: [
                { value: "today", label: "Hoje" },
                { value: "7d", label: "Últimos 7 dias" },
                { value: "30d", label: "Últimos 30 dias" },
              ],
            },
          ]}
          emptyMessage="Nenhum abastecimento."
          pageSize={25}
        />
      </Card>

      {/* Modal de nota */}
      <Dialog
        open={!!invoicePhoto}
        onOpenChange={(o) => !o && setInvoicePhoto(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nota fiscal do abastecimento</DialogTitle>
          </DialogHeader>
          {invoicePhoto && (
            <div className="rounded-lg overflow-hidden border bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={invoicePhoto}
                alt="Nota"
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
          )}
          {invoicePhoto && (
            <Button asChild variant="outline" className="w-full">
              <a href={invoicePhoto} target="_blank" rel="noreferrer">
                Abrir em nova aba <ExternalLink className="h-4 w-4 ml-1" />
              </a>
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
