"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        // Changes made by *another* role — an admin creating a cohort, a mentor
        // enrolling a student — can't invalidate this browser's cache. Without this,
        // a cached list would keep showing stale data for up to staleTime after
        // navigating back to the page. Cached data still renders instantly; the
        // refetch happens in the background.
        refetchOnMount: "always",
        retry: 1,
      },
    },
  });
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Created once per browser session via useState's lazy initializer, per TanStack
  // Query's App Router guidance — avoids sharing a client across requests/users.
  const [queryClient] = useState(makeQueryClient);
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
