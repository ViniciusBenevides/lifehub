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
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { toast } from "sonner";

import { DreamCard } from "@/components/features/dreams/dream-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { reorderDreamsAction } from "@/server/actions/dreams";
import type { DreamWithGoal } from "@/server/services/dreams";
import type { LifeArea } from "@/server/services/goals";

function SortableDream({ dream, lifeAreas }: { dream: DreamWithGoal; lifeAreas: LifeArea[] }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: dream.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && "z-10 opacity-80")}
    >
      <DreamCard
        dream={dream}
        lifeAreas={lifeAreas}
        dragHandle={
          <Button
            variant="secondary"
            size="icon-sm"
            className="cursor-grab touch-none backdrop-blur"
            aria-label={`Reordenar ${dream.title}`}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" aria-hidden />
          </Button>
        }
      />
    </div>
  );
}

export function DreamsBoard({
  dreams: initial,
  lifeAreas,
}: {
  dreams: DreamWithGoal[];
  lifeAreas: LifeArea[];
}) {
  const [dreams, setDreams] = React.useState(initial);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  // Re-sincroniza quando o servidor revalida (ajuste de estado durante o render).
  const [prevInitial, setPrevInitial] = React.useState(initial);
  if (prevInitial !== initial) {
    setPrevInitial(initial);
    setDreams(initial);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = dreams.findIndex((dream) => dream.id === active.id);
    const newIndex = dreams.findIndex((dream) => dream.id === over.id);
    const reordered = arrayMove(dreams, oldIndex, newIndex);
    setDreams(reordered);
    const result = await reorderDreamsAction({ orderedIds: reordered.map((dream) => dream.id) });
    if (!result.ok) toast.error(result.error);
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={dreams.map((dream) => dream.id)} strategy={rectSortingStrategy}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dreams.map((dream) => (
            <SortableDream key={dream.id} dream={dream} lifeAreas={lifeAreas} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
