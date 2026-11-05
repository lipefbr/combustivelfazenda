"use client";

import { useState } from "react";
import { useApi } from "@/hooks/use-session";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  Pencil,
  MessageCircle,
  Download,
  Star,
  Phone,
} from "lucide-react";
import { AdminDataTable, type Column } from "@/components/admin/data-table";
import {
  LEAD_STATUS,
  formatDateTime,
} from "@/lib/constants";

type Lead = {
  id: string;
  name: string;
  company?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  equipmentCount?: number | null;
  message?: string | null;
  status: string;
  source?: string | null;
  notes?: string | null;
  createdAt: string;
};

export default function AdminLeadsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [notesTarget, setNotesTarget] = useState<Lead | null>(null);

  const apiPath =
    statusFilter !== "all"
      ? `/api/admin/leads?status=${statusFilter}`
      : "/api/admin/leads";

  const { data, loading, error, refetch } = useApi<{ leads: Lead[] }>(
    apiPath
  );

  const leads = data?.leads || [];

  async function changeStatus(lead: Lead, status: string) {
    try {
      await apiFetch(`/api/admin/leads/${lead.id}`, {
        method: "PATCH",
        json: { status },
      });
      toast.success(`Status: ${LEAD_STATUS[status] || status}`);
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Erro");
    }
  }

  const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    new: "default",
    contacted: "secondary",
    negotiating: "outline",
    won: "default",
    lost: "destructive",
  };

  function exportCsv() {
    const headers = [
      "Nome",
      "Empresa",
      "WhatsApp",
      "E-mail",
      "Equipamentos",
      "Status",
      "Mensagem",
      "Notas",
      "Data",
    ];
    const rows = leads.map((l) => [
      l.name,
      l.company || "",
      l.whatsapp || "",
      l.email || "",
      l.equipmentCount || 0,
      LEAD_STATUS[l.status] || l.status,
      (l.message || "").replace(/\n/g, " "),
      (l.notes || "").replace(/\n/g, " "),
      formatDateTime(l.createdAt),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success("CSV exportado.");
  }

  const columns: Column<Lead>[] = [
    {
      key: "name",
      header: "Nome",
      sortable: true,
      sortValue: (l) => l.name,
      cell: (l) => (
        <div className="min-w-0">
          <p className="font-medium truncate">{l.name}</p>
          {l.company && (
            <p className="text-xs text-muted-foreground truncate">
              {l.company}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contato",
      cell: (l) => (
        <div className="min-w-0 text-sm">
          {l.email && <p className="truncate">{l.email}</p>}
          {l.whatsapp && (
            <p className="text-xs text-muted-foreground">{l.whatsapp}</p>
          )}
          {!l.email && !l.whatsapp && "—"}
        </div>
      ),
    },
    {
      key: "equipmentCount",
      header: "Equip.",
      sortable: true,
      sortValue: (l) => l.equipmentCount ?? 0,
      cell: (l) => (
        <span className="text-sm font-medium">
          {l.equipmentCount ?? "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      sortValue: (l) => l.status,
      cell: (l) => (
        <Select
          value={l.status}
          onValueChange={(v) => changeStatus(l, v)}
        >
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(LEAD_STATUS).map(([v, label]) => (
              <SelectItem key={v} value={v}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      key: "notes",
      header: "Notas",
      cell: (l) =>
        l.notes ? (
          <Button
            variant="ghost"
            size="icon"
            title="Ver/editar notas"
            onClick={(e) => {
              e.stopPropagation();
              setNotesTarget(l);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            title="Adicionar notas"
            onClick={(e) => {
              e.stopPropagation();
              setNotesTarget(l);
            }}
          >
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </Button>
        ),
    },
    {
      key: "createdAt",
      header: "Recebido em",
      sortable: true,
      sortValue: (l) => new Date(l.createdAt).getTime(),
      cell: (l) => (
        <span className="text-xs text-muted-foreground">
          {formatDateTime(l.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Ações",
      width: "1%",
      cell: (l) => (
        <div className="flex items-center gap-1">
          {l.whatsapp && (
            <Button asChild variant="ghost" size="icon" title="WhatsApp">
              <a
                href={`https://wa.me/${l.whatsapp}`}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="h-4 w-4 text-emerald-600" />
              </a>
            </Button>
          )}
          {l.email && (
            <Button asChild variant="ghost" size="icon" title="E-mail">
              <a href={`mailto:${l.email}`}>
                <Phone className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      ),
    },
  ];

  // Estatísticas por status
  const stats = Object.keys(LEAD_STATUS).map((k) => ({
    key: k,
    label: LEAD_STATUS[k],
    count: leads.filter((l) => l.status === k).length,
  }));

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Leads</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Contatos recebidos pelo formulário da landing.
          </p>
        </div>
        <Button
          onClick={exportCsv}
          variant="outline"
          className="gap-2"
        >
          <Download className="h-4 w-4" /> Exportar CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((s) => (
          <Card key={s.key} className="p-3">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-xl font-bold">{s.count}</p>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <AdminDataTable
          columns={columns}
          rows={leads}
          loading={loading}
          error={error}
          searchFields={(l) =>
            `${l.name} ${l.company || ""} ${l.email || ""} ${l.whatsapp || ""} ${l.message || ""}`
          }
          searchPlaceholder="Buscar por nome, empresa, contato..."
          filters={[
            {
              label: "Status",
              value: statusFilter,
              onChange: setStatusFilter,
              options: Object.entries(LEAD_STATUS).map(([value, label]) => ({
                value,
                label,
              })),
            },
          ]}
          emptyMessage="Nenhum lead recebido."
        />
      </Card>

      {notesTarget && (
        <NotesDialog
          lead={notesTarget}
          onClose={() => setNotesTarget(null)}
          onSaved={() => {
            setNotesTarget(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}

function NotesDialog({
  lead,
  onClose,
  onSaved,
}: {
  lead: Lead;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState(lead.notes || "");

  async function save() {
    setLoading(true);
    try {
      await apiFetch(`/api/admin/leads/${lead.id}`, {
        method: "PATCH",
        json: { notes },
      });
      toast.success("Notas salvas.");
      onSaved();
    } catch (e: any) {
      toast.error(e.message || "Erro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Notas — {lead.name}</DialogTitle>
          <DialogDescription>
            Anotações internas sobre este lead (não visíveis para o cliente).
          </DialogDescription>
        </DialogHeader>
        <div>
          <Label>Notas</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={6}
            placeholder="Histórico de contato, expectativa, valor previsto..."
          />
        </div>
        {lead.message && (
          <div className="rounded-lg bg-slate-50 dark:bg-slate-900/40 p-3 text-sm">
            <p className="font-semibold mb-1 flex items-center gap-1">
              <Star className="h-3 w-3 text-amber-500" />
              Mensagem do cliente:
            </p>
            <p className="text-muted-foreground">{lead.message}</p>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={save}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? "Salvando..." : "Salvar notas"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
