// IAST -> Devanagari transliterator (dev-time tool; used by the seed builder and the dataset merger).
const IND = { a: "अ", ā: "आ", i: "इ", ī: "ई", u: "उ", ū: "ऊ", ṛ: "ऋ", ṝ: "ॠ", ḷ: "ऌ", e: "ए", ai: "ऐ", o: "ओ", au: "औ" };
const MATRA = { a: "", ā: "ा", i: "ि", ī: "ी", u: "ु", ū: "ू", ṛ: "ृ", ṝ: "ॄ", ḷ: "ॢ", e: "े", ai: "ै", o: "ो", au: "ौ" };
const CONS = {
  k: "क", kh: "ख", g: "ग", gh: "घ", ṅ: "ङ", c: "च", ch: "छ", j: "ज", jh: "झ", ñ: "ञ",
  ṭ: "ट", ṭh: "ठ", ḍ: "ड", ḍh: "ढ", ṇ: "ण", t: "त", th: "थ", d: "द", dh: "ध", n: "न",
  p: "प", ph: "फ", b: "ब", bh: "भ", m: "म", y: "य", r: "र", l: "ल", v: "व", ś: "श", ṣ: "ष", s: "स", h: "ह",
};
const VIRAMA = "्";

export function normalizeIast(s) {
  return s.normalize("NFC").replace(/r̥/g, "ṛ").replace(/l̥/g, "ḷ").replace(/ṁ/g, "ṃ");
}

export function iastToDevanagari(input) {
  const s = normalizeIast(input).toLowerCase();
  let out = "";
  let afterCons = false;
  for (let i = 0; i < s.length; ) {
    const two = s.slice(i, i + 2);
    const one = s[i];
    if (two === "ai" || two === "au") {
      out += afterCons ? MATRA[two] : IND[two];
      afterCons = false; i += 2; continue;
    }
    if (IND[one] !== undefined) {
      out += afterCons ? MATRA[one] : IND[one];
      afterCons = false; i += 1; continue;
    }
    if (CONS[two] !== undefined && two.length === 2) {
      if (afterCons) out += VIRAMA;
      out += CONS[two]; afterCons = true; i += 2; continue;
    }
    if (CONS[one] !== undefined) {
      if (afterCons) out += VIRAMA;
      out += CONS[one]; afterCons = true; i += 1; continue;
    }
    if (one === "ṃ") { out += "ं"; afterCons = false; i += 1; continue; }
    if (one === "ḥ") { out += "ः"; afterCons = false; i += 1; continue; }
    if (afterCons) { out += VIRAMA; afterCons = false; }
    if (one === "|") {
      if (s[i + 1] === "|") { out += "॥"; i += 2; } else { out += "।"; i += 1; }
      continue;
    }
    if (one === "-") { i += 1; continue; }
    if (one === "'") { out += "ऽ"; i += 1; continue; }
    out += one; i += 1;
  }
  if (afterCons) out += VIRAMA;
  return out;
}

const cap = (w) => (w ? w[0].toLocaleUpperCase() + w.slice(1) : w);
export const titleCaseIast = (s) => s.split(/(\s+)/).map(cap).join("");

// Heuristic dative for feminine names (used only by merge-data when `mantraForm` is not supplied).
export function guessDativeIast(iast) {
  const n = normalizeIast(iast);
  if (/mātā$/.test(n)) return n.replace(/mātā$/, "mātre");
  if (/ā$/.test(n)) return n.replace(/ā$/, "āyai");
  if (/ī$/.test(n)) return n.replace(/ī$/, "yai");
  if (/ūḥ$/.test(n)) return n.replace(/ūḥ$/, "uve");
  if (/ḥ$/.test(n)) return n; // needs manual review
  return n;
}

export function mantraFromDative(dativeIast) {
  const d = titleCaseIast(dativeIast);
  return {
    iast: `Oṃ ${d} Namaḥ`,
    devanagari: `ॐ ${iastToDevanagari(dativeIast)} नमः`,
  };
}
