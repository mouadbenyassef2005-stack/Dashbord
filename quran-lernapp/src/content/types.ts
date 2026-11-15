export type Stage = 1 | 2 | 3;

/** Ein Lernbaustein innerhalb einer Lektion. */
export type LessonItem = ReadItem | ChooseItem;

export interface ItemBase {
  /** Global eindeutig, wird für Fortschritt/Wiederholung persistiert. */
  id: string;
}

/** Hören → Nachsprechen → Feedback. */
export interface ReadItem extends ItemBase {
  kind: "read";
  arabic: string;
  /** Lautschrift/Name als optionale Lernhilfe (z. B. "Bā", "ba", "Bismi"). */
  hint: string;
  /** Kurzer Auftrag, z. B. "Lies den Buchstaben". */
  prompt?: string;
  /** Verweis auf Wort-Datenbank (nur Quran-Wörter). */
  wordId?: string;
  /** Fundstelle bei Quran-Text, z. B. "1:2". */
  ref?: string;
  /** Pfad zu menschlicher Referenzaufnahme (public/audio/...). Fehlt → Platzhalter. */
  audioUrl?: string;
  /** Größenstufe der Anzeige. */
  size?: "xl" | "lg" | "md";
}

/** Erkennen: Mehrfachauswahl (Einstufungstest, Formen). */
export interface ChooseItem extends ItemBase {
  kind: "choose";
  question: string;
  arabic?: string;
  options: string[];
  /** Optionen sind arabischer Text (RTL, große Schrift). */
  optionsArabic?: boolean;
  answer: number;
  explanation?: string;
}

export interface LessonIntro {
  title: string;
  body: string[];
  /** Arabische Beispiele, groß dargestellt. */
  examples?: { arabic: string; label: string }[];
}

export interface Lesson {
  id: string;
  stage: Stage;
  unitId: string;
  title: string;
  /** Klares Lernziel, wird in Pfad & Lektion angezeigt. */
  goal: string;
  minutes: number;
  intro: LessonIntro;
  items: LessonItem[];
}

export interface Unit {
  id: string;
  title: string;
  summary: string;
}

export type Difficulty = 1 | 2 | 3;

/** Eintrag der Wortdatenbank (ohne nutzerspezifischen Lernstatus – der liegt im Fortschritt). */
export interface QuranWord {
  id: string; // "1:2:3" = Sure:Ayah:Wortposition
  uthmani: string;
  transliteration?: string;
  surah: number;
  surahName: string;
  ayah: number;
  position: number;
  letters: string[];
  harakat: string[];
  difficulty: Difficulty;
  audioUrl?: string;
}
