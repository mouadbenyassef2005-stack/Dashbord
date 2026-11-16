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

export interface LessonCheck {
  score: number;
  total: number;
  passed: boolean;
  at: number;
}

export interface LessonStat {
  completedAt: number;
  bestAccuracy: number;
  runs: number;
  /** Verständnis-Check am Lektionsende (letzter Stand; bestanden bleibt bestanden) */
  check?: LessonCheck;
}

/** Eintrag der Fehlerhistorie (jeder bewertete Versuch). */
export interface HistoryEntry {
  t: number;
  id: string;
  ok: boolean;
  /** Fehlerstelle (Buchstabe) laut Analyse bzw. Demo */
  weak?: string;
  /** Quelle der Bewertung: simulierte Demo, Selbsteinschätzung oder (später) echte Analyse */
  src: "demo" | "self" | "live" | "quiz";
}

export interface DayStats {
  xp: number;
  lessons: number;
  /** Übungen, die beim ersten Versuch richtig waren */
  firstTry: number;
  /** Übungen, die in persönlichen Übungen bestanden wurden */
  personal: number;
  /** Übungen, die früher schon einmal Fehler hatten und nun bestanden wurden */
  hard: number;
}

export interface Progress {
  v: 2;
  onboarded: boolean;
  name: string;
  level: Level | null;
  placement: { score: number; total: number } | null;
  startLessonId: string;
  dailyGoal: number; // Übungen pro Tag
  /** Persönliches Lesetrainingsziel: neue Lese-Einheiten pro Woche */
  weeklyGoal: number;
  lessons: Record<string, LessonStat>;
  items: Record<string, ItemStat>;
  /** Fehler je Segment (Buchstabe/Zeichen), z. B. "ث" */
  errors: Record<string, number>;
  /** Bestandene Übungen pro Tag (YYYY-MM-DD) */
  activity: Record<string, number>;
  daily: Record<string, DayStats>;
  history: HistoryEntry[];
  /** Vom Nutzer als unsicher markierte Items → Zeitstempel */
  flagged: Record<string, number>;
  /** Zeitpunkt der ersten bestandenen Übung je Item */
  firstPassAt: Record<string, number>;
  micConsent: boolean;
  /** Einwilligung für die Live-Spracherkennung (Audio geht an den Sprachdienst des Browsers) */
  liveConsent: boolean;
  settings: { showHint: boolean; unlockAll: boolean };
  lastLessonId?: string;
}

export const DEFAULT_PROGRESS: Progress = {
  v: 2,
  onboarded: false,
  name: "",
  level: null,
  placement: null,
  startLessonId: LESSONS[0].id,
  dailyGoal: 10,
  weeklyGoal: 20,
  lessons: {},
  items: {},
  errors: {},
  activity: {},
  daily: {},
  history: [],
  flagged: {},
  firstPassAt: {},
  micConsent: false,
  liveConsent: false,
  settings: { showHint: true, unlockAll: false },
};

const DAY = 24 * 3600 * 1000;
const INTERVAL_DAYS = [0, 1, 3, 7, 14];
const HISTORY_MAX = 300;
const EMPTY_DAY: DayStats = { xp: 0, lessons: 0, firstTry: 0, personal: 0, hard: 0 };

export const dayKey = (t = Date.now()) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const dayOf = (p: Progress, now = Date.now()): DayStats => p.daily[dayKey(now)] ?? EMPTY_DAY;
const withDay = (p: Progress, now: number, patch: Partial<DayStats>): Progress => {
  const k = dayKey(now);
  const cur = p.daily[k] ?? EMPTY_DAY;
  const next = { ...cur };
  for (const [key, v] of Object.entries(patch)) next[key as keyof DayStats] = cur[key as keyof DayStats] + (v as number);
  return { ...p, daily: { ...p.daily, [k]: next } };
};

/** Ergebnis eines bewerteten Versuchs speichern (Leitner, Fehlerstatistik, Historie). */
export function recordAttempt(
  p: Progress, itemId: string, passed: boolean, weakKeys: string[] = [], now = Date.now(), src: HistoryEntry["src"] = "demo",
): Progress {
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
  const history = [...p.history, { t: now, id: itemId, ok: passed, weak: weakKeys[0], src }].slice(-HISTORY_MAX);
  const firstPassAt = passed && src !== "quiz" && !p.firstPassAt[itemId] ? { ...p.firstPassAt, [itemId]: now } : p.firstPassAt;
  // Unsicher-Markierung fällt weg, sobald das Item sicher sitzt.
  let flagged = p.flagged;
  if (passed && box >= 3 && flagged[itemId]) {
    flagged = { ...flagged };
    delete flagged[itemId];
  }
  let out: Progress = { ...p, items: { ...p.items, [itemId]: stat }, errors, activity, history, firstPassAt, flagged };
  if (passed && prev.fails > 0) out = withDay(out, now, { hard: 1 });
  return out;
}

export const XP_FIRST_TRY = 10;
export const XP_RETRY = 5;
export const XP_LESSON = 20;

/** Übung wurde „weiter“ bestätigt: XP (aktivitätsbasiert) + Tageszähler. XP sind KEIN Kompetenzmaß. */
export function awardPass(p: Progress, firstTry: boolean, personal: boolean, now = Date.now()): Progress {
  return withDay(p, now, { xp: firstTry ? XP_FIRST_TRY : XP_RETRY, firstTry: firstTry ? 1 : 0, personal: personal ? 1 : 0 });
}

export function completeLesson(p: Progress, lessonId: string, accuracy: number, now = Date.now(), check?: { score: number; total: number; passed: boolean }): Progress {
  const prev = p.lessons[lessonId];
  const prevCheck = prev?.check;
  const newCheck: LessonCheck | undefined = check
    ? { ...check, at: now, passed: check.passed || !!prevCheck?.passed }
    : prevCheck;
  const next: Progress = {
    ...p,
    lessons: {
      ...p.lessons,
      [lessonId]: { completedAt: prev?.completedAt ?? now, bestAccuracy: Math.max(prev?.bestAccuracy ?? 0, accuracy), runs: (prev?.runs ?? 0) + 1, check: newCheck },
    },
    lastLessonId: lessonId,
  };
  // Lektionsbonus nur, wenn der Check bestanden wurde (Fortschritt = Können).
  const bonus = !prev && check?.passed ? XP_LESSON : 0;
  return withDay(next, now, { xp: bonus, lessons: prev ? 0 : 1 });
}

/** Nur das Check-Ergebnis einer Lektion nachtragen (z. B. späterer Check aus dem Lernpfad). */
export function recordCheck(p: Progress, lessonId: string, check: { score: number; total: number; passed: boolean }, now = Date.now()): Progress {
  const prev = p.lessons[lessonId];
  if (!prev) return completeLesson(p, lessonId, 0, now, check);
  const wasPassed = !!prev.check?.passed;
  const next = completeLesson(p, lessonId, prev.bestAccuracy, now, check);
  // Bonus nachträglich, wenn der Check erstmals bestanden wird
  return !wasPassed && check.passed ? withDay(next, now, { xp: XP_LESSON }) : next;
}

export const lessonCheck = (p: Progress, id: string) => p.lessons[id]?.check;

export function toggleFlag(p: Progress, itemId: string, now = Date.now()): Progress {
  const flagged = { ...p.flagged };
  if (flagged[itemId]) delete flagged[itemId];
  else flagged[itemId] = now;
  return { ...p, flagged };
}

export const totalXp = (p: Progress) => Object.values(p.daily).reduce((s, d) => s + d.xp, 0);

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

/** Kompetenz einer Lektion: Anteil der Lese-Items, die „sicher“ sitzen (Box ≥ 3). Spiegelt Können, nicht Aktivität. */
export function lessonMastery(p: Progress, lessonId: string): number {
  const l = LESSONS[LESSON_INDEX.get(lessonId) ?? -1];
  if (!l) return 0;
  const reads = l.items.filter((i) => i.kind === "read");
  if (!reads.length) return 0;
  return reads.filter((i) => statusOf(p, i.id) === "known").length / reads.length;
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

export function longestStreak(p: Progress): number {
  const days = Object.keys(p.activity).filter((k) => p.activity[k] > 0).sort();
  let best = 0;
  let run = 0;
  let prev = 0;
  for (const k of days) {
    const [y, m, d] = k.split("-").map(Number);
    const t = Date.UTC(y, m - 1, d);
    run = prev && t - prev === DAY ? run + 1 : 1;
    prev = t;
    best = Math.max(best, run);
  }
  return best;
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

/** Neue Lese-Einheiten (erstmals bestanden) der letzten 7 Tage – Grundlage des Wochenziels. */
export function weeklyNew(p: Progress, now = Date.now()): number {
  return Object.entries(p.firstPassAt).filter(([id, t]) => !id.startsWith("c:") && !id.startsWith("fc:") && now - t < 7 * DAY).length;
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
  const v = (raw as { v?: number }).v;
  if (v !== 1 && v !== 2) return DEFAULT_PROGRESS;
  return { ...DEFAULT_PROGRESS, ...r, v: 2, settings: { ...DEFAULT_PROGRESS.settings, ...(r.settings ?? {}) } } as Progress;
}
