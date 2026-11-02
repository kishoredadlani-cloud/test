# Śrī Lalitā Sahasranāma — Study & Chant

A modern, distraction-free web app for studying and chanting the Śrī Lalitā Sahasranāma (Brahmāṇḍa Purāṇa).
Next.js 14 (App Router) · TypeScript · Tailwind CSS · `lucide-react`. No backend — everything personal lives in `localStorage`.

```bash
npm install
npm run dev          # http://localhost:3000
npm run typecheck && npm run build
```

## Features
| | |
|---|---|
| **Stotra mode** | Flowing, centred verses for uninterrupted recitation (Pūrva Pīṭhikā → Mukhya Bhāga → Phala Śruti). |
| **Archana mode** | One card per name: Devanagari, IAST, `Oṃ … Namaḥ` mantra form, word-for-word chips, meaning, commentary, tags. Filter by bookmarks / favorites / notes. |
| **Sticky controls** | Toggle Devanagari · IAST · English · Commentary, A−/A+ font size (85–200%), light / dark / system theme. |
| **Search** | `Ctrl/⌘ + K`. `#42` jumps to a number; otherwise matches IAST (diacritic-insensitive), Devanagari, English meaning, tags and commentary. ↑↓ ↵ esc. |
| **Auto-scroll** | Floating play/pause teleprompter, 5–200 px/s; pauses if you scroll manually; offers to log a round at the end. |
| **Sādhanā** (`/sadhana`) | Bookmarks, favorites, notes, names-read progress + resume, daily round log, current/longest streak, 28-day heat strip. |

## Data
`src/data/lalita-sahasranamam.json` follows `src/lib/types.ts` (sections → shlokas, plus a flat `namas` array with
`id, shlokaNumber, devanagari, iast, mantraForm, meaning, wordBreakdown, commentary, categoryTags`).
`src/lib/data.ts` is the only module that touches the JSON — swap `loadDataset()` to fetch from an API if you prefer.

**Seeded now:** the three Dhyāna verses and Namas 1–26 (Shlokas 1–10). Nama 25 sits mid-verse 10, so Nama 26 is
included to keep that verse whole.

### Adding the rest
```bash
npm run data:merge -- path/or/url/to/more.json   # merge namas and/or shlokas
npm run data:validate                            # ids, shloka ↔ nama links, mantra format
```
Input shape (every field except `id` / `shlokaNumber` / `iast` is optional):
```json
{ "namas":   [{ "id": 27, "shlokaNumber": 11, "iast": "…", "dative": "…āyai",
                "meaning": "…", "commentary": "…", "categoryTags": ["gross-form"],
                "wordBreakdown": [{ "devanagari": "…", "iast": "…", "meaning": "…" }] }],
  "shlokas": [{ "section": "mukhya-bhaga", "shlokaNumber": 11, "iast": "…|\n…||", "englishTranslation": "…" }] }
```
* Devanagari is generated from IAST (`scripts/lib/translit.mjs`).
* Give `dative` (e.g. `śrīmātre`) for exact `Oṃ … Namaḥ` forms; otherwise a heuristic is used and the script warns you to review.
* `namaIds` on each shloka are recomputed automatically. Phala Śruti verses use `"section": "phala-shruti"`.
* To regenerate the seed from `scripts/seed/seed-source.mjs`: `npm run data:build`.

## Please verify before relying on the text
* Sanskrit was entered by hand from the standard recension — **proof-read against a trusted printed edition**; recensions differ in minor readings.
* Commentary is a concise paraphrase of traditional readings associated with Bhāskararāya's *Saubhāgya-bhāskara*, not a quotation of it.
* Phala Śruti is intentionally empty (the section exists) rather than risk inaccurate verses.
