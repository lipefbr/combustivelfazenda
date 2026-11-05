"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-session";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ShieldAlert, LogOut } from "lucide-react";

/**
 * Mostra um banner de impersonação no topo quando o Super Admin está
 * operando como gestor de uma empresa. Chama POST /api/auth/unimpersonate
 * e volta para /admin.
 */
export function ImpersonationBanner() {
  const router = useRouter();
  const { data: session } = useApi<{
    user: any;
    impersonatedBy?: string;
  }>("/api/auth/me");
  const [exiting, setExiting] = useState(false);

  if (!session?.impersonatedBy || !session?.user) return null;

  async function exitImpersonation() {
    setExiting(true);
    try {
      await apiFetch("/api/auth/unimpersonate", { method: "POST" });
      toast.success("Impersonação encerrada. Voltando ao painel admin.");
      router.push("/admin");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Erro ao sair da impersonação");
    } finally {
      setExiting(false);
    }
  }

  return (
    <div className="sticky top-0 z-50 w-full bg-amber-500 text-white border-b border-amber-600 px-4 py-2 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <ShieldAlert className="h-4 w-4 shrink-0" />
        <p className="text-sm font-medium truncate">
          Você está acessando como{" "}
          <strong>{session.user.companyName || "empresa"}</strong>{" "}
          ({session.user.email}). Modo de impersonação do Super Admin.
        </p>
      </div>
      <Button
        onClick={exitImpersonation}
        disabled={exiting}
        size="sm"
        variant="secondary"
        className="bg-white text-amber-700 hover:bg-amber-50 shrink-0 gap-2"
      >
        <LogOut className="h-3.5 w-3.5" />
        {exiting ? "Saindo..." : "Sair da impersonação"}
      </Button>
    </div>
  );
}
