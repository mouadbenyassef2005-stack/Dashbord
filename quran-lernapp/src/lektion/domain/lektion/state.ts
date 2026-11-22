import type { Confidence } from "@/lektion/content/lektion1";
import { DAY, retrievability, review } from "../scheduler";
import type { Evidence, MemoryState } from "../types";
import { CONFUSION_THRESHOLD, isActive, pairKey, srsKey, type Confusion, type LogEntry } from "./competence";
import type { TaskResult } from "./tasks";

/** Die sieben Phasen. Sie gelten pro Lerneinheit in kompakter Form. */
export const PHASES = [
  { n: 1, title: "Orientierung", method: "Advanced Organizer", unitLabel: "Ziel und Einführung" },
  { n: 2, title: "Entdecken", method: "Scaffolding · Dual Coding · Multisensorik", unitLabel: "Angeleitete Übung" },
  { n: 3, title: "Hypothesen", method: "Productive Failure", unitLabel: "Vermuten und Regel finden" },
  { n: 4, title: "Verstehen", method: "Erklärung · Elaboration · Feedback", unitLabel: "Erklärung und Verständnis" },
  { n: 5, title: "Anwenden", method: "Transfer · Interleaving", unitLabel: "Selbstständige Übung" },
  { n: 6, title: "Abrufen", method: "Retrieval Practice", unitLabel: "Überprüfung und Entscheidung" },
  { n: 7, title: "Festigen", method: "Spaced Repetition", unitLabel: "Wiederholungsplan" },
] as const;
export const PHASE_COUNT = PHASES.length;
export const UNIT_COUNT = 4;
export const pk = (unit: number, phase: number) => `${unit}.${phase}`;

export type SelfLevel = "none" | "letters" | "reading";
export interface HypothesisAnswer { choice: number; confidence: Confidence; why?: string }
export interface ElabAnswer { text: string; rating?: "match" | "partial" | "off" }
export interface SimSession { day: number; total: number; right: number }
export interface SimState { start: number; offsetDays: number; srs: Record<string, MemoryState>; log: LogEntry[]; sessions: SimSession[] }
export type Decision = "continue" | "more";

export interface LessonState {
  v: 2;
  startedAt: number;
  /** Höchste freigeschaltete Einheit */
  unit: number;
  /** Einheiten, für die eine Weiter-Entscheidung getroffen wurde */
  decided: Record<number, { choice: Decision; at: number }>;
  steps: Record<string, number>;
  /** `${einheit}.${phase}` → Aktivität abgeschlossen (nicht: Inhalt verstanden) */
  phaseDone: Record<string, boolean>;
  selfLevel?: SelfLevel;
  pretest: Record<string, "right" | "wrong" | "unknown">;
  hyp: Record<string, HypothesisAnswer>;
  elab: Record<string, ElabAnswer>;
  results: Record<string, TaskResult[]>;
  /** Wiederholungsplan pro Item UND Kompetenz (Schlüssel `item|kompetenz`) */
  srs: Record<string, MemoryState>;
  log: LogEntry[];
  confusions: Record<string, Confusion>;
  /** Selbstständig gesprochen/aufgenommen (Selbstbericht, keine Bewertung) */
  spoken: Record<string, boolean>;
  sim?: SimState;
}

export const initialLesson = (now = Date.now()): LessonState => ({
  v: 2, startedAt: now, unit: 1, decided: {}, steps: {}, phaseDone: {}, pretest: {}, hyp: {}, elab: {}, results: {}, srs: {}, log: [], confusions: {}, spoken: {},
});

export type Action =
  | { t: "step"; unit: number; phase: number; step: number }
  | { t: "phaseDone"; unit: number; phase: number }
  | { t: "decide"; unit: number; choice: Decision; now: number }
  | { t: "selfLevel"; level: SelfLevel }
  | { t: "pretest"; itemId: string; value: "right" | "wrong" | "unknown" }
  | { t: "hyp"; id: string; answer: HypothesisAnswer }
  | { t: "elab"; id: string; answer: ElabAnswer }
  | { t: "results"; unit: number; phase: number; results: TaskResult[]; now: number; keep?: boolean; slot?: string }
  | { t: "resolve"; a: string; b: string }
  | { t: "spoken"; itemId: string }
  | { t: "simStart"; now: number }
  | { t: "simReset"; now: number }
  | { t: "simAdvance"; days: number }
  | { t: "simResults"; results: TaskResult[]; unit: number }
  | { t: "reset"; now: number }
  | { t: "load"; state: LessonState };

const evidenceOf = (r: TaskResult): Evidence => (r.type === "write" ? "production" : r.type === "type" ? "recall" : "recognition");

/** Wendet Ergebnisse auf Plan und Log an: pro Item und Kompetenz getrennt. */
export function applyToPlan(srs: Record<string, MemoryState>, log: LogEntry[], results: TaskResult[], ctx: { unit: number; phase: number }, now: number) {
  const nextSrs = { ...srs };
  const nextLog = [...log];
  for (const r of results) {
    const key = srsKey(r.itemId, r.competence);
    const m = review(nextSrs[key], r.grade, evidenceOf(r), now);
    nextSrs[key] = m;
    nextLog.push({ key, itemId: r.itemId, competence: r.competence, ts: now, grade: r.grade, correct: r.correctness === "right", unit: ctx.unit, phase: ctx.phase, stability: m.stability, ms: r.ms });
  }
  return { srs: nextSrs, log: nextLog };
}

/** Zählt Verwechslungen (nur falsche Auswahlen mit erkennbarem Gegenstück, ohne „Weiß ich nicht“). */
export function trackConfusions(conf: Record<string, Confusion>, results: TaskResult[], now: number): Record<string, Confusion> {
  const out = { ...conf };
  for (const r of results) {
    if (r.correctness !== "wrong" || !r.confusedWith || r.confusedWith === r.itemId) continue;
    const k = pairKey(r.itemId, r.confusedWith);
    const cur = out[k] ?? { a: k.split("~")[0], b: k.split("~")[1], count: 0, resolved: false, lastAt: now };
    out[k] = { ...cur, count: cur.resolved ? 1 : cur.count + 1, resolved: false, lastAt: now };
  }
  return out;
}
export const activeConfusions = (s: LessonState) => Object.values(s.confusions).filter(isActive).sort((x, y) => y.count - x.count);
export { CONFUSION_THRESHOLD };

export function lessonReducer(s: LessonState, a: Action): LessonState {
  switch (a.t) {
    case "step": return { ...s, steps: { ...s.steps, [pk(a.unit, a.phase)]: Math.max(0, a.step) } };
    case "phaseDone": return { ...s, phaseDone: { ...s.phaseDone, [pk(a.unit, a.phase)]: true } };
    case "decide": {
      const unit = Math.min(UNIT_COUNT, a.choice === "continue" ? Math.max(s.unit, a.unit + 1) : s.unit);
      return { ...s, unit, decided: { ...s.decided, [a.unit]: { choice: a.choice, at: a.now } } };
    }
    case "selfLevel": return { ...s, selfLevel: a.level };
    case "pretest": return { ...s, pretest: { ...s.pretest, [a.itemId]: a.value } };
    case "hyp": return { ...s, hyp: { ...s.hyp, [a.id]: a.answer } };
    case "elab": return { ...s, elab: { ...s.elab, [a.id]: a.answer } };
    case "results": {
      const plan = applyToPlan(s.srs, s.log, a.results, { unit: a.unit, phase: a.phase }, a.now);
      return {
        ...s, ...plan,
        results: a.keep === false ? s.results : { ...s.results, [a.slot ?? pk(a.unit, a.phase)]: a.results },
        confusions: trackConfusions(s.confusions, a.results, a.now),
      };
    }
    case "resolve": {
      const k = pairKey(a.a, a.b);
      const cur = s.confusions[k];
      return cur ? { ...s, confusions: { ...s.confusions, [k]: { ...cur, resolved: true, count: 0 } } } : s;
    }
    case "spoken": return { ...s, spoken: { ...s.spoken, [a.itemId]: true } };
    case "simStart": return s.sim ? s : { ...s, sim: { start: a.now, offsetDays: 0, srs: { ...s.srs }, log: [...s.log], sessions: [] } };
    case "simReset": return { ...s, sim: { start: a.now, offsetDays: 0, srs: { ...s.srs }, log: [...s.log], sessions: [] } };
    case "simAdvance": return s.sim ? { ...s, sim: { ...s.sim, offsetDays: s.sim.offsetDays + Math.max(0, a.days) } } : s;
    case "simResults": {
      if (!s.sim) return s;
      const now = simNow(s.sim);
      const plan = applyToPlan(s.sim.srs, s.sim.log, a.results, { unit: a.unit, phase: 7 }, now);
      const right = a.results.filter((r) => r.correctness === "right").length;
      return { ...s, sim: { ...s.sim, ...plan, sessions: [...s.sim.sessions, { day: s.sim.offsetDays, total: a.results.length, right }] } };
    }
    case "reset": return initialLesson(a.now);
    case "load": return a.state;
  }
}

/* ---------- Wiederholungslogik ---------- */
export const simNow = (sim: SimState) => sim.start + sim.offsetDays * DAY;

export interface DueEntry { key: string; r: number; lapses: number }
/**
 * Fällige Einträge (dueAt erreicht), schwächste zuerst. Kürzlich fehlerhafte Kompetenzen (lapses) stehen bei gleicher
 * Abrufwahrscheinlichkeit weiter vorn: Fehlerhafte Kompetenzen werden früher wiederholt, weil ihr Intervall nach einem Fehler schrumpft.
 */
export function dueEntries(srs: Record<string, MemoryState>, now: number): DueEntry[] {
  return Object.entries(srs)
    .filter(([, m]) => m.dueAt <= now)
    .map(([key, m]) => ({ key, r: retrievability(m, now), lapses: m.lapses }))
    .sort((a, b) => a.r - b.r || b.lapses - a.lapses);
}

export const daysUntilDue = (m: MemoryState, now: number) => (m.dueAt - now) / DAY;

export function daysToNextDue(srs: Record<string, MemoryState>, now: number): number | null {
  const all = Object.values(srs);
  if (!all.length) return null;
  return Math.max(1, Math.ceil((Math.min(...all.map((m) => m.dueAt)) - now) / DAY));
}

/** Verlauf der Modellschätzung eines Schlüssels als Sägezahn aus dem Log. */
export function curvePoints(log: LogEntry[], key: string, fromTs: number, toTs: number, steps = 120): { x: number; r: number }[] {
  const entries = log.filter((e) => e.key === key).sort((a, b) => a.ts - b.ts);
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
export const LS_LESSON = "qaidah.lektion.v2";

const num = (x: unknown): x is number => typeof x === "number" && Number.isFinite(x);
const obj = <T,>(x: unknown): Record<string, T> => (x && typeof x === "object" && !Array.isArray(x) ? (x as Record<string, T>) : {});
const isMem = (m: unknown): m is MemoryState => {
  if (!m || typeof m !== "object") return false;
  const o = m as Record<string, unknown>;
  return ["stability", "difficulty", "reps", "lapses", "lastAt", "dueAt"].every((k) => num(o[k])) && (o.stability as number) > 0;
};
const isLog = (e: unknown): e is LogEntry => {
  const o = e as Record<string, unknown> | null;
  return !!o && typeof o.key === "string" && typeof o.itemId === "string" && typeof o.competence === "string" && num(o.ts) && num(o.stability) && (o.stability as number) > 0 && typeof o.correct === "boolean";
};
const cleanSrs = (x: unknown) => Object.fromEntries(Object.entries(obj(x)).filter(([, m]) => isMem(m))) as Record<string, MemoryState>;

/** Liest gespeicherten Zustand tolerant; kaputte Teile werden verworfen, nicht die ganze Lektion. */
export function parseLesson(raw: string | null, now = Date.now()): LessonState {
  const base = initialLesson(now);
  if (!raw) return base;
  try {
    const j = JSON.parse(raw) as Partial<LessonState> | null;
    if (!j || typeof j !== "object" || j.v !== 2) return base;
    const sim = j.sim && num(j.sim.start) && num(j.sim.offsetDays) && j.sim.offsetDays >= 0
      ? { start: j.sim.start, offsetDays: j.sim.offsetDays, srs: cleanSrs(j.sim.srs), log: Array.isArray(j.sim.log) ? j.sim.log.filter(isLog) : [], sessions: Array.isArray(j.sim.sessions) ? j.sim.sessions.filter((x) => x && num(x.day) && num(x.total) && num(x.right)) : [] }
      : undefined;
    return {
      ...base,
      startedAt: num(j.startedAt) ? j.startedAt : base.startedAt,
      unit: num(j.unit) ? Math.min(UNIT_COUNT, Math.max(1, Math.floor(j.unit))) : 1,
      decided: obj(j.decided), steps: obj(j.steps), phaseDone: obj(j.phaseDone),
      selfLevel: j.selfLevel === "none" || j.selfLevel === "letters" || j.selfLevel === "reading" ? j.selfLevel : undefined,
      pretest: obj(j.pretest), hyp: obj(j.hyp), elab: obj(j.elab), results: obj(j.results), spoken: obj(j.spoken),
      srs: cleanSrs(j.srs),
      log: Array.isArray(j.log) ? j.log.filter(isLog) : [],
      confusions: Object.fromEntries(Object.entries(obj<Confusion>(j.confusions)).filter(([, c]) => c && typeof c.a === "string" && typeof c.b === "string" && num(c.count))),
      sim,
    };
  } catch {
    return base;
  }
}
