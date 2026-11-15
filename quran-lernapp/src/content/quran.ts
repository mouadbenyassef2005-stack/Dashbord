import raw from "./generated/quran-source.json";
import type { QuranWord } from "./types";
import { difficultyOf, harakatOf, lettersOf } from "@/lib/arabic";

interface RawWord { t: string; tr?: string }
interface RawVerse { n: number; text: string; words: RawWord[] }
interface RawSurah { id: number; name: string; nameTranslit: string; verses: RawVerse[] }

const surahs = (raw as { surahs: RawSurah[] }).surahs;
export const QURAN_SOURCE_INFO = (raw as { source: { arabic: string; transliteration: string; license: string; note: string } }).source;

export const SURAHS = surahs.map((s) => ({ id: s.id, name: s.name, nameTranslit: s.nameTranslit, ayat: s.verses.length }));

export function surahInfo(id: number) {
  return SURAHS.find((s) => s.id === id)!;
}

/** Alle Wörter der enthaltenen Suren. */
export const WORDS: QuranWord[] = surahs.flatMap((s) =>
  s.verses.flatMap((v) =>
    v.words.map((w, i): QuranWord => ({
      id: `${s.id}:${v.n}:${i + 1}`,
      uthmani: w.t,
      transliteration: w.tr,
      surah: s.id,
      surahName: s.nameTranslit,
      ayah: v.n,
      position: i + 1,
      letters: lettersOf(w.t),
      harakat: harakatOf(w.t),
      difficulty: difficultyOf(w.t),
    })),
  ),
);

export const WORD_BY_ID = new Map(WORDS.map((w) => [w.id, w]));

/** Eindeutige Wörter (erstes Vorkommen) einer Sure in Lesereihenfolge. */
export function uniqueWordsOf(surahId: number): QuranWord[] {
  const seen = new Set<string>();
  return WORDS.filter((w) => w.surah === surahId).filter((w) => {
    if (seen.has(w.uthmani)) return false;
    seen.add(w.uthmani);
    return true;
  });
}

/** Lernbare Wörter: je Sure das erste Vorkommen jedes Wortes (entspricht den Wort-Lektionen). */
export const UNIQUE_WORDS: QuranWord[] = SURAHS.flatMap((s) => uniqueWordsOf(s.id));

export interface Ayah {
  id: string; // "112:1"
  surah: number;
  surahName: string;
  n: number;
  text: string;
  translit?: string;
}

export function ayatOf(surahId: number): Ayah[] {
  const s = surahs.find((x) => x.id === surahId)!;
  return s.verses.map((v) => ({
    id: `${s.id}:${v.n}`,
    surah: s.id,
    surahName: s.nameTranslit,
    n: v.n,
    text: v.text,
    translit: v.words.every((w) => w.tr) ? v.words.map((w) => w.tr).join(" ") : undefined,
  }));
}
