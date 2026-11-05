"use client";

// Cliente de API para uso no client-side.
// Todas as rotas são relativas, com cookies automáticos.

export class ApiError extends Error {
  status: number;
  details?: any;
  constructor(message: string, status: number, details?: any) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export async function apiFetch<T = any>(
  path: string,
  options?: RequestInit & { json?: any }
): Promise<T> {
  const { json, ...init } = options || {};
  const headers: Record<string, string> = { ...(init.headers as any) };

  if (json !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(path, {
    ...init,
    headers,
    body: json !== undefined ? JSON.stringify(json) : init.body,
    credentials: "same-origin",
  });

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const data = await res.json();
    if (!res.ok) {
      throw new ApiError(data.error || "Erro na requisição", res.status, data.details);
    }
    return data;
  }

  if (contentType.includes("text/")) {
    const text = await res.text();
    if (!res.ok) throw new ApiError(text, res.status);
    return text as unknown as T;
  }

  // Para blob/buffer
  const buf = await res.arrayBuffer();
  if (!res.ok) throw new ApiError("Erro na requisição", res.status);
  return buf as unknown as T;
}

// Helper para upload de arquivos
export async function apiUpload(
  path: string,
  file: File,
  subdir?: string
): Promise<{ url: string }> {
  const fd = new FormData();
  fd.append("file", file);
  if (subdir) fd.append("subdir", subdir);
  const res = await fetch(path, {
    method: "POST",
    body: fd,
    credentials: "same-origin",
  });
  const data = await res.json();
  if (!res.ok) throw new ApiError(data.error || "Erro no upload", res.status);
  return data;
}

// Helper para download de arquivos (PDF/Excel/CSV)
export async function apiDownload(
  path: string,
  filename?: string
): Promise<void> {
  const res = await fetch(path, { credentials: "same-origin" });
  if (!res.ok) {
    throw new ApiError("Erro ao baixar arquivo", res.status);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "download";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
