"use client";

import { useMemo, useState } from "react";
import { Search, X, ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { computeTradeStage, TRADE_STAGE_META, type TradeStage } from "@/lib/calculations";
import { TradeRow, type TradeBid } from "@/components/trades/trade-row";
import type { CompanyOption } from "@/components/companies/company-picker";
import { Input } from "@/components/ui/input";

export interface TradeListItem {
  id: string;
  name: string;
  qty: number;
  bids: TradeBid[];
}

const STAGE_ORDER: TradeStage[] = ["not_started", "requested", "needs_decision", "won"];

export function TradeList({
  projectId,
  trades,
  companies,
  canEdit,
}: {
  projectId: string;
  trades: TradeListItem[];
  companies: CompanyOption[];
  canEdit: boolean;
}) {
  const [filter, setFilter] = useState<TradeStage | "all">("all");
  const [search, setSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const withStage = useMemo(
    () => trades.map((trade) => ({ trade, stage: computeTradeStage(trade.bids) })),
    [trades]
  );

  const counts = useMemo(() => {
    const c: Record<TradeStage, number> = { not_started: 0, requested: 0, needs_decision: 0, won: 0 };
    for (const { stage } of withStage) c[stage]++;
    return c;
  }, [withStage]);

  const stageFiltered = filter === "all" ? withStage : withStage.filter((t) => t.stage === filter);

  const query = search.trim().toLowerCase();
  const visible = query
    ? stageFiltered.filter((t) => t.trade.name.toLowerCase().includes(query))
    : stageFiltered;

  const toggleTrade = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => setExpandedIds(new Set(visible.map(({ trade }) => trade.id)));
  const collapseAll = () => setExpandedIds(new Set());

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products/services..."
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

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <FilterChip label="All" count={trades.length} active={filter === "all"} onClick={() => setFilter("all")} />
          {STAGE_ORDER.map((stage) => (
            <FilterChip
              key={stage}
              label={TRADE_STAGE_META[stage].label}
              count={counts[stage]}
              active={filter === stage}
              onClick={() => setFilter(stage)}
            />
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <button type="button" onClick={expandAll} className="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-accent/50 hover:text-foreground">
            <ChevronsUpDown className="h-3.5 w-3.5" /> Expand all
          </button>
          <button type="button" onClick={collapseAll} className="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-accent/50 hover:text-foreground">
            <ChevronsDownUp className="h-3.5 w-3.5" /> Collapse all
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {visible.map(({ trade }) => (
          <TradeRow
            key={trade.id}
            projectId={projectId}
            trade={trade}
            bids={trade.bids}
            companies={companies}
            canEdit={canEdit}
            expanded={expandedIds.has(trade.id)}
            onToggle={() => toggleTrade(trade.id)}
          />
        ))}
        {!visible.length && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            {trades.length === 0
              ? "No products/services yet. Add your first one below."
              : "No products/services match your search or filter."}
          </p>
        )}
      </div>
    </div>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:bg-accent/50 hover:text-foreground"
      )}
    >
      {label}
      <span
        className={cn(
          "rounded-full px-1.5 py-px text-[10px] tabular-nums",
          active ? "bg-primary/15" : "bg-muted"
        )}
      >
        {count}
      </span>
    </button>
  );
}
