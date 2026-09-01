"use client";

import { useMemo, useState } from "react";
import { Search, X, ChevronsDownUp, ChevronsUpDown, GripVertical, ArrowUpDown } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { computeTradeStage, TRADE_STAGE_META, type TradeStage } from "@/lib/calculations";
import { TradeRow, type TradeBid } from "@/components/trades/trade-row";
import type { TradeImage } from "@/components/trades/trade-details-form";
import type { CompanyOption } from "@/components/companies/company-picker";
import { setTradeSortMode } from "@/lib/actions/projects";
import { reorderTrades } from "@/lib/actions/trades";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface TradeListItem {
  id: string;
  name: string;
  qty: number;
  description: string | null;
  images: TradeImage[];
  bids: TradeBid[];
}

const STAGE_ORDER: TradeStage[] = ["not_started", "requested", "needs_decision", "won"];

export function TradeList({
  projectId,
  trades,
  companies,
  canEdit,
  useCustomOrder,
}: {
  projectId: string;
  trades: TradeListItem[];
  companies: CompanyOption[];
  canEdit: boolean;
  useCustomOrder: boolean;
}) {
  const [filter, setFilter] = useState<TradeStage | "all">("all");
  const [search, setSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [prevTrades, setPrevTrades] = useState(trades);
  const [orderedTrades, setOrderedTrades] = useState(trades);
  if (trades !== prevTrades) {
    setPrevTrades(trades);
    setOrderedTrades(trades);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const withStage = useMemo(
    () => orderedTrades.map((trade) => ({ trade, stage: computeTradeStage(trade.bids) })),
    [orderedTrades]
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

  const canReorder = canEdit && useCustomOrder && filter === "all" && !query;

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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedTrades.findIndex((t) => t.id === active.id);
    const newIndex = orderedTrades.findIndex((t) => t.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const next = arrayMove(orderedTrades, oldIndex, newIndex);
    setOrderedTrades(next);
    reorderTrades(projectId, next.map((t) => t.id));
  }

  const rows = visible.map(({ trade }) => (
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
  ));

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
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-muted-foreground">
          {canEdit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setTradeSortMode(projectId, !useCustomOrder)}
              title={useCustomOrder ? "Switch back to alphabetical order" : "Switch to a manual drag-to-reorder order"}
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              {useCustomOrder ? "Custom order" : "Alphabetical"}
            </Button>
          )}
          <button type="button" onClick={expandAll} className="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-accent/50 hover:text-foreground">
            <ChevronsUpDown className="h-3.5 w-3.5" /> Expand all
          </button>
          <button type="button" onClick={collapseAll} className="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-accent/50 hover:text-foreground">
            <ChevronsDownUp className="h-3.5 w-3.5" /> Collapse all
          </button>
        </div>
      </div>

      {useCustomOrder && !canReorder && canEdit && (
        <p className="text-xs text-muted-foreground">Clear the search and stage filter to drag and reorder.</p>
      )}

      <div className="flex flex-col gap-2">
        {canReorder ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={visible.map(({ trade }) => trade.id)} strategy={verticalListSortingStrategy}>
              {visible.map(({ trade }) => (
                <SortableTradeRow key={trade.id} id={trade.id}>
                  <TradeRow
                    projectId={projectId}
                    trade={trade}
                    bids={trade.bids}
                    companies={companies}
                    canEdit={canEdit}
                    expanded={expandedIds.has(trade.id)}
                    onToggle={() => toggleTrade(trade.id)}
                  />
                </SortableTradeRow>
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          rows
        )}
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

function SortableTradeRow({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-stretch gap-1">
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="flex w-6 shrink-0 touch-none items-center justify-center rounded-md text-muted-foreground hover:bg-accent/50 hover:text-foreground active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="min-w-0 flex-1">{children}</div>
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
