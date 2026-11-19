import { LETTERS } from "@/content/letters";
import { dueItems, interleave } from "./selection";
import type { ExerciseType } from "./exercises";
import type { Progress } from "./progress";
import { itemKey, type Skill } from "./types";

/** Skills, für die es derzeit Aufgaben gibt. Schreiben, Formen, Lesen, Aussprache folgen in späteren Meilensteinen. */
export const SKILL_TO_TYPE: Partial<Record<Skill, ExerciseType>> = {
  visual: "find-letter", association: "letter-to-sound", contrast: "contrast",
};

export interface Planned { letterId: string; type: ExerciseType; why: "due" | "new" }

/** Gruppe g ist offen, wenn Gruppe g−1 vollständig eingeführt wurde (Gruppe 1 immer). */
export function unlockedGroups(introduced: Set<string>): number[] {
  const groups = [...new Set(LETTERS.map((l) => l.group))];
  const open: number[] = [];
  for (const g of groups) {
    open.push(g);
    if (!LETTERS.filter((l) => l.group === g).every((l) => introduced.has(l.id))) break;
  }
  return open;
}

export function nextToIntroduce(introduced: Set<string>): string | undefined {
  return LETTERS.find((l) => !introduced.has(l.id))?.id;
}

/** Übungsplan: Fälliges zuerst (schwächste zuerst), dann Neues; bunt gemischt (Interleaving), gedeckelt. */
export function planSession(p: Progress, introduced: Set<string>, now: number, size = 8): Planned[] {
  const due: Planned[] = dueItems(p, now, size * 2)
    .filter((d) => introduced.has(d.letterId) && SKILL_TO_TYPE[d.skill])
    .map((d) => ({ letterId: d.letterId, type: SKILL_TO_TYPE[d.skill]!, why: "due" as const }));
  const fresh: Planned[] = [];
  for (const l of LETTERS) {
    if (!introduced.has(l.id)) continue;
    for (const [skill, type] of Object.entries(SKILL_TO_TYPE) as [Skill, ExerciseType][]) {
      if (!p.states.has(itemKey(l.id, skill))) fresh.push({ letterId: l.id, type, why: "new" });
    }
  }
  const head = due.slice(0, size);
  const tail = fresh.slice(0, Math.max(0, size - head.length) * 2);
  return interleave([...head, ...interleave(tail)]).slice(0, size);
}
