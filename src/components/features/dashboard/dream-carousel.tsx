import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import { formatBRL } from "@/lib/format";
import type { DreamWithGoal } from "@/server/services/dreams";

/** Carrossel horizontal de sonhos em destaque (scroll com snap). */
export function DreamCarousel({ dreams }: { dreams: DreamWithGoal[] }) {
  if (dreams.length === 0) return null;

  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
      <ul className="flex snap-x snap-mandatory gap-3">
        {dreams.map((dream) => (
          <li key={dream.id} className="w-40 shrink-0 snap-start">
            <Link
              href="/sonhos"
              className="block overflow-hidden rounded-2xl border transition-colors hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <div className="relative aspect-[4/3] bg-gradient-to-br from-primary/25 via-primary/10 to-transparent">
                {dream.imageUrl ? (
                  <Image
                    src={dream.imageUrl}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="160px"
                  />
                ) : (
                  <Sparkles
                    className="absolute inset-0 m-auto size-6 text-primary/50"
                    aria-hidden
                  />
                )}
              </div>
              <div className="p-2.5">
                <p className="truncate text-sm font-medium">{dream.title}</p>
                {dream.estimatedCostCents ? (
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {formatBRL(dream.estimatedCostCents)}
                  </p>
                ) : null}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
