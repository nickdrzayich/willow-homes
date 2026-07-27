"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TaskListFields({ defaultTasks = [] }: { defaultTasks?: string[] }) {
  const [tasks, setTasks] = useState<string[]>(defaultTasks.length ? defaultTasks : [""]);

  return (
    <div className="flex flex-col gap-2">
      <Label>Tasks</Label>
      {tasks.map((task, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            name="tasks"
            value={task}
            onChange={(e) => {
              const next = [...tasks];
              next[index] = e.target.value;
              setTasks(next);
            }}
            placeholder="e.g. Framing inspection"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setTasks(tasks.length > 1 ? tasks.filter((_, i) => i !== index) : [""])}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => setTasks([...tasks, ""])}
      >
        <Plus className="h-3.5 w-3.5" /> Add task
      </Button>
    </div>
  );
}
