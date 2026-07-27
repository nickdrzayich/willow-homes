import { Plus, Pencil, CalendarDays } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ScheduleDayForm } from "@/components/build-schedule/schedule-day-form";
import { DeleteScheduleDayButton } from "@/components/build-schedule/delete-schedule-day-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function BuildSchedulePage() {
  const supabase = await createClient();
  const { data: days } = await supabase
    .from("build_schedule_template")
    .select("id, day_number, tasks, notes")
    .order("day_number");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Build Schedule</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Reference guide for what typically happens around each day of a build. Shared across
            all projects &mdash; not tied to real dates.
          </p>
        </div>
        <ScheduleDayForm
          trigger={
            <Button type="button">
              <Plus className="h-4 w-4" /> Add day
            </Button>
          }
        />
      </div>

      {!days?.length ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
            <CalendarDays className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No reference days added yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {days.map((day) => (
            <Card key={day.id}>
              <CardContent className="flex items-start justify-between gap-4 py-4">
                <div className="flex flex-col gap-1.5">
                  <p className="text-sm font-medium">Day {day.day_number}</p>
                  {day.tasks.length > 0 && (
                    <ul className="list-inside list-disc text-sm text-muted-foreground">
                      {day.tasks.map((task, i) => (
                        <li key={i}>{task}</li>
                      ))}
                    </ul>
                  )}
                  {day.notes && <p className="whitespace-pre-line text-sm text-muted-foreground">{day.notes}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <ScheduleDayForm
                    day={day}
                    trigger={
                      <Button type="button" variant="ghost" size="icon-sm">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    }
                  />
                  <DeleteScheduleDayButton dayId={day.id} dayNumber={day.day_number} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
