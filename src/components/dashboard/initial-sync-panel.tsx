"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";

export function InitialSyncPanel() {
  const [status, setStatus] = useState<"syncing" | "done" | "error">("syncing");
  const [message, setMessage] = useState("Buscando seus repositórios no GitHub...");

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/sync/initial", { method: "POST" });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        setStatus("done");
        setMessage("Sincronização concluída!");

        // Recarrega a página para mostrar os dados
        setTimeout(() => window.location.reload(), 1200);
      } catch {
        setStatus("error");
        setMessage("Erro ao sincronizar. Tente novamente.");
      }
    };

    run();
  }, []);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        {status === "syncing" && <Loader2 className="size-8 animate-spin text-muted-foreground" />}
        {status === "done" && <RefreshCw className="size-8 text-emerald-500" />}
        {status === "error" && <RefreshCw className="size-8 text-destructive" />}
      </div>
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">
          {status === "syncing" ? "Sincronizando..." : status === "done" ? "Pronto!" : "Ops!"}
        </h2>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      {status === "error" && (
        <button
          onClick={() => window.location.reload()}
          className="text-sm underline underline-offset-2"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}
