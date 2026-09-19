"use client";

import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { deleteScheduleDay } from "@/lib/actions/build-schedule";
import { Button } from "@/components/ui/button";

export function DeleteScheduleDayButton({ dayId, dayNumber }: { dayId: string; dayNumber: number }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={async () => {
        if (!confirm(`Delete Day ${dayNumber}?`)) return;
        try {
          await deleteScheduleDay(dayId);
          toast.success("Day deleted");
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Could not delete");
        }
      }}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}
