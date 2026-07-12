"use client";

import * as React from "react";
import Image from "next/image";
import { toast } from "sonner";

import { CurrencyInput } from "@/components/features/finance/currency-input";
import { ResponsiveDialog } from "@/components/features/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { createDreamAction, updateDreamAction } from "@/server/actions/dreams";
import type { Dream } from "@/server/services/dreams";
import { createDreamSchema } from "@/shared/schemas/dreams";

type DreamFormDialogProps = {
  dream?: Dream;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
};

export function DreamFormDialog({ dream, open, onOpenChange, trigger }: DreamFormDialogProps) {
  const isEdit = Boolean(dream);
  const [title, setTitle] = React.useState(dream?.title ?? "");
  const [description, setDescription] = React.useState(dream?.description ?? "");
  const [imageUrl, setImageUrl] = React.useState(dream?.imageUrl ?? "");
  const [costCents, setCostCents] = React.useState(dream?.estimatedCostCents ?? 0);
  const [targetDate, setTargetDate] = React.useState(dream?.targetDate ?? "");
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [previewOk, setPreviewOk] = React.useState(true);

  const showPreview = imageUrl.startsWith("https://") && previewOk;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const parsed = createDreamSchema.safeParse({
      title,
      description: description || null,
      imageUrl: imageUrl || null,
      estimatedCostCents: costCents > 0 ? costCents : null,
      targetDate: targetDate || null,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }
    setSaving(true);
    const result = isEdit
      ? await updateDreamAction(dream!.id, parsed.data)
      : await createDreamAction(parsed.data);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success(isEdit ? "Sonho atualizado." : "Sonho adicionado ao mural!");
    onOpenChange(false);
    if (!isEdit) {
      setTitle("");
      setDescription("");
      setImageUrl("");
      setCostCents(0);
      setTargetDate("");
    }
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Editar sonho" : "Novo sonho"}
      description="O que você quer viver, ter ou realizar?"
      trigger={trigger}
    >
      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="dream-title">Título</FieldLabel>
            <Input
              id="dream-title"
              placeholder="Ex.: Conhecer o Japão"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="dream-image">Imagem (URL)</FieldLabel>
            <Input
              id="dream-image"
              type="url"
              placeholder="https://…"
              value={imageUrl}
              onChange={(event) => {
                setImageUrl(event.target.value);
                setPreviewOk(true);
              }}
            />
            <FieldDescription>Cole o link de uma imagem que represente o sonho.</FieldDescription>
            {showPreview && (
              <div className="relative mt-1 h-32 overflow-hidden rounded-xl border">
                <Image
                  src={imageUrl}
                  alt="Prévia da imagem do sonho"
                  fill
                  unoptimized
                  className="object-cover"
                  onError={() => setPreviewOk(false)}
                />
              </div>
            )}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel htmlFor="dream-cost">Custo estimado</FieldLabel>
              <CurrencyInput id="dream-cost" valueCents={costCents} onValueChange={setCostCents} />
            </Field>
            <Field>
              <FieldLabel htmlFor="dream-date">Quando?</FieldLabel>
              <Input
                id="dream-date"
                type="date"
                value={targetDate}
                onChange={(event) => setTargetDate(event.target.value)}
              />
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="dream-description">Descrição</FieldLabel>
            <Textarea
              id="dream-description"
              rows={2}
              placeholder="Detalhes, motivação…"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </Field>
          {error ? <FieldError>{error}</FieldError> : null}
          <Button type="submit" disabled={saving}>
            {saving ? <Spinner /> : null}
            {isEdit ? "Salvar alterações" : "Adicionar ao mural"}
          </Button>
        </FieldGroup>
      </form>
    </ResponsiveDialog>
  );
}
