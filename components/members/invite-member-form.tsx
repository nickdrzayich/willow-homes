"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function InviteMemberForm({ action }: { action: (formData: FormData) => Promise<void> }) {
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      action={async (formData) => {
        try {
          await action(formData);
          toast.success("Invite sent");
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Could not send invite");
        }
      }}
      className="flex flex-col gap-3"
    >
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex min-w-[200px] flex-1 flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="role">Role</Label>
          <Select name="role" defaultValue="viewer">
            <SelectTrigger id="role" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="viewer">Viewer</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="owner">Owner</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit">Invite</Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
