"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { DreamFormDialog } from "@/components/features/dreams/dream-form-dialog";
import { Button } from "@/components/ui/button";

export function NewDreamButton() {
  const [open, setOpen] = React.useState(false);

  return (
    <DreamFormDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button>
          <Plus aria-hidden /> Novo sonho
        </Button>
      }
    />
  );
}
