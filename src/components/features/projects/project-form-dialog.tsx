"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";

import { ResponsiveDialog } from "@/components/features/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { createProjectAction, updateProjectAction } from "@/server/actions/projects";
import type { Project } from "@/server/services/projects";
import { createProjectSchema, PROJECT_COLORS } from "@/shared/schemas/projects";

type ProjectFormDialogProps = {
  project?: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
};

export function ProjectFormDialog({
  project,
  open,
  onOpenChange,
  trigger,
}: ProjectFormDialogProps) {
  const isEdit = Boolean(project);
  const [name, setName] = React.useState(project?.name ?? "");
  const [description, setDescription] = React.useState(project?.description ?? "");
  const [color, setColor] = React.useState(project?.color ?? PROJECT_COLORS[0]);
  const [deadline, setDeadline] = React.useState(project?.deadline ?? "");
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const parsed = createProjectSchema.safeParse({
      name,
      description: description || null,
      color,
      deadline: deadline || null,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }
    setSaving(true);
    const result = isEdit
      ? await updateProjectAction(project!.id, parsed.data)
      : await createProjectAction(parsed.data);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success(isEdit ? "Projeto atualizado." : "Projeto criado!");
    onOpenChange(false);
    if (!isEdit) {
      setName("");
      setDescription("");
      setDeadline("");
    }
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Editar Projeto" : "Novo Projeto"}
      trigger={trigger}
    >
      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="project-name">Nome do Projeto</FieldLabel>
            <Input
              id="project-name"
              placeholder="Digite o nome do projeto"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoFocus={!isEdit}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="project-description">Descrição</FieldLabel>
            <Textarea
              id="project-description"
              placeholder="Digite a descrição do projeto"
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel>Cor do Projeto</FieldLabel>
            <div className="grid grid-cols-5 gap-3">
              {PROJECT_COLORS.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-label={`Cor ${option}`}
                  aria-pressed={color === option}
                  onClick={() => setColor(option)}
                  className={cn(
                    "mx-auto grid size-11 place-items-center rounded-full text-white transition-transform",
                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    color === option
                      ? "ring-2 ring-white ring-offset-2 ring-offset-background"
                      : "hover:scale-110",
                  )}
                  style={{ backgroundColor: option }}
                >
                  {color === option ? <Check className="size-5" aria-hidden /> : null}
                </button>
              ))}
            </div>
          </Field>
          <Field>
            <FieldLabel htmlFor="project-deadline">Prazo</FieldLabel>
            <Input
              id="project-deadline"
              type="date"
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
            />
          </Field>
          {error ? <FieldError>{error}</FieldError> : null}
          <Button type="submit" disabled={saving} size="lg">
            {saving ? <Spinner /> : null}
            {isEdit ? "Salvar Alterações" : "Criar Projeto"}
          </Button>
        </FieldGroup>
      </form>
    </ResponsiveDialog>
  );
}

export function NewProjectButton() {
  const [open, setOpen] = React.useState(false);
  return (
    <ProjectFormDialog open={open} onOpenChange={setOpen} trigger={<Button>Novo Projeto</Button>} />
  );
}
