"use client";

import * as React from "react";
import {
  Check,
  CheckCircle2,
  MoreVertical,
  Plus,
  RotateCcw,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { formatBRL } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  createShoppingItemAction,
  createShoppingListAction,
  deleteShoppingItemAction,
  deleteShoppingListAction,
  updateShoppingItemAction,
  updateShoppingListAction,
} from "@/server/actions/shopping";
import type { ShoppingItem, ShoppingListWithItems } from "@/server/services/shopping";

/** Converte "12,50" / "12.50" / "12" em centavos (null quando vazio/inválido). */
function parsePriceToCents(value: string): number | null {
  const normalized = value.trim().replace(/\./g, "").replace(",", ".");
  if (!normalized) return null;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.round(parsed * 100);
}

function ItemRow({ item }: { item: ShoppingItem }) {
  async function toggle() {
    const result = await updateShoppingItemAction(item.id, { purchased: !item.purchased });
    if (!result.ok) toast.error(result.error);
  }

  async function remove() {
    const result = await deleteShoppingItemAction(item.id);
    if (!result.ok) toast.error(result.error);
  }

  return (
    <div className="group flex items-center gap-3 py-2">
      <button
        type="button"
        role="checkbox"
        aria-checked={item.purchased}
        aria-label={`Marcar ${item.name}`}
        onClick={toggle}
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-md border-2 transition-all active:scale-90",
          item.purchased
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-muted-foreground/40 text-transparent hover:border-emerald-500",
        )}
      >
        <Check className="size-3.5" strokeWidth={3} aria-hidden />
      </button>
      <p
        className={cn(
          "min-w-0 flex-1 truncate text-sm",
          item.purchased && "text-muted-foreground line-through",
        )}
      >
        {item.name}
        {item.quantity > 1 ? (
          <span className="ml-1.5 text-xs text-muted-foreground">×{item.quantity}</span>
        ) : null}
      </p>
      {item.priceCents != null ? (
        <p className="shrink-0 text-sm text-muted-foreground tabular-nums">
          {formatBRL(item.priceCents * item.quantity)}
        </p>
      ) : null}
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Excluir ${item.name}`}
        className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
        onClick={remove}
      >
        <Trash2 className="size-3.5" aria-hidden />
      </Button>
    </div>
  );
}

function AddItemRow({ listId }: { listId: string }) {
  const [name, setName] = React.useState("");
  const [quantity, setQuantity] = React.useState("1");
  const [price, setPrice] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function add() {
    if (!name.trim()) return;
    setSaving(true);
    const result = await createShoppingItemAction(listId, {
      name: name.trim(),
      quantity: Math.max(Number(quantity) || 1, 1),
      priceCents: parsePriceToCents(price),
    });
    setSaving(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setName("");
    setQuantity("1");
    setPrice("");
  }

  return (
    <div className="flex items-center gap-2 border-t pt-3">
      <Input
        value={name}
        placeholder="Adicionar item..."
        aria-label="Nome do item"
        onChange={(event) => setName(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            void add();
          }
        }}
        className="flex-1"
      />
      <Input
        value={quantity}
        type="number"
        min={1}
        aria-label="Quantidade"
        onChange={(event) => setQuantity(event.target.value)}
        className="w-16 text-center"
      />
      <Input
        value={price}
        placeholder="R$"
        inputMode="decimal"
        aria-label="Preço unitário"
        onChange={(event) => setPrice(event.target.value)}
        className="w-20"
      />
      <Button size="icon" aria-label="Adicionar item" onClick={add} disabled={saving}>
        <Plus aria-hidden />
      </Button>
    </div>
  );
}

function ListCard({ list }: { list: ShoppingListWithItems }) {
  async function toggleDone() {
    const result = await updateShoppingListAction(list.id, { done: !list.done });
    if (!result.ok) toast.error(result.error);
    else if (!list.done) toast.success("Lista concluída! 🛒");
  }

  async function remove() {
    const result = await deleteShoppingListAction(list.id);
    if (!result.ok) toast.error(result.error);
    else toast.success("Lista excluída.");
  }

  return (
    <Card className={cn("space-y-3 p-4", list.done && "opacity-70")}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className={cn("truncate font-semibold", list.done && "line-through")}>{list.name}</h3>
          <p className="text-xs text-muted-foreground">
            {list.purchasedCount}/{list.items.length} itens
            {list.totalCents > 0 ? (
              <>
                {" "}
                · comprado {formatBRL(list.purchasedCents)} de {formatBRL(list.totalCents)}
              </>
            ) : null}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={`Opções de ${list.name}`}>
              <MoreVertical className="size-4" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={toggleDone}>
              {list.done ? (
                <>
                  <RotateCcw aria-hidden /> Reabrir lista
                </>
              ) : (
                <>
                  <CheckCircle2 aria-hidden /> Concluir lista
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={remove}>
              <Trash2 aria-hidden /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {list.items.length > 0 ? (
        <div className="divide-y">
          {list.items.map((item) => (
            <ItemRow key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p className="py-2 text-center text-xs text-muted-foreground">Lista vazia.</p>
      )}

      {!list.done && <AddItemRow listId={list.id} />}
    </Card>
  );
}

export function ShoppingView({ lists }: { lists: ShoppingListWithItems[] }) {
  const [name, setName] = React.useState("");
  const [creating, setCreating] = React.useState(false);

  async function createList() {
    if (!name.trim()) return;
    setCreating(true);
    const result = await createShoppingListAction({ name: name.trim() });
    setCreating(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setName("");
    toast.success("Lista criada!");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex gap-2">
        <Input
          value={name}
          placeholder="Nova lista (ex.: Mercado da semana)"
          aria-label="Nome da nova lista"
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void createList();
            }
          }}
        />
        <Button onClick={createList} disabled={creating}>
          <Plus aria-hidden /> Criar
        </Button>
      </div>

      {lists.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia
              variant="icon"
              className="bg-yellow-500/15 text-yellow-600 dark:text-yellow-500"
            >
              <ShoppingCart aria-hidden />
            </EmptyMedia>
            <EmptyTitle>Nenhuma lista de compras</EmptyTitle>
            <EmptyDescription>
              Crie uma lista, adicione itens com preço e acompanhe o total no mercado.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent />
        </Empty>
      ) : (
        <div className="space-y-4">
          {lists.map((list) => (
            <ListCard key={list.id} list={list} />
          ))}
        </div>
      )}
    </div>
  );
}
