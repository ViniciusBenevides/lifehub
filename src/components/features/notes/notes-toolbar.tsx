"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { NOTE_CATEGORY_META } from "@/shared/constants/notes";
import { noteCategoryValues } from "@/shared/schemas/notes";

export function NotesToolbar({
  category,
  search,
}: {
  category: string | undefined;
  search: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [text, setText] = React.useState(search);

  function replaceParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams);
    mutate(params);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  // Busca com debounce leve.
  React.useEffect(() => {
    const handle = setTimeout(() => {
      const current = new URLSearchParams(window.location.search).get("busca") ?? "";
      if (text === current) return;
      const params = new URLSearchParams(window.location.search);
      if (text) params.set("busca", text);
      else params.delete("busca");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 350);
    return () => clearTimeout(handle);
  }, [text, pathname, router]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search
          className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Buscar anotações..."
          className="pl-9"
          aria-label="Buscar anotações"
        />
      </div>
      <div className="flex w-fit max-w-full [scrollbar-width:none] gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          aria-pressed={!category}
          onClick={() => replaceParams((params) => params.delete("categoria"))}
          className={cn(
            "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
            !category
              ? "border-transparent bg-primary/15 text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          Todas
        </button>
        {noteCategoryValues.map((value) => {
          const meta = NOTE_CATEGORY_META[value];
          const active = category === value;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={active}
              onClick={() => replaceParams((params) => params.set("categoria", value))}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "border-transparent text-white"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
              style={active ? { backgroundColor: meta.color } : undefined}
            >
              {meta.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
