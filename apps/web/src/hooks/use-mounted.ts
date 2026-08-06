import { useEffect, useState } from "react";

// Guards against SSR/client hydration mismatches for anything derived from
// client-only state (localStorage-persisted stores, matchMedia, etc.).
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
