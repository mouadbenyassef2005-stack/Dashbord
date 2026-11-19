import type { Evidence, Grade, MemoryState } from "./types";

/**
 * FSRS-ähnlicher Scheduler (vereinfacht, eigene Implementierung).
 * - Abrufwahrscheinlichkeit R(t) = (1 + t / (9·S))^-1  → R = 0,9 bei t = S.
 * - Das nächste Intervall ergibt sich aus der Stabilität und der Zielwahrscheinlichkeit, nicht aus einem festen Plan.
 * - Erfolg erhöht die Stabilität stärker, wenn der Abruf schwerer war (niedrigeres R) und die Aufgabe schwieriger ist.
 * - Fehler senken die Stabilität deutlich und erhöhen die Schwierigkeit.
 * Die Konstanten sind Startwerte, nicht an Nutzerdaten kalibriert.
 */
export const DAY = 86_400_000;
export const TARGET_R = 0.9;

const EVIDENCE_WEIGHT: Record<Evidence, number> = { recognition: 0.5, recall: 1, production: 1.15, self: 0.35 };
const GRADE_BONUS: Record<Grade, number> = { 0: 0, 1: 0.6, 2: 1, 3: 1.4 };
const INITIAL_S: Record<Grade, number> = { 0: 0.2, 1: 0.6, 2: 1.2, 3: 2.5 };

export const retrievability = (s: MemoryState, now: number) => {
  const t = Math.max(0, (now - s.lastAt) / DAY);
  return 1 / (1 + t / (9 * s.stability));
};

const intervalDays = (stability: number, targetR = TARGET_R) => 9 * stability * (1 / targetR - 1);
const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

export function initialState(grade: Grade, evidence: Evidence, now: number): MemoryState {
  const failed = grade === 0;
  const stability = Math.max(0.1, INITIAL_S[grade] * (failed ? 1 : 0.6 + 0.4 * EVIDENCE_WEIGHT[evidence]));
  const difficulty = clamp(5 - (grade - 1.5) * 1.2, 1, 10);
  return { stability, difficulty, reps: 1, lapses: failed ? 1 : 0, lastAt: now, dueAt: now + intervalDays(stability) * DAY };
}

export function review(prev: MemoryState | undefined, grade: Grade, evidence: Evidence, now: number): MemoryState {
  if (!prev) return initialState(grade, evidence, now);
  const r = retrievability(prev, now);
  let stability: number;
  let difficulty = prev.difficulty;
  let lapses = prev.lapses;
  if (grade === 0) {
    stability = Math.max(0.1, Math.min(prev.stability * 0.3, 1.5));
    difficulty = clamp(difficulty + 0.8, 1, 10);
    lapses += 1;
  } else {
    const w = EVIDENCE_WEIGHT[evidence];
    // Bonus für schwereren Abruf: je niedriger R, desto größer der Zuwachs (wie bei FSRS: e^(k(1-R)) - 1)
    const recallGain = Math.exp(1.1 * (1 - r)) - 0.85;
    const ease = (11 - difficulty) / 6;
    const growth = 1 + w * GRADE_BONUS[grade] * ease * recallGain * Math.pow(prev.stability, -0.2) * 1.4;
    stability = prev.stability * Math.max(1.02, growth);
    difficulty = clamp(difficulty + (grade === 1 ? 0.3 : grade === 3 ? -0.4 : -0.1), 1, 10);
  }
  return { stability, difficulty, reps: prev.reps + 1, lapses, lastAt: now, dueAt: now + intervalDays(stability) * DAY };
}
