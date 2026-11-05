"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-session";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";
import {
  User as UserIcon,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  Mail,
  Phone,
  Lock,
  Loader2,
  Building2,
  Save,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingState } from "@/components/app/states";
import { cn } from "@/lib/utils";

export default function MaisPage() {
  const router = useRouter();
  const { data: session } = useApi<{ user: any }>("/api/auth/me");
  const [tab, setTab] = useState<"menu" | "perfil" | "config">("menu");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Mais</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Perfil, configurações da empresa e mais.
        </p>
      </div>

      {tab === "menu" && (
        <MenuList
          session={session}
          onNavigate={(t) => setTab(t as any)}
          onLogout={async () => {
            await apiFetch("/api/auth/logout", { method: "POST" });
            router.push("/app/login");
            router.refresh();
          }}
        />
      )}

      {tab === "perfil" && (
        <PerfilSection onBack={() => setTab("menu")} session={session} />
      )}

      {tab === "config" && (
        <ConfigSection onBack={() => setTab("menu")} />
      )}
    </div>
  );
}

function MenuList({
  session,
  onNavigate,
  onLogout,
}: {
  session: any;
  onNavigate: (t: string) => void;
  onLogout: () => void;
}) {
  if (!session?.user) return <LoadingState />;
  const isManager = session.user.role === "manager";

  return (
    <div className="space-y-3">
      {/* User card */}
      <Card className="p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xl flex-shrink-0">
            {session.user.name?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-lg truncate">
              {session.user.name}
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {session.user.email}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                {isManager ? "Gestor" : "Operador"}
              </span>
              <span className="text-xs text-muted-foreground">
                {session.user.companyName || ""}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Menu items */}
      <Card className="p-0 gap-0 divide-y divide-border">
        <MenuItem
          icon={UserIcon}
          label="Perfil"
          description="Editar nome, e-mail e alterar senha"
          onClick={() => onNavigate("perfil")}
        />
        {isManager && (
          <Link href="/app/usuarios" className="block">
            <MenuItem
              icon={Users}
              label="Usuários da empresa"
              description="Gestão de gestores e operadores"
              onClick={() => {}}
            />
          </Link>
        )}
        {isManager && (
          <MenuItem
            icon={Settings}
            label="Configurações"
            description="Dados da empresa"
            onClick={() => onNavigate("config")}
        />
        )}
      </Card>

      <Card className="p-0 gap-0">
        <button
          onClick={onLogout}
          className="w-full p-4 flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors rounded-xl"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
            <LogOut className="h-5 w-5" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold">Sair</p>
            <p className="text-xs text-muted-foreground">
              Encerrar sessão nesta conta
            </p>
          </div>
          <ChevronRight className="h-5 w-5" />
        </button>
      </Card>
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  description,
  onClick,
}: {
  icon: any;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 flex items-center gap-3 hover:bg-emerald-50 transition-colors text-left"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="font-semibold">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </button>
  );
}

function PerfilSection({
  onBack,
  session,
}: {
  onBack: () => void;
  session: any;
}) {
  // The current user from auth/me only has name/email/role. For password and profile update we use a separate state.
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [pw, setPw] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setProfile({
        name: session.user.name || "",
        email: session.user.email || "",
        phone: session.user.phone || "",
      });
    }
  }, [session]);

  // Note: The PATCH /api/users/[id] is manager-only. For self profile we can use a workaround.
  // Most company users can use the change-password API for password, but for name/email/phone
  // they need their manager to do it. We'll use PATCH /api/users/[id] if the user is a manager.
  // If operator, we just show a notice.

  const isManager = session?.user?.role === "manager";

  async function saveProfile() {
    if (!isManager) {
      toast.info("Apenas o gestor pode editar dados dos usuários.");
      return;
    }
    setSavingProfile(true);
    try {
      await apiFetch(`/api/users/${session.user.id}`, {
        method: "PATCH",
        json: {
          name: profile.name,
          email: profile.email,
          phone: profile.phone || undefined,
        },
      });
      toast.success("Perfil atualizado!");
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar");
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword() {
    if (pw.next !== pw.confirm) {
      toast.error("A nova senha e a confirmação não conferem");
      return;
    }
    if (pw.next.length < 8) {
      toast.error("A nova senha deve ter no mínimo 8 caracteres");
      return;
    }
    setSavingPw(true);
    try {
      await apiFetch("/api/auth/change-password", {
        method: "POST",
        json: {
          currentPassword: pw.current,
          newPassword: pw.next,
        },
      });
      toast.success("Senha alterada com sucesso!");
      setPw({ current: "", next: "", confirm: "" });
    } catch (e: any) {
      toast.error(e.message || "Erro ao alterar senha");
    } finally {
      setSavingPw(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 mb-3">
          ← Voltar
        </Button>
      </div>

      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <UserIcon className="h-5 w-5 text-emerald-600" />
          <h2 className="font-bold text-lg">Meu perfil</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <Label>Nome</Label>
            <Input
              value={profile.name}
              onChange={(e) =>
                setProfile({ ...profile, name: e.target.value })
              }
              disabled={!isManager}
            />
          </div>
          <div>
            <Label>E-mail</Label>
            <Input
              type="email"
              value={profile.email}
              onChange={(e) =>
                setProfile({ ...profile, email: e.target.value })
              }
              disabled={!isManager}
            />
          </div>
          <div>
            <Label>Telefone</Label>
            <Input
              value={profile.phone}
              onChange={(e) =>
                setProfile({ ...profile, phone: e.target.value })
              }
              disabled={!isManager}
            />
          </div>
        </div>
        {!isManager && (
          <p className="text-xs text-muted-foreground">
            Apenas o gestor pode editar dados de usuários. Peça ao gestor para
            alterar seus dados.
          </p>
        )}
        <Button
          onClick={saveProfile}
          disabled={savingProfile || !isManager}
          className="bg-emerald-600 hover:bg-emerald-700 gap-2"
        >
          {savingProfile ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Salvar perfil
        </Button>
      </Card>

      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Lock className="h-5 w-5 text-emerald-600" />
          <h2 className="font-bold text-lg">Trocar senha</h2>
        </div>
        <div className="space-y-3">
          <div>
            <Label>Senha atual</Label>
            <Input
              type="password"
              value={pw.current}
              onChange={(e) => setPw({ ...pw, current: e.target.value })}
              placeholder="••••••••"
            />
          </div>
          <div>
            <Label>Nova senha (mínimo 8 caracteres)</Label>
            <Input
              type="password"
              value={pw.next}
              onChange={(e) => setPw({ ...pw, next: e.target.value })}
              placeholder="••••••••"
            />
          </div>
          <div>
            <Label>Confirmar nova senha</Label>
            <Input
              type="password"
              value={pw.confirm}
              onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
              placeholder="••••••••"
            />
          </div>
        </div>
        <Button
          onClick={changePassword}
          disabled={savingPw || !pw.current || !pw.next}
          className="bg-emerald-600 hover:bg-emerald-700 gap-2"
        >
          {savingPw ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Lock className="h-4 w-4" />
          )}
          Alterar senha
        </Button>
      </Card>
    </div>
  );
}

function ConfigSection({ onBack }: { onBack: () => void }) {
  const { data, loading } = useApi<{ company: any }>("/api/company");
  const [form, setForm] = useState<any>({
    name: "",
    responsibleName: "",
    whatsapp: "",
    phone: "",
    document: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data?.company) {
      setForm({
        name: data.company.name || "",
        responsibleName: data.company.responsibleName || "",
        whatsapp: data.company.whatsapp || "",
        phone: data.company.phone || "",
        document: data.company.document || "",
        address: data.company.address || "",
        city: data.company.city || "",
        state: data.company.state || "",
        zipCode: data.company.zipCode || "",
      });
    }
  }, [data]);

  async function save() {
    setSaving(true);
    try {
      await apiFetch("/api/company", {
        method: "PATCH",
        json: {
          name: form.name,
          responsibleName: form.responsibleName,
          whatsapp: form.whatsapp,
          phone: form.phone,
          document: form.document || null,
          address: form.address || null,
          city: form.city || null,
          state: form.state || null,
          zipCode: form.zipCode || null,
        },
      });
      toast.success("Empresa atualizada!");
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-5">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 mb-3">
        ← Voltar
      </Button>

      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="h-5 w-5 text-emerald-600" />
          <h2 className="font-bold text-lg">Dados da empresa</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <Label>Nome da empresa</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <Label>Responsável</Label>
            <Input
              value={form.responsibleName}
              onChange={(e) =>
                setForm({ ...form, responsibleName: e.target.value })
              }
            />
          </div>
          <div>
            <Label>CNPJ / CPF</Label>
            <Input
              value={form.document}
              onChange={(e) =>
                setForm({ ...form, document: e.target.value })
              }
              placeholder="00.000.000/0000-00"
            />
          </div>
          <div>
            <Label>WhatsApp</Label>
            <Input
              value={form.whatsapp}
              onChange={(e) =>
                setForm({ ...form, whatsapp: e.target.value })
              }
              placeholder="(00) 00000-0000"
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
          <div className="sm:col-span-2">
            <Label>Endereço</Label>
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Rua, número, complemento"
            />
          </div>
          <div>
            <Label>Cidade</Label>
            <Input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </div>
          <div>
            <Label>Estado (UF)</Label>
            <Input
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              placeholder="SP"
              maxLength={2}
            />
          </div>
          <div>
            <Label>CEP</Label>
            <Input
              value={form.zipCode}
              onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
              placeholder="00000-000"
            />
          </div>
        </div>

        <Button
          onClick={save}
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-700 gap-2"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Salvar alterações
        </Button>
      </Card>
    </div>
  );
}
