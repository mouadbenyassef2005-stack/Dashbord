import type { Lesson } from "@/content/types";

/**
 * Lernlogik einer Lektion (unabhängig von UI).
 * Ablauf: intro → Items nacheinander → bei „später“ wird ein Item ans Ende gestellt → done.
 * Ein Item gilt als „beim ersten Versuch richtig“, wenn es ohne Fehlversuch bestanden wurde.
 */
export interface Session {
  lessonId: string;
  phase: "intro" | "items" | "done";
  queue: string[];
  total: number;
  passed: string[];
  firstTry: string[];
  failedOnce: string[];
}

export function createSession(lesson: Lesson): Session {
  return { lessonId: lesson.id, phase: "intro", queue: lesson.items.map((i) => i.id), total: lesson.items.length, passed: [], firstTry: [], failedOnce: [] };
}

export const startItems = (s: Session): Session => ({ ...s, phase: s.queue.length ? "items" : "done" });
export const currentItemId = (s: Session) => (s.phase === "items" ? s.queue[0] : undefined);

/** Fehlversuch merken (Item bleibt aktuell, bis bestanden oder zurückgestellt). */
export function markFailed(s: Session, id: string): Session {
  return s.failedOnce.includes(id) ? s : { ...s, failedOnce: [...s.failedOnce, id] };
}

export function markPassed(s: Session, id: string): Session {
  const queue = s.queue.filter((q) => q !== id);
  const firstTry = s.failedOnce.includes(id) || s.passed.includes(id) ? s.firstTry : [...s.firstTry, id];
  const passed = s.passed.includes(id) ? s.passed : [...s.passed, id];
  return { ...s, queue, passed, firstTry, phase: queue.length ? "items" : "done" };
}

/** Item später noch einmal üben (ans Ende der Warteschlange). */
export function defer(s: Session, id: string): Session {
  const failedOnce = s.failedOnce.includes(id) ? s.failedOnce : [...s.failedOnce, id];
  if (s.queue.length <= 1) return { ...s, failedOnce };
  return { ...s, failedOnce, queue: [...s.queue.filter((q) => q !== id), id] };
}

export const fraction = (s: Session) => (s.total ? s.passed.length / s.total : 0);
export const accuracy = (s: Session) => (s.total ? s.firstTry.length / s.total : 0);
