// Builds src/data/lalita-sahasranamam.json from scripts/seed/seed-source.mjs.
// Usage: npm run data:build
import { writeFileSync } from "node:fs";
import { dhyanam, shlokas, namas } from "./seed/seed-source.mjs";
import { iastToDevanagari, mantraFromDative, normalizeIast, titleCaseIast } from "./lib/translit.mjs";

const verse = (iast) => normalizeIast(iast).replace(/-\n/g, "\n");
const dev = (iast) => iastToDevanagari(verse(iast));

const purva = dhyanam.map((d, i) => ({
  id: `pp-${i + 1}`, section: "purva-peethika", shlokaNumber: i + 1, label: d.label,
  devanagari: dev(d.iast).replace(/ *\n */g, "\n"), iast: verse(d.iast), englishTranslation: d.en, namaIds: [],
}));

const mukhya = shlokas.map((s) => ({
  id: `mb-${s.n}`, section: "mukhya-bhaga", shlokaNumber: s.n,
  devanagari: dev(s.iast), iast: verse(s.iast), englishTranslation: s.en, namaIds: s.ids,
}));

const namaRows = namas.map((n) => {
  const m = mantraFromDative(n.dat);
  return {
    id: n.id, shlokaNumber: n.s,
    devanagari: iastToDevanagari(n.iast), iast: titleCaseIast(normalizeIast(n.iast)),
    mantraForm: m.iast, mantraFormDevanagari: m.devanagari,
    meaning: n.meaning,
    wordBreakdown: n.words.map(([w, mean]) => ({ devanagari: iastToDevanagari(w), iast: w, meaning: mean })),
    commentary: n.commentary, categoryTags: n.tags,
  };
});

const dataset = {
  meta: {
    title: "Śrī Lalitā Sahasranāma", titleDevanagari: "श्रीललितासहस्रनाम",
    source: "Brahmāṇḍa Purāṇa (Lalitopākhyāna)", commentaryTradition: "Bhāskararāya, Saubhāgya-bhāskara (paraphrased)",
    schemaVersion: 1, expectedNamaCount: 1000, expectedMukhyaShlokaCount: 182,
    note: "Seed dataset: Dhyānam + Namas 1–26 (Shlokas 1–10). Use `npm run data:merge` to add the rest.",
  },
  sections: [
    { id: "purva-peethika", title: "Pūrva Pīṭhikā", titleDevanagari: "पूर्वपीठिका", description: "Dhyānam and introductory verses", shlokas: purva },
    { id: "mukhya-bhaga", title: "Mukhya Bhāga", titleDevanagari: "मुख्यभाग", description: "The main stotra — the 1,000 names", shlokas: mukhya },
    { id: "phala-shruti", title: "Phala Śruti", titleDevanagari: "फलश्रुति", description: "Concluding verses on the fruits of recitation", shlokas: [] },
  ],
  namas: namaRows,
};
writeFileSync(new URL("../src/data/lalita-sahasranamam.json", import.meta.url), JSON.stringify(dataset, null, 2) + "\n");
console.log(`Wrote ${namaRows.length} namas, ${purva.length + mukhya.length} shlokas.`);
