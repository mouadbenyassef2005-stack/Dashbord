import { retrievability } from "./scheduler";
import type { Progress } from "./progress";
import { parseKey, type Skill } from "./types";

export interface DueItem { letterId: string; skill: Skill; r: number }

/** Fällige Items: Abrufwahrscheinlichkeit unter dem Ziel, schwächste zuerst. Gedeckelt, damit nach Pausen keine Lawine entsteht. */
export function dueItems(p: Progress, now: number, cap = 12): DueItem[] {
  const out: DueItem[] = [];
  for (const [k, s] of p.states) {
    if (s.dueAt <= now) {
      const { letterId, skill } = parseKey(k);
      out.push({ letterId, skill, r: retrievability(s, now) });
    }
  }
  return interleave(out.sort((a, b) => a.r - b.r)).slice(0, cap);
}

/** Verhindert, dass derselbe Buchstabe direkt hintereinander kommt, soweit möglich (Interleaving). */
export function interleave<T extends { letterId: string }>(items: T[]): T[] {
  const rest = [...items];
  const out: T[] = [];
  while (rest.length) {
    const last = out[out.length - 1]?.letterId;
    const i = rest.findIndex((x) => x.letterId !== last);
    out.push(...rest.splice(i === -1 ? 0 : i, 1));
  }
  return out;
}

/** Distraktoren: zuerst bekannte Verwechslungen, dann optisch ähnliche, dann Zufall aus der Auswahl. */
export function pickDistractors(
  target: string, similar: string[], confused: string[], pool: string[], n: number, rnd: () => number = Math.random,
): string[] {
  const out: string[] = [];
  const add = (id: string) => { if (id !== target && !out.includes(id) && pool.includes(id) && out.length < n) out.push(id); };
  confused.forEach(add);
  similar.forEach(add);
  const rest = pool.filter((x) => x !== target && !out.includes(x)).sort(() => rnd() - 0.5);
  rest.forEach(add);
  return out;
}
