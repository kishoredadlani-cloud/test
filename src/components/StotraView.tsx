"use client";
import { toDevanagariDigits, getNama, sections } from "@/lib/data";
import type { Shloka } from "@/lib/types";
import { useApp } from "./AppProvider";

/** Insert the verse number inside the closing danda: "… ॥" → "… ॥ ३ ॥" */
const withNumDeva = (t: string, n: number) => t.replace(/॥\s*$/, `॥ ${toDevanagariDigits(n)} ॥`);
const withNumIast = (t: string, n: number) => t.replace(/\|\|\s*$/, `|| ${n} ||`);

function ShlokaBlock({ s }: { s: Shloka }) {
  const { settings } = useApp();
  const { showDevanagari, showIast, showMeaning, showCommentary } = settings;
  const lines = (t: string) => t.split("\n").map((l, i) => <span key={i} className="block">{l}</span>);
  const names = s.namaIds.map(getNama).filter((n): n is NonNullable<typeof n> => !!n);
  const range = s.namaIds.length ? (s.namaIds.length > 1 ? `Names ${s.namaIds[0]}–${s.namaIds[s.namaIds.length - 1]}` : `Name ${s.namaIds[0]}`) : null;

  return (
    <article
      id={`shloka-${s.id}`} data-shloka-id={s.id} data-nama-ids={s.namaIds.join(",")}
      className="scroll-mt-28 py-7 text-center [contain-intrinsic-size:auto_220px] [content-visibility:auto]"
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold">{[s.label ?? `Śloka ${s.shlokaNumber}`, range].filter(Boolean).join(" · ")}</p>
      {showDevanagari && <p className="deva mx-auto max-w-2xl text-[1.55em] font-medium leading-[1.9] text-crimson">{lines(withNumDeva(s.devanagari, s.shlokaNumber))}</p>}
      {showIast && <p className="iast mx-auto mt-3 max-w-2xl text-[1.05em] leading-relaxed">{lines(withNumIast(s.iast, s.shlokaNumber))}</p>}
      {showMeaning && s.englishTranslation && <p className="mx-auto mt-3 max-w-xl text-[0.95em] leading-relaxed text-muted">{s.englishTranslation}</p>}
      {showCommentary && names.length > 0 && (
        <details className="mx-auto mt-4 max-w-xl text-left">
          <summary className="cursor-pointer text-center text-sm text-saffron hover:text-crimson">Notes on the names in this verse</summary>
          <ul className="mt-3 space-y-3">
            {names.map((n) => (
              <li key={n.id} className="border-l-[3px] border-gold pl-3 text-[0.9em]">
                <p><span className="font-semibold text-crimson">{n.id}. {n.iast}</span> — {n.meaning}</p>
                <p className="mt-1 text-ink/85">{n.commentary}</p>
              </li>
            ))}
          </ul>
        </details>
      )}
    </article>
  );
}

export function StotraView() {
  return (
    <div className="divide-y divide-line/60">
      {sections.map((sec) => (
        <section key={sec.id} id={`section-${sec.id}`} className="py-6" aria-labelledby={`h-${sec.id}`}>
          <header className="mb-2 text-center">
            <h2 id={`h-${sec.id}`} className="font-display text-3xl font-semibold text-crimson">{sec.title}</h2>
            <p className="deva text-lg text-saffron">{sec.titleDevanagari}</p>
            <p className="text-sm text-muted">{sec.description}</p>
          </header>
          {sec.shlokas.length === 0 ? (
            <p className="mx-auto my-6 max-w-md rounded-xl border border-dashed border-line p-4 text-center text-sm text-muted">
              This section isn’t in the dataset yet. Add it with <code className="rounded bg-gold/15 px-1">npm run data:merge</code> — see the README.
            </p>
          ) : (
            sec.shlokas.map((s) => <ShlokaBlock key={s.id} s={s} />)
          )}
        </section>
      ))}
    </div>
  );
}
