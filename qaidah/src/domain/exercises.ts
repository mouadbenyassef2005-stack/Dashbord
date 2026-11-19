import { LETTER_BY_ID, LETTERS, dotsText } from "@/content/letters";
import { confusionsOf, type Progress } from "./progress";
import { pickDistractors } from "./selection";
import type { Skill } from "./types";

export type ExerciseType = "find-letter" | "letter-to-sound" | "contrast";

export interface Exercise {
  type: ExerciseType;
  skill: Skill;
  letterId: string;
  prompt: string;
  /** Anzeige der Frage (Glyphe) bzw. leer */
  promptArabic?: string;
  options: { letterId?: string; label: string; arabic?: boolean }[];
  answerIndex: number;
  explanation: string;
}

const shuffle = <T,>(a: T[], rnd: () => number) => {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
};

/** `pool`: Buchstaben-IDs, die der Lernende bereits kennengelernt hat. */
export function buildExercise(
  type: ExerciseType, letterId: string, pool: string[], progress: Progress, rnd: () => number = Math.random,
): Exercise {
  const t = LETTER_BY_ID.get(letterId)!;
  const confused = confusionsOf(progress, letterId).map(([id]) => id);
  const pickN = (n: number) => pickDistractors(letterId, t.similar, confused, pool, n, rnd);

  if (type === "find-letter") {
    const opts = shuffle([letterId, ...pickN(3)], rnd);
    return {
      type, skill: "visual", letterId, prompt: `Welcher Buchstabe ist „${t.name}“?`,
      options: opts.map((id) => ({ letterId: id, label: LETTER_BY_ID.get(id)!.ch, arabic: true })),
      answerIndex: opts.indexOf(letterId),
      explanation: `${t.ch} heißt ${t.name}: ${dotsText(t.dots)}.`,
    };
  }
  if (type === "letter-to-sound") {
    const opts = shuffle([letterId, ...pickN(3)], rnd);
    return {
      type, skill: "association", letterId, prompt: "Welcher Laut gehört zu diesem Buchstaben?", promptArabic: t.ch,
      options: opts.map((id) => ({ letterId: id, label: `${LETTER_BY_ID.get(id)!.syllable} (${LETTER_BY_ID.get(id)!.name})` })),
      answerIndex: opts.indexOf(letterId),
      explanation: `${t.ch} ist ${t.name} und klingt wie „${t.syllable}“: ${t.tip}`,
    };
  }
  // contrast: gleiche Grundform, nur die Punkte unterscheiden → Merkmal erkennen
  const sims = t.similar.filter((s) => pool.includes(s));
  const rivals = (sims.length ? sims : pickN(2)).slice(0, 2);
  const opts = shuffle([letterId, ...rivals], rnd);
  return {
    type, skill: "contrast", letterId, prompt: `Welcher Buchstabe hat ${dotsText(t.dots)}?`,
    options: opts.map((id) => ({ letterId: id, label: LETTER_BY_ID.get(id)!.ch, arabic: true })),
    answerIndex: opts.indexOf(letterId),
    explanation: rivals.length
      ? `${t.ch} (${t.name}): ${dotsText(t.dots)}. ` + rivals.map((r) => `${LETTER_BY_ID.get(r)!.ch}: ${dotsText(LETTER_BY_ID.get(r)!.dots)}`).join("; ") + "."
      : `${t.ch}: ${dotsText(t.dots)}.`,
  };
}

export const ALL_IDS = LETTERS.map((l) => l.id);
