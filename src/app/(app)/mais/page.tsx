import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { MORE_GROUPS } from "@/components/features/shell/nav-items";
import { PageHeader } from "@/components/features/shell/page-header";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Mais",
};

export default function MaisPage() {
  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Mais" description="Todos os módulos e configurações." />
      <div className="space-y-6">
        {MORE_GROUPS.map((group, index) => (
          <section key={group.label ?? index} aria-label={group.label ?? "Geral"}>
            {group.label ? (
              <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                {group.label}
              </h2>
            ) : null}
            <Card className="divide-y p-0">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors first:rounded-t-xl last:rounded-b-xl hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <item.icon className="size-4.5 text-muted-foreground" aria-hidden />
                  {item.label}
                  <ChevronRight className="ml-auto size-4 text-muted-foreground" aria-hidden />
                </Link>
              ))}
            </Card>
          </section>
        ))}
      </div>
    </div>
  );
}
