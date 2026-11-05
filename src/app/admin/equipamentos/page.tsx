"use client";

import { useState } from "react";
import { useApi } from "@/hooks/use-session";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Truck,
  ChevronDown,
  ChevronRight,
  Fuel,
  Wrench,
} from "lucide-react";
import { AdminDataTable, type Column } from "@/components/admin/data-table";
import {
  EQUIPMENT_TYPE_LABELS,
  CONTROL_TYPE_LABELS,
  ORIGIN_LABELS,
  formatBRL,
  formatDate,
  formatNumber,
} from "@/lib/constants";

type Equipment = {
  id: string;
  name: string;
  type: string;
  plate?: string | null;
  assetNumber?: string | null;
  value?: number | null;
  origin: string;
  ownerName?: string | null;
  controlType: string;
  initialReading: number;
  currentReading: number;
  active: boolean;
  company?: { id: string; name: string } | null;
  companyId: string;
  maintenanceItems?: any[];
  createdAt: string;
};

export default function AdminEquipmentsPage() {
  const [companyFilter, setCompanyFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [originFilter, setOriginFilter] = useState("all");
  const [controlFilter, setControlFilter] = useState("all");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const { data: companiesData } = useApi<{ companies: any[] }>(
    "/api/admin/companies"
  );

  const apiPath =
    companyFilter !== "all"
      ? `/api/admin/equipments?companyId=${companyFilter}`
      : "/api/admin/equipments";

  const { data, loading, error } = useApi<{ equipments: Equipment[] }>(
    apiPath
  );

  // Filtros client-side adicionais
  const equipments = (data?.equipments || []).filter((e) => {
    if (typeFilter !== "all" && e.type !== typeFilter) return false;
    if (originFilter !== "all" && e.origin !== originFilter) return false;
    if (controlFilter !== "all" && e.controlType !== controlFilter) return false;
    return true;
  });

  function toggle(id: string) {
    setExpanded((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  const columns: Column<Equipment>[] = [
    {
      key: "expand",
      header: "",
      width: "1%",
      cell: (e) => (
        <button
          onClick={(ev) => {
            ev.stopPropagation();
            toggle(e.id);
          }}
          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {expanded.has(e.id) ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      ),
    },
    {
      key: "company",
      header: "Empresa",
      sortable: true,
      sortValue: (e) => e.company?.name || "",
      cell: (e) => (
        <span className="text-sm font-medium truncate">
          {e.company?.name || "—"}
        </span>
      ),
    },
    {
      key: "name",
      header: "Equipamento",
      sortable: true,
      sortValue: (e) => e.name,
      cell: (e) => (
        <div className="min-w-0">
          <p className="font-semibold truncate">{e.name}</p>
          {e.ownerName && (
            <p className="text-xs text-muted-foreground truncate">
              Proprietário: {e.ownerName}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "type",
      header: "Tipo",
      sortable: true,
      sortValue: (e) => e.type,
      cell: (e) => (
        <Badge variant="outline">
          {EQUIPMENT_TYPE_LABELS[e.type] || e.type}
        </Badge>
      ),
    },
    {
      key: "plate",
      header: "Placa/Patrimônio",
      cell: (e) => (
        <div className="text-sm">
          {e.plate && <p className="font-mono">{e.plate}</p>}
          {e.assetNumber && (
            <p className="text-xs text-muted-foreground">
              Patrim.: {e.assetNumber}
            </p>
          )}
          {!e.plate && !e.assetNumber && "—"}
        </div>
      ),
    },
    {
      key: "value",
      header: "Valor",
      sortable: true,
      sortValue: (e) => e.value ?? 0,
      cell: (e) => (
        <span className="text-sm">{formatBRL(e.value)}</span>
      ),
    },
    {
      key: "controlType",
      header: "Controle",
      cell: (e) => (
        <span className="text-sm">
          {CONTROL_TYPE_LABELS[e.controlType] || e.controlType}
        </span>
      ),
    },
    {
      key: "currentReading",
      header: "Leitura atual",
      sortable: true,
      sortValue: (e) => e.currentReading,
      cell: (e) => (
        <span className="text-sm font-medium">
          {formatNumber(e.currentReading, 0)}
        </span>
      ),
    },
    {
      key: "origin",
      header: "Origem",
      sortable: true,
      sortValue: (e) => e.origin,
      cell: (e) => (
        <Badge
          variant="outline"
          className={e.origin === "company" ? "" : "bg-amber-100 text-amber-700"}
        >
          {ORIGIN_LABELS[e.origin] || e.origin}
        </Badge>
      ),
    },
  ];

  // Renderização de linha expandida
  function ExpandedRow({ e }: { e: Equipment }) {
    return (
      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/40 border-t">
        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2 text-emerald-700">
              <Fuel className="h-4 w-4" />
              <h4 className="font-semibold text-sm">Itens de manutenção</h4>
            </div>
            {e.maintenanceItems && e.maintenanceItems.length > 0 ? (
              <ul className="text-sm space-y-1">
                {e.maintenanceItems.map((mi: any) => (
                  <li key={mi.id} className="flex justify-between gap-2">
                    <span className="truncate">{mi.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      int. {formatNumber(mi.interval, 0)} · últ.{" "}
                      {formatNumber(mi.lastReading, 0)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">
                Sem itens configurados.
              </p>
            )}
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2 text-amber-700">
              <Wrench className="h-4 w-4" />
              <h4 className="font-semibold text-sm">Histórico</h4>
            </div>
            <div className="text-sm space-y-1">
              <p>
                Leitura inicial:{" "}
                <strong>{formatNumber(e.initialReading, 0)}</strong>
              </p>
              <p>
                Leitura atual:{" "}
                <strong>{formatNumber(e.currentReading, 0)}</strong>
              </p>
              <p>
                Status:{" "}
                <Badge variant={e.active ? "default" : "destructive"}>
                  {e.active ? "Ativo" : "Inativo"}
                </Badge>
              </p>
              <p className="text-xs text-muted-foreground">
                Criado em {formatDate(e.createdAt)}
              </p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2 text-sky-700">
              <Truck className="h-4 w-4" />
              <h4 className="font-semibold text-sm">Detalhes</h4>
            </div>
            <div className="text-sm space-y-1">
              <p>
                Patrimônio:{" "}
                <strong>{e.assetNumber || "—"}</strong>
              </p>
              <p>
                Proprietário: <strong>{e.ownerName || "—"}</strong>
              </p>
              <p>
                Valor: <strong>{formatBRL(e.value)}</strong>
              </p>
              <p className="text-xs text-muted-foreground truncate">
                ID: {e.id}
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Equipamentos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Todos os equipamentos de todas as empresas.
        </p>
      </div>

      <Card className="p-4">
        <AdminDataTable
          columns={columns}
          rows={equipments}
          loading={loading}
          error={error}
          searchFields={(e) =>
            `${e.name} ${e.plate || ""} ${e.assetNumber || ""} ${e.ownerName || ""} ${e.company?.name || ""}`
          }
          searchPlaceholder="Buscar por nome, placa, patrimônio..."
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
              label: "Tipo",
              value: typeFilter,
              onChange: setTypeFilter,
              options: Object.entries(EQUIPMENT_TYPE_LABELS).map(
                ([value, label]) => ({ value, label })
              ),
            },
            {
              label: "Origem",
              value: originFilter,
              onChange: setOriginFilter,
              options: Object.entries(ORIGIN_LABELS).map(([value, label]) => ({
                value,
                label,
              })),
            },
            {
              label: "Controle",
              value: controlFilter,
              onChange: setControlFilter,
              options: Object.entries(CONTROL_TYPE_LABELS).map(
                ([value, label]) => ({ value, label })
              ),
            },
          ]}
          emptyMessage="Nenhum equipamento cadastrado."
        />

        {/* Linhas expandidas */}
        <div className="mt-3 space-y-2">
          {equipments
            .filter((e) => expanded.has(e.id))
            .map((e) => (
              <ExpandedRow key={e.id} e={e} />
            ))}
        </div>
      </Card>
    </div>
  );
}
