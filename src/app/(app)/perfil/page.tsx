import type { Metadata } from "next";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { SignOutButton } from "@/components/features/auth/sign-out-button";
import { PageHeader } from "@/components/features/shell/page-header";
import { ThemeToggle } from "@/components/features/shell/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { requireUser } from "@/server/session";

export const metadata: Metadata = {
  title: "Perfil",
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

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Perfil" description="Sua conta e preferências." />
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="size-14">
            <AvatarImage src={user.image ?? undefined} alt="" />
            <AvatarFallback className="text-lg">{initials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <CardTitle className="truncate">{user.name}</CardTitle>
            <CardDescription className="truncate">{user.email}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Membro desde {format(user.createdAt, "MMMM 'de' yyyy", { locale: ptBR })}
          </p>
          <Separator />
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Tema</p>
              <p className="text-sm text-muted-foreground">Claro, escuro ou seguir o sistema.</p>
            </div>
            <ThemeToggle />
          </div>
          <Separator />
          <SignOutButton />
        </CardContent>
      </Card>
    </div>
  );
}
