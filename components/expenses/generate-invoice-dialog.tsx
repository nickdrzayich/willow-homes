"use client";

import { useState, type ReactElement } from "react";
import { generateMonthlyInvoice } from "@/lib/actions/expenses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function previousMonthValue() {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function GenerateInvoiceDialog({ projectId, trigger }: { projectId: string; trigger: ReactElement }) {
  const [open, setOpen] = useState(false);
  const action = generateMonthlyInvoice.bind(null, projectId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate monthly invoice</DialogTitle>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Pulls every billable expense logged in the selected month that hasn&apos;t already been included on
            another invoice, applies the project&apos;s builder fee, and creates the itemized report.
          </p>
          <div className="flex flex-col gap-2">
            <Label htmlFor="month">Month</Label>
            <Input id="month" name="month" type="month" defaultValue={previousMonthValue()} required />
          </div>
          <Button type="submit">Generate</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
