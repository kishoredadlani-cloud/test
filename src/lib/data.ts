import raw from "@/data/lalita-sahasranamam.json";
import type { Dataset, Nama, Section, Shloka } from "./types";

/**
 * Modular loader. To change the data source (e.g. fetch from an API), replace `loadDataset`
 * with an async implementation – everything else uses the helpers below.
 */
export function loadDataset(): Dataset {
  return raw as unknown as Dataset;
}

const dataset = loadDataset();

export const meta = dataset.meta;
export const sections: Section[] = dataset.sections;
export const namas: Nama[] = [...dataset.namas].sort((a, b) => a.id - b.id);

const namaById = new Map(namas.map((n) => [n.id, n]));
export const getNama = (id: number): Nama | undefined => namaById.get(id);

export const allShlokas: Shloka[] = sections.flatMap((s) => s.shlokas);
export const mukhyaShlokas: Shloka[] = sections.find((s) => s.id === "mukhya-bhaga")?.shlokas ?? [];

const shlokaByNumber = new Map(mukhyaShlokas.map((s) => [s.shlokaNumber, s]));
export const getMainShloka = (n: number): Shloka | undefined => shlokaByNumber.get(n);

export const TOTAL_NAMAS = meta.expectedNamaCount;
export const loadedNamaCount = namas.length;

/** Devanagari digits for verse numbers, e.g. 12 → १२ */
export const toDevanagariDigits = (n: number): string =>
  String(n).replace(/\d/g, (d) => "०१२३४५६७८९"[Number(d)]);
