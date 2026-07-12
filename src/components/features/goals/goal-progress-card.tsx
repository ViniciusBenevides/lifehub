"use client";

import * as React from "react";
import { CheckCircle2, Minus, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/spinner";
import { fireCelebration } from "@/lib/confetti";
import { completeGoalAction, updateGoalProgressAction } from "@/server/actions/goals";
import type { GoalDetail } from "@/server/services/goals";

export function GoalProgressCard({ goal }: { goal: GoalDetail }) {
  const [percent, setPercent] = React.useState(goal.progressPercent);
  const [numericValue, setNumericValue] = React.useState(goal.currentValue);
  const [saving, setSaving] = React.useState(false);
  const [completing, setCompleting] = React.useState(false);
  const isActive = goal.status === "active";

  async function saveProgress(currentValue: number) {
    setSaving(true);
    const result = await updateGoalProgressAction(goal.id, { currentValue });
    setSaving(false);
    if (!result.ok) toast.error(result.error);
  }

  async function handleComplete() {
    setCompleting(true);
    const result = await completeGoalAction(goal.id);
    setCompleting(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    fireCelebration();
    toast.success("Meta concluída — parabéns! 🎉");
  }

  const displayPercent =
    goal.progressType === "manual_percent"
      ? percent
      : goal.progressType === "numeric" && goal.targetValue
        ? Math.min(100, Math.round((numericValue / goal.targetValue) * 100))
        : goal.progressPercent;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">Progresso</CardTitle>
        {saving ? <Spinner className="size-4" /> : null}
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-end justify-between">
          <span className="text-4xl font-semibold tabular-nums">{displayPercent}%</span>
          {goal.progressType === "numeric" && goal.targetValue ? (
            <span className="text-sm text-muted-foreground">
              {numericValue}/{goal.targetValue} {goal.unit ?? ""}
            </span>
          ) : null}
        </div>
        <Progress value={displayPercent} aria-label="Progresso da meta" />

        {isActive && goal.progressType === "manual_percent" && (
          <Slider
            value={[percent]}
            min={0}
            max={100}
            step={5}
            aria-label="Ajustar progresso"
            onValueChange={([value]) => setPercent(value)}
            onValueCommit={([value]) => saveProgress(value)}
          />
        )}

        {isActive && goal.progressType === "numeric" && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              aria-label="Diminuir"
              disabled={numericValue <= 0}
              onClick={() => {
                const next = Math.max(0, numericValue - 1);
                setNumericValue(next);
                saveProgress(next);
              }}
            >
              <Minus aria-hidden />
            </Button>
            <Input
              type="number"
              className="w-24 text-center tabular-nums"
              value={numericValue}
              min={0}
              aria-label="Valor atual"
              onChange={(event) => setNumericValue(Math.max(0, Number(event.target.value) || 0))}
              onBlur={() => saveProgress(numericValue)}
            />
            <Button
              variant="outline"
              size="icon"
              aria-label="Aumentar"
              onClick={() => {
                const next = numericValue + 1;
                setNumericValue(next);
                saveProgress(next);
              }}
            >
              <Plus aria-hidden />
            </Button>
          </div>
        )}

        {isActive && (
          <Button className="w-full" onClick={handleComplete} disabled={completing}>
            {completing ? <Spinner /> : <CheckCircle2 aria-hidden />}
            Concluir meta
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
