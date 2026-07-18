"use client";

import { useState, type ReactElement } from "react";
import { createExpense, updateExpense } from "@/lib/actions/expenses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EXPENSE_CATEGORY_META } from "@/lib/calculations";
import type { ExpenseCategory } from "@/lib/types";

export interface EditableExpense {
  id: string;
  expense_date: string;
  category: ExpenseCategory;
  vendor_name: string | null;
  description: string | null;
  amount: number;
  billable: boolean;
  invoice_file_name: string | null;
}

export function ExpenseForm({
  projectId,
  expense,
  trigger,
}: {
  projectId: string;
  expense?: EditableExpense;
  trigger: ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const action = expense
    ? updateExpense.bind(null, projectId, expense.id)
    : createExpense.bind(null, projectId);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{expense ? "Edit expense" : "Add expense"}</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            await action(formData);
            setOpen(false);
          }}
          className="flex flex-col gap-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="expenseDate">Date</Label>
              <Input
                id="expenseDate"
                name="expenseDate"
                type="date"
                defaultValue={expense?.expense_date ?? today}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue={expense?.category ?? "subcontractor"}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(EXPENSE_CATEGORY_META) as [ExpenseCategory, { label: string }][]).map(
                    ([value, meta]) => (
                      <SelectItem key={value} value={value}>
                        {meta.label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="vendorName">Vendor / subcontractor</Label>
            <Input
              id="vendorName"
              name="vendorName"
              defaultValue={expense?.vendor_name ?? ""}
              placeholder="e.g. Kyles Cabs, City of Emmett"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={expense?.description ?? ""} rows={2} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0"
              defaultValue={expense?.amount ?? ""}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="invoiceFile">
              Vendor invoice / receipt{expense?.invoice_file_name ? ` (replace "${expense.invoice_file_name}")` : ""}
            </Label>
            <Input id="invoiceFile" name="invoiceFile" type="file" accept="image/*,.pdf" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="billable"
              defaultChecked={expense?.billable ?? true}
              className="h-4 w-4 rounded border-input"
            />
            Billable to owner (uncheck for subcontractor-covered corrective work)
          </label>
          <Button type="submit">{expense ? "Save expense" : "Add expense"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
