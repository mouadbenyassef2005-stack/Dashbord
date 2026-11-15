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

import { buildPersonalPlan, buildTransfer, buildDynamic } from "@/lib/adaptive";
import { dailyMissions } from "@/lib/missions";
import { achievements, competence, competenceLevel } from "@/lib/achievements";
import { awardPass, longestStreak, lessonMastery, toggleFlag, totalXp, weeklyNew, migrate } from "@/lib/progress";

describe("Adaptive Übungen", () => {
  const T = 1_800_000_000_000;
  it("ist leer ohne Lernhistorie", () => {
    expect(buildPersonalPlan(DEFAULT_PROGRESS, 8, T)).toEqual([]);
    expect(buildDynamic("personal", DEFAULT_PROGRESS)).toBeNull();
  });
  it("priorisiert markierte, fällige und fehlerhafte Items mit Begründung", () => {
    let p = recordAttempt(DEFAULT_PROGRESS, "l:ث", false, ["ث"], T - 1000);
    p = recordAttempt(p, "l:ب", true, [], T - 1000);
    p = toggleFlag(p, "l:ب", T);
    const plan = buildPersonalPlan(p, 8, T);
    expect(plan.map((x) => x.item.id)).toContain("l:ث");
    expect(plan.map((x) => x.item.id)).toContain("l:ب"); // markiert
    expect(plan[0].item.id).toBe("l:ث"); // fällig + Fehler schlägt Markierung allein
    expect(plan.find((x) => x.item.id === "l:ث")!.reasons.length).toBeGreaterThan(0);
  });
  it("sicher sitzende Items erscheinen nicht", () => {
    let p = DEFAULT_PROGRESS;
    for (let i = 0; i < 4; i++) p = recordAttempt(p, "l:ب", true, [], T);
    expect(buildPersonalPlan(p, 8, T).map((x) => x.item.id)).not.toContain("l:ب");
  });
  it("Transfer-Wörter erst nach Vokal-Lektionen und nur mit bekannten Buchstaben", () => {
    expect(buildTransfer(DEFAULT_PROGRESS).lesson).toBeNull();
    const p = { ...DEFAULT_PROGRESS, startLessonId: "D1" };
    const t = buildTransfer(p);
    expect(t.lesson).not.toBeNull();
    expect(t.lesson!.items.every((i) => i.kind === "read" && i.id.startsWith("w:"))).toBe(true);
  });
});

describe("Missionen, XP, Erfolge", () => {
  it("Missionen: Tagesziel + 2, stabil am selben Tag, Fortschritt gedeckelt", () => {
    const now = new Date(2026, 5, 10, 10).getTime();
    const a = dailyMissions(DEFAULT_PROGRESS, now);
    expect(a.length).toBe(3);
    expect(a[0].id).toBe("goal");
    expect(dailyMissions(DEFAULT_PROGRESS, now + 3600_000).map((m) => m.id)).toEqual(a.map((m) => m.id));
    let p = DEFAULT_PROGRESS;
    for (let i = 0; i < 15; i++) p = recordAttempt(p, "l:ب" + i, true, [], now);
    const m = dailyMissions(p, now)[0];
    expect(m.done).toBe(true);
    expect(m.progress).toBe(m.target);
  });
  it("XP nur für Aktivität; Kompetenz nur für sicher Gelesenes", () => {
    let p = awardPass(DEFAULT_PROGRESS, true, false, 1000);
    p = awardPass(p, false, false, 1000);
    expect(totalXp(p)).toBe(15);
    expect(competenceLevel(competence(p))).toBe(0);
    for (let i = 0; i < 4; i++) p = recordAttempt(p, "l:ب", true, [], 1000);
    expect(competence(p).letters).toBe(1);
  });
  it("Lektions-Sicherheit & Historie & Wochenziel", () => {
    let p = recordAttempt(DEFAULT_PROGRESS, "l:ا", true, [], 1000, "self");
    expect(p.history[0]).toMatchObject({ id: "l:ا", ok: true, src: "self" });
    expect(lessonMastery(p, "A1")).toBe(0);
    expect(weeklyNew(p, 1000 + 86400000)).toBe(1);
    expect(achievements(p).length).toBeGreaterThan(8);
    expect(longestStreak(p)).toBe(1);
  });
  it("migriert alte v1-Daten", () => {
    const p = migrate({ v: 1, onboarded: true, items: {}, lessons: {}, errors: {}, activity: {}, settings: { showHint: true, unlockAll: false }, startLessonId: "A1", dailyGoal: 10, micConsent: false, level: null, placement: null });
    expect(p.v).toBe(2);
    expect(p.history).toEqual([]);
    expect(p.weeklyGoal).toBe(20);
  });
});

import { lessonCheckQuestions, makeQuestions, rng, CHECK_QUESTIONS } from "@/lib/quiz";
import { LESSON_BY_ID as LBI } from "@/content/lessons";
import { createDeck, flip, isMismatch, closeMismatch, isWon, newGame } from "@/lib/memory";
import { recordCheck, lessonCheck } from "@/lib/progress";

describe("Verständnis-Check & Quiz", () => {
  it("erzeugt für jede Lektion gültige, abwechslungsreiche Fragen", () => {
    for (const l of LESSONS) {
      const qs = lessonCheckQuestions(l, 42);
      expect(qs.length, l.id).toBeGreaterThanOrEqual(Math.min(CHECK_QUESTIONS, 3));
      for (const q of qs) {
        if (q.kind === "pick-translit" || q.kind === "pick-arabic") {
          expect(new Set(q.options).size, q.id).toBe(3);
          expect(q.answer).toBeGreaterThanOrEqual(0);
        }
        if (q.kind === "find-letter") expect(q.correct.length).toBeGreaterThan(0);
        if (q.kind === "build-word") expect([...q.pieces].sort()).toEqual([...q.target].sort());
      }
    }
    const kinds = new Set(lessonCheckQuestions(LBI.get("H1")!, 7).map((q) => q.kind));
    expect(kinds.size).toBeGreaterThan(1);
  });
  it("ist deterministisch mit Seed", () => {
    const items = LBI.get("D2")!.items.filter((i) => i.kind === "read") as any[];
    expect(makeQuestions(items, 5, 1).map((q) => q.id)).toEqual(makeQuestions(items, 5, 1).map((q) => q.id));
    expect(rng(3)()).toBe(rng(3)());
  });
  it("Check-Ergebnis: Bonus nur bei Bestehen, bestanden bleibt bestanden", () => {
    let p = completeLesson(DEFAULT_PROGRESS, "A1", 0.8, 1000, { score: 2, total: 5, passed: false });
    expect(totalXp(p)).toBe(0);
    expect(lessonCheck(p, "A1")?.passed).toBe(false);
    p = recordCheck(p, "A1", { score: 4, total: 5, passed: true }, 2000);
    expect(totalXp(p)).toBe(20);
    p = recordCheck(p, "A1", { score: 1, total: 5, passed: false }, 3000);
    expect(lessonCheck(p, "A1")?.passed).toBe(true);
    expect(totalXp(p)).toBe(20);
  });
});

describe("Memory", () => {
  it("Paare finden, Fehlgriffe merken, Sieg erkennen", () => {
    const cards = createDeck(["ب", "ت", "ث"], "name", 5);
    expect(cards.length).toBe(6);
    let s = newGame(cards);
    const keys = cards.map((c) => c.key);
    const a = keys.indexOf("ب"), b = keys.lastIndexOf("ب"), c = keys.indexOf("ت");
    s = flip(flip(s, a), c);
    expect(isMismatch(s)).toBe(true);
    expect(s.missed).toContain("ب");
    s = closeMismatch(s);
    s = flip(flip(s, a), b);
    expect(s.matched).toEqual(["ب"]);
    expect(s.clean).not.toContain("ب");
    for (const k of ["ت", "ث"]) s = flip(flip(s, keys.indexOf(k)), keys.lastIndexOf(k));
    expect(isWon(s)).toBe(true);
    expect(s.clean).toEqual(["ث"]); // ب und ت hatten einen Fehlgriff
  });
});
