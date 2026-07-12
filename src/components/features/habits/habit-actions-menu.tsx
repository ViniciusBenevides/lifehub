"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CircleOff, CirclePlay, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { HabitFormDialog } from "@/components/features/habits/habit-form-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { deleteHabitAction, updateHabitAction } from "@/server/actions/habits";
import type { Habit } from "@/server/services/habits";

export function HabitActionsMenu({
  habit,
  goals,
}: {
  habit: Habit;
  goals: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  async function toggleActive() {
    const result = await updateHabitAction(habit.id, { active: !habit.active });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(habit.active ? "Hábito desativado." : "Hábito reativado.");
  }

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteHabitAction(habit.id);
    setDeleting(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Hábito excluído.");
    router.push("/habitos");
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Ações do hábito">
            <MoreVertical aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil aria-hidden /> Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={toggleActive}>
            {habit.active ? (
              <>
                <CircleOff aria-hidden /> Desativar
              </>
            ) : (
              <>
                <CirclePlay aria-hidden /> Reativar
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setConfirmDelete(true)}>
            <Trash2 aria-hidden /> Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <HabitFormDialog goals={goals} habit={habit} open={editOpen} onOpenChange={setEditOpen} />

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir hábito?</DialogTitle>
            <DialogDescription>
              &quot;{habit.name}&quot; e todo o histórico de conclusões serão removidos. Essa ação
              não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Spinner /> : null} Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
