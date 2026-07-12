"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function AppRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TriangleAlert aria-hidden />
        </EmptyMedia>
        <EmptyTitle>Algo deu errado</EmptyTitle>
        <EmptyDescription>
          Não conseguimos carregar esta tela. Verifique sua conexão e tente novamente.
          {error.digest ? ` (código ${error.digest})` : ""}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={reset}>
          <RotateCcw aria-hidden /> Tentar novamente
        </Button>
      </EmptyContent>
    </Empty>
  );
}
