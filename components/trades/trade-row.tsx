"use client";

import { ChevronDown, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BidPill } from "@/components/trades/bid-pill";
import { BidForm, type EditableBid } from "@/components/trades/bid-form";
import { formatCurrency, formatCurrencyPrecise, BID_STATUS_META } from "@/lib/calculations";
import { deleteBid, toggleWinner } from "@/lib/actions/bids";
import { deleteTrade } from "@/lib/actions/trades";
import type { CompanyOption } from "@/components/companies/company-picker";
import type { BidStatus } from "@/lib/types";

export interface TradeBid {
  id: string;
  company_id: string | null;
  company_name: string | null;
  amount: number | null;
  status: BidStatus;
  is_winner: boolean;
  notes: string | null;
}

const STATUS_ORDER: BidStatus[] = ["actual", "estimate", "sent"];

export function TradeRow({
  projectId,
  trade,
  bids,
  companies,
  canEdit,
  expanded,
  onToggle,
}: {
  projectId: string;
  trade: { id: string; name: string; qty: number };
  bids: TradeBid[];
  companies: CompanyOption[];
  canEdit: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const winner = bids.find((b) => b.is_winner) ?? null;
  const lowestActual = bids
    .filter((b) => b.status === "actual" && b.amount !== null)
    .reduce<TradeBid | null>((min, b) => (!min || (b.amount ?? Infinity) < (min.amount ?? Infinity) ? b : min), null);

  const statusCounts = bids.reduce<Record<BidStatus, number>>(
    (acc, b) => {
      acc[b.status]++;
      return acc;
    },
    { sent: 0, estimate: 0, actual: 0 }
  );

  return (
    <div
      className={cn(
        "rounded-xl border transition-colors",
        expanded ? "border-accent-foreground/20 bg-accent/40" : "bg-card"
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex w-full touch-manipulation items-center gap-3 rounded-xl px-4 py-3.5 text-left transition-colors",
          expanded ? "rounded-b-none" : "hover:bg-accent/40 active:bg-accent/60"
        )}
      >
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            expanded && "rotate-180"
          )}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{trade.name}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            {bids.length === 0 ? (
              <span>No bids yet</span>
            ) : (
              STATUS_ORDER.filter((status) => statusCounts[status] > 0).map((status) => (
                <span key={status} className="flex items-center gap-1.5">
                  <span className={cn("h-1.5 w-1.5 rounded-full", BID_STATUS_META[status].dotClass)} />
                  {statusCounts[status]} {BID_STATUS_META[status].shortLabel}
                </span>
              ))
            )}
            {winner?.company_name && <span>· Winner: {winner.company_name}</span>}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold">{formatCurrency(winner?.amount ?? null)}</p>
        </div>
      </button>

      {expanded && (
        <div className="border-t px-4 py-3.5">
          <div className="flex flex-col gap-2">
            {bids.length === 0 && (
              <p className="py-2 text-sm text-muted-foreground">No bids yet.</p>
            )}
            {bids.map((bid) => (
              <div
                key={bid.id}
                className={cn(
                  "flex flex-wrap items-center gap-3 rounded-lg border bg-background/60 p-2.5 sm:flex-nowrap",
                  bid.is_winner && "border-primary/50 bg-primary/5",
                  lowestActual?.id === bid.id && !bid.is_winner && "border-emerald-500/40"
                )}
              >
                {canEdit && (
                  <form action={toggleWinner.bind(null, projectId, trade.id, bid.id, bid.is_winner)}>
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      title={bid.is_winner ? "Unmark winner" : "Mark as winner"}
                    >
                      <Star className={cn("h-4 w-4", bid.is_winner && "fill-amber-400 text-amber-500")} />
                    </Button>
                  </form>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {bid.company_name ?? "No company"}
                  </p>
                  {bid.notes && (
                    <p className="truncate text-xs text-muted-foreground">{bid.notes}</p>
                  )}
                </div>
                <BidPill status={bid.status} />
                <p className="w-24 text-right text-sm font-medium sm:w-28">
                  {formatCurrencyPrecise(bid.amount)}
                </p>
                {canEdit && (
                  <div className="flex items-center gap-1">
                    <BidForm
                      projectId={projectId}
                      tradeId={trade.id}
                      companies={companies}
                      bid={bid as EditableBid}
                      trigger={
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      }
                    />
                    <form action={deleteBid.bind(null, projectId, bid.id)}>
                      <Button type="submit" variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>

          {canEdit && (
            <div className="mt-3 flex items-center justify-between">
              <BidForm
                projectId={projectId}
                tradeId={trade.id}
                companies={companies}
                trigger={
                  <Button type="button" variant="outline" size="sm">
                    <Plus className="mr-1 h-3.5 w-3.5" /> Add bid
                  </Button>
                }
              />
              <form
                action={deleteTrade.bind(null, projectId, trade.id)}
                onSubmit={(e) => {
                  if (!confirm(`Delete "${trade.name}" and all its bids?`)) e.preventDefault();
                }}
              >
                <Button type="submit" variant="ghost" size="sm" className="text-muted-foreground">
                  Delete
                </Button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
