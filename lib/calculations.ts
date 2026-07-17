import type { BidStatus } from "@/lib/types";

export interface ProjectTotals {
  grandTotal: number;
  costPerSqft: number | null;
}

export function computeProjectTotals(grandTotal: number | null, sqft: number | null): ProjectTotals {
  const total = grandTotal ?? 0;
  const costPerSqft = sqft && sqft > 0 ? total / sqft : null;

  return { grandTotal: total, costPerSqft };
}

export const BID_STATUS_META = {
  sent: {
    label: "Bid Requested",
    shortLabel: "requested",
    colorClass: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30",
    dotClass: "bg-cyan-500",
  },
  estimate: {
    label: "Estimate",
    shortLabel: "estimate",
    colorClass: "bg-amber-400/20 text-amber-700 dark:text-amber-300 border-amber-500/30",
    dotClass: "bg-amber-400",
  },
  actual: {
    label: "Actual bid",
    shortLabel: "actual",
    colorClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    dotClass: "bg-emerald-500",
  },
} as const;

export type TradeStage = "not_started" | "requested" | "needs_decision" | "won";

export const TRADE_STAGE_META: Record<TradeStage, { label: string }> = {
  not_started: { label: "Not started" },
  requested: { label: "Requested" },
  needs_decision: { label: "Needs decision" },
  won: { label: "Won" },
};

// Classifies a trade's pipeline stage from its bids, for filtering the trade list:
// - not_started: no bids at all, nothing sent yet
// - requested: has bids, but none are an actual received number yet
// - needs_decision: has an actual bid in hand, but no winner picked yet
// - won: a winner has been selected
export function computeTradeStage(bids: { status: BidStatus; is_winner: boolean }[]): TradeStage {
  if (bids.length === 0) return "not_started";
  if (bids.some((b) => b.is_winner)) return "won";
  if (bids.some((b) => b.status === "actual")) return "needs_decision";
  return "requested";
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCurrencyPrecise(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}
