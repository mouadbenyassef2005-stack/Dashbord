/** Wie stark ein Nachweis ist: Erkennen < freier Abruf < Produktion. 'self' = Selbsteinschätzung. */
export type Evidence = "recognition" | "recall" | "production" | "self";

/** 0 = nicht gewusst, 1 = mühsam, 2 = gewusst, 3 = mühelos */
export type Grade = 0 | 1 | 2 | 3;

export interface MemoryState {
  stability: number; // Tage, bis Abrufwahrscheinlichkeit auf 90 % fällt
  difficulty: number; // 1..10
  reps: number;
  lapses: number;
  lastAt: number;
  dueAt: number;
}
