import { LESSONS, LESSON_INDEX } from "@/content/lessons";

export type Level = "beginner" | "letters" | "reader";

export interface ItemStat {
  attempts: number;
  passes: number;
  fails: number;
  /** Leitner-Box 0..4 */
  box: number;
  dueAt: number;
  lastAt: number;
}

export interface LessonStat {
  completedAt: number;
  bestAccuracy: number;
  runs: number;
}

export interface Progress {
  v: 1;
  onboarded: boolean;
  level: Level | null;
  placement: { score: number; total: number } | null;
  startLessonId: string;
  dailyGoal: number; // Übungen pro Tag
  lessons: Record<string, LessonStat>;
  items: Record<string, ItemStat>;
  /** Fehler je Segment (Buchstabe/Zeichen), z. B. "ث" */
  errors: Record<string, number>;
  /** Anzahl bestandener Übungen pro Tag (YYYY-MM-DD) */
  activity: Record<string, number>;
  micConsent: boolean;
  settings: { showHint: boolean; unlockAll: boolean };
  lastLessonId?: string;
}

export const DEFAULT_PROGRESS: Progress = {
  v: 1,
  onboarded: false,
  level: null,
  placement: null,
  startLessonId: LESSONS[0].id,
  dailyGoal: 10,
  lessons: {},
  items: {},
  errors: {},
  activity: {},
  micConsent: false,
  settings: { showHint: true, unlockAll: false },
};

const DAY = 24 * 3600 * 1000;
const INTERVAL_DAYS = [0, 1, 3, 7, 14];

export const dayKey = (t = Date.now()) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** Ergebnis eines einzelnen Übungsversuchs speichern. */
export function recordAttempt(p: Progress, itemId: string, passed: boolean, weakKeys: string[] = [], now = Date.now()): Progress {
  const prev = p.items[itemId] ?? { attempts: 0, passes: 0, fails: 0, box: 0, dueAt: 0, lastAt: 0 };
  const box = passed ? Math.min(4, prev.box + 1) : Math.max(0, prev.box - 1);
  const stat: ItemStat = {
    attempts: prev.attempts + 1,
    passes: prev.passes + (passed ? 1 : 0),
    fails: prev.fails + (passed ? 0 : 1),
    box,
    dueAt: now + (passed ? INTERVAL_DAYS[box] * DAY : 0),
    lastAt: now,
  };
  const errors = { ...p.errors };
  if (!passed) for (const k of weakKeys) errors[k] = (errors[k] ?? 0) + 1;
  const activity = passed ? { ...p.activity, [dayKey(now)]: (p.activity[dayKey(now)] ?? 0) + 1 } : p.activity;
  return { ...p, items: { ...p.items, [itemId]: stat }, errors, activity };
}

export function completeLesson(p: Progress, lessonId: string, accuracy: number, now = Date.now()): Progress {
  const prev = p.lessons[lessonId];
  return {
    ...p,
    lessons: {
      ...p.lessons,
      [lessonId]: { completedAt: prev?.completedAt ?? now, bestAccuracy: Math.max(prev?.bestAccuracy ?? 0, accuracy), runs: (prev?.runs ?? 0) + 1 },
    },
    lastLessonId: lessonId,
  };
}

export function isCompleted(p: Progress, lessonId: string) {
  return !!p.lessons[lessonId];
}

export function isUnlocked(p: Progress, lessonId: string): boolean {
  if (p.settings.unlockAll) return true;
  const i = LESSON_INDEX.get(lessonId);
  if (i === undefined) return false;
  const start = LESSON_INDEX.get(p.startLessonId) ?? 0;
  return i <= start || isCompleted(p, LESSONS[i - 1].id);
}

/** Nächste Lektion, die der Nutzer machen sollte. */
export function currentLessonId(p: Progress): string | null {
  const start = LESSON_INDEX.get(p.startLessonId) ?? 0;
  const next = LESSONS.slice(start).find((l) => !isCompleted(p, l.id));
  return next?.id ?? null;
}

export function completedCount(p: Progress) {
  return LESSONS.filter((l) => isCompleted(p, l.id)).length;
}

export function stageFraction(p: Progress) {
  return completedCount(p) / LESSONS.length;
}

export type Status = "new" | "learning" | "known";
export function statusOf(p: Progress, itemId: string): Status {
  const s = p.items[itemId];
  if (!s || s.attempts === 0) return "new";
  return s.box >= 3 ? "known" : "learning";
}

export function dueItemIds(p: Progress, now = Date.now()): string[] {
  return Object.entries(p.items)
    .filter(([, s]) => s.attempts > 0 && (s.dueAt <= now || (s.fails > s.passes && s.box < 2)))
    .sort((a, b) => a[1].dueAt - b[1].dueAt)
    .map(([id]) => id);
}

export function todayCount(p: Progress, now = Date.now()) {
  return p.activity[dayKey(now)] ?? 0;
}

export function streak(p: Progress, now = Date.now()): number {
  let n = 0;
  let t = now;
  if (!(p.activity[dayKey(t)] > 0)) t -= DAY; // heute noch nichts → ab gestern zählen
  while (p.activity[dayKey(t)] > 0) {
    n++;
    t -= DAY;
  }
  return n;
}

export function topErrors(p: Progress, n = 6): [string, number][] {
  return Object.entries(p.errors)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}

export function errorRate(p: Progress): number {
  const all = Object.values(p.items);
  const attempts = all.reduce((s, x) => s + x.attempts, 0);
  const fails = all.reduce((s, x) => s + x.fails, 0);
  return attempts ? fails / attempts : 0;
}

/** Lektions-Startpunkt je Einstufung. */
export function startLessonForScore(score: number): { level: Level; lessonId: string } {
  if (score <= 1) return { level: "beginner", lessonId: "A1" };
  if (score <= 3) return { level: "letters", lessonId: "C1" };
  return { level: "reader", lessonId: "D1" };
}

export function migrate(raw: unknown): Progress {
  if (!raw || typeof raw !== "object") return DEFAULT_PROGRESS;
  const r = raw as Partial<Progress>;
  if (r.v !== 1) return DEFAULT_PROGRESS;
  return { ...DEFAULT_PROGRESS, ...r, settings: { ...DEFAULT_PROGRESS.settings, ...(r.settings ?? {}) } } as Progress;
}
