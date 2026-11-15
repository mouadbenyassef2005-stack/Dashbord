import { describe, expect, it } from "vitest";
import { LESSONS, LESSON_BY_ID } from "@/content/lessons";
import { accuracy, createSession, defer, fraction, markFailed, markPassed, startItems } from "@/lib/engine";
import { DEFAULT_PROGRESS, completeLesson, currentLessonId, dueItemIds, isUnlocked, recordAttempt, startLessonForScore, statusOf, streak } from "@/lib/progress";
import { DemoAnalyzer } from "@/lib/analysis/demo";

describe("Lesson-Engine", () => {
  it("führt durch Items, Wiederholung und Abschluss", () => {
    const l = LESSON_BY_ID.get("C1")!;
    let s = startItems(createSession(l));
    const first = s.queue[0];
    s = defer(markFailed(s, first), first);
    expect(s.queue[s.queue.length - 1]).toBe(first);
    for (const id of [...s.queue]) s = markPassed(s, id);
    expect(s.phase).toBe("done");
    expect(fraction(s)).toBe(1);
    expect(accuracy(s)).toBeCloseTo((l.items.length - 1) / l.items.length);
  });
});

describe("Fortschritt", () => {
  it("schaltet Lektionen der Reihe nach frei und zeigt die nächste an", () => {
    let p = DEFAULT_PROGRESS;
    expect(isUnlocked(p, "A1")).toBe(true);
    expect(isUnlocked(p, "A2")).toBe(false);
    expect(currentLessonId(p)).toBe("A1");
    p = completeLesson(p, "A1", 0.9);
    expect(isUnlocked(p, "A2")).toBe(true);
    expect(currentLessonId(p)).toBe("A2");
  });
  it("Einstufung setzt Startpunkt; frühere Lektionen bleiben optional offen", () => {
    const { lessonId } = startLessonForScore(4);
    const p = { ...DEFAULT_PROGRESS, startLessonId: lessonId };
    expect(currentLessonId(p)).toBe(lessonId);
    expect(isUnlocked(p, lessonId)).toBe(true);
    expect(isUnlocked(p, "A3")).toBe(true);
  });
  it("Leitner-Box und Fehlerstatistik", () => {
    let p = recordAttempt(DEFAULT_PROGRESS, "l:ب", false, ["ب"], 1000);
    expect(p.errors["ب"]).toBe(1);
    expect(statusOf(p, "l:ب")).toBe("learning");
    expect(dueItemIds(p, 1000)).toContain("l:ب");
    for (let i = 0; i < 4; i++) p = recordAttempt(p, "l:ب", true, [], 2000);
    expect(statusOf(p, "l:ب")).toBe("known");
    expect(dueItemIds(p, 2000)).not.toContain("l:ب");
  });
  it("Streak zählt aufeinanderfolgende Tage", () => {
    const now = new Date(2026, 5, 10, 12).getTime();
    let p = recordAttempt(DEFAULT_PROGRESS, "x", true, [], now);
    p = recordAttempt(p, "x", true, [], now - 86400000);
    expect(streak(p, now)).toBe(2);
  });
  it("alle Lektionen sind über die Pfad-Reihenfolge durchlaufbar", () => {
    let p = DEFAULT_PROGRESS;
    for (const l of LESSONS) {
      expect(isUnlocked(p, l.id)).toBe(true);
      p = completeLesson(p, l.id, 1);
    }
    expect(currentLessonId(p)).toBeNull();
  });
});

describe("Demo-Analyse", () => {
  const item = { id: "l:ب", kind: "read" as const, arabic: "بَ", hint: "ba" };
  it("erkennt fehlendes Signal ehrlich", async () => {
    const r = await new DemoAnalyzer().analyze({ item, attempt: 1, signal: { durationMs: 100, peak: 0, rms: 0 } });
    expect(r.status).toBe("no-signal");
    expect(r.simulated).toBe(true);
  });
  it("ist als simuliert markiert, deterministisch und besteht spätestens im 2. Versuch", async () => {
    const a = new DemoAnalyzer();
    const sig = { durationMs: 1500, peak: 0.5, rms: 0.1 };
    expect((await a.analyze({ item, attempt: 1, signal: sig })).simulated).toBe(true);
    expect((await a.analyze({ item, attempt: 2, signal: sig })).passed).toBe(true);
  });
});
