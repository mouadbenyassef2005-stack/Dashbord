import { WORDS, SURAHS } from "./quran";
import { skeleton } from "@/lib/live/normalize";

export interface MWord {
  id: string; // "85:3:2"
  verse: number;
  pos: number;
  text: string;
  skel: string;
  tr?: string;
  optional?: boolean;
}
export interface MVerse { n: number; words: MWord[] }
export interface SurahPage {
  id: number;
  name: string;
  nameTranslit: string;
  basmala: MWord[];
  verses: MVerse[];
  /** flache Wortliste in Lesereihenfolge: Basmala (optional) + alle Ayat */
  flat: MWord[];
}

/** Suren, die im Lesemodus verfügbar sind (Demo: eine Seite). */
export const READER_SURAHS = [85];

export function surahPage(id: number): SurahPage | null {
  const info = SURAHS.find((s) => s.id === id);
  if (!info || !READER_SURAHS.includes(id)) return null;
  const mk = (w: (typeof WORDS)[number], optional = false): MWord => ({ id: w.id, verse: w.ayah, pos: w.position, text: w.uthmani, skel: skeleton(w.uthmani), tr: w.transliteration, optional });
  const basmala = WORDS.filter((w) => w.surah === 1 && w.ayah === 1).map((w) => mk(w, true));
  const words = WORDS.filter((w) => w.surah === id).map((w) => mk(w));
  const verses: MVerse[] = [];
  for (const w of words) {
    let v = verses.find((x) => x.n === w.verse);
    if (!v) verses.push((v = { n: w.verse, words: [] }));
    v.words.push(w);
  }
  return { id, name: info.name, nameTranslit: info.nameTranslit, basmala, verses, flat: [...basmala, ...words] };
}

/** Arabisch-indische Ziffern für Ayah-Nummern. */
export const arabicIndic = (n: number) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
