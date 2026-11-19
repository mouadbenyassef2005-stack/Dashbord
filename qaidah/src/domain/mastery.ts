import { DAY } from "./scheduler";
import type { Evidence, MasteryLevel, MemoryState, ReviewEvent, Skill } from "./types";

/**
 * Ein Skill gilt erst als gemeistert, wenn ALLES zutrifft:
 *  - ≥ 3 erfolgreiche Abrufe (Note ≥ 2)
 *  - mit ≥ 2 verschiedenen Aktivitätstypen
 *  - an ≥ 2 verschiedenen Tagen
 *  - Stabilität ≥ 6 Tage
 *  - letzter Versuch war kein Fehler
 *  - mind. ein Nachweis durch freien Abruf/Produktion, außer bei reinen Erkennungs-Skills
 * Selbsteinschätzung (Aussprache) zählt nie über „vertraut“ hinaus.
 * Die Schwellen sind Startwerte.
 */
export const MASTERY_RULES = { minSuccesses: 3, minActivities: 2, minDays: 2, minStability: 6 } as const;
const RECOGNITION_ONLY: Skill[] = ["visual", "sound", "association", "contrast"];

export interface MasteryInfo {
  level: MasteryLevel;
  /** Wofür noch Nachweise fehlen – wird in der UI angezeigt */
  missing: string[];
}

const dayOf = (ts: number) => Math.floor(ts / DAY);

export function masteryOf(skill: Skill, events: ReviewEvent[], state: MemoryState | undefined): MasteryInfo {
  if (events.length === 0 || !state) return { level: "new", missing: ["Noch nicht geübt"] };
  const ok = events.filter((e) => e.grade >= 2 && e.evidence !== "self");
  const activities = new Set(ok.map((e) => e.activity));
  const days = new Set(ok.map((e) => dayOf(e.ts)));
  const strong = ok.some((e) => ([ "recall", "production" ] as Evidence[]).includes(e.evidence));
  const last = events[events.length - 1];
  const missing: string[] = [];
  const R = MASTERY_RULES;
  if (ok.length < R.minSuccesses) missing.push(`${R.minSuccesses - ok.length}× weiteres richtiges Abrufen`);
  if (activities.size < R.minActivities) missing.push("eine andere Aufgabenart");
  if (days.size < R.minDays) missing.push("Wiederholung an einem anderen Tag");
  if (state.stability < R.minStability) missing.push("längere Behaltensdauer");
  if (last.grade < 2) missing.push("letzter Versuch war ein Fehler");
  if (!strong && !RECOGNITION_ONLY.includes(skill)) missing.push("freier Abruf ohne Auswahlmöglichkeiten");
  const selfOnly = skill === "pronunciation";
  if (selfOnly) {
    return { level: ok.length || events.some((e) => e.grade >= 2) ? "familiar" : "learning", missing: ["Aussprache wird nur selbst eingeschätzt"] };
  }
  if (missing.length === 0) return { level: "mastered", missing };
  const level: MasteryLevel = ok.length >= 2 && last.grade >= 2 ? "familiar" : "learning";
  return { level, missing };
}

export const LEVEL_ORDER: MasteryLevel[] = ["new", "learning", "familiar", "mastered"];
