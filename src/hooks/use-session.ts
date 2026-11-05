"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";

// Tipos exportados para uso em telas
export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "manager" | "operator";
  companyId?: string;
  companyName?: string;
  forcePasswordChange?: boolean;
};

export type Session = {
  user: CurrentUser | null;
  impersonatedBy?: string;
};

// Hook para obter sessão atual
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Session>("/api/auth/me")
      .then((data) => setSession(data))
      .catch(() => setSession({ user: null }))
      .finally(() => setLoading(false));
  }, []);

  return { session, loading, setSession };
}

// Hook para SWR-like fetch com revalidação manual
export function useApi<T = any>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!path);

  const refetch = async () => {
    if (!path) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch<T>(path);
      setData(result);
    } catch (e: any) {
      setError(e.message || "Erro");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, [path]);

  return { data, error, loading, refetch };
}
