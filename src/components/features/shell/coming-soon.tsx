import { Construction } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function ComingSoon({ module: moduleName }: { module: string }) {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Construction aria-hidden />
        </EmptyMedia>
        <EmptyTitle>Em construção</EmptyTitle>
        <EmptyDescription>
          O módulo de {moduleName} chega nas próximas fases do LifeHub.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
