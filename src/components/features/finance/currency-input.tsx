"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { formatBRL } from "@/lib/format";

type CurrencyInputProps = Omit<React.ComponentProps<typeof Input>, "value" | "onChange"> & {
  valueCents: number;
  onValueChange: (cents: number) => void;
};

/** Input monetário BRL: digita-se apenas dígitos, exibido como "R$ 1.234,56". */
export function CurrencyInput({ valueCents, onValueChange, ...props }: CurrencyInputProps) {
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const digits = event.target.value.replace(/\D/g, "").slice(0, 13);
    onValueChange(digits ? Number(digits) : 0);
  }

  return (
    <Input
      inputMode="numeric"
      value={valueCents > 0 ? formatBRL(valueCents) : ""}
      onChange={handleChange}
      placeholder="R$ 0,00"
      {...props}
    />
  );
}
