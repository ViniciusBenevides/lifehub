import type { Metadata } from "next";

import { ShoppingView } from "@/components/features/shopping/shopping-view";
import { PageHeader } from "@/components/features/shell/page-header";
import { listShoppingLists } from "@/server/services/shopping";
import { requireUser } from "@/server/session";

export const metadata: Metadata = {
  title: "Compras",
};

export default async function ComprasPage() {
  const user = await requireUser();
  const lists = await listShoppingLists(user.id);

  return (
    <>
      <PageHeader title="Compras" description="Listas de compras com preços e total estimado." />
      <ShoppingView lists={lists} />
    </>
  );
}
