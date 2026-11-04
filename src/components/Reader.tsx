"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { History } from "lucide-react";
import { FONT_SCALES, useApp } from "./AppProvider";
import { ControlBar } from "./ControlBar";
import { StotraView } from "./StotraView";
import { ArchanaView, type ArchanaFilter } from "./ArchanaView";
import { loadedNamaCount, meta, TOTAL_NAMAS } from "@/lib/data";

/** Find the element that shows nama `id` in the current view (a card, or the verse containing it). */
function findTarget(id: number): HTMLElement | null {
  const direct = document.getElementById(`nama-${id}`);
  if (direct) return direct;
  for (const el of document.querySelectorAll<HTMLElement>("[data-nama-ids]")) {
    if (el.dataset.namaIds?.split(",").includes(String(id))) return el;
  }
  return null;
}

function flashTo(el: HTMLElement) {
  el.scrollIntoView({ block: "center" });
  // content-visibility can shift layout once neighbours render; settle once more.
  setTimeout(() => el.scrollIntoView({ block: "center" }), 120);
  el.classList.remove("flash");
  void el.offsetWidth;
  el.classList.add("flash");
  setTimeout(() => el.classList.remove("flash"), 2500);
}

const FILTERS: [ArchanaFilter, string][] = [["all", "All names"], ["bookmarks", "Bookmarked"], ["favorites", "Favorites"], ["notes", "With notes"]];

export function Reader() {
  const { settings, sadhana, hydrated, jumpTarget, clearJump, markSeen, setLastRead } = useApp();
  const { mode } = settings;
  const [filter, setFilter] = useState<ArchanaFilter>("all");
  const pending = useRef<Set<number>>(new Set());
  const timer = useRef<ReturnType<typeof setTimeout>>();

  // Reading progress: names whose card/verse crosses the middle of the viewport count as read.
  useEffect(() => {
    if (!hydrated) return;
    const flush = () => {
      const ids = [...pending.current];
      pending.current.clear();
      if (!ids.length) return;
      markSeen(ids);
      setLastRead(mode, Math.min(...ids));
    };
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        for (const s of (e.target as HTMLElement).dataset.namaIds?.split(",") ?? []) if (s) pending.current.add(Number(s));
      }
      clearTimeout(timer.current);
      timer.current = setTimeout(flush, 1200);
    }, { rootMargin: "-40% 0px -40% 0px" });
    document.querySelectorAll("[data-nama-ids]").forEach((el) => io.observe(el));
    return () => { io.disconnect(); clearTimeout(timer.current); };
  }, [hydrated, mode, filter, markSeen, setLastRead]);

  // Jump from the search palette (or sadhana page).
  useEffect(() => {
    if (!jumpTarget || !hydrated) return;
    if (mode === "archana" && filter !== "all") { setFilter("all"); return; }
    const id = requestAnimationFrame(() => {
      const el = findTarget(jumpTarget.id);
      if (el) flashTo(el);
      clearJump();
    });
    return () => cancelAnimationFrame(id);
  }, [jumpTarget, hydrated, mode, filter, clearJump]);

  const resume = useCallback(() => {
    if (!sadhana.lastRead) return;
    if (filter !== "all") setFilter("all");
    requestAnimationFrame(() => { const el = findTarget(sadhana.lastRead!.id); if (el) flashTo(el); });
  }, [sadhana.lastRead, filter]);

  const read = sadhana.seen.length;
  const pct = Math.min(100, (read / TOTAL_NAMAS) * 100);

  return (
    <>
      <ControlBar />
      <div className="mx-auto max-w-3xl px-4 pb-16" style={{ fontSize: `${FONT_SCALES[settings.fontSize]}rem` }}>
        <section className="pt-8 text-center">
          <p className="deva text-[1.9em] font-semibold text-crimson">{meta.titleDevanagari}</p>
          <h1 className="font-display text-[1.6em] font-semibold text-saffron">{meta.title}</h1>
          <p className="text-[0.8em] text-muted">{meta.source}</p>
          <div className="mx-auto mt-4 max-w-sm" aria-label="Reading progress">
            <div className="h-1.5 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-gradient-to-r from-saffron to-gold transition-all" style={{ width: `${pct}%` }} /></div>
            <p className="mt-1 text-[0.75em] text-muted">{read} of {TOTAL_NAMAS} names read · {loadedNamaCount} in dataset</p>
          </div>
          {hydrated && sadhana.lastRead && (
            <button className="btn mx-auto mt-3" onClick={resume}><History size={15} />Resume from name {sadhana.lastRead.id}</button>
          )}
        </section>

        {!hydrated ? (
          <div className="py-24 text-center text-muted" aria-busy="true">॥ ॐ ॥</div>
        ) : mode === "stotra" ? (
          <StotraView />
        ) : (
          <>
            <div className="mt-6 flex flex-wrap justify-center gap-1.5" role="group" aria-label="Filter names">
              {FILTERS.map(([f, label]) => <button key={f} className="chip" aria-pressed={filter === f} onClick={() => setFilter(f)}>{label}</button>)}
            </div>
            <ArchanaView filter={filter} />
          </>
        )}
      </div>
    </>
  );
}
