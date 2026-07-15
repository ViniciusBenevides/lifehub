"use client";

import * as React from "react";
import { CloudDownload, CloudUpload, FileJson, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export function BackupView() {
  const router = useRouter();
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [exporting, setExporting] = React.useState(false);
  const [importing, setImporting] = React.useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const response = await fetch("/api/v1/backup");
      if (!response.ok) throw new Error("Falha ao gerar o backup");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `lifehub-backup-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success("Backup exportado!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao exportar");
    } finally {
      setExporting(false);
    }
  }

  async function handleImport(file: File) {
    setImporting(true);
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      const response = await fetch("/api/v1/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Arquivo de backup inválido");
      const results: Array<{ imported: number }> = await response.json();
      const total = results.reduce((sum, result) => sum + result.imported, 0);
      toast.success(
        total > 0
          ? `Backup restaurado: ${total} registro${total === 1 ? "" : "s"} importado${total === 1 ? "" : "s"}.`
          : "Nada novo para importar — seus dados já estavam em dia.",
      );
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao restaurar");
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <Card className="space-y-3 p-5">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400">
            <CloudDownload className="size-5.5" aria-hidden />
          </span>
          <div>
            <h2 className="font-semibold">Exportar dados</h2>
            <p className="text-sm text-muted-foreground">
              Baixe um arquivo JSON com tudo: tarefas, hábitos, finanças, notas, diários e mais.
            </p>
          </div>
        </div>
        <Button onClick={handleExport} disabled={exporting} className="w-full">
          {exporting ? <Spinner /> : <FileJson aria-hidden />}
          Baixar backup completo
        </Button>
      </Card>

      <Card className="space-y-3 p-5">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-violet-500/15 text-violet-600 dark:text-violet-400">
            <CloudUpload className="size-5.5" aria-hidden />
          </span>
          <div>
            <h2 className="font-semibold">Restaurar backup</h2>
            <p className="text-sm text-muted-foreground">
              Importe um arquivo exportado anteriormente. Registros existentes não são duplicados.
            </p>
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          aria-label="Selecionar arquivo de backup"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleImport(file);
          }}
        />
        <Button
          variant="outline"
          onClick={() => fileRef.current?.click()}
          disabled={importing}
          className="w-full"
        >
          {importing ? <Spinner /> : <CloudUpload aria-hidden />}
          Selecionar arquivo JSON
        </Button>
      </Card>

      <p className="flex items-start gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
        Seus dados ficam no seu banco. O backup é um arquivo local, sob seu controle — guarde-o em
        um lugar seguro.
      </p>
    </div>
  );
}
