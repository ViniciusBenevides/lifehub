"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

export function SearchInput({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [text, setText] = React.useState(initialQuery);

  React.useEffect(() => {
    const handle = setTimeout(() => {
      const current = new URLSearchParams(window.location.search).get("q") ?? "";
      if (text === current) return;
      const params = new URLSearchParams(searchParams);
      if (text) params.set("q", text);
      else params.delete("q");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 300);
    return () => clearTimeout(handle);
  }, [text, pathname, router, searchParams]);

  return (
    <div className="relative">
      <Search
        className="absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Buscar tarefas e anotações..."
        aria-label="Buscar"
        autoFocus
        className="h-12 rounded-2xl pl-11 text-base"
      />
    </div>
  );
}
