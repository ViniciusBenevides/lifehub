"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Archive, MoreVertical, Pause, Pencil, Play, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { GoalEditDialog } from "@/components/features/goals/goal-edit-dialog";
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
import { deleteGoalAction, updateGoalAction } from "@/server/actions/goals";
import type { GoalDetail, LifeArea } from "@/server/services/goals";

export function GoalActionsMenu({ goal, lifeAreas }: { goal: GoalDetail; lifeAreas: LifeArea[] }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  async function setStatus(status: "active" | "paused" | "archived") {
    const result = await updateGoalAction(goal.id, { status });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(
      status === "active"
        ? "Meta retomada."
        : status === "paused"
          ? "Meta pausada."
          : "Meta arquivada.",
    );
  }

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteGoalAction(goal.id);
    setDeleting(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Meta excluída.");
    router.push("/metas");
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Ações da meta">
            <MoreVertical aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil aria-hidden /> Editar
          </DropdownMenuItem>
          {goal.status === "active" && (
            <DropdownMenuItem onClick={() => setStatus("paused")}>
              <Pause aria-hidden /> Pausar
            </DropdownMenuItem>
          )}
          {(goal.status === "paused" || goal.status === "archived") && (
            <DropdownMenuItem onClick={() => setStatus("active")}>
              <Play aria-hidden /> Retomar
            </DropdownMenuItem>
          )}
          {goal.status !== "archived" && (
            <DropdownMenuItem onClick={() => setStatus("archived")}>
              <Archive aria-hidden /> Arquivar
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setConfirmDelete(true)}>
            <Trash2 aria-hidden /> Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <GoalEditDialog
        goal={goal}
        lifeAreas={lifeAreas}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir meta?</DialogTitle>
            <DialogDescription>
              &quot;{goal.title}&quot; e todos os seus marcos serão removidos. Essa ação não pode
              ser desfeita.
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
