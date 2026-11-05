"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useApi } from "@/hooks/use-session";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Building2,
  Pencil,
  UserCog,
  Ban,
  CheckCircle2,
  CalendarPlus,
  Trash2,
  Eye,
  ExternalLink,
} from "lucide-react";
import { AdminDataTable, type Column } from "@/components/admin/data-table";
import {
  COMPANY_STATUS,
  formatDate,
  formatDateTime,
} from "@/lib/constants";

type Company = {
  id: string;
  name: string;
  responsibleName: string;
  email: string;
  whatsapp?: string;
  phone?: string;
  document?: string;
  status: string;
  trialEndsAt?: string | null;
  planId?: string | null;
  plan?: { id: string; name: string } | null;
  createdAt: string;
  _count?: {
    users: number;
    equipments: number;
    reservoirs: number;
  };
};

const STATUS_BADGE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  trial: "secondary",
  overdue: "destructive",
  blocked: "destructive",
};

const STATUS_DOT: Record<string, string> = {
  active: "bg-emerald-500",
  trial: "bg-amber-500",
  overdue: "bg-red-500",
  blocked: "bg-slate-500",
};

export default function AdminCompaniesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchFromUrl, setSearchFromUrl] = useState(
    searchParams.get("search") || ""
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Company | null>(null);
  const [extendTrialTarget, setExtendTrialTarget] = useState<Company | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);
  const [impersonating, setImpersonating] = useState<string | null>(null);

  // Atualiza query quando filtros mudam
  const queryString = new URLSearchParams({
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(searchFromUrl && { search: searchFromUrl }),
  }).toString();

  const { data, loading, error, refetch } = useApi<{ companies: Company[] }>(
    `/api/admin/companies${queryString ? `?${queryString}` : ""}`
  );

  // Carrega planos p/ selects
  const { data: plansData } = useApi<{ plans: any[] }>("/api/plans");
  const plans = plansData?.plans || [];

  useEffect(() => {
    const q = searchParams.get("search") || "";
    if (q !== searchFromUrl) setSearchFromUrl(q);
  }, [searchParams]);

  const companies = data?.companies || [];

  async function impersonate(c: Company) {
    if (!confirm(`Entrar como gestor da empresa "${c.name}"?`)) return;
    setImpersonating(c.id);
    try {
      await apiFetch(`/api/admin/companies/${c.id}/impersonate`, {
        method: "POST",
      });
      toast.success(`Você está agora como: ${c.name}`);
      router.push("/app/inicio");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Erro ao impersonar");
    } finally {
      setImpersonating(null);
    }
  }

  async function setStatus(c: Company, status: string) {
    try {
      await apiFetch(`/api/admin/companies/${c.id}`, {
        method: "PATCH",
        json: { status },
      });
      toast.success(`Status atualizado para: ${COMPANY_STATUS[status] || status}`);
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Erro ao atualizar status");
    }
  }

  async function setPlan(c: Company, planId: string) {
    try {
      await apiFetch(`/api/admin/companies/${c.id}`, {
        method: "PATCH",
        json: { planId },
      });
      toast.success("Plano atualizado.");
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Erro ao atualizar plano");
    }
  }

  async function deleteCompany(c: Company) {
    try {
      await apiFetch(`/api/admin/companies/${c.id}`, { method: "DELETE" });
      toast.success("Empresa removida.");
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Erro ao remover empresa");
    }
  }

  const columns: Column<Company>[] = [
    {
      key: "name",
      header: "Empresa",
      sortable: true,
      sortValue: (c) => c.name,
      cell: (c) => (
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${STATUS_DOT[c.status] || "bg-slate-400"}`} />
            <Link
              href={`/admin/empresas/${c.id}`}
              className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline truncate"
            >
              {c.name}
            </Link>
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {c.responsibleName}
          </p>
        </div>
      ),
    },
    {
      key: "email",
      header: "Contato",
      cell: (c) => (
        <div className="min-w-0">
          <p className="truncate text-sm">{c.email}</p>
          {c.whatsapp && (
            <p className="text-xs text-muted-foreground">{c.whatsapp}</p>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      sortValue: (c) => c.status,
      cell: (c) => (
        <Badge variant={STATUS_BADGE[c.status] || "outline"}>
          {COMPANY_STATUS[c.status] || c.status}
        </Badge>
      ),
    },
    {
      key: "plan",
      header: "Plano",
      cell: (c) => (
        <Select
          value={c.planId || "none"}
          onValueChange={(v) => setPlan(c, v === "none" ? "" : v)}
        >
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue placeholder="—" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sem plano</SelectItem>
            {plans.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      key: "trialEndsAt",
      header: "Vencimento",
      sortable: true,
      sortValue: (c) => (c.trialEndsAt ? new Date(c.trialEndsAt).getTime() : 0),
      cell: (c) =>
        c.trialEndsAt ? (
          <span className="text-sm">
            {formatDate(c.trialEndsAt)}
            {new Date(c.trialEndsAt) < new Date() && (
              <Badge variant="destructive" className="ml-1 text-[10px]">
                vencido
              </Badge>
            )}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      key: "users",
      header: "Users",
      cell: (c) => (
        <span className="text-sm">{c._count?.users ?? 0}</span>
      ),
    },
    {
      key: "equipments",
      header: "Equip.",
      cell: (c) => (
        <span className="text-sm">{c._count?.equipments ?? 0}</span>
      ),
    },
    {
      key: "createdAt",
      header: "Criada em",
      sortable: true,
      sortValue: (c) => new Date(c.createdAt).getTime(),
      cell: (c) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(c.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Ações",
      width: "1%",
      cell: (c) => (
        <div className="flex items-center gap-1">
          <Button
            asChild
            variant="ghost"
            size="icon"
            title="Ver detalhes"
          >
            <Link href={`/admin/empresas/${c.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Entrar como"
            onClick={() => impersonate(c)}
            disabled={impersonating === c.id}
          >
            <UserCog className="h-4 w-4 text-emerald-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Editar"
            onClick={() => setEditTarget(c)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Estender teste"
            onClick={() => setExtendTrialTarget(c)}
          >
            <CalendarPlus className="h-4 w-4 text-amber-600" />
          </Button>
          {c.status === "blocked" ? (
            <Button
              variant="ghost"
              size="icon"
              title="Ativar"
              onClick={() => setStatus(c, "active")}
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              title="Bloquear"
              onClick={() => setStatus(c, "blocked")}
            >
              <Ban className="h-4 w-4 text-red-600" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            title="Excluir"
            onClick={() => setDeleteTarget(c)}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Empresas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie empresas, planos, status e impersonação para suporte.
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 gap-2 h-10"
        >
          <Plus className="h-4 w-4" /> Nova empresa
        </Button>
      </div>

      <Card className="p-4">
        <AdminDataTable
          columns={columns}
          rows={companies}
          loading={loading}
          error={error}
          searchFields={(c) =>
            `${c.name} ${c.responsibleName} ${c.email} ${c.document || ""}`
          }
          searchPlaceholder="Buscar por nome, responsável, e-mail..."
          filters={[
            {
              label: "Status",
              value: statusFilter,
              onChange: setStatusFilter,
              options: Object.entries(COMPANY_STATUS).map(([value, label]) => ({
                value,
                label,
              })),
            },
          ]}
          emptyMessage="Nenhuma empresa cadastrada."
          emptyDescription="Crie uma nova empresa para começar."
          onRowClick={(c) => router.push(`/admin/empresas/${c.id}`)}
        />
      </Card>

      {/* Diálogo Criar */}
      {createOpen && (
        <CompanyFormDialog
          plans={plans}
          onClose={() => setCreateOpen(false)}
          onSaved={() => {
            setCreateOpen(false);
            refetch();
          }}
        />
      )}

      {/* Diálogo Editar */}
      {editTarget && (
        <CompanyFormDialog
          plans={plans}
          company={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => {
            setEditTarget(null);
            refetch();
          }}
        />
      )}

      {/* Estender teste */}
      {extendTrialTarget && (
        <ExtendTrialDialog
          company={extendTrialTarget}
          onClose={() => setExtendTrialTarget(null)}
          onSaved={() => {
            setExtendTrialTarget(null);
            refetch();
          }}
        />
      )}

      {/* Confirmar exclusão */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir empresa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é irreversível. Todos os dados (usuários, equipamentos,
              abastecimentos, manutenções) da empresa{" "}
              <strong>{deleteTarget?.name}</strong> serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteTarget && deleteCompany(deleteTarget)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CompanyFormDialog({
  company,
  plans,
  onClose,
  onSaved,
}: {
  company?: Company;
  plans: any[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: company?.name || "",
    responsibleName: company?.responsibleName || "",
    email: company?.email || "",
    whatsapp: company?.whatsapp || "",
    phone: company?.phone || "",
    document: company?.document || "",
    status: company?.status || "active",
    planId: company?.planId || "",
    managerPassword: "",
  });

  async function save() {
    if (!form.name || !form.responsibleName || !form.email) {
      toast.error("Preencha nome, responsável e e-mail.");
      return;
    }
    setLoading(true);
    try {
      const payload: any = { ...form };
      if (company) {
        // Edit
        delete payload.managerPassword;
        if (!payload.planId) payload.planId = null;
        await apiFetch(`/api/admin/companies/${company.id}`, {
          method: "PATCH",
          json: payload,
        });
        toast.success("Empresa atualizada!");
      } else {
        // Create
        await apiFetch(`/api/admin/companies`, {
          method: "POST",
          json: payload,
        });
        toast.success("Empresa criada!");
      }
      onSaved();
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{company ? "Editar empresa" : "Nova empresa"}</DialogTitle>
          <DialogDescription>
            {company
              ? "Atualize os dados da empresa."
              : "Crie uma nova empresa e gere o gestor inicial."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <Label>Nome da empresa *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex.: Fazenda São João"
            />
          </div>
          <div>
            <Label>Responsável *</Label>
            <Input
              value={form.responsibleName}
              onChange={(e) =>
                setForm({ ...form, responsibleName: e.target.value })
              }
              placeholder="Nome do gestor"
            />
          </div>
          <div>
            <Label>E-mail (login) *</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="gestor@empresa.com"
            />
          </div>
          <div>
            <Label>WhatsApp</Label>
            <Input
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              placeholder="5511999999999"
            />
          </div>
          <div>
            <Label>Telefone</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="(11) 9999-9999"
            />
          </div>
          <div>
            <Label>Documento (CNPJ/CPF)</Label>
            <Input
              value={form.document}
              onChange={(e) => setForm({ ...form, document: e.target.value })}
              placeholder="00.000.000/0000-00"
            />
          </div>
          <div>
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => setForm({ ...form, status: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(COMPANY_STATUS).map(([v, l]) => (
                  <SelectItem key={v} value={v}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Plano</Label>
            <Select
              value={form.planId || "none"}
              onValueChange={(v) =>
                setForm({ ...form, planId: v === "none" ? "" : v })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sem plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem plano</SelectItem>
                {plans.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {!company && (
            <div className="sm:col-span-2">
              <Label>Senha do gestor (mín. 6 caracteres)</Label>
              <Input
                type="text"
                value={form.managerPassword}
                onChange={(e) =>
                  setForm({ ...form, managerPassword: e.target.value })
                }
                placeholder="Senha temporária do gestor"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Deixe vazio para não criar gestor agora.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={save}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ExtendTrialDialog({
  company,
  onClose,
  onSaved,
}: {
  company: Company;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(14);

  async function save() {
    setLoading(true);
    try {
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + days);
      await apiFetch(`/api/admin/companies/${company.id}`, {
        method: "PATCH",
        json: {
          trialEndsAt: newDate.toISOString(),
          status: company.status === "blocked" ? "trial" : company.status,
        },
      });
      toast.success(`Teste estendido em ${days} dias.`);
      onSaved();
    } catch (e: any) {
      toast.error(e.message || "Erro ao estender teste");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Estender teste — {company.name}</DialogTitle>
          <DialogDescription>
            {company.trialEndsAt
              ? `Vencimento atual: ${formatDate(company.trialEndsAt)}`
              : "Empresa sem data de teste definida."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Label>Dias a adicionar a partir de hoje</Label>
          <Input
            type="number"
            min={1}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">
            Novo vencimento:{" "}
            <strong>
              {formatDate(
                new Date(Date.now() + days * 24 * 60 * 60 * 1000)
              )}
            </strong>
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={save}
            disabled={loading}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            {loading ? "Estendendo..." : "Estender"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
