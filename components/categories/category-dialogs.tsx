"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { createCategory, renameCategory, deleteCategory } from "@/lib/actions/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function AddCategoryDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button type="button">
            <Plus className="h-4 w-4" /> Add category
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add category</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            try {
              await createCategory(formData);
              toast.success("Category added");
              setOpen(false);
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Could not add category");
            }
          }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required />
          </div>
          <Button type="submit">Create</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function RenameCategoryDialog({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const action = renameCategory.bind(null, name);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button type="button" variant="ghost" size="icon-sm">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename category</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            try {
              await action(formData);
              toast.success("Category renamed");
              setOpen(false);
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Could not rename category");
            }
          }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={name} required />
          </div>
          <p className="text-sm text-muted-foreground">
            Updates every existing project trade and subcontractor tag using this name too.
          </p>
          <Button type="submit">Save</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteCategoryButton({ id, name }: { id: string; name: string }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={async () => {
        if (!confirm(`Delete "${name}"?`)) return;
        try {
          await deleteCategory(id);
          toast.success("Category deleted");
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Could not delete category");
        }
      }}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}
