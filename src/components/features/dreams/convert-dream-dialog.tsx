"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Target } from "lucide-react";
import { toast } from "sonner";

import { DynamicIcon } from "@/components/features/icon";
import { ResponsiveDialog } from "@/components/features/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { formatBRL } from "@/lib/format";
import { cn } from "@/lib/utils";
import { convertDreamAction } from "@/server/actions/dreams";
import type { Dream } from "@/server/services/dreams";
import type { LifeArea } from "@/server/services/goals";

type ConvertDreamDialogProps = {
  dream: Dream;
  lifeAreas: LifeArea[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ConvertDreamDialog({
  dream,
  lifeAreas,
  open,
  onOpenChange,
}: ConvertDreamDialogProps) {
  const router = useRouter();
  const [lifeAreaId, setLifeAreaId] = React.useState<string | null>(null);
  const [converting, setConverting] = React.useState(false);

  async function handleConvert() {
    if (!lifeAreaId) return;
    setConverting(true);
    const result = await convertDreamAction(dream.id, { lifeAreaId });
    setConverting(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    const { monthlySavingCents, goalId } = result.data;
    toast.success(
      monthlySavingCents
        ? `Meta criada! Guarde ${formatBRL(monthlySavingCents)} por mês para realizar no prazo.`
        : "Meta criada a partir do sonho!",
      { duration: 8000 },
    );
    onOpenChange(false);
    router.push(`/metas/${goalId}`);
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Transformar em meta"
      description={
        dream.estimatedCostCents
          ? `Cria uma meta de economia de ${formatBRL(dream.estimatedCostCents)} vinculada a este sonho.`
          : "Cria uma meta vinculada a este sonho para acompanhar o progresso."
      }
    >
      <FieldGroup>
        <Field>
          <FieldLabel>Em qual área da vida?</FieldLabel>
          <div className="grid grid-cols-2 gap-2">
            {lifeAreas.map((area) => (
              <button
                key={area.id}
                type="button"
                onClick={() => setLifeAreaId(area.id)}
                className={cn(
                  "flex items-center gap-2 rounded-xl border p-2.5 text-sm font-medium transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  lifeAreaId === area.id ? "border-primary bg-primary/10" : "hover:bg-accent",
                )}
              >
                <DynamicIcon name={area.icon} className="size-4" />
                {area.name}
              </button>
            ))}
          </div>
          {dream.estimatedCostCents && dream.targetDate ? (
            <FieldDescription>
              A sugestão de economia mensal será calculada pelo custo ÷ meses até o prazo.
            </FieldDescription>
          ) : null}
        </Field>
        <Button onClick={handleConvert} disabled={!lifeAreaId || converting}>
          {converting ? <Spinner /> : <Target aria-hidden />}
          Criar meta
        </Button>
      </FieldGroup>
    </ResponsiveDialog>
  );
}
