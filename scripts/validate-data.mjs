// Validates src/data/lalita-sahasranamam.json. Usage: npm run data:validate
import { readFileSync } from "node:fs";
const path = new URL("../src/data/lalita-sahasranamam.json", import.meta.url);
const d = JSON.parse(readFileSync(path, "utf8"));
const errors = [], warns = [];
const err = (m) => errors.push(m);

const shlokaByNumber = new Map();
for (const sec of d.sections) for (const s of sec.shlokas) {
  for (const k of ["id", "shlokaNumber", "devanagari", "iast", "englishTranslation", "namaIds"]) if (s[k] === undefined) err(`shloka ${sec.id}/${s.id ?? "?"}: missing ${k}`);
  if (sec.id === "mukhya-bhaga") {
    if (shlokaByNumber.has(s.shlokaNumber)) err(`duplicate mukhya shloka ${s.shlokaNumber}`);
    shlokaByNumber.set(s.shlokaNumber, s);
  }
}
const seen = new Set();
for (const n of d.namas) {
  for (const k of ["id", "shlokaNumber", "devanagari", "iast", "mantraForm", "meaning", "categoryTags"]) if (n[k] === undefined || n[k] === "") err(`nama ${n.id ?? "?"}: missing ${k}`);
  if (!n.commentary) warns.push(`nama ${n.id}: no commentary yet`);
  if (!Number.isInteger(n.id) || n.id < 1 || n.id > 1000) err(`nama id out of range: ${n.id}`);
  if (seen.has(n.id)) err(`duplicate nama id ${n.id}`);
  seen.add(n.id);
  if (!/^Oṃ .+ Namaḥ$/.test(n.mantraForm ?? "")) err(`nama ${n.id}: mantraForm should read "Oṃ … Namaḥ"`);
  const sh = shlokaByNumber.get(n.shlokaNumber);
  if (!sh) err(`nama ${n.id}: shloka ${n.shlokaNumber} not found`);
  else if (!sh.namaIds.includes(n.id)) err(`nama ${n.id}: not listed in shloka ${n.shlokaNumber}.namaIds`);
}
for (const s of shlokaByNumber.values()) for (const id of s.namaIds) if (!seen.has(id)) err(`shloka ${s.shlokaNumber}: namaId ${id} has no nama record`);
const ids = [...seen].sort((a, b) => a - b);
if (ids.length && ids[ids.length - 1] !== ids.length) warns.push(`nama ids are not contiguous from 1 (have ${ids.length}, max ${ids[ids.length - 1]})`);
console.log(`Namas: ${ids.length}/1000   Mukhya shlokas: ${shlokaByNumber.size}/${d.meta.expectedMukhyaShlokaCount}`);
warns.forEach((w) => console.warn("warn:", w));
if (errors.length) { errors.forEach((e) => console.error("error:", e)); process.exit(1); }
console.log("Dataset OK");
