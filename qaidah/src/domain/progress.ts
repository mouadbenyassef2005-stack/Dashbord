import { masteryOf, type MasteryInfo } from "./mastery";
import { review } from "./scheduler";
import { itemKey, type MemoryState, type ReviewEvent, type Skill } from "./types";

export interface Progress {
  states: Map<string, MemoryState>;
  events: Map<string, ReviewEvent[]>;
  /** `richtig:verwechselt` → Anzahl */
  confusions: Map<string, number>;
}

/** Zustand entsteht ausschließlich aus dem Ereignislog (sortiert nach Zeit, dann id) – deterministisch. */
export function buildProgress(all: ReviewEvent[]): Progress {
  const sorted = [...all].sort((a, b) => a.ts - b.ts || a.id.localeCompare(b.id));
  const p: Progress = { states: new Map(), events: new Map(), confusions: new Map() };
  for (const e of sorted) {
    const k = itemKey(e.letterId, e.skill);
    p.states.set(k, review(p.states.get(k), e.grade, e.evidence, e.ts));
    (p.events.get(k) ?? p.events.set(k, []).get(k)!).push(e);
    if (e.grade < 2 && e.confusedWith) {
      const ck = `${e.letterId}:${e.confusedWith}`;
      p.confusions.set(ck, (p.confusions.get(ck) ?? 0) + 1);
    }
  }
  return p;
}

export function masteryFor(p: Progress, letterId: string, skill: Skill): MasteryInfo {
  const k = itemKey(letterId, skill);
  return masteryOf(skill, p.events.get(k) ?? [], p.states.get(k));
}

/** Häufigste Verwechslungen eines Buchstabens, absteigend. */
export function confusionsOf(p: Progress, letterId: string): [string, number][] {
  return [...p.confusions.entries()]
    .filter(([k]) => k.startsWith(letterId + ":"))
    .map(([k, n]) => [k.split(":")[1], n] as [string, number])
    .sort((a, b) => b[1] - a[1]);
}
