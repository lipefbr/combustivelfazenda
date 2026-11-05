"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-session";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  UserCircle,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Mail,
  Save,
  LogOut,
} from "lucide-react";

export default function AdminProfilePage() {
  const router = useRouter();
  const { data: session, loading, refetch } = useApi<{ user: any }>(
    "/api/auth/me"
  );

  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPw, setSavingPw] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  async function changePassword() {
    if (!pwForm.currentPassword || !pwForm.newPassword) {
      toast.error("Preencha a senha atual e a nova senha.");
      return;
    }
    if (pwForm.newPassword.length < 8) {
      toast.error("A nova senha deve ter no mínimo 8 caracteres.");
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error("As senhas não conferem.");
      return;
    }
    setSavingPw(true);
    try {
      await apiFetch("/api/auth/change-password", {
        method: "POST",
        json: {
          currentPassword: pwForm.currentPassword,
          newPassword: pwForm.newPassword,
        },
      });
      toast.success("Senha alterada com sucesso!");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Erro ao trocar senha");
    } finally {
      setSavingPw(false);
    }
  }

  async function logout() {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch {}
    router.push("/admin/login");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const user = session?.user;

  if (!user) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground mb-3">
          Sessão expirada. Faça login novamente.
        </p>
        <Button asChild>
          <a href="/admin/login">Ir para login</a>
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Meu Perfil</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Dados do Super Admin e segurança da conta.
        </p>
      </div>

      {user.forcePasswordChange && (
        <Card className="p-4 border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 shrink-0">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-amber-700 dark:text-amber-300">
                Troque sua senha
              </p>
              <p className="text-sm text-amber-700/80 dark:text-amber-200/70">
                Detectamos que você ainda está com a senha temporária. Por
                segurança, defina uma nova senha abaixo.
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 text-2xl font-bold shrink-0">
            {user.name?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg">{user.name}</h3>
            <p className="text-sm text-muted-foreground truncate">
              {user.email}
            </p>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 px-2 py-0.5 text-xs font-medium">
                <ShieldCheck className="h-3 w-3" />
                Super Admin
              </span>
              {user.forcePasswordChange && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 px-2 py-0.5 text-xs font-medium">
                  <ShieldAlert className="h-3 w-3" />
                  Senha temporária
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-bold flex items-center gap-2 mb-4">
          <UserCircle className="h-5 w-5 text-emerald-600" />
          Dados pessoais
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Nome</Label>
            <Input value={user.name} disabled />
          </div>
          <div>
            <Label className="flex items-center gap-1">
              <Mail className="h-3 w-3" /> E-mail
            </Label>
            <Input value={user.email} disabled />
          </div>
          <div>
            <Label>Telefone</Label>
            <Input value={user.phone || "—"} disabled />
          </div>
          <div>
            <Label>Perfil</Label>
            <Input value="Super Admin" disabled />
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-bold flex items-center gap-2 mb-4">
          <KeyRound className="h-5 w-5 text-emerald-600" />
          Alterar senha
        </h3>
        <div className="space-y-3 max-w-md">
          <div>
            <Label>Senha atual</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                value={pwForm.currentPassword}
                onChange={(e) =>
                  setPwForm({ ...pwForm, currentPassword: e.target.value })
                }
                className="pl-9"
                placeholder="••••••••"
              />
            </div>
          </div>
          <div>
            <Label>Nova senha (mín. 8 caracteres)</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                value={pwForm.newPassword}
                onChange={(e) =>
                  setPwForm({ ...pwForm, newPassword: e.target.value })
                }
                className="pl-9"
                placeholder="••••••••"
              />
            </div>
          </div>
          <div>
            <Label>Confirme a nova senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                value={pwForm.confirmPassword}
                onChange={(e) =>
                  setPwForm({ ...pwForm, confirmPassword: e.target.value })
                }
                className="pl-9"
                placeholder="••••••••"
              />
            </div>
          </div>
          <Button
            onClick={changePassword}
            disabled={savingPw}
            className="bg-emerald-600 hover:bg-emerald-700 gap-2"
          >
            <Save className="h-4 w-4" />
            {savingPw ? "Salvando..." : "Trocar senha"}
          </Button>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-bold flex items-center gap-2 mb-4">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          Segurança
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800">
            <div>
              <p className="font-medium">Autenticação em duas etapas (2FA)</p>
              <p className="text-xs text-muted-foreground">
                Aumenta a segurança exigindo um código adicional no login.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={twoFactor}
                onCheckedChange={(v) => {
                  setTwoFactor(v);
                  toast.info(
                    v
                      ? "2FA habilitado (simulado)."
                      : "2FA desabilitado (simulado)."
                  );
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-red-200 dark:border-red-900 bg-red-50/40 dark:bg-red-950/10">
            <div>
              <p className="font-medium text-red-700 dark:text-red-300">
                Encerrar sessão
              </p>
              <p className="text-xs text-muted-foreground">
                Saia do painel administrativo.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={logout}
              className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/30"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Sair
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
