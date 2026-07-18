"use client";

import { useMemo, useState } from "react";
import { Pencil, Trash2, FileText, Receipt } from "lucide-react";
import { deleteExpense, toggleExpensePaid } from "@/lib/actions/expenses";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { EXPENSE_CATEGORY_META, formatCurrencyPrecise } from "@/lib/calculations";
import { cn } from "@/lib/utils";
import type { ExpenseCategory, ExpensePaidStatus } from "@/lib/types";

export interface ExpenseListItem {
  id: string;
  expense_date: string;
  category: ExpenseCategory;
  vendor_name: string | null;
  description: string | null;
  amount: number;
  billable: boolean;
  paid_status: ExpensePaidStatus;
  invoice_file_name: string | null;
  fileUrl: string | null;
  invoiced: boolean;
}

export function ExpenseTable({ projectId, expenses }: { projectId: string; expenses: ExpenseListItem[] }) {
  const [category, setCategory] = useState<string>("all");
  const [paidStatus, setPaidStatus] = useState<string>("all");

  const visible = useMemo(
    () =>
      expenses
        .filter((e) => category === "all" || e.category === category)
        .filter((e) => paidStatus === "all" || e.paid_status === paidStatus)
        .sort((a, b) => b.expense_date.localeCompare(a.expense_date)),
    [expenses, category, paidStatus]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <Select value={category} onValueChange={(value) => setCategory(value ?? "all")}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {(Object.entries(EXPENSE_CATEGORY_META) as [ExpenseCategory, { label: string }][]).map(
              ([value, meta]) => (
                <SelectItem key={value} value={value}>
                  {meta.label}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
        <Select value={paidStatus} onValueChange={(value) => setPaidStatus(value ?? "all")}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Paid + unpaid</SelectItem>
            <SelectItem value="unpaid">Unpaid only</SelectItem>
            <SelectItem value="paid">Paid only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!visible.length ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
            <Receipt className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              {expenses.length === 0
                ? "No expenses logged yet."
                : "No expenses match your filters."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Billable</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>File</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="text-muted-foreground">{expense.expense_date}</TableCell>
                <TableCell>{EXPENSE_CATEGORY_META[expense.category].label}</TableCell>
                <TableCell>{expense.vendor_name ?? "—"}</TableCell>
                <TableCell className="max-w-64 truncate">{expense.description ?? "—"}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrencyPrecise(expense.amount)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {expense.billable ? (
                      <Badge variant="outline">Billable</Badge>
                    ) : (
                      <Badge variant="secondary">Not billed</Badge>
                    )}
                    {expense.invoiced && <Badge variant="secondary">Invoiced</Badge>}
                  </div>
                </TableCell>
                <TableCell>
                  <form action={toggleExpensePaid.bind(null, projectId, expense.id, expense.paid_status)}>
                    <button
                      type="submit"
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-xs font-medium",
                        expense.paid_status === "paid"
                          ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : "border-amber-500/30 bg-amber-400/20 text-amber-700 dark:text-amber-300"
                      )}
                    >
                      {expense.paid_status === "paid" ? "Paid" : "Unpaid"}
                    </button>
                  </form>
                </TableCell>
                <TableCell>
                  {expense.fileUrl ? (
                    <a
                      href={expense.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <FileText className="h-3.5 w-3.5" /> View
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <ExpenseForm
                      projectId={projectId}
                      expense={expense}
                      trigger={
                        <Button type="button" variant="ghost" size="icon-sm">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      }
                    />
                    <form
                      action={deleteExpense.bind(null, projectId, expense.id)}
                      onSubmit={(e) => {
                        if (!confirm("Delete this expense?")) e.preventDefault();
                      }}
                    >
                      <Button type="submit" variant="ghost" size="icon-sm">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </form>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
