"use client";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * SSR-safe localStorage state. Renders `initial` on the server and first client render (no hydration
 * mismatch), then loads the stored value. `hydrated` tells you when the stored value is available.
 * Every read/write is try/catch-wrapped (private mode, quota, blocked storage).
 */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);
  const initialRef = useRef(initial);

  useEffect(() => {
    try {
      const s = window.localStorage.getItem(key);
      if (s !== null) {
        const parsed = JSON.parse(s);
        const base = initialRef.current;
        setValue(
          base && typeof base === "object" && !Array.isArray(base) && parsed && typeof parsed === "object"
            ? ({ ...base, ...parsed } as T)
            : (parsed as T),
        );
      }
    } catch { /* ignore */ }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
  }, [key, value, hydrated]);

  // keep multiple tabs in sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key || e.newValue === null) return;
      try { setValue(JSON.parse(e.newValue) as T); } catch { /* ignore */ }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);

  const update = useCallback((next: T | ((prev: T) => T)) => setValue(next), []);
  return [value, update, hydrated] as const;
}
