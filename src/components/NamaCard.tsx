"use client";
import { memo, useState } from "react";
import { Bookmark, Heart, StickyNote } from "lucide-react";
import type { Nama } from "@/lib/types";

export interface NamaCardProps {
  nama: Nama;
  showDevanagari: boolean;
  showIast: boolean;
  showMeaning: boolean;
  showCommentary: boolean;
  bookmarked: boolean;
  favorite: boolean;
  note: string;
  onBookmark: (id: number) => void;
  onFavorite: (id: number) => void;
  onNote: (id: number, text: string) => void;
}

function NamaCardImpl(p: NamaCardProps) {
  const { nama: n } = p;
  const [noteOpen, setNoteOpen] = useState(false);
  const hasNote = p.note.trim().length > 0;
  const words = n.wordBreakdown ?? [];

  return (
    <article
      id={`nama-${n.id}`} data-nama-ids={n.id}
      className="card scroll-mt-28 p-4 [contain-intrinsic-size:auto_320px] [content-visibility:auto] sm:p-6"
      aria-label={`Nama ${n.id}: ${n.iast}`}
    >
      <header className="mb-3 flex items-center gap-2">
        <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-crimson px-2 text-sm font-semibold text-[#fff4d6]">{n.id}</span>
        <div className="flex flex-wrap gap-1">
          {n.categoryTags.map((t) => (
            <span key={t} className="rounded-full border border-gold/50 px-2 py-0.5 text-[11px] uppercase tracking-wide text-gold">{t}</span>
          ))}
        </div>
        <div className="ml-auto flex">
          <button className={`btn-icon ${hasNote ? "!text-saffron" : ""}`} onClick={() => setNoteOpen((o) => !o)} aria-label={noteOpen ? "Hide note" : hasNote ? "Edit note" : "Add note"} aria-expanded={noteOpen} title="Study note"><StickyNote size={18} /></button>
          <button className={`btn-icon ${p.favorite ? "!text-crimson" : ""}`} onClick={() => p.onFavorite(n.id)} aria-pressed={p.favorite} aria-label="Favorite" title="Favorite"><Heart size={18} fill={p.favorite ? "currentColor" : "none"} /></button>
          <button className={`btn-icon ${p.bookmarked ? "!text-saffron" : ""}`} onClick={() => p.onBookmark(n.id)} aria-pressed={p.bookmarked} aria-label="Bookmark" title="Bookmark"><Bookmark size={18} fill={p.bookmarked ? "currentColor" : "none"} /></button>
        </div>
      </header>

      {p.showDevanagari && <h3 className="deva break-words text-[1.7em] font-semibold leading-snug text-crimson">{n.devanagari}</h3>}
      {p.showIast && <p className="iast mt-1 break-words text-[1.15em] font-medium">{n.iast}</p>}

      {(p.showDevanagari || p.showIast) && (
        <div className="mt-3 rounded-xl border border-gold/40 bg-gold/10 px-4 py-2.5">
          {p.showDevanagari && <p className="deva break-words text-[1.15em] text-ink">{n.mantraFormDevanagari ?? n.mantraForm}</p>}
          {p.showIast && <p className="iast break-words text-[0.95em] text-muted">{n.mantraForm}</p>}
        </div>
      )}

      {p.showMeaning && (
        <>
          {words.length > 0 && (
            <dl className="mt-4 flex flex-wrap gap-2" aria-label="Word-for-word">
              {words.map((w, i) => (
                <div key={i} className="rounded-lg border border-line bg-bg/60 px-2.5 py-1.5">
                  <dt className="text-[0.95em]"><span className="deva text-crimson">{w.devanagari}</span> <span className="iast text-[0.85em] text-muted">{w.iast}</span></dt>
                  <dd className="text-[0.8em] text-muted">{w.meaning}</dd>
                </div>
              ))}
            </dl>
          )}
          <p className="mt-4 text-[1.05em] leading-relaxed"><span className="font-semibold text-saffron">Meaning · </span>{n.meaning}</p>
        </>
      )}

      {p.showCommentary && (
        <blockquote className="mt-4 border-l-[3px] border-gold pl-4 text-[0.95em] leading-relaxed text-ink/90">
          <span className="mb-1 block text-[0.75em] font-semibold uppercase tracking-wider text-gold">Commentary</span>
          {n.commentary}
        </blockquote>
      )}

      {(noteOpen || hasNote) && (
        <div className="mt-4">
          <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted" htmlFor={`note-${n.id}`}><StickyNote size={12} />My note</label>
          <textarea
            id={`note-${n.id}`} value={p.note} onChange={(e) => p.onNote(n.id, e.target.value)}
            rows={3} placeholder="Personal reflections on this name… (saved on this device)"
            className="w-full resize-y rounded-lg border border-line bg-bg/70 p-3 text-sm outline-none focus:border-saffron"
          />
        </div>
      )}
    </article>
  );
}
export const NamaCard = memo(NamaCardImpl);
