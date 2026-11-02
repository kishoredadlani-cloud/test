import { namas } from "./data";
import type { Nama } from "./types";

/** Lower-case and strip diacritics so "sri" matches "Śrī". */
export function fold(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-̣̥ͯ̇̄]/g, "")
    .replace(/ḷ|ḹ/g, "l")
    .toLowerCase();
}

interface Indexed { nama: Nama; iast: string; meaning: string; tags: string; commentary: string; dev: string }
const index: Indexed[] = namas.map((n) => ({
  nama: n,
  iast: fold(n.iast),
  meaning: fold(n.meaning),
  tags: fold(n.categoryTags.join(" ")),
  commentary: fold(n.commentary),
  dev: n.devanagari,
}));

export interface SearchResult {
  nama: Nama;
  score: number;
}

export type SearchOutcome =
  | { kind: "empty" }
  | { kind: "missing-number"; id: number }
  | { kind: "results"; results: SearchResult[] };

/**
 * `#42` or `42` → jump to that nama number.
 * Otherwise every whitespace-separated term must match somewhere (AND), ranked by where it matched.
 */
export function searchNamas(query: string, limit = 40): SearchOutcome {
  const q = query.trim();
  if (!q) return { kind: "empty" };

  const num = /^#?\s*(\d{1,4})$/.exec(q);
  if (num) {
    const id = Number(num[1]);
    const hit = index.find((i) => i.nama.id === id);
    if (hit) {
      const prefix = String(id);
      const extra = q.startsWith("#")
        ? []
        : index.filter((i) => i.nama.id !== id && String(i.nama.id).startsWith(prefix)).slice(0, 5);
      return { kind: "results", results: [hit, ...extra].map((i) => ({ nama: i.nama, score: 100 })) };
    }
    return { kind: "missing-number", id };
  }

  const terms = fold(q).split(/\s+/).filter(Boolean);
  const devTerms = q.split(/\s+/).filter(Boolean);
  const results: SearchResult[] = [];
  for (const i of index) {
    let score = 0;
    let ok = true;
    for (let t = 0; t < terms.length; t++) {
      const term = terms[t];
      let s = 0;
      if (i.iast.startsWith(term)) s = 10;
      else if (i.iast.includes(term)) s = 8;
      else if (i.dev.includes(devTerms[t])) s = 8;
      else if (i.meaning.includes(term)) s = 6;
      else if (i.tags.includes(term)) s = 4;
      else if (i.commentary.includes(term)) s = 2;
      if (!s) { ok = false; break; }
      score += s;
    }
    if (ok) results.push({ nama: i.nama, score });
  }
  results.sort((a, b) => b.score - a.score || a.nama.id - b.nama.id);
  return { kind: "results", results: results.slice(0, limit) };
}
