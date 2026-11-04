// Merge more of the dataset into src/data/lalita-sahasranamam.json.
//   npm run data:merge -- path/to/more.json
//   npm run data:merge -- https://example.org/lalita.json
//
// Input JSON: { "namas": [...], "shlokas": [...] }  (either key optional)
//  • nama   : { id, shlokaNumber, iast, meaning, [dative], [devanagari], [mantraForm], [commentary], [categoryTags], [wordBreakdown] }
//  • shloka : { section?: "mukhya-bhaga"|"phala-shruti"|"purva-peethika", shlokaNumber, iast, englishTranslation, [devanagari] }
// Missing Devanagari is generated from IAST. Missing mantraForm is built from `dative` (preferred) or a
// heuristic that you should review. namaIds are recomputed from nama.shlokaNumber.
import { readFileSync, writeFileSync } from "node:fs";
import { iastToDevanagari, mantraFromDative, guessDativeIast, normalizeIast, titleCaseIast } from "./lib/translit.mjs";

const target = new URL("../src/data/lalita-sahasranamam.json", import.meta.url);
const arg = process.argv[2];
if (!arg) { console.error("usage: npm run data:merge -- <file-or-url>"); process.exit(1); }
const raw = /^https?:\/\//.test(arg) ? await (await fetch(arg)).text() : readFileSync(arg, "utf8");
const incoming = JSON.parse(raw);
const d = JSON.parse(readFileSync(target, "utf8"));

const byId = new Map(d.namas.map((n) => [n.id, n]));
let addedN = 0, guessed = 0;
for (const n of incoming.namas ?? []) {
  const iast = titleCaseIast(normalizeIast(n.iast));
  const dative = n.dative ?? guessDativeIast(n.iast);
  if (!n.mantraForm && !n.dative) guessed++;
  const m = mantraFromDative(dative);
  const row = {
    id: n.id, shlokaNumber: n.shlokaNumber,
    devanagari: n.devanagari ?? iastToDevanagari(n.iast), iast,
    mantraForm: n.mantraForm ?? m.iast, mantraFormDevanagari: n.mantraFormDevanagari ?? m.devanagari,
    meaning: n.meaning ?? "", wordBreakdown: n.wordBreakdown ?? [],
    commentary: n.commentary ?? "", categoryTags: n.categoryTags ?? [],
  };
  if (!byId.has(n.id)) addedN++;
  byId.set(n.id, row);
}
d.namas = [...byId.values()].sort((a, b) => a.id - b.id);

let addedS = 0;
for (const s of incoming.shlokas ?? []) {
  const secId = s.section ?? "mukhya-bhaga";
  const sec = d.sections.find((x) => x.id === secId);
  if (!sec) throw new Error(`unknown section ${secId}`);
  const row = {
    id: s.id ?? `${secId === "mukhya-bhaga" ? "mb" : secId === "phala-shruti" ? "ps" : "pp"}-${s.shlokaNumber}`,
    section: secId, shlokaNumber: s.shlokaNumber, ...(s.label ? { label: s.label } : {}),
    devanagari: s.devanagari ?? iastToDevanagari(s.iast), iast: normalizeIast(s.iast),
    englishTranslation: s.englishTranslation ?? "", namaIds: [],
  };
  const i = sec.shlokas.findIndex((x) => x.shlokaNumber === row.shlokaNumber);
  if (i >= 0) sec.shlokas[i] = row; else { sec.shlokas.push(row); addedS++; }
  sec.shlokas.sort((a, b) => a.shlokaNumber - b.shlokaNumber);
}
const mb = d.sections.find((s) => s.id === "mukhya-bhaga");
for (const s of mb.shlokas) s.namaIds = d.namas.filter((n) => n.shlokaNumber === s.shlokaNumber).map((n) => n.id);

writeFileSync(target, JSON.stringify(d, null, 2) + "\n");
console.log(`Merged: +${addedN} new namas (${d.namas.length} total), +${addedS} new shlokas.`);
if (guessed) console.warn(`Review: ${guessed} mantra forms used the dative heuristic. Supply "dative" or "mantraForm" for exact forms.`);
