import { formatCurrency, type ProjectTotals } from "@/lib/calculations";

export function TotalsBar({ totals }: { totals: ProjectTotals }) {
  const items = [
    { label: "Grand total", value: formatCurrency(totals.grandTotal) },
    { label: "Cost / sqft", value: formatCurrency(totals.costPerSqft) },
  ];

  return (
    <div className="sticky top-16 z-30 grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border">
      {items.map((item) => (
        <div key={item.label} className="bg-card px-4 py-3.5 sm:px-5 sm:py-4">
          <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
          <p className="mt-0.5 text-xl font-semibold tracking-tight text-primary">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
