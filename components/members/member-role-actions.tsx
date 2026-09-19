"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MemberRole } from "@/lib/types";

export function MemberRoleForm({
  action,
  role,
}: {
  action: (formData: FormData) => Promise<void>;
  role: MemberRole;
}) {
  return (
    <form
      action={async (formData) => {
        try {
          await action(formData);
          toast.success("Role updated");
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Could not update role");
        }
      }}
      className="flex items-center gap-2"
    >
      <Select name="role" defaultValue={role}>
        <SelectTrigger className="w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="viewer">Viewer</SelectItem>
          <SelectItem value="editor">Editor</SelectItem>
          <SelectItem value="owner">Owner</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit" variant="ghost" size="sm">
        Save
      </Button>
    </form>
  );
}

export function RemoveMemberButton({
  action,
  label,
}: {
  action: () => Promise<void>;
  label: string;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="text-muted-foreground"
      onClick={async () => {
        if (!confirm(`Remove ${label} from this project?`)) return;
        try {
          await action();
          toast.success("Member removed");
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Could not remove member");
        }
      }}
    >
      Remove
    </Button>
  );
}
