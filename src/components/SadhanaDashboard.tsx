"use client";
import { useMemo } from "react";
import Link from "next/link";
import { Bookmark, Flame, Heart, Minus, Plus, StickyNote } from "lucide-react";
import { useApp } from "./AppProvider";
import { computeStreak, dateKey, lastNDays } from "@/lib/dates";
import { getNama, TOTAL_NAMAS } from "@/lib/data";

function Stat({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="card p-4 text-center">
      <p className="flex items-center justify-center gap-1.5 font-display text-4xl font-semibold text-crimson">{icon}{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wider text-muted">{label}</p>
    </div>
  );
}

function NamaRow({ id, onOpen, extra }: { id: number; onOpen: (id: number) => void; extra?: React.ReactNode }) {
  const n = getNama(id);
  return (
    <li className="flex items-start gap-3 rounded-xl border border-line bg-surface/70 p-3">
      <span className="mt-0.5 flex h-7 min-w-7 items-center justify-center rounded-full bg-crimson px-1.5 text-xs font-semibold text-[#fff4d6]">{id}</span>
      <div className="min-w-0 flex-1">
        {n ? (
          <button onClick={() => onOpen(id)} className="block text-left">
            <span className="deva block text-lg leading-snug text-crimson">{n.devanagari}</span>
            <span className="iast block text-sm">{n.iast}</span>
            <span className="block text-sm text-muted">{n.meaning}</span>
          </button>
        ) : <span className="text-sm text-muted">Name {id} (not in dataset yet)</span>}
        {extra}
      </div>
    </li>
  );
}

export function SadhanaDashboard() {
  const { sadhana, hydrated, addRounds, setNote, toggleBookmark, toggleFavorite, jumpTo } = useApp();
  const today = dateKey();
  const streak = useMemo(() => computeStreak(sadhana.log, today), [sadhana.log, today]);
  const days = useMemo(() => lastNDays(28, today), [today]);
  const todayCount = sadhana.log[today] ?? 0;
  const noteIds = Object.keys(sadhana.notes).map(Number).sort((a, b) => a - b);
  const bookmarks = [...sadhana.bookmarks].sort((a, b) => a - b);
  const favorites = [...sadhana.favorites].sort((a, b) => a - b);
  const pct = Math.min(100, (sadhana.seen.length / TOTAL_NAMAS) * 100);

  if (!hydrated) return <div className="py-24 text-center text-muted" aria-busy="true">॥ ॐ ॥</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 pb-24 pt-8">
      <div className="text-center">
        <h1 className="font-display text-4xl font-semibold text-crimson">Sādhanā</h1>
        <p className="text-sm text-muted">Your practice, kept privately on this device.</p>
      </div>

      <section aria-label="Streak" className="grid grid-cols-3 gap-3">
        <Stat label="Day streak" value={streak.current} icon={<Flame size={26} className={streak.current ? "text-saffron" : "text-line"} />} />
        <Stat label="Longest" value={streak.longest} />
        <Stat label="Total rounds" value={streak.totalRounds} />
      </section>

      <section className="card p-5" aria-label="Today's parayanam">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-semibold text-crimson">Today’s parayanam</h2>
            <p className="text-sm text-muted">{todayCount > 0 ? `${todayCount} round${todayCount > 1 ? "s" : ""} logged today.` : streak.current > 0 ? "Log today to keep your streak alive." : "Log a round to begin your streak."}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-icon border border-line" onClick={() => addRounds(-1)} disabled={!todayCount} aria-label="Remove one round"><Minus size={16} /></button>
            <span className="w-8 text-center font-display text-3xl text-crimson tabular-nums" aria-live="polite">{todayCount}</span>
            <button className="btn border-saffron bg-saffron/15" onClick={() => addRounds(1)}><Plus size={16} />Log a round</button>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-7 gap-1.5" role="img" aria-label="Recitation activity over the last 28 days">
          {days.map((d) => {
            const c = sadhana.log[d] ?? 0;
            return (
              <div key={d} title={`${d}: ${c} round${c === 1 ? "" : "s"}`}
                className={`aspect-square rounded-md border ${d === today ? "border-saffron" : "border-line"} ${c === 0 ? "bg-bg/60" : c === 1 ? "bg-saffron/50" : c === 2 ? "bg-saffron/80" : "bg-crimson"}`} />
            );
          })}
        </div>
        <p className="mt-2 text-xs text-muted">Last 28 days · darker = more rounds</p>
      </section>

      <section aria-label="Reading progress" className="card p-5">
        <h2 className="font-display text-2xl font-semibold text-crimson">Reading progress</h2>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-gradient-to-r from-saffron to-gold" style={{ width: `${pct}%` }} /></div>
        <p className="mt-1.5 text-sm text-muted">{sadhana.seen.length} of {TOTAL_NAMAS} names read{sadhana.lastRead ? ` · last position: name ${sadhana.lastRead.id}` : ""}</p>
        {sadhana.lastRead && <button className="btn mt-3" onClick={() => jumpTo(sadhana.lastRead!.id)}>Resume reading</button>}
      </section>

      <section aria-label="Bookmarks">
        <h2 className="mb-3 flex items-center gap-2 font-display text-2xl font-semibold text-crimson"><Bookmark size={20} className="text-saffron" />Bookmarks <span className="text-base text-muted">({bookmarks.length})</span></h2>
        {bookmarks.length ? <ul className="space-y-2">{bookmarks.map((id) => <NamaRow key={id} id={id} onOpen={jumpTo} extra={<button className="mt-1 text-xs text-muted underline" onClick={() => toggleBookmark(id)}>Remove</button>} />)}</ul> : <Empty>Bookmark names while reading to collect them here.</Empty>}
      </section>

      <section aria-label="Favorites">
        <h2 className="mb-3 flex items-center gap-2 font-display text-2xl font-semibold text-crimson"><Heart size={20} className="text-crimson" />Favorite names <span className="text-base text-muted">({favorites.length})</span></h2>
        {favorites.length ? <ul className="space-y-2">{favorites.map((id) => <NamaRow key={id} id={id} onOpen={jumpTo} extra={<button className="mt-1 text-xs text-muted underline" onClick={() => toggleFavorite(id)}>Remove</button>} />)}</ul> : <Empty>Tap the heart on a name to add it to your favorites.</Empty>}
      </section>

      <section aria-label="Study notes">
        <h2 className="mb-3 flex items-center gap-2 font-display text-2xl font-semibold text-crimson"><StickyNote size={20} className="text-saffron" />Study notes <span className="text-base text-muted">({noteIds.length})</span></h2>
        {noteIds.length ? (
          <ul className="space-y-2">
            {noteIds.map((id) => (
              <NamaRow key={id} id={id} onOpen={jumpTo} extra={
                <textarea value={sadhana.notes[id]} onChange={(e) => setNote(id, e.target.value)} rows={2} aria-label={`Note for name ${id}`}
                  className="mt-2 w-full resize-y rounded-lg border border-line bg-bg/70 p-2 text-sm outline-none focus:border-saffron" />
              } />
            ))}
          </ul>
        ) : <Empty>Add a note from the note button on any name in <Link href="/" className="underline">Archana view</Link>.</Empty>}
      </section>
    </div>
  );
}

const Empty = ({ children }: { children: React.ReactNode }) => (
  <p className="rounded-xl border border-dashed border-line p-4 text-center text-sm text-muted">{children}</p>
);
