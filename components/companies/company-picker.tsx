"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface CompanyOption {
  id: string;
  name: string;
}

export function CompanyPicker({
  companies,
  defaultCompanyId,
  defaultCompanyName,
}: {
  companies: CompanyOption[];
  defaultCompanyId?: string | null;
  defaultCompanyName?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(defaultCompanyId ?? null);
  const [newName, setNewName] = useState<string | null>(defaultCompanyName ?? null);

  const label = selectedId
    ? companies.find((c) => c.id === selectedId)?.name
    : newName;

  const exactMatch = companies.some(
    (c) => c.name.toLowerCase() === search.trim().toLowerCase()
  );

  return (
    <>
      <input type="hidden" name="companyId" value={selectedId ?? ""} />
      <input type="hidden" name="companyName" value={selectedId ? "" : newName ?? ""} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between font-normal"
            />
          }
        >
          {label || "Select company..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput
              placeholder="Search companies..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>
                {search.trim() ? (
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent"
                    onClick={() => {
                      setSelectedId(null);
                      setNewName(search.trim());
                      setOpen(false);
                    }}
                  >
                    <Plus className="h-4 w-4" /> Create &ldquo;{search.trim()}&rdquo;
                  </button>
                ) : (
                  "No companies found."
                )}
              </CommandEmpty>
              <CommandGroup>
                {companies.map((company) => (
                  <CommandItem
                    key={company.id}
                    value={company.name}
                    onSelect={() => {
                      setSelectedId(company.id);
                      setNewName(null);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedId === company.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {company.name}
                  </CommandItem>
                ))}
                {search.trim() && !exactMatch && companies.length > 0 && (
                  <CommandItem
                    value={`create-${search}`}
                    onSelect={() => {
                      setSelectedId(null);
                      setNewName(search.trim());
                      setOpen(false);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Create &ldquo;{search.trim()}&rdquo;
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
}
