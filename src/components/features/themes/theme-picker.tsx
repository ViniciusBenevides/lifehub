"use client";

import * as React from "react";
import { Calendar, Check, ChevronLeft, ChevronRight, Trophy } from "lucide-react";
import { useTheme } from "next-themes";

import {
  applyColorTheme,
  getColorThemeSnapshot,
  getServerColorThemeSnapshot,
  subscribeColorTheme,
} from "@/lib/color-theme";
import { cn } from "@/lib/utils";
import { THEMES, type ThemeDefinition } from "@/shared/constants/themes";

const emptySubscribe = () => () => {};

/** Fake task list rendered with the theme's own swatches (like the reference app). */
function ThemePreviewCard({ theme }: { theme: ThemeDefinition }) {
  const { preview } = theme;
  return (
    <div
      className="mx-auto w-full max-w-sm rounded-3xl border-2 p-5 shadow-xl transition-colors"
      style={{ backgroundColor: preview.background, borderColor: preview.primary }}
    >
      <div className="mb-4 flex items-center justify-between">
        <span
          className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
          style={{ backgroundColor: `${preview.primary}26`, color: preview.primary }}
        >
          <Trophy className="size-3.5" aria-hidden /> Nv 5
        </span>
        <Calendar className="size-5" style={{ color: preview.muted }} aria-hidden />
      </div>

      <div
        className="mb-3 flex items-center gap-3 rounded-2xl border p-3.5"
        style={{ backgroundColor: preview.card, borderColor: preview.border }}
      >
        <span
          className="grid size-10 shrink-0 place-items-center rounded-xl"
          style={{ backgroundColor: `${preview.primary}26`, color: preview.primary }}
        >
          <Check className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold" style={{ color: preview.foreground }}>
            Minha Tarefa
          </p>
          <p className="text-xs" style={{ color: preview.muted }}>
            Hoje às 14:00
          </p>
        </div>
        <span className="size-4.5 rounded-[5px] border-2" style={{ borderColor: preview.muted }} />
      </div>

      <div className="space-y-2">
        {[
          { label: "Reunião de equipe", done: true },
          { label: "Revisar código", done: false },
          { label: "Atualizar documentação", done: false },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-xl border px-3.5 py-2.5"
            style={{ backgroundColor: preview.card, borderColor: preview.border }}
          >
            <span
              className="grid size-4.5 shrink-0 place-items-center rounded-[5px] border-2"
              style={
                item.done
                  ? { backgroundColor: "#22c55e", borderColor: "#22c55e", color: "#fff" }
                  : { borderColor: preview.muted }
              }
            >
              {item.done ? <Check className="size-3" aria-hidden /> : null}
            </span>
            <span
              className={cn("truncate text-sm", item.done && "line-through")}
              style={{ color: item.done ? preview.muted : preview.foreground }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Horizontal snap carousel of themes with live preview, like the reference app. */
export function ThemePicker() {
  const { setTheme } = useTheme();
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const current = React.useSyncExternalStore(
    subscribeColorTheme,
    getColorThemeSnapshot,
    getServerColorThemeSnapshot,
  );

  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const [index, setIndex] = React.useState(0);

  const scrollTo = React.useCallback((next: number) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const clamped = Math.max(0, Math.min(THEMES.length - 1, next));
    scroller.scrollTo({ left: clamped * scroller.clientWidth, behavior: "smooth" });
  }, []);

  function handleScroll() {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const next = Math.round(scroller.scrollLeft / scroller.clientWidth);
    if (next !== index) setIndex(next);
  }

  function apply(theme: ThemeDefinition) {
    setTheme(theme.mode);
    applyColorTheme(theme.id);
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden"
        aria-label="Galeria de temas"
      >
        {THEMES.map((theme) => {
          const active = mounted && current === theme.id;
          return (
            <section
              key={theme.id}
              className="flex w-full shrink-0 snap-center flex-col items-center gap-6 px-2 py-4"
              aria-label={theme.label}
            >
              <ThemePreviewCard theme={theme} />
              <div className="text-center">
                <h2 className="text-2xl font-bold tracking-tight">{theme.label}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{theme.description}</p>
              </div>
              <button
                type="button"
                onClick={() => apply(theme)}
                disabled={active}
                className={cn(
                  "w-full max-w-sm rounded-2xl px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-all",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  active ? "opacity-70" : "hover:brightness-110 active:scale-[0.98]",
                )}
                style={{ backgroundColor: theme.preview.primary }}
              >
                {active ? "Tema Atual" : "Aplicar Tema"}
              </button>
            </section>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => scrollTo(index - 1)}
        aria-label="Tema anterior"
        className={cn(
          "absolute top-1/3 left-0 hidden size-10 -translate-y-1/2 place-items-center rounded-full border bg-card/80 text-muted-foreground backdrop-blur transition-colors hover:text-foreground md:grid",
          index === 0 && "pointer-events-none opacity-30",
        )}
      >
        <ChevronLeft className="size-5" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => scrollTo(index + 1)}
        aria-label="Próximo tema"
        className={cn(
          "absolute top-1/3 right-0 hidden size-10 -translate-y-1/2 place-items-center rounded-full border bg-card/80 text-muted-foreground backdrop-blur transition-colors hover:text-foreground md:grid",
          index === THEMES.length - 1 && "pointer-events-none opacity-30",
        )}
      >
        <ChevronRight className="size-5" aria-hidden />
      </button>

      <div
        className="mt-2 flex items-center justify-center gap-2"
        role="tablist"
        aria-label="Temas"
      >
        {THEMES.map((theme, themeIndex) => (
          <button
            key={theme.id}
            type="button"
            role="tab"
            aria-selected={themeIndex === index}
            aria-label={theme.label}
            onClick={() => scrollTo(themeIndex)}
            className={cn(
              "h-2 rounded-full transition-all",
              themeIndex === index
                ? "w-6 bg-primary"
                : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50",
            )}
          />
        ))}
      </div>
    </div>
  );
}
