import type { Confidence } from "@/content/lektion1";
import { DAY, retrievability, review } from "../scheduler";
import type { Evidence, MemoryState } from "../types";
import type { TaskResult } from "./tasks";

export const PHASES = [
  { n: 1, title: "Orientierung", method: "Advanced Organizer", minutes: 5 },
  { n: 2, title: "Entdecken", method: "Scaffolding · Dual Coding · Multisensorik", minutes: 12 },
  { n: 3, title: "Hypothesen", method: "Productive Failure", minutes: 6 },
  { n: 4, title: "Verstehen", method: "Erklärung · Elaboration · Feedback", minutes: 10 },
  { n: 5, title: "Anwenden", method: "Transfer · Interleaving", minutes: 8 },
  { n: 6, title: "Abrufen", method: "Retrieval Practice", minutes: 5 },
  { n: 7, title: "Festigen", method: "Spaced Repetition", minutes: 6 },
] as const;
export const PHASE_COUNT = PHASES.length;

export type SelfLevel = "none" | "letters" | "reading";
export interface HypothesisAnswer { choice: number; confidence: Confidence; why?: string }
export interface ElabAnswer { text: string; rating?: "match" | "partial" | "off" }
export interface LogEntry { itemId: string; ts: number; grade: number; phase: number; /** Stabilität nach der Wiederholung (Tage) */ stability: number }
export interface SimSession { day: number; total: number; right: number }

export interface LessonState {
  v: 1;
  startedAt: number;
  /** Höchste freigeschaltete Phase */
  unlocked: number;
  done: number[];
  steps: Record<number, number>;
  selfLevel?: SelfLevel;
  pretest: Record<string, "right" | "wrong" | "unknown">;
  hyp: Record<string, HypothesisAnswer>;
  elab: Record<string, ElabAnswer>;
  results: Record<number, TaskResult[]>;
  srs: Record<string, MemoryState>;
  log: LogEntry[];
  /** Beginn der simulierten Zeit (Phase 7), Unix-ms */
  simStart?: number;
  offsetDays: number;
  sessions: SimSession[];
}

export const initialLesson = (now = Date.now()): LessonState => ({
  v: 1, startedAt: now, unlocked: 1, done: [], steps: {}, pretest: {}, hyp: {}, elab: {}, results: {}, srs: {}, log: [], offsetDays: 0, sessions: [],
});

export type Action =
  | { t: "step"; phase: number; step: number }
  | { t: "complete"; phase: number }
  | { t: "selfLevel"; level: SelfLevel }
  | { t: "pretest"; itemId: string; value: "right" | "wrong" | "unknown" }
  | { t: "hyp"; id: string; answer: HypothesisAnswer }
  | { t: "elab"; id: string; answer: ElabAnswer }
  | { t: "results"; phase: number; results: TaskResult[]; now: number; sim?: boolean }
  | { t: "simStart"; now: number }
  | { t: "advance"; days: number }
  | { t: "session"; session: SimSession }
  | { t: "reset"; now: number }
  | { t: "load"; state: LessonState };

const evidenceOf = (r: TaskResult): Evidence => (r.type === "type" ? "recall" : "recognition");

/** Wendet Ergebnisse auf den Wiederholungsplan an. `now` ist die (ggf. simulierte) Zeit. */
export function applyResults(s: LessonState, phase: number, results: TaskResult[], now: number): LessonState {
  const srs = { ...s.srs };
  const log = [...s.log];
  for (const r of results) {
    const next = review(srs[r.itemId], r.grade, evidenceOf(r), now);
    srs[r.itemId] = next;
    log.push({ itemId: r.itemId, ts: now, grade: r.grade, phase, stability: next.stability });
  }
  return { ...s, srs, log };
}

export function lessonReducer(s: LessonState, a: Action): LessonState {
  switch (a.t) {
    case "step": return { ...s, steps: { ...s.steps, [a.phase]: Math.max(0, a.step) } };
    case "complete": {
      const done = s.done.includes(a.phase) ? s.done : [...s.done, a.phase].sort((x, y) => x - y);
      return { ...s, done, unlocked: Math.min(PHASE_COUNT, Math.max(s.unlocked, a.phase + 1)) };
    }
    case "selfLevel": return { ...s, selfLevel: a.level };
    case "pretest": return { ...s, pretest: { ...s.pretest, [a.itemId]: a.value } };
    case "hyp": return { ...s, hyp: { ...s.hyp, [a.id]: a.answer } };
    case "elab": return { ...s, elab: { ...s.elab, [a.id]: a.answer } };
    case "results": {
      const merged = { ...s, results: { ...s.results, [a.phase]: a.results } };
      return applyResults(merged, a.phase, a.results, a.now);
    }
    case "simStart": return s.simStart === undefined ? { ...s, simStart: a.now } : s;
    case "advance": return { ...s, offsetDays: s.offsetDays + Math.max(0, a.days) };
    case "session": return { ...s, sessions: [...s.sessions, a.session] };
    case "reset": return initialLesson(a.now);
    case "load": return a.state;
  }
}

/* ---------- Simulierte Zeit & Wiederholungslogik ---------- */
export const simNow = (s: LessonState, realNow: number) => (s.simStart ?? realNow) + s.offsetDays * DAY;
export const simDay = (s: LessonState) => s.offsetDays;

export interface DueEntry { itemId: string; r: number }
/** Fällige Items (dueAt erreicht), schwächste zuerst. */
export function dueEntries(srs: Record<string, MemoryState>, now: number): DueEntry[] {
  return Object.entries(srs)
    .filter(([, m]) => m.dueAt <= now)
    .map(([itemId, m]) => ({ itemId, r: retrievability(m, now) }))
    .sort((a, b) => a.r - b.r);
}

/** Tage bis zur Fälligkeit (negativ = überfällig). */
export const daysUntilDue = (m: MemoryState, now: number) => (m.dueAt - now) / DAY;

/** Kleinste ganze Anzahl Tage ab jetzt, nach der mindestens ein Item fällig ist; null, wenn kein Plan existiert. */
export function daysToNextDue(srs: Record<string, MemoryState>, now: number): number | null {
  const all = Object.values(srs);
  if (!all.length) return null;
  const soonest = Math.min(...all.map((m) => m.dueAt));
  return Math.max(1, Math.ceil((soonest - now) / DAY));
}

/** Abrufwahrscheinlichkeit eines Items zu einem Zeitpunkt, anhand des Logs rekonstruiert (Sägezahn-Kurve). */
export function curvePoints(log: LogEntry[], itemId: string, fromTs: number, toTs: number, steps = 120): { x: number; r: number }[] {
  const entries = log.filter((e) => e.itemId === itemId).sort((a, b) => a.ts - b.ts);
  if (!entries.length) return [];
  const pts: { x: number; r: number }[] = [];
  const total = toTs - fromTs;
  for (let i = 0; i <= steps; i++) {
    const ts = fromTs + (total * i) / steps;
    const last = [...entries].reverse().find((e) => e.ts <= ts);
    if (!last) continue;
    const t = Math.max(0, (ts - last.ts) / DAY);
    pts.push({ x: (ts - fromTs) / DAY, r: 1 / (1 + t / (9 * last.stability)) });
  }
  return pts;
}

/* ---------- Persistenz ---------- */
export const LS_LESSON = "qaidah.lektion1.v1";

const num = (x: unknown): x is number => typeof x === "number" && Number.isFinite(x);
const isMem = (m: unknown): m is MemoryState => {
  if (!m || typeof m !== "object") return false;
  const o = m as Record<string, unknown>;
  return ["stability", "difficulty", "reps", "lapses", "lastAt", "dueAt"].every((k) => num(o[k])) && (o.stability as number) > 0;
};

/** Liest einen gespeicherten Zustand tolerant ein; kaputte Teile werden verworfen, nicht die ganze Lektion. */
export function parseLesson(raw: string | null, now = Date.now()): LessonState {
  const base = initialLesson(now);
  if (!raw) return base;
  try {
    const j = JSON.parse(raw) as Partial<LessonState> | null;
    if (!j || typeof j !== "object" || j.v !== 1) return base;
    const done = Array.isArray(j.done) ? j.done.filter((n): n is number => Number.isInteger(n) && n >= 1 && n <= PHASE_COUNT) : [];
    const srs: Record<string, MemoryState> = {};
    for (const [k, m] of Object.entries(j.srs ?? {})) if (isMem(m)) srs[k] = m;
    return {
      ...base,
      startedAt: num(j.startedAt) ? j.startedAt : base.startedAt,
      done: [...new Set(done)].sort((a, b) => a - b),
      unlocked: num(j.unlocked) ? Math.min(PHASE_COUNT, Math.max(1, Math.floor(j.unlocked), ...done.map((d) => d + 1))) : Math.max(1, ...done.map((d) => d + 1)),
      steps: typeof j.steps === "object" && j.steps ? (j.steps as Record<number, number>) : {},
      selfLevel: j.selfLevel === "none" || j.selfLevel === "letters" || j.selfLevel === "reading" ? j.selfLevel : undefined,
      pretest: typeof j.pretest === "object" && j.pretest ? j.pretest : {},
      hyp: typeof j.hyp === "object" && j.hyp ? j.hyp : {},
      elab: typeof j.elab === "object" && j.elab ? j.elab : {},
      results: typeof j.results === "object" && j.results ? j.results : {},
      srs,
      log: Array.isArray(j.log) ? j.log.filter((e) => e && typeof e.itemId === "string" && num(e.ts) && num(e.stability) && e.stability > 0) : [],
      simStart: num(j.simStart) ? j.simStart : undefined,
      offsetDays: num(j.offsetDays) && j.offsetDays >= 0 ? j.offsetDays : 0,
      sessions: Array.isArray(j.sessions) ? j.sessions.filter((x) => x && num(x.day) && num(x.total) && num(x.right)) : [],
    };
  } catch {
    return base;
  }
}
