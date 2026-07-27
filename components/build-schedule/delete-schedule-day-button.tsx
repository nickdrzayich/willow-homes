"use client";

import { Trash2 } from "lucide-react";
import { deleteScheduleDay } from "@/lib/actions/build-schedule";
import { Button } from "@/components/ui/button";

export function DeleteScheduleDayButton({ dayId, dayNumber }: { dayId: string; dayNumber: number }) {
  return (
    <form
      action={deleteScheduleDay.bind(null, dayId)}
      onSubmit={(e) => {
        if (!confirm(`Delete Day ${dayNumber}?`)) e.preventDefault();
      }}
    >
      <Button type="submit" variant="ghost" size="icon-sm">
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </form>
  );
}
