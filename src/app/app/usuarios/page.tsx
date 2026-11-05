"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/hooks/use-session";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Key,
  ShieldCheck,
  ShieldOff,
  Mail,
  Phone,
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

import { formatDate, formatDateTime } from "@/lib/constants";

type User = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: "manager" | "operator";
  active: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
};

export default function UsuariosPage() {
  const { data, error, loading, refetch } = useApi<{ users: User[] }>(
    "/api/users"
  );
  const { data: session } = useApi<{ user: any }>("/api/auth/me");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [toDelete, setToDelete] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const users = data?.users || [];
  const currentUserId = session?.user?.id;

  function openNew() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(u: User) {
    setEditing(u);
    setDialogOpen(true);
  }

  async function toggleActive(u: User) {
    try {
      await apiFetch(`/api/users/${u.id}`, {
        method: "PATCH",
        json: { active: !u.active },
      });
      toast.success(u.active ? "Usuário bloqueado" : "Usuário ativado");
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Erro");
    }
  }

  async function handleDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/users/${toDelete.id}`, { method: "DELETE" });
      toast.success("Usuário removido");
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
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Usuários</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gestão de gestores e operadores da empresa.
          </p>
        </div>
        <Button
          onClick={openNew}
          className="bg-emerald-600 hover:bg-emerald-700 gap-2"
        >
          <Plus className="h-4 w-4" /> Novo Usuário
        </Button>
      </div>

      {loading ? (
        <LoadingState label="Carregando usuários..." />
      ) : error ? (
        <ErrorState message={error} />
      ) : users.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon={Users}
            title="Nenhum usuário"
            description="Cadastre gestores e operadores para a sua empresa."
          />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {users.map((u) => (
            <Card key={u.id} className="p-4 gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold flex-shrink-0">
                  {u.name?.charAt(0) || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">
                    {u.name}
                    {u.id === currentUserId && (
                      <span className="text-xs text-emerald-600 ml-1">
                        (você)
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <Badge
                      className={
                        u.role === "manager"
                          ? "bg-emerald-100 text-emerald-700 text-xs"
                          : "bg-amber-100 text-amber-700 text-xs"
                      }
                    >
                      {u.role === "manager" ? "Gestor" : "Operador"}
                    </Badge>
                    {u.active ? (
                      <Badge className="bg-emerald-600 text-xs">Ativo</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Bloqueado
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{u.email}</span>
                </div>
                {u.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3 w-3" />
                    <span>{u.phone}</span>
                  </div>
                )}
                {u.lastLoginAt && (
                  <p>Último acesso: {formatDateTime(u.lastLoginAt)}</p>
                )}
              </div>

              <div className="flex gap-1.5 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEdit(u)}
                  className="gap-1 h-8"
                >
                  <Pencil className="h-3.5 w-3.5" /> Editar
                </Button>
                {u.id !== currentUserId && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleActive(u)}
                      className="gap-1 h-8"
                    >
                      {u.active ? (
                        <>
                          <ShieldOff className="h-3.5 w-3.5" /> Bloquear
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-3.5 w-3.5" /> Ativar
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setToDelete(u)}
                      className="text-red-600 hover:bg-red-50 gap-1 h-8"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog Novo/Editar */}
      <UserDialog
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

      {/* Confirma exclusão */}
      <AlertDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir{" "}
              <strong>{toDelete?.name}</strong>? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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

function UserDialog({
  open,
  onOpenChange,
  editing,
  saving,
  setSaving,
  onSaved,
}: any) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "operator",
  });

  useEffect(() => {
    if (open) {
      if (editing) {
        setForm({
          name: editing.name,
          email: editing.email,
          password: "",
          phone: editing.phone || "",
          role: editing.role,
        });
      } else {
        setForm({
          name: "",
          email: "",
          password: "",
          phone: "",
          role: "operator",
        });
      }
    }
  }, [open, editing]);

  async function save() {
    if (!form.name || form.name.length < 2) {
      toast.error("Informe o nome");
      return;
    }
    if (!form.email || !form.email.includes("@")) {
      toast.error("E-mail inválido");
      return;
    }
    if (!editing && form.password.length < 6) {
      toast.error("Senha deve ter no mínimo 6 caracteres");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const payload: any = {
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          role: form.role,
        };
        if (form.password) payload.password = form.password;
        await apiFetch(`/api/users/${editing.id}`, {
          method: "PATCH",
          json: payload,
        });
        toast.success("Usuário atualizado!");
      } else {
        await apiFetch("/api/users", {
          method: "POST",
          json: {
            name: form.name,
            email: form.email,
            password: form.password,
            phone: form.phone || undefined,
            role: form.role,
          },
        });
        toast.success("Usuário criado!");
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editing ? "Editar usuário" : "Novo usuário"}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? "Edite os dados. Deixe a senha em branco para não alterar."
              : "Crie um novo gestor ou operador para a empresa."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>Nome *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nome completo"
            />
          </div>
          <div>
            <Label>E-mail *</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="email@empresa.com"
            />
          </div>
          <div>
            <Label>
              {editing ? "Nova senha (opcional)" : "Senha *"}
            </Label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={editing ? "••••••••" : "Mínimo 6 caracteres"}
            />
          </div>
          <div>
            <Label>Telefone</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="(00) 0000-0000"
            />
          </div>
          <div>
            <Label>Perfil *</Label>
            <Select
              value={form.role}
              onValueChange={(v) => setForm({ ...form, role: v })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="operator">Operador</SelectItem>
                <SelectItem value="manager">Gestor</SelectItem>
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
            {editing ? "Salvar" : "Criar usuário"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
