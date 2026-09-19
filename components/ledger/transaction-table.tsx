"use client";

import { useMemo, useState } from "react";
import { Pencil, Search, Trash2, Wallet, X } from "lucide-react";
import { deleteTransaction } from "@/lib/actions/transactions";
import { TransactionForm } from "@/components/ledger/transaction-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatCurrencyPrecise } from "@/lib/calculations";
import type { TransactionType } from "@/lib/types";

export interface TransactionListItem {
  id: string;
  transaction_date: string;
  type: TransactionType;
  amount: number;
  description: string | null;
}

export function TransactionTable({
  projectId,
  transactions,
  canEdit,
}: {
  projectId: string;
  transactions: TransactionListItem[];
  canEdit: boolean;
}) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<TransactionType | "all">("all");

  const { rows, totalDeposits, totalWithdrawals, balance } = useMemo(() => {
    const chronological = [...transactions].sort((a, b) =>
      a.transaction_date === b.transaction_date ? 0 : a.transaction_date.localeCompare(b.transaction_date)
    );

    const accumulated = chronological.reduce(
      (acc, t) => {
        const running = acc.running + (t.type === "deposit" ? t.amount : -t.amount);
        return {
          list: [...acc.list, { ...t, balance: running }],
          running,
          deposits: acc.deposits + (t.type === "deposit" ? t.amount : 0),
          withdrawals: acc.withdrawals + (t.type === "withdrawal" ? t.amount : 0),
        };
      },
      {
        list: [] as (TransactionListItem & { balance: number })[],
        running: 0,
        deposits: 0,
        withdrawals: 0,
      }
    );

    return {
      rows: accumulated.list.reverse(),
      totalDeposits: accumulated.deposits,
      totalWithdrawals: accumulated.withdrawals,
      balance: accumulated.running,
    };
  }, [transactions]);

  const query = search.trim().toLowerCase();
  const visible = rows
    .filter((t) => type === "all" || t.type === type)
    .filter((t) => !query || t.description?.toLowerCase().includes(query) || t.transaction_date.includes(query));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border bg-border">
        <div className="bg-card px-4 py-3.5">
          <p className="text-xs font-medium text-muted-foreground">Total deposits</p>
          <p className="mt-0.5 text-xl font-semibold tracking-tight">{formatCurrencyPrecise(totalDeposits)}</p>
        </div>
        <div className="bg-card px-4 py-3.5">
          <p className="text-xs font-medium text-muted-foreground">Total withdrawals</p>
          <p className="mt-0.5 text-xl font-semibold tracking-tight">{formatCurrencyPrecise(totalWithdrawals)}</p>
        </div>
        <div className="bg-card px-4 py-3.5">
          <p className="text-xs font-medium text-muted-foreground">Current balance</p>
          <p className="mt-0.5 text-xl font-semibold tracking-tight text-primary">
            {formatCurrencyPrecise(balance)}
          </p>
        </div>
      </div>

      {rows.length > 5 && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search description or date..."
              className="h-9 pl-9 pr-9"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Select value={type} onValueChange={(value) => setType((value as TransactionType | "all") ?? "all")}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Deposits + withdrawals</SelectItem>
              <SelectItem value="deposit">Deposits only</SelectItem>
              <SelectItem value="withdrawal">Withdrawals only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {!rows.length ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
            <Wallet className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No deposits or withdrawals logged yet.</p>
          </CardContent>
        </Card>
      ) : !visible.length ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
            <Wallet className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No entries match your search or filter.</p>
          </CardContent>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              {canEdit && <TableHead />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="text-muted-foreground">{t.transaction_date}</TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-xs font-medium",
                      t.type === "deposit"
                        ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        : "border-amber-500/30 bg-amber-400/20 text-amber-700 dark:text-amber-300"
                    )}
                  >
                    {t.type === "deposit" ? "Deposit" : "Withdrawal"}
                  </span>
                </TableCell>
                <TableCell className="max-w-64 truncate">{t.description ?? "—"}</TableCell>
                <TableCell className="text-right font-medium">
                  {t.type === "withdrawal" ? "−" : ""}
                  {formatCurrencyPrecise(t.amount)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatCurrencyPrecise(t.balance)}
                </TableCell>
                {canEdit && (
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <TransactionForm
                        projectId={projectId}
                        transaction={t}
                        trigger={
                          <Button type="button" variant="ghost" size="icon-sm">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        }
                      />
                      <form
                        action={deleteTransaction.bind(null, projectId, t.id)}
                        onSubmit={(e) => {
                          if (!confirm("Delete this entry?")) e.preventDefault();
                        }}
                      >
                        <Button type="submit" variant="ghost" size="icon-sm">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
