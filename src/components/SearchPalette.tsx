"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { CornerDownLeft, Search, X } from "lucide-react";
import { useApp } from "./AppProvider";
import { searchNamas } from "@/lib/search";
import { loadedNamaCount, TOTAL_NAMAS } from "@/lib/data";

export function SearchPalette() {
  const { searchOpen, setSearchOpen, jumpTo } = useApp();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const outcome = useMemo(() => searchNamas(q), [q]);
  const results = outcome.kind === "results" ? outcome.results : [];

  useEffect(() => { setActive(0); }, [q]);
  useEffect(() => {
    if (searchOpen) { setQ(""); requestAnimationFrame(() => inputRef.current?.focus()); }
  }, [searchOpen]);
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!searchOpen) return null;

  const choose = (idx: number) => {
    const r = results[idx];
    if (!r) return;
    setSearchOpen(false);
    jumpTo(r.nama.id);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { e.preventDefault(); setSearchOpen(false); }
    else if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); choose(active); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 px-3 pt-[10vh] backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}>
      <div role="dialog" aria-modal="true" aria-label="Search names" className="card w-full max-w-xl overflow-hidden bg-surface shadow-2xl" onKeyDown={onKeyDown}>
        <div className="flex items-center gap-2 border-b border-line px-4">
          <Search size={18} className="text-muted" />
          <input
            ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search: #42, lotus, compassion, śrī…"
            className="h-14 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-muted/70"
            aria-label="Search query" autoComplete="off" spellCheck={false}
          />
          <button className="btn-icon" onClick={() => setSearchOpen(false)} aria-label="Close search"><X size={18} /></button>
        </div>

        <ul ref={listRef} className="max-h-[50vh] overflow-y-auto p-2" role="listbox">
          {outcome.kind === "empty" && (
            <li className="px-3 py-6 text-center text-sm text-muted">
              Type a name number (<code className="rounded bg-gold/15 px-1">#12</code>), an English word, or transliteration.
              <br />Try <button className="underline" onClick={() => setQ("moon")}>moon</button>, <button className="underline" onClick={() => setQ("compassion")}>compassion</button> or <button className="underline" onClick={() => setQ("#17")}>#17</button>.
            </li>
          )}
          {outcome.kind === "missing-number" && (
            <li className="px-3 py-6 text-center text-sm text-muted">
              Nama #{outcome.id} {outcome.id > TOTAL_NAMAS ? "doesn’t exist (1–1000)." : `isn’t in the dataset yet (${loadedNamaCount} of ${TOTAL_NAMAS} loaded).`}
            </li>
          )}
          {outcome.kind === "results" && results.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-muted">No matches among the {loadedNamaCount} loaded names.</li>
          )}
          {results.map((r, i) => (
            <li key={r.nama.id} data-idx={i} role="option" aria-selected={i === active}>
              <button
                className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left ${i === active ? "bg-saffron/15" : "hover:bg-gold/10"}`}
                onMouseMove={() => setActive(i)} onClick={() => choose(i)}
              >
                <span className="mt-0.5 flex h-7 min-w-7 items-center justify-center rounded-full bg-crimson px-1.5 text-xs font-semibold text-[#fff4d6]">{r.nama.id}</span>
                <span className="min-w-0 flex-1">
                  <span className="deva block truncate text-lg leading-snug text-crimson">{r.nama.devanagari}</span>
                  <span className="iast block truncate text-sm">{r.nama.iast}</span>
                  <span className="block truncate text-sm text-muted">{r.nama.meaning}</span>
                </span>
                {i === active && <CornerDownLeft size={14} className="mt-1 text-muted" />}
              </button>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-line px-4 py-2 text-xs text-muted">
          <span>↑↓ navigate · ↵ jump · esc close</span>
          <span>{loadedNamaCount}/{TOTAL_NAMAS} names loaded</span>
        </div>
      </div>
    </div>
  );
}
