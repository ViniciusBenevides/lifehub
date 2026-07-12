"use client";

import * as React from "react";
import { Check, Pencil, Plus, Settings2, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { HABIT_COLOR_OPTIONS } from "@/components/features/habits/frequency";
import { DynamicIcon } from "@/components/features/icon";
import { ResponsiveDialog } from "@/components/features/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/server/actions/finance";
import type { TransactionCategory } from "@/server/services/finance";

const CATEGORY_ICON_OPTIONS = [
  "UtensilsCrossed",
  "Car",
  "House",
  "Gamepad2",
  "HeartPulse",
  "Repeat",
  "BookOpen",
  "ShoppingBag",
  "PiggyBank",
  "Banknote",
  "Laptop",
  "TrendingUp",
  "Wallet",
  "CircleEllipsis",
] as const;

export function CategoriesManager({ categories }: { categories: TransactionCategory[] }) {
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<TransactionCategory | null>(null);
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<"income" | "expense">("expense");
  const [icon, setIcon] = React.useState<string>("CircleEllipsis");
  const [color, setColor] = React.useState<string>(HABIT_COLOR_OPTIONS[0]);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  function startEdit(category: TransactionCategory) {
    setEditing(category);
    setName(category.name);
    setType(category.type);
    setIcon(category.icon ?? "CircleEllipsis");
    setColor(category.color ?? HABIT_COLOR_OPTIONS[0]);
  }

  function resetForm() {
    setEditing(null);
    setName("");
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSaving(true);
    const result = editing
      ? await updateCategoryAction(editing.id, { name, icon, color })
      : await createCategoryAction({ name, type, icon, color });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success(editing ? "Categoria atualizada." : "Categoria criada.");
    resetForm();
  }

  async function handleDelete(category: TransactionCategory) {
    const result = await deleteCategoryAction(category.id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Categoria excluída.");
    if (editing?.id === category.id) resetForm();
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetForm();
      }}
      title="Categorias"
      description="Crie, edite ou exclua categorias de receitas e despesas."
      trigger={
        <Button variant="outline" size="sm">
          <Settings2 aria-hidden /> Categorias
        </Button>
      }
    >
      <div className="space-y-5">
        <ul className="max-h-56 space-y-1 overflow-y-auto pr-1">
          {categories.map((category) => (
            <li key={category.id} className="flex items-center gap-2 rounded-lg px-1 py-1 text-sm">
              <span
                className="flex size-7 items-center justify-center rounded-md"
                style={{
                  backgroundColor: `${category.color ?? "#64748b"}22`,
                  color: category.color ?? "#64748b",
                }}
              >
                <DynamicIcon name={category.icon} className="size-3.5" />
              </span>
              <span className="min-w-0 flex-1 truncate">{category.name}</span>
              <span className="text-xs text-muted-foreground">
                {category.type === "income" ? "Receita" : "Despesa"}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Editar ${category.name}`}
                onClick={() => startEdit(category)}
              >
                <Pencil className="size-3.5" aria-hidden />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Excluir ${category.name}`}
                onClick={() => handleDelete(category)}
              >
                <Trash2 className="size-3.5" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>

        <form onSubmit={handleSubmit} className="rounded-xl border p-3" noValidate>
          <FieldGroup>
            <p className="text-sm font-medium">
              {editing ? `Editando "${editing.name}"` : "Nova categoria"}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="cat-name">Nome</FieldLabel>
                <Input
                  id="cat-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ex.: Pets"
                />
              </Field>
              {!editing && (
                <Field>
                  <FieldLabel>Tipo</FieldLabel>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setType("expense")}
                      className={cn(
                        "rounded-lg border py-1.5 text-xs font-medium",
                        type === "expense" ? "border-primary bg-primary/10" : "hover:bg-accent",
                      )}
                    >
                      Despesa
                    </button>
                    <button
                      type="button"
                      onClick={() => setType("income")}
                      className={cn(
                        "rounded-lg border py-1.5 text-xs font-medium",
                        type === "income" ? "border-primary bg-primary/10" : "hover:bg-accent",
                      )}
                    >
                      Receita
                    </button>
                  </div>
                </Field>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_ICON_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-label={option}
                  aria-pressed={icon === option}
                  onClick={() => setIcon(option)}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-lg border hover:bg-accent",
                    icon === option && "border-primary bg-primary/10",
                  )}
                >
                  <DynamicIcon name={option} className="size-4" />
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {HABIT_COLOR_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-label={`Cor ${option}`}
                  aria-pressed={color === option}
                  onClick={() => setColor(option)}
                  className={cn(
                    "size-6 rounded-full border-2",
                    color === option ? "scale-110 border-foreground" : "border-transparent",
                  )}
                  style={{ backgroundColor: option }}
                />
              ))}
            </div>
            {error ? <FieldError>{error}</FieldError> : null}
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={saving || !name.trim()}>
                {saving ? <Spinner /> : editing ? <Check aria-hidden /> : <Plus aria-hidden />}
                {editing ? "Salvar" : "Adicionar"}
              </Button>
              {editing && (
                <Button type="button" size="sm" variant="ghost" onClick={resetForm}>
                  <X aria-hidden /> Cancelar
                </Button>
              )}
            </div>
          </FieldGroup>
        </form>
      </div>
    </ResponsiveDialog>
  );
}
