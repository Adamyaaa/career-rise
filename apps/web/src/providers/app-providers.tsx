"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "./query-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <TooltipProvider delay={200}>
        {children}
        <Toaster position="bottom-right" />
      </TooltipProvider>
    </QueryProvider>
  );
}
