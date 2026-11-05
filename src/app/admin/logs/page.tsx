"use client";

import { useState } from "react";
import { useApi } from "@/hooks/use-session";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollText, LogIn, LogOut, Pencil, Trash2, UserCog, KeyRound, FilePlus } from "lucide-react";
import { AdminDataTable, type Column } from "@/components/admin/data-table";
import { formatDateTime } from "@/lib/constants";

type Log = {
  id: string;
  action: string;
  entity?: string | null;
  entityId?: string | null;
  details?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  createdAt: string;
  user?: { id: string; name: string; email: string } | null;
  company?: { id: string; name: string } | null;
  impersonatedBy?: { id: string; name: string } | null;
};

const ACTION_ICONS: Record<string, any> = {
  login: LogIn,
  logout: LogOut,
  create: FilePlus,
  update: Pencil,
  delete: Trash2,
  impersonate: UserCog,
  "change-password": KeyRound,
};

const ACTION_LABELS: Record<string, string> = {
  login: "Login",
  logout: "Logout",
  create: "Criação",
  update: "Atualização",
  delete: "Exclusão",
  impersonate: "Impersonação",
  "change-password": "Troca de senha",
};

export default function AdminLogsPage() {
  const [actionFilter, setActionFilter] = useState("all");
  const [limit, setLimit] = useState("200");

  const apiPath = `/api/admin/logs?limit=${limit}${actionFilter !== "all" ? `&action=${actionFilter}` : ""}`;
  const { data, loading, error } = useApi<{ logs: Log[] }>(apiPath);

  const logs = data?.logs || [];

  const columns: Column<Log>[] = [
    {
      key: "createdAt",
      header: "Data",
      sortable: true,
      sortValue: (l) => new Date(l.createdAt).getTime(),
      cell: (l) => (
        <span className="text-sm">{formatDateTime(l.createdAt)}</span>
      ),
    },
    {
      key: "user",
      header: "Usuário",
      cell: (l) => (
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">
            {l.user?.name || "—"}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {l.user?.email}
          </p>
        </div>
      ),
    },
    {
      key: "company",
      header: "Empresa",
      cell: (l) => (
        <span className="text-sm truncate">
          {l.company?.name || "—"}
        </span>
      ),
    },
    {
      key: "action",
      header: "Ação",
      sortable: true,
      sortValue: (l) => l.action,
      cell: (l) => {
        const Icon = ACTION_ICONS[l.action] || ScrollText;
        return (
          <Badge variant="outline" className="gap-1">
            <Icon className="h-3 w-3" />
            {ACTION_LABELS[l.action] || l.action}
          </Badge>
        );
      },
    },
    {
      key: "entity",
      header: "Entidade",
      cell: (l) => (
        <div className="text-xs text-muted-foreground">
          {l.entity && <p>{l.entity}</p>}
          {l.impersonatedBy && (
            <p className="text-amber-600 font-medium">
              via {l.impersonatedBy.name}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "ip",
      header: "IP",
      cell: (l) => (
        <span className="text-xs text-muted-foreground font-mono">
          {l.ip || "—"}
        </span>
      ),
    },
    {
      key: "details",
      header: "Detalhes",
      cell: (l) => (
        <span className="text-xs text-muted-foreground line-clamp-2 max-w-md">
          {l.details || "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Logs & Auditoria</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Histórico de ações e eventos da plataforma.
        </p>
      </div>

      <Card className="p-4">
        <AdminDataTable
          columns={columns}
          rows={logs}
          loading={loading}
          error={error}
          searchFields={(l) =>
            `${l.user?.name || ""} ${l.user?.email || ""} ${l.company?.name || ""} ${l.action} ${l.details || ""} ${l.ip || ""}`
          }
          searchPlaceholder="Buscar por usuário, empresa, ação..."
          filters={[
            {
              label: "Ação",
              value: actionFilter,
              onChange: setActionFilter,
              options: Object.entries(ACTION_LABELS).map(([value, label]) => ({
                value,
                label,
              })),
            },
            {
              label: "Limite",
              value: limit,
              onChange: setLimit,
              options: [
                { value: "50", label: "50" },
                { value: "100", label: "100" },
                { value: "200", label: "200" },
                { value: "500", label: "500" },
              ],
            },
          ]}
          emptyMessage="Nenhum log registrado."
          pageSize={25}
        />
      </Card>
    </div>
  );
}
