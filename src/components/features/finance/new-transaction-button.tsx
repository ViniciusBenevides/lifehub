"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { TransactionFormDialog } from "@/components/features/finance/transaction-form-dialog";
import { Button } from "@/components/ui/button";
import type { TransactionCategory } from "@/server/services/finance";

/** Botão de header (desktop) + FAB flutuante (mobile) para lançamento rápido. */
export function NewTransactionButton({ categories }: { categories: TransactionCategory[] }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <TransactionFormDialog
        categories={categories}
        open={open}
        onOpenChange={setOpen}
        trigger={
          <Button className="hidden sm:inline-flex">
            <Plus aria-hidden /> Nova transação
          </Button>
        }
      />
      <Button
        size="icon-lg"
        aria-label="Nova transação"
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-24 z-40 size-14 rounded-full shadow-lg sm:hidden"
      >
        <Plus className="size-6" aria-hidden />
      </Button>
    </>
  );
}
