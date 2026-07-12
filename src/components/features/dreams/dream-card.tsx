"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  MoreVertical,
  PartyPopper,
  Pencil,
  Rocket,
  Sparkles,
  Target,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { ConvertDreamDialog } from "@/components/features/dreams/convert-dream-dialog";
import { DreamFormDialog } from "@/components/features/dreams/dream-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { fireCelebration } from "@/lib/confetti";
import { deadlineLabel, formatBRL } from "@/lib/format";
import { cn } from "@/lib/utils";
import { deleteDreamAction, updateDreamAction } from "@/server/actions/dreams";
import type { DreamWithGoal } from "@/server/services/dreams";
import type { LifeArea } from "@/server/services/goals";

const STATUS_LABELS = {
  dreaming: "Sonhando",
  in_progress: "Em progresso",
  achieved: "Realizado",
} as const;

export function DreamCard({
  dream,
  lifeAreas,
  dragHandle,
}: {
  dream: DreamWithGoal;
  lifeAreas: LifeArea[];
  dragHandle?: React.ReactNode;
}) {
  const [editOpen, setEditOpen] = React.useState(false);
  const [convertOpen, setConvertOpen] = React.useState(false);

  async function setStatus(status: "dreaming" | "in_progress" | "achieved") {
    const result = await updateDreamAction(dream.id, { status });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    if (status === "achieved") {
      fireCelebration();
      toast.success("Sonho realizado — que momento! 🎉");
    }
  }

  async function handleDelete() {
    const result = await deleteDreamAction(dream.id);
    if (!result.ok) toast.error(result.error);
    else toast.success("Sonho removido.");
  }

  return (
    <Card className={cn("gap-0 overflow-hidden p-0", dream.status === "achieved" && "opacity-90")}>
      <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-primary/25 via-primary/10 to-transparent">
        {dream.imageUrl ? (
          <Image
            src={dream.imageUrl}
            alt=""
            fill
            unoptimized
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 33vw"
          />
        ) : (
          <Sparkles className="absolute inset-0 m-auto size-10 text-primary/50" aria-hidden />
        )}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2">
          <Badge
            variant="secondary"
            className={cn(
              "backdrop-blur",
              dream.status === "achieved" && "bg-emerald-500/90 text-white",
              dream.status === "in_progress" && "bg-primary/90 text-primary-foreground",
            )}
          >
            {dream.status === "achieved" && <PartyPopper className="size-3" aria-hidden />}
            {STATUS_LABELS[dream.status]}
          </Badge>
          <div className="flex items-center gap-1">
            {dragHandle}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon-sm"
                  className="backdrop-blur"
                  aria-label={`Ações de ${dream.title}`}
                >
                  <MoreVertical className="size-4" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Pencil aria-hidden /> Editar
                </DropdownMenuItem>
                {!dream.linkedGoalId && (
                  <DropdownMenuItem onClick={() => setConvertOpen(true)}>
                    <Target aria-hidden /> Transformar em meta
                  </DropdownMenuItem>
                )}
                {dream.status !== "in_progress" && dream.status !== "achieved" && (
                  <DropdownMenuItem onClick={() => setStatus("in_progress")}>
                    <Rocket aria-hidden /> Começar a realizar
                  </DropdownMenuItem>
                )}
                {dream.status !== "achieved" && (
                  <DropdownMenuItem onClick={() => setStatus("achieved")}>
                    <PartyPopper aria-hidden /> Marcar como realizado
                  </DropdownMenuItem>
                )}
                {dream.status === "achieved" && (
                  <DropdownMenuItem onClick={() => setStatus("dreaming")}>
                    <Sparkles aria-hidden /> Voltar para o mural
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleDelete}>
                  <Trash2 aria-hidden /> Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="space-y-2 p-4">
        <h3 className="line-clamp-2 font-medium">{dream.title}</h3>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {dream.estimatedCostCents ? (
            <span className="font-medium text-foreground tabular-nums">
              {formatBRL(dream.estimatedCostCents)}
            </span>
          ) : null}
          {dream.targetDate && dream.status !== "achieved" ? (
            <span className="flex items-center gap-1">
              <CalendarDays className="size-3.5" aria-hidden />
              {deadlineLabel(dream.targetDate)}
            </span>
          ) : null}
        </div>
        {dream.linkedGoalId && dream.goalProgress != null && (
          <Link href={`/metas/${dream.linkedGoalId}`} className="block space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Economia</span>
              <span className="font-medium tabular-nums">{dream.goalProgress}%</span>
            </div>
            <Progress value={dream.goalProgress} aria-label="Progresso de economia" />
          </Link>
        )}
      </div>

      <DreamFormDialog dream={dream} open={editOpen} onOpenChange={setEditOpen} />
      <ConvertDreamDialog
        dream={dream}
        lifeAreas={lifeAreas}
        open={convertOpen}
        onOpenChange={setConvertOpen}
      />
    </Card>
  );
}
