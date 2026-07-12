"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { DynamicIcon } from "@/components/features/icon";
import { ResponsiveDialog } from "@/components/features/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { createGoalAction } from "@/server/actions/goals";
import type { LifeArea } from "@/server/services/goals";
import { createGoalSchema, type CreateGoalInput } from "@/shared/schemas/goals";

const PROGRESS_TYPES = [
  { value: "manual_percent", title: "Percentual", hint: "Você atualiza o % manualmente" },
  { value: "milestones", title: "Por marcos", hint: "Checklist com % automático" },
  { value: "numeric", title: "Numérica", hint: "Ex.: ler 12 livros — atual/alvo" },
] as const;

const STEP_FIELDS: (keyof CreateGoalInput)[][] = [
  ["title", "description"],
  ["lifeAreaId", "progressType", "targetValue", "unit"],
  ["targetDate"],
];

export function GoalFormDialog({ lifeAreas }: { lifeAreas: LifeArea[] }) {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState(0);

  const form = useForm<CreateGoalInput>({
    resolver: zodResolver(createGoalSchema),
    defaultValues: { title: "", description: "", progressType: "manual_percent" },
  });
  const { errors, isSubmitting } = form.formState;
  const progressType = form.watch("progressType");
  const lifeAreaId = form.watch("lifeAreaId");

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setStep(0);
      form.reset();
    }
  }

  async function nextStep() {
    const valid = await form.trigger(STEP_FIELDS[step]);
    if (valid) setStep((s) => s + 1);
  }

  async function onSubmit(values: CreateGoalInput) {
    const result = await createGoalAction({
      ...values,
      description: values.description || undefined,
      targetDate: values.targetDate || undefined,
      unit: values.unit || undefined,
    });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Meta criada!");
    handleOpenChange(false);
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Nova meta"
      description={`Passo ${step + 1} de 3`}
      trigger={
        <Button>
          <Plus aria-hidden /> Nova meta
        </Button>
      }
    >
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <FieldGroup>
          {step === 0 && (
            <>
              <Field>
                <FieldLabel htmlFor="goal-title">O que você quer alcançar?</FieldLabel>
                <Input
                  id="goal-title"
                  placeholder="Ex.: Correr uma meia maratona"
                  aria-invalid={Boolean(errors.title)}
                  {...form.register("title")}
                />
                <FieldError errors={[errors.title]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="goal-description">Descrição (opcional)</FieldLabel>
                <Textarea
                  id="goal-description"
                  rows={3}
                  placeholder="Por que essa meta importa?"
                  {...form.register("description")}
                />
              </Field>
            </>
          )}

          {step === 1 && (
            <>
              <Field>
                <FieldLabel>Área da vida</FieldLabel>
                <div className="grid grid-cols-2 gap-2">
                  {lifeAreas.map((area) => (
                    <button
                      key={area.id}
                      type="button"
                      onClick={() => form.setValue("lifeAreaId", area.id, { shouldValidate: true })}
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
                <FieldError errors={[errors.lifeAreaId]} />
              </Field>
              <Field>
                <FieldLabel>Como medir o progresso?</FieldLabel>
                <div className="grid gap-2">
                  {PROGRESS_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => form.setValue("progressType", type.value)}
                      className={cn(
                        "rounded-xl border p-3 text-left transition-colors",
                        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                        progressType === type.value
                          ? "border-primary bg-primary/10"
                          : "hover:bg-accent",
                      )}
                    >
                      <p className="text-sm font-medium">{type.title}</p>
                      <p className="text-xs text-muted-foreground">{type.hint}</p>
                    </button>
                  ))}
                </div>
              </Field>
              {progressType === "numeric" && (
                <div className="grid grid-cols-2 gap-3">
                  <Field>
                    <FieldLabel htmlFor="goal-target">Valor alvo</FieldLabel>
                    <Input
                      id="goal-target"
                      type="number"
                      min={1}
                      placeholder="12"
                      aria-invalid={Boolean(errors.targetValue)}
                      {...form.register("targetValue", {
                        setValueAs: (v) => (v === "" || v == null ? null : Number(v)),
                      })}
                    />
                    <FieldError errors={[errors.targetValue]} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="goal-unit">Unidade</FieldLabel>
                    <Input id="goal-unit" placeholder="livros" {...form.register("unit")} />
                  </Field>
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <Field>
              <FieldLabel htmlFor="goal-date">Prazo (opcional)</FieldLabel>
              <Input id="goal-date" type="date" {...form.register("targetDate")} />
              <FieldError errors={[errors.targetDate]} />
            </Field>
          )}

          <div className="flex items-center justify-between gap-2 pt-2">
            {step > 0 ? (
              <Button type="button" variant="ghost" onClick={() => setStep((s) => s - 1)}>
                <ArrowLeft aria-hidden /> Voltar
              </Button>
            ) : (
              <span />
            )}
            {step < 2 ? (
              <Button type="button" onClick={nextStep}>
                Continuar <ArrowRight aria-hidden />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Spinner /> : null} Criar meta
              </Button>
            )}
          </div>
        </FieldGroup>
      </form>
    </ResponsiveDialog>
  );
}
