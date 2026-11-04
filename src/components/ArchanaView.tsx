"use client";
import { Fragment, useMemo } from "react";
import { namas, TOTAL_NAMAS, loadedNamaCount } from "@/lib/data";
import { useApp } from "./AppProvider";
import { NamaCard } from "./NamaCard";

export type ArchanaFilter = "all" | "bookmarks" | "favorites" | "notes";

export function ArchanaView({ filter }: { filter: ArchanaFilter }) {
  const { settings, sadhana, toggleBookmark, toggleFavorite, setNote } = useApp();
  const { showDevanagari, showIast, showMeaning, showCommentary } = settings;

  const bookmarks = useMemo(() => new Set(sadhana.bookmarks), [sadhana.bookmarks]);
  const favorites = useMemo(() => new Set(sadhana.favorites), [sadhana.favorites]);

  const list = useMemo(() => namas.filter((n) =>
    filter === "all" ? true
      : filter === "bookmarks" ? bookmarks.has(n.id)
      : filter === "favorites" ? favorites.has(n.id)
      : !!sadhana.notes[n.id]?.trim(),
  ), [filter, bookmarks, favorites, sadhana.notes]);

  if (list.length === 0) {
    return <p className="mx-auto my-16 max-w-sm text-center text-muted">Nothing here yet — use the bookmark, heart or note buttons on any name.</p>;
  }

  let prevShloka = -1;
  return (
    <div className="space-y-4 py-6">
      {list.map((n) => {
        const header = filter === "all" && n.shlokaNumber !== prevShloka;
        prevShloka = n.shlokaNumber;
        return (
          <Fragment key={n.id}>
            {header && (
              <div className="flex items-center gap-3 pt-4 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                <span className="h-px flex-1 bg-line" />Śloka {n.shlokaNumber}<span className="h-px flex-1 bg-line" />
              </div>
            )}
            <NamaCard
              nama={n}
              showDevanagari={showDevanagari} showIast={showIast} showMeaning={showMeaning} showCommentary={showCommentary}
              bookmarked={bookmarks.has(n.id)} favorite={favorites.has(n.id)} note={sadhana.notes[n.id] ?? ""}
              onBookmark={toggleBookmark} onFavorite={toggleFavorite} onNote={setNote}
            />
          </Fragment>
        );
      })}
      {filter === "all" && loadedNamaCount < TOTAL_NAMAS && (
        <div className="rounded-2xl border border-dashed border-line p-5 text-center text-sm text-muted">
          Names {loadedNamaCount + 1}–{TOTAL_NAMAS} are not in the dataset yet ({loadedNamaCount} of {TOTAL_NAMAS} loaded).
          <br />Add them with <code className="rounded bg-gold/15 px-1">npm run data:merge -- your-file.json</code>.
        </div>
      )}
    </div>
  );
}
