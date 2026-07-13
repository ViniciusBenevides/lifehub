"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type SidebarState = {
  collapsed: boolean;
  toggle: () => void;
};

/**
 * Estado efêmero de UI da sidebar (recolhida/expandida), persistido no
 * localStorage. `skipHydration` evita divergência com o HTML do servidor —
 * o componente chama `rehydrate()` após montar.
 */
export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      toggle: () => set((state) => ({ collapsed: !state.collapsed })),
    }),
    { name: "lifehub-sidebar", skipHydration: true },
  ),
);
