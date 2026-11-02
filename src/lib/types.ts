export type SectionId = "purva-peethika" | "mukhya-bhaga" | "phala-shruti";

export interface WordPart {
  devanagari: string;
  iast: string;
  meaning: string;
}

export interface Shloka {
  id: string;
  section: SectionId;
  shlokaNumber: number;
  /** Optional heading, e.g. "Dhyānam 1" */
  label?: string;
  devanagari: string;
  iast: string;
  englishTranslation: string;
  namaIds: number[];
}

export interface Nama {
  /** 1–1000 */
  id: number;
  shlokaNumber: number;
  devanagari: string;
  iast: string;
  /** e.g. "Oṃ Śrīmātre Namaḥ" */
  mantraForm: string;
  /** e.g. "ॐ श्रीमात्रे नमः" */
  mantraFormDevanagari?: string;
  meaning: string;
  wordBreakdown?: WordPart[];
  commentary: string;
  /** e.g. "Srishti", "Kundalini", "gross-form", "subtle-form" */
  categoryTags: string[];
}

export interface Section {
  id: SectionId;
  title: string;
  titleDevanagari: string;
  description: string;
  shlokas: Shloka[];
}

export interface DatasetMeta {
  title: string;
  titleDevanagari: string;
  source: string;
  commentaryTradition: string;
  schemaVersion: number;
  expectedNamaCount: number;
  expectedMukhyaShlokaCount: number;
  note?: string;
}

export interface Dataset {
  meta: DatasetMeta;
  sections: Section[];
  namas: Nama[];
}
