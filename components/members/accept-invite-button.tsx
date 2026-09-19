"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function AcceptInviteButton({ action }: { action: () => Promise<void> }) {
  return (
    <Button
      type="button"
      size="sm"
      onClick={async () => {
        try {
          await action();
          toast.success("Invite accepted");
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Could not accept invite");
        }
      }}
    >
      Accept
    </Button>
  );
}
