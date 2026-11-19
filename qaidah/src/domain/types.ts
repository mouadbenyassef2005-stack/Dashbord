export const SKILLS = [
  "visual",        // Buchstabe sehen → erkennen/benennen
  "sound",         // Laut hören → Buchstabe
  "association",   // Buchstabe ↔ Laut/Name zuordnen
  "pronunciation", // nur Selbsteinschätzung (keine automatische Bewertung)
  "writing",
  "contextForm",
  "contrast",      // Abgrenzung von ähnlichen Buchstaben
  "reading",
] as const;
export type Skill = (typeof SKILLS)[number];

/** Wie stark ein Nachweis ist: Erkennen < freier Abruf < Produktion. 'self' = Selbsteinschätzung. */
export type Evidence = "recognition" | "recall" | "production" | "self";

/** 0 = nicht gewusst, 1 = mühsam, 2 = gewusst, 3 = mühelos */
export type Grade = 0 | 1 | 2 | 3;

export const itemKey = (letterId: string, skill: Skill) => `${letterId}:${skill}`;
export const parseKey = (k: string) => {
  const [letterId, skill] = k.split(":");
  return { letterId, skill: skill as Skill };
};

export interface ReviewEvent {
  id: string;
  /** Unix-ms */
  ts: number;
  letterId: string;
  skill: Skill;
  activity: string;
  grade: Grade;
  evidence: Evidence;
  /** Buchstabe, mit dem fälschlich verwechselt wurde */
  confusedWith?: string;
}

export interface MemoryState {
  stability: number; // Tage, bis Abrufwahrscheinlichkeit auf 90 % fällt
  difficulty: number; // 1..10
  reps: number;
  lapses: number;
  lastAt: number;
  dueAt: number;
}

export type MasteryLevel = "new" | "learning" | "familiar" | "mastered";
