"use client";

import * as React from "react";

/** Registra o service worker (apenas em produção). */
export function ServiceWorkerRegister() {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // PWA é progressivo: falha no registro não afeta o app.
    });
  }, []);

  return null;
}
