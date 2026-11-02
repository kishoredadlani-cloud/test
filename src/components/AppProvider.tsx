"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { dateKey } from "@/lib/dates";

export type ThemeChoice = "light" | "dark" | "system";
export type ViewMode = "stotra" | "archana";

export interface Settings {
  theme: ThemeChoice;
  mode: ViewMode;
  showDevanagari: boolean;
  showIast: boolean;
  showMeaning: boolean;
  showCommentary: boolean;
  /** index into FONT_SCALES */
  fontSize: number;
  /** auto-scroll speed, px per second */
  scrollSpeed: number;
}

export const FONT_SCALES = [0.85, 1, 1.15, 1.3, 1.5, 1.75, 2];
export const DEFAULT_SETTINGS: Settings = {
  theme: "system", mode: "stotra",
  showDevanagari: true, showIast: true, showMeaning: true, showCommentary: true,
  fontSize: 1, scrollSpeed: 30,
};

export interface Sadhana {
  bookmarks: number[];
  favorites: number[];
  notes: Record<string, string>;
  /** nama ids that have been read (scrolled into view) */
  seen: number[];
  lastRead: { mode: ViewMode; id: number } | null;
  /** YYYY-MM-DD → rounds of parayanam completed that day */
  log: Record<string, number>;
}
const DEFAULT_SADHANA: Sadhana = { bookmarks: [], favorites: [], notes: {}, seen: [], lastRead: null, log: {} };

export const SETTINGS_KEY = "lalita:settings";

interface Ctx {
  settings: Settings;
  setSettings: (patch: Partial<Settings>) => void;
  sadhana: Sadhana;
  hydrated: boolean;
  toggleBookmark: (id: number) => void;
  toggleFavorite: (id: number) => void;
  setNote: (id: number, text: string) => void;
  markSeen: (ids: number[]) => void;
  setLastRead: (mode: ViewMode, id: number) => void;
  addRounds: (delta: number, key?: string) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  jumpTarget: { id: number; nonce: number } | null;
  jumpTo: (id: number) => void;
  clearJump: () => void;
}

const AppContext = createContext<Ctx | null>(null);
export const useApp = (): Ctx => {
  const c = useContext(AppContext);
  if (!c) throw new Error("useApp must be used inside <AppProvider>");
  return c;
};

const toggle = (arr: number[], id: number) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettingsState, h1] = useLocalStorage<Settings>(SETTINGS_KEY, DEFAULT_SETTINGS);
  const [sadhana, setSadhana, h2] = useLocalStorage<Sadhana>("lalita:sadhana", DEFAULT_SADHANA);
  const [searchOpen, setSearchOpen] = useState(false);
  const [jumpTarget, setJumpTarget] = useState<Ctx["jumpTarget"]>(null);
  const router = useRouter();
  const pathname = usePathname();

  const setSettings = useCallback((patch: Partial<Settings>) => setSettingsState((s) => ({ ...s, ...patch })), [setSettingsState]);

  // Theme
  useEffect(() => {
    const apply = () => {
      const dark = settings.theme === "dark" || (settings.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.classList.toggle("dark", dark);
      document.documentElement.style.colorScheme = dark ? "dark" : "light";
    };
    apply();
    if (settings.theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [settings.theme]);

  // Cmd/Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const jumpTo = useCallback((id: number) => {
    setJumpTarget({ id, nonce: Date.now() });
    if (pathname !== "/") router.push("/");
  }, [pathname, router]);
  const clearJump = useCallback(() => setJumpTarget(null), []);

  // Stable action references (they only depend on the state setter) so memoised cards don't re-render.
  const actions = useMemo(() => ({
    toggleBookmark: (id: number) => setSadhana((s) => ({ ...s, bookmarks: toggle(s.bookmarks, id) })),
    toggleFavorite: (id: number) => setSadhana((s) => ({ ...s, favorites: toggle(s.favorites, id) })),
    setNote: (id: number, text: string) => setSadhana((s) => {
      const notes = { ...s.notes };
      if (text.trim()) notes[id] = text; else delete notes[id];
      return { ...s, notes };
    }),
    markSeen: (ids: number[]) => setSadhana((s) => {
      const set = new Set(s.seen);
      let changed = false;
      for (const id of ids) if (!set.has(id)) { set.add(id); changed = true; }
      return changed ? { ...s, seen: [...set] } : s;
    }),
    setLastRead: (mode: ViewMode, id: number) => setSadhana((s) => (s.lastRead?.id === id && s.lastRead.mode === mode ? s : { ...s, lastRead: { mode, id } })),
    addRounds: (delta: number, key: string = dateKey()) => setSadhana((s) => {
      const next = Math.max(0, (s.log[key] ?? 0) + delta);
      const log = { ...s.log };
      if (next === 0) delete log[key]; else log[key] = next;
      return { ...s, log };
    }),
  }), [setSadhana]);

  const value = useMemo<Ctx>(() => ({
    settings, setSettings, sadhana, hydrated: h1 && h2, ...actions,
    searchOpen, setSearchOpen, jumpTarget, jumpTo, clearJump,
  }), [settings, setSettings, sadhana, h1, h2, actions, searchOpen, jumpTarget, jumpTo, clearJump]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
