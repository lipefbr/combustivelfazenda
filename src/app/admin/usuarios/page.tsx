"use client";

import { useState } from "react";
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
  Pencil,
  Ban,
  CheckCircle2,
  KeyRound,
  Trash2,
  Users as UsersIcon,
} from "lucide-react";
import { AdminDataTable, type Column } from "@/components/admin/data-table";
import { formatDateTime } from "@/lib/constants";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  phone?: string | null;
  companyId?: string | null;
  company?: { id: string; name: string } | null;
  lastLoginAt?: string | null;
  createdAt: string;
};

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  manager: "Gestor",
  operator: "Operador",
};

export default function AdminUsersPage() {
  const [roleFilter, setRoleFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null);
  const [pwTarget, setPwTarget] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  const { data, loading, error, refetch } = useApi<{ users: AdminUser[] }>(
    "/api/admin/users"
  );
  const { data: companiesData } = useApi<{ companies: any[] }>(
    "/api/admin/companies"
  );

  const users = (data?.users || []).filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (statusFilter !== "all") {
      if (statusFilter === "active" && !u.active) return false;
      if (statusFilter === "blocked" && u.active) return false;
    }
    if (companyFilter !== "all") {
      if (companyFilter === "none" && u.companyId) return false;
      if (companyFilter !== "none" && u.companyId !== companyFilter) return false;
    }
    return true;
  });

  async function toggleActive(u: AdminUser) {
    try {
      await apiFetch(`/api/admin/users/${u.id}`, {
        method: "PATCH",
        json: { active: !u.active },
      });
      toast.success(u.active ? "Usuário bloqueado." : "Usuário ativado.");
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Erro");
    }
  }

  async function deleteUser(u: AdminUser) {
    try {
      await apiFetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
      toast.success("Usuário removido.");
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Erro");
    }
  }

  const columns: Column<AdminUser>[] = [
    {
      key: "name",
      header: "Nome",
      sortable: true,
      sortValue: (u) => u.name,
      cell: (u) => (
        <div className="min-w-0">
          <p className="font-medium truncate">{u.name}</p>
          <p className="text-xs text-muted-foreground truncate">{u.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      header: "Perfil",
      sortable: true,
      sortValue: (u) => u.role,
      cell: (u) => (
        <Badge
          variant={u.role === "super_admin" ? "default" : "outline"}
          className={
            u.role === "super_admin"
              ? "bg-emerald-600"
              : u.role === "manager"
                ? "bg-sky-100 text-sky-700 border-sky-200"
                : ""
          }
        >
          {ROLE_LABELS[u.role] || u.role}
        </Badge>
      ),
    },
    {
      key: "company",
      header: "Empresa",
      sortable: true,
      sortValue: (u) => u.company?.name || "",
      cell: (u) => (
        <span className="text-sm truncate">
          {u.company?.name || "—"}
        </span>
      ),
    },
    {
      key: "phone",
      header: "Telefone",
      cell: (u) => (
        <span className="text-sm text-muted-foreground">
          {u.phone || "—"}
        </span>
      ),
    },
    {
      key: "lastLoginAt",
      header: "Último acesso",
      sortable: true,
      sortValue: (u) => (u.lastLoginAt ? new Date(u.lastLoginAt).getTime() : 0),
      cell: (u) => (
        <span className="text-sm text-muted-foreground">
          {u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "Nunca"}
        </span>
      ),
    },
    {
      key: "active",
      header: "Status",
      cell: (u) => (
        <Badge variant={u.active ? "default" : "destructive"}>
          {u.active ? "Ativo" : "Bloqueado"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Ações",
      width: "1%",
      cell: (u) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            title="Editar"
            onClick={() => setEditTarget(u)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Resetar senha"
            onClick={() => setPwTarget(u)}
          >
            <KeyRound className="h-4 w-4 text-amber-600" />
          </Button>
          {u.role !== "super_admin" && (
            <>
              <Button
                variant="ghost"
                size="icon"
                title={u.active ? "Bloquear" : "Ativar"}
                onClick={() => toggleActive(u)}
              >
                {u.active ? (
                  <Ban className="h-4 w-4 text-red-600" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title="Excluir"
                onClick={() => setDeleteTarget(u)}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Usuários</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestores, operadores e super admins de todas as empresas.
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 gap-2 h-10"
        >
          <Plus className="h-4 w-4" /> Novo usuário
        </Button>
      </div>

      <Card className="p-4">
        <AdminDataTable
          columns={columns}
          rows={users}
          loading={loading}
          error={error}
          searchFields={(u) =>
            `${u.name} ${u.email} ${u.company?.name || ""} ${u.phone || ""}`
          }
          searchPlaceholder="Buscar por nome, e-mail, empresa..."
          filters={[
            {
              label: "Perfil",
              value: roleFilter,
              onChange: setRoleFilter,
              options: Object.entries(ROLE_LABELS).map(([value, label]) => ({
                value,
                label,
              })),
            },
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
              label: "Status",
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { value: "active", label: "Ativos" },
                { value: "blocked", label: "Bloqueados" },
              ],
            },
          ]}
          emptyMessage="Nenhum usuário."
        />
      </Card>

      {createOpen && (
        <UserFormDialog
          companies={companiesData?.companies || []}
          onClose={() => setCreateOpen(false)}
          onSaved={() => {
            setCreateOpen(false);
            refetch();
          }}
        />
      )}

      {editTarget && (
        <UserFormDialog
          user={editTarget}
          companies={companiesData?.companies || []}
          onClose={() => setEditTarget(null)}
          onSaved={() => {
            setEditTarget(null);
            refetch();
          }}
        />
      )}

      {pwTarget && (
        <ResetPasswordDialog
          user={pwTarget}
          onClose={() => setPwTarget(null)}
          onSaved={() => setPwTarget(null)}
        />
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é irreversível. O usuário{" "}
              <strong>{deleteTarget?.name}</strong> será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteTarget && deleteUser(deleteTarget)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function UserFormDialog({
  user,
  companies,
  onClose,
  onSaved,
}: {
  user?: AdminUser;
  companies: any[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    phone: user?.phone || "",
    role: user?.role || "operator",
    companyId: user?.companyId || "",
  });

  async function save() {
    if (!form.name || !form.email) {
      toast.error("Preencha nome e e-mail.");
      return;
    }
    if (!user && !form.password) {
      toast.error("Defina uma senha.");
      return;
    }
    setLoading(true);
    try {
      const payload: any = { ...form };
      if (user) {
        delete payload.password;
        if (!payload.companyId) payload.companyId = null;
        await apiFetch(`/api/admin/users/${user.id}`, {
          method: "PATCH",
          json: payload,
        });
        toast.success("Usuário atualizado!");
      } else {
        await apiFetch(`/api/admin/users`, {
          method: "POST",
          json: payload,
        });
        toast.success("Usuário criado!");
      }
      onSaved();
    } catch (e: any) {
      toast.error(e.message || "Erro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {user ? "Editar usuário" : "Novo usuário"}
          </DialogTitle>
          <DialogDescription>
            {user
              ? "Atualize os dados do usuário."
              : "Crie um novo usuário para a plataforma."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div>
            <Label>Nome *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <Label>E-mail *</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          {!user && (
            <div>
              <Label>Senha *</Label>
              <Input
                type="text"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Mín. 6 caracteres"
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Telefone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <Label>Perfil</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm({ ...form, role: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operator">Operador</SelectItem>
                  <SelectItem value="manager">Gestor</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {form.role !== "super_admin" && (
            <div>
              <Label>Empresa</Label>
              <Select
                value={form.companyId || "none"}
                onValueChange={(v) =>
                  setForm({ ...form, companyId: v === "none" ? "" : v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sem empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem empresa</SelectItem>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

function ResetPasswordDialog({
  user,
  onClose,
  onSaved,
}: {
  user: AdminUser;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");

  async function save() {
    if (password.length < 6) {
      toast.error("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }
    setLoading(true);
    try {
      await apiFetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        json: { password },
      });
      toast.success("Senha redefinida!");
      onSaved();
    } catch (e: any) {
      toast.error(e.message || "Erro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Resetar senha — {user.name}</DialogTitle>
          <DialogDescription>
            A nova senha será aplicada imediatamente.
          </DialogDescription>
        </DialogHeader>
        <div>
          <Label>Nova senha</Label>
          <Input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mín. 6 caracteres"
          />
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
            {loading ? "Salvando..." : "Redefinir senha"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
