"use client";

import { useState, type ReactElement } from "react";
import { createScheduleDay, updateScheduleDay } from "@/lib/actions/build-schedule";
import { TaskListFields } from "@/components/shared/task-list-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface EditableScheduleDay {
  id: string;
  day_number: number;
  tasks: string[];
  notes: string | null;
}

export function ScheduleDayForm({
  day,
  trigger,
}: {
  day?: EditableScheduleDay;
  trigger: ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const action = day ? updateScheduleDay.bind(null, day.id) : createScheduleDay;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{day ? "Edit day" : "Add day"}</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            await action(formData);
            setOpen(false);
          }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="dayNumber">Day number</Label>
            <Input
              id="dayNumber"
              name="dayNumber"
              type="number"
              min="1"
              step="1"
              defaultValue={day?.day_number ?? ""}
              required
            />
          </div>
          <TaskListFields defaultTasks={day?.tasks} />
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" defaultValue={day?.notes ?? ""} rows={4} />
          </div>
          <Button type="submit">{day ? "Save day" : "Add day"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
