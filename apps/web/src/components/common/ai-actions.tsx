"use client";

import { toast } from "sonner";
import { Sparkles, FileQuestion, Wand2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

const actions = [
  { icon: Sparkles, label: "Ask AI" },
  { icon: FileQuestion, label: "Generate quiz" },
  { icon: Wand2, label: "Summarize resource" },
  { icon: Layers, label: "Generate flashcards" },
];

// UI placeholder only, per spec — the AI service is a separate integration the core
// platform never depends on. Wiring these up later means replacing the onClick with a
// real call to POST /lessons/:id/ai/* — the buttons and layout stay the same.
export function AiActions() {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant="outline"
          size="sm"
          onClick={() => toast.info(`${action.label} is coming soon`)}
        >
          <action.icon className="size-3.5" />
          {action.label}
        </Button>
      ))}
    </div>
  );
}
