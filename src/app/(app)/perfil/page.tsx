import type { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Flame, Lock, Palette, Sparkles, Trophy } from "lucide-react";

import { SignOutButton } from "@/components/features/auth/sign-out-button";
import { PageHeader } from "@/components/features/shell/page-header";
import { ThemeToggle } from "@/components/features/shell/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { getGamification } from "@/server/services/gamification";
import { requireUser } from "@/server/session";

export const metadata: Metadata = {
  title: "Perfil & Conquistas",
};

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default async function PerfilPage() {
  const user = await requireUser();
  const gamification = await getGamification(user.id, new Date());
  const { level } = gamification;
  const xpIntoLevel = level.totalXp - level.levelStartXp;
  const xpNeeded = level.nextLevelXp - level.levelStartXp;
  const xpPercent = xpNeeded > 0 ? Math.round((xpIntoLevel / xpNeeded) * 100) : 0;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader title="Perfil & Conquistas" description="Seu progresso, conta e preferências." />

      <Card className="overflow-hidden p-0">
        <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-5">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 border-2 border-primary/30">
              <AvatarImage src={user.image ?? undefined} alt="" />
              <AvatarFallback className="text-xl">{initials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-bold">{user.name}</p>
              <p className="truncate text-sm text-muted-foreground">{user.email}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Membro desde {format(user.createdAt, "MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/15 px-3 py-1 text-sm font-bold text-amber-600 dark:text-amber-400">
                <Trophy className="size-4" aria-hidden /> Nv {level.level}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Flame className="size-3.5 text-orange-500" aria-hidden />
                {gamification.activityStreak} dia{gamification.activityStreak === 1 ? "" : "s"}
              </span>
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium">
                <Sparkles className="size-3.5 text-primary" aria-hidden />
                {level.totalXp} XP total
              </span>
              <span className="text-muted-foreground">
                {xpIntoLevel}/{xpNeeded} XP para o nível {level.level + 1}
              </span>
            </div>
            <Progress value={xpPercent} aria-label="Progresso de XP no nível atual" />
          </div>
        </div>
      </Card>

      <section aria-label="Conquistas" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight">Conquistas</h2>
          <span className="text-sm text-muted-foreground">
            {gamification.unlockedCount}/{gamification.achievements.length} desbloqueadas
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {gamification.achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={cn(
                "relative flex flex-col items-center gap-1.5 rounded-2xl border p-4 text-center transition-all",
                achievement.unlocked
                  ? "border-amber-500/30 bg-amber-500/5"
                  : "opacity-60 grayscale",
              )}
            >
              {!achievement.unlocked && (
                <Lock
                  className="absolute top-2.5 right-2.5 size-3.5 text-muted-foreground"
                  aria-hidden
                />
              )}
              <span className="text-3xl" aria-hidden>
                {achievement.icon}
              </span>
              <p className="text-sm font-semibold">{achievement.title}</p>
              <p className="text-xs leading-tight text-muted-foreground">
                {achievement.description}
              </p>
              {!achievement.unlocked && (
                <p className="text-[11px] font-medium text-muted-foreground">
                  {achievement.current}/{achievement.target}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preferências</CardTitle>
          <CardDescription>Aparência e conta.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Tema</p>
              <p className="text-sm text-muted-foreground">Claro, escuro ou seguir o sistema.</p>
            </div>
            <ThemeToggle />
          </div>
          <Button asChild variant="outline" className="w-full">
            <Link href="/temas">
              <Palette aria-hidden /> Galeria de temas (6 estilos)
            </Link>
          </Button>
          <Separator />
          <SignOutButton />
        </CardContent>
      </Card>
    </div>
  );
}
