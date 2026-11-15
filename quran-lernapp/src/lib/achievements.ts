import { LESSONS } from "@/content/lessons";
import { LETTERS } from "@/content/letters";
import { isCompleted, longestStreak, statusOf, totalXp, type Progress } from "./progress";

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  progress: number;
  target: number;
  done: boolean;
}

export interface Competence {
  letters: number;
  syllables: number;
  words: number;
  ayat: number;
}

const known = (p: Progress, prefix: string) => Object.keys(p.items).filter((id) => id.startsWith(prefix) && statusOf(p, id) === "known").length;

/** Kompetenz = was wirklich sicher sitzt (Leitner-Box ≥ 3), nicht was nur gemacht wurde. */
export function competence(p: Progress): Competence {
  return {
    letters: LETTERS.filter((l) => statusOf(p, `l:${l.ch}`) === "known").length,
    syllables: known(p, "s:") + known(p, "t:") + known(p, "p:"),
    words: known(p, "w:"),
    ayat: known(p, "a:"),
  };
}

export const COMPETENCE_LEVELS = [
  { id: 0, title: "Einsteiger", need: "Starte mit dem ersten Buchstaben." },
  { id: 1, title: "Buchstabenkenner", need: "10 Buchstaben sicher." },
  { id: 2, title: "Alphabet-Leser", need: "Alle 28 Buchstaben sicher." },
  { id: 3, title: "Silbenleser", need: "12 Silben/Übungswörter sicher." },
  { id: 4, title: "Wortleser", need: "15 Quran-Wörter sicher." },
  { id: 5, title: "Ayah-Leser", need: "5 Ayat sicher gelesen." },
];

export function competenceLevel(c: Competence): number {
  if (c.ayat >= 5) return 5;
  if (c.words >= 15) return 4;
  if (c.letters >= 28 && c.syllables >= 12) return 3;
  if (c.letters >= 28) return 2;
  if (c.letters >= 10) return 1;
  return 0;
}

export function achievements(p: Progress): Achievement[] {
  const c = competence(p);
  const retriesMastered = Object.entries(p.items).filter(([id, s]) => s.fails > 0 && s.box >= 3 && !id.startsWith("c:")).length;
  const reviews = p.history.filter((h) => h.ok).length;
  const lessonsDone = LESSONS.filter((l) => isCompleted(p, l.id)).length;
  const mk = (id: string, title: string, desc: string, progress: number, target: number): Achievement => ({ id, title, desc, progress: Math.min(progress, target), target, done: progress >= target });
  return [
    mk("first", "Erster Schritt", "Schließe deine erste Lektion ab.", lessonsDone, 1),
    mk("alphabet", "Alphabet sicher", "Beherrsche alle 28 Buchstaben sicher.", c.letters, 28),
    mk("streak3", "Drei Tage dran", "Übe an 3 Tagen in Folge.", longestStreak(p), 3),
    mk("streak7", "Eine Woche", "Übe an 7 Tagen in Folge.", longestStreak(p), 7),
    mk("syllables", "Silben-Flüssigkeit", "12 Silben oder Übungswörter sicher.", c.syllables, 12),
    mk("words", "Wortschatz", "15 Quran-Wörter sicher lesen.", c.words, 15),
    mk("ayah", "Erste Ayat", "5 Ayat sicher lesen.", c.ayat, 5),
    mk("fatiha", "Al-Fātiḥa gelesen", "Schließe die Lektion zu Sure 1 ab.", isCompleted(p, "P4") ? 1 : 0, 1),
    mk("comeback", "Aus Fehlern gelernt", "Meistere 10 Übungen, die dir zuerst nicht gelangen.", retriesMastered, 10),
    mk("practice", "Dranbleiber", "Bestehe 100 Übungen insgesamt.", reviews, 100),
    mk("xp", "Fleißig", "Sammle 500 XP.", totalXp(p), 500),
    mk("path", "Stage 1 geschafft", "Schließe alle Lektionen von Stage 1 ab.", lessonsDone, LESSONS.length),
  ];
}
