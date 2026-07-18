"use client";

import { useState, type ReactElement } from "react";
import { createTransaction, updateTransaction } from "@/lib/actions/transactions";
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
import type { TransactionType } from "@/lib/types";

export interface EditableTransaction {
  id: string;
  transaction_date: string;
  type: TransactionType;
  amount: number;
  description: string | null;
}

export function TransactionForm({
  projectId,
  transaction,
  defaultType,
  trigger,
}: {
  projectId: string;
  transaction?: EditableTransaction;
  defaultType?: TransactionType;
  trigger: ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const action = transaction
    ? updateTransaction.bind(null, projectId, transaction.id)
    : createTransaction.bind(null, projectId);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{transaction ? "Edit entry" : "Add entry"}</DialogTitle>
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
              <Label htmlFor="transactionDate">Date</Label>
              <Input
                id="transactionDate"
                name="transactionDate"
                type="date"
                defaultValue={transaction?.transaction_date ?? today}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="type">Type</Label>
              <Select name="type" defaultValue={transaction?.type ?? defaultType ?? "deposit"}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="withdrawal">Withdrawal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0"
              defaultValue={transaction?.amount ?? ""}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={transaction?.description ?? ""}
              rows={2}
              placeholder="e.g. Mobilization deposit, Kyles Cabs payment"
            />
          </div>
          <Button type="submit">{transaction ? "Save entry" : "Add entry"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
