"use client";

import * as React from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  addMilestoneAction,
  deleteMilestoneAction,
  reorderMilestonesAction,
  updateMilestoneAction,
} from "@/server/actions/goals";
import type { GoalMilestone } from "@/server/services/goals";

function SortableMilestone({
  milestone,
  onToggle,
  onDelete,
}: {
  milestone: GoalMilestone;
  onToggle: (done: boolean) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: milestone.id,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-2 rounded-xl border bg-card px-2 py-1.5",
        isDragging && "z-10 opacity-80 shadow-md",
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none p-1 text-muted-foreground hover:text-foreground"
        aria-label={`Reordenar ${milestone.title}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" aria-hidden />
      </button>
      <Checkbox
        id={`milestone-${milestone.id}`}
        checked={milestone.done}
        onCheckedChange={(checked) => onToggle(checked === true)}
      />
      <label
        htmlFor={`milestone-${milestone.id}`}
        className={cn(
          "flex-1 cursor-pointer py-1 text-sm",
          milestone.done && "text-muted-foreground line-through",
        )}
      >
        {milestone.title}
      </label>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Excluir ${milestone.title}`}
        onClick={onDelete}
      >
        <Trash2 className="size-4" aria-hidden />
      </Button>
    </li>
  );
}

export function MilestonesEditor({
  goalId,
  milestones: initial,
}: {
  goalId: string;
  milestones: GoalMilestone[];
}) {
  const [milestones, setMilestones] = React.useState(initial);
  const [newTitle, setNewTitle] = React.useState("");
  const [adding, setAdding] = React.useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  // Re-sincroniza quando o servidor revalida (ajuste de estado durante o render).
  const [prevInitial, setPrevInitial] = React.useState(initial);
  if (prevInitial !== initial) {
    setPrevInitial(initial);
    setMilestones(initial);
  }

  async function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    if (!newTitle.trim()) return;
    setAdding(true);
    const result = await addMilestoneAction(goalId, { title: newTitle.trim() });
    setAdding(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setMilestones((current) => [...current, result.data]);
    setNewTitle("");
  }

  async function handleToggle(milestone: GoalMilestone, done: boolean) {
    setMilestones((current) => current.map((m) => (m.id === milestone.id ? { ...m, done } : m)));
    const result = await updateMilestoneAction(goalId, milestone.id, { done });
    if (!result.ok) {
      setMilestones((current) =>
        current.map((m) => (m.id === milestone.id ? { ...m, done: !done } : m)),
      );
      toast.error(result.error);
    }
  }

  async function handleDelete(milestone: GoalMilestone) {
    const previous = milestones;
    setMilestones((current) => current.filter((m) => m.id !== milestone.id));
    const result = await deleteMilestoneAction(goalId, milestone.id);
    if (!result.ok) {
      setMilestones(previous);
      toast.error(result.error);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = milestones.findIndex((m) => m.id === active.id);
    const newIndex = milestones.findIndex((m) => m.id === over.id);
    const reordered = arrayMove(milestones, oldIndex, newIndex);
    setMilestones(reordered);
    const result = await reorderMilestonesAction(goalId, {
      orderedIds: reordered.map((m) => m.id),
    });
    if (!result.ok) toast.error(result.error);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Marcos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {milestones.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={milestones.map((m) => m.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="space-y-2">
                {milestones.map((milestone) => (
                  <SortableMilestone
                    key={milestone.id}
                    milestone={milestone}
                    onToggle={(done) => handleToggle(milestone, done)}
                    onDelete={() => handleDelete(milestone)}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        ) : (
          <p className="text-sm text-muted-foreground">
            Quebre a meta em passos menores — o progresso é calculado automaticamente.
          </p>
        )}

        <form onSubmit={handleAdd} className="flex gap-2">
          <Input
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            placeholder="Novo marco…"
            aria-label="Título do novo marco"
          />
          <Button
            type="submit"
            size="icon"
            disabled={adding || !newTitle.trim()}
            aria-label="Adicionar marco"
          >
            <Plus aria-hidden />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
