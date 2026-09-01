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

export interface CategoryOption {
  id: string;
  name: string;
}

export function TradeCategoryPicker({ categories }: { categories: CategoryOption[] }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newName, setNewName] = useState<string | null>(null);

  const label = selectedId ? categories.find((c) => c.id === selectedId)?.name : newName;

  const exactMatch = categories.some((c) => c.name.toLowerCase() === search.trim().toLowerCase());

  return (
    <>
      <input type="hidden" name="categoryId" value={selectedId ?? ""} />
      <input type="hidden" name="categoryName" value={selectedId ? "" : newName ?? ""} />
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
          {label || "Select product/service..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput
              placeholder="Search products/services..."
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
                  "No products/services found."
                )}
              </CommandEmpty>
              <CommandGroup>
                {categories.map((category) => (
                  <CommandItem
                    key={category.id}
                    value={category.name}
                    onSelect={() => {
                      setSelectedId(category.id);
                      setNewName(null);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedId === category.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {category.name}
                  </CommandItem>
                ))}
                {search.trim() && !exactMatch && categories.length > 0 && (
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
