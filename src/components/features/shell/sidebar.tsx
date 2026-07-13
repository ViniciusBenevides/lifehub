"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Orbit, PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { NAV_ITEMS } from "@/components/features/shell/nav-items";
import { UserMenu, type ShellUser } from "@/components/features/shell/user-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSidebarStore } from "@/hooks/use-sidebar-store";
import { cn } from "@/lib/utils";

export function AppSidebar({ user }: { user: ShellUser }) {
  const pathname = usePathname();
  const collapsed = useSidebarStore((state) => state.collapsed);
  const toggle = useSidebarStore((state) => state.toggle);

  // Rehidrata a preferência persistida após a montagem (evita mismatch de SSR).
  React.useEffect(() => {
    void useSidebarStore.persist.rehydrate();
  }, []);

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground transition-[width] duration-200 md:flex",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <div className={cn("flex items-center gap-2 px-3 py-4", collapsed && "justify-center px-0")}>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Orbit className="size-4" aria-hidden />
        </span>
        {!collapsed && <span className="text-lg font-semibold tracking-tight">LifeHub</span>}
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2" aria-label="Navegação principal">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          const link = (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                collapsed && "justify-center px-0",
              )}
            >
              <item.icon className="size-4.5 shrink-0" aria-hidden />
              {!collapsed && item.label}
            </Link>
          );

          if (!collapsed) {
            return link;
          }
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>{link}</TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      <div className="flex flex-col gap-1 border-t p-2">
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors",
            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            collapsed && "justify-center px-0",
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4.5" aria-hidden />
          ) : (
            <>
              <PanelLeftClose className="size-4.5" aria-hidden />
              Recolher
            </>
          )}
        </button>
        <UserMenu user={user} collapsed={collapsed} />
      </div>
    </aside>
  );
}
