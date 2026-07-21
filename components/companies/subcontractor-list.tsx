"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface SubcontractorListItem {
  id: string;
  name: string;
  categoryNames: string[];
  bidCount: number;
  primaryContactName: string | null;
  archived: boolean;
}

export function SubcontractorList({ companies }: { companies: SubcontractorListItem[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [showArchived, setShowArchived] = useState(false);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const c of companies) for (const cat of c.categoryNames) set.add(cat);
    return Array.from(set).sort();
  }, [companies]);

  const query = search.trim().toLowerCase();
  const visible = companies.filter((c) => {
    if (!showArchived && c.archived) return false;
    if (query && !c.name.toLowerCase().includes(query)) return false;
    if (category !== "all" && !c.categoryNames.includes(category)) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subcontractors..."
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
        <Select value={category} onValueChange={(value) => setCategory(value ?? "all")}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All products/services</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          Show archived
        </label>
      </div>

      {!visible.length ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
            <Building2 className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              {companies.length === 0
                ? "No subcontractors yet. They'll also appear automatically as you add bids."
                : "No subcontractors match your search or filter."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((company) => (
            <Link key={company.id} href={`/admin/subcontractors/${company.id}`}>
              <Card
                className={cn(
                  "h-full transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm",
                  company.archived && "opacity-60"
                )}
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{company.name}</CardTitle>
                    {company.archived && (
                      <Badge variant="secondary" className="text-[10px]">
                        Archived
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
                  {company.primaryContactName ? (
                    <p className="truncate">{company.primaryContactName}</p>
                  ) : (
                    <p className="text-muted-foreground/60">No contacts yet</p>
                  )}
                  {company.categoryNames.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {company.categoryNames.slice(0, 3).map((cat) => (
                        <Badge key={cat} variant="secondary" className="text-[10px]">
                          {cat}
                        </Badge>
                      ))}
                      {company.categoryNames.length > 3 && (
                        <Badge variant="secondary" className="text-[10px]">
                          +{company.categoryNames.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  <p>
                    {company.bidCount} bid{company.bidCount === 1 ? "" : "s"} across all projects
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
