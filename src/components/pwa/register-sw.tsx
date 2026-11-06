"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });
        console.log("[PWA] Service Worker registrado:", registration.scope);

        // Verifica atualizações a cada 1h
        setInterval(() => {
          registration.update().catch(() => {});
        }, 60 * 60 * 1000);

        // Aplica atualização quando disponível
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // Novo SW pronto — força o skipWaiting
              newWorker.postMessage("skipWaiting");
            }
          });
        });
      } catch (err) {
        console.warn("[PWA] Falha ao registrar Service Worker:", err);
      }
    };

    // Registra após carregamento da página
    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register);
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
