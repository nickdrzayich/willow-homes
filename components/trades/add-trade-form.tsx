"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { createTrade } from "@/lib/actions/trades";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AddTradeForm({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const action = createTrade.bind(null, projectId);

  if (!open) {
    return (
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        <Plus className="mr-1 h-4 w-4" /> Add product/service
      </Button>
    );
  }

  return (
    <form
      action={async (formData) => {
        await action(formData);
        setOpen(false);
      }}
      className="flex flex-wrap items-end gap-2 rounded-lg border p-3"
    >
      <div className="flex-1 min-w-[200px]">
        <Input name="name" placeholder="Product/service name (e.g. Roofing)" required autoFocus />
      </div>
      <div className="w-24">
        <Input name="qty" type="number" step="1" min="0" placeholder="Qty" defaultValue={1} />
      </div>
      <Button type="submit">Add</Button>
      <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
        Cancel
      </Button>
    </form>
  );
}
