"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { ResponsiveDialog } from "@/components/features/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { updateGoalAction } from "@/server/actions/goals";
import type { GoalDetail, LifeArea } from "@/server/services/goals";
import { updateGoalSchema, type UpdateGoalInput } from "@/shared/schemas/goals";

type GoalEditDialogProps = {
  goal: GoalDetail;
  lifeAreas: LifeArea[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function GoalEditDialog({ goal, lifeAreas, open, onOpenChange }: GoalEditDialogProps) {
  const form = useForm<UpdateGoalInput>({
    resolver: zodResolver(updateGoalSchema),
    values: {
      title: goal.title,
      description: goal.description ?? "",
      lifeAreaId: goal.lifeAreaId,
      targetDate: goal.targetDate,
      targetValue: goal.targetValue,
      unit: goal.unit ?? "",
    },
  });
  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values: UpdateGoalInput) {
    const result = await updateGoalAction(goal.id, {
      ...values,
      description: values.description || null,
      targetDate: values.targetDate || null,
      unit: values.unit || null,
    });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Meta atualizada.");
    onOpenChange(false);
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} title="Editar meta">
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="edit-title">Título</FieldLabel>
            <Input
              id="edit-title"
              aria-invalid={Boolean(errors.title)}
              {...form.register("title")}
            />
            <FieldError errors={[errors.title]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="edit-description">Descrição</FieldLabel>
            <Textarea id="edit-description" rows={3} {...form.register("description")} />
          </Field>
          <Field>
            <FieldLabel>Área da vida</FieldLabel>
            <Select
              value={form.watch("lifeAreaId")}
              onValueChange={(value) => form.setValue("lifeAreaId", value)}
            >
              <SelectTrigger aria-label="Área da vida">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {lifeAreas.map((area) => (
                  <SelectItem key={area.id} value={area.id}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="edit-date">Prazo</FieldLabel>
            <Input id="edit-date" type="date" {...form.register("targetDate")} />
          </Field>
          {goal.progressType === "numeric" && (
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="edit-target">Valor alvo</FieldLabel>
                <Input
                  id="edit-target"
                  type="number"
                  min={1}
                  aria-invalid={Boolean(errors.targetValue)}
                  {...form.register("targetValue", {
                    setValueAs: (v) => (v === "" || v == null ? null : Number(v)),
                  })}
                />
                <FieldError errors={[errors.targetValue]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-unit">Unidade</FieldLabel>
                <Input id="edit-unit" {...form.register("unit")} />
              </Field>
            </div>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Spinner /> : null} Salvar alterações
          </Button>
        </FieldGroup>
      </form>
    </ResponsiveDialog>
  );
}
