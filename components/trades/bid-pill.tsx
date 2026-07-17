import { BID_STATUS_META } from "@/lib/calculations";
import { cn } from "@/lib/utils";
import type { BidStatus } from "@/lib/types";

export function BidPill({ status, className }: { status: BidStatus; className?: string }) {
  const meta = BID_STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        meta.colorClass,
        className
      )}
    >
      {meta.label}
    </span>
  );
}
