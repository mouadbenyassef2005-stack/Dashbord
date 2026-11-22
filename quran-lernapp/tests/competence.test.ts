import { describe, expect, it } from "vitest";
import { AREAS, COMPETENCES, levelOf, mnemonicStage, srsKey, summarize, type LogEntry } from "@/lektion/domain/lektion/competence";
import { DAY } from "@/lektion/domain/scheduler";
import {
  UNIT_COUNT, activeConfusions, curvePoints, daysToNextDue, dueEntries, initialLesson, lessonReducer, parseLesson, simNow,
} from "@/lektion/domain/lektion/state";
import type { TaskResult } from "@/lektion/domain/lektion/tasks";

const T0 = Math.floor(1_700_000_000_000 / DAY) * DAY; // Tagesgrenze, damit „am selben Tag“ eindeutig ist
const res = (itemId: string, competence: TaskResult["competence"], grade: 0 | 1 | 2 | 3, confusedWith?: string): TaskResult => ({
  taskId: `${itemId}#0`, itemId, competence, type: "choice", correctness: grade === 0 ? "wrong" : "right", grade, hintUsed: false, answer: "", confusedWith,
});
const entry = (over: Partial<LogEntry>): LogEntry => ({ key: "letter:ba|visual", itemId: "letter:ba", competence: "visual", ts: T0, grade: 2, correct: true, unit: 1, phase: 5, stability: 1, ...over });

describe("Kompetenzen getrennt geplant", () => {
  it("Erfolg beim Erkennen verändert den Plan des Hörens nicht", () => {
    let s = initialLesson(T0);
    s = lessonReducer(s, { t: "results", unit: 1, phase: 5, now: T0, results: [res("syl:ba-fatha", "listen", 0)] });
    const listenBefore = s.srs[srsKey("syl:ba-fatha", "listen")];
    s = lessonReducer(s, { t: "results", unit: 1, phase: 5, now: T0 + DAY, results: [res("syl:ba-fatha", "syllable", 3), res("syl:ba-fatha", "visual", 3)] });
    expect(s.srs[srsKey("syl:ba-fatha", "listen")]).toEqual(listenBefore);
    expect(Object.keys(s.srs).sort()).toEqual(["syl:ba-fatha|listen", "syl:ba-fatha|syllable", "syl:ba-fatha|visual"]);
  });
  it("Fehler verkürzen das Intervall gegenüber Erfolg und stehen bei gleicher Schätzung weiter vorn", () => {
    let s = initialLesson(T0);
    s = lessonReducer(s, { t: "results", unit: 1, phase: 5, now: T0, results: [res("letter:ba", "visual", 2), res("letter:ta", "visual", 0)] });
    expect(s.srs["letter:ta|visual"].dueAt).toBeLessThan(s.srs["letter:ba|visual"].dueAt);
    const due = dueEntries(s.srs, T0 + 30 * DAY);
    expect(due[0].key).toBe("letter:ta|visual");
  });
  it("sieben Kompetenzen, vier Bereiche, jede Kompetenz genau einem Bereich zugeordnet", () => {
    expect(COMPETENCES).toHaveLength(7);
    expect(AREAS).toHaveLength(4);
    expect(AREAS.flatMap((a) => a.comps).sort()).toEqual([...COMPETENCES].sort());
  });
  it("Bereiche werden nicht verrechnet: Erkennen gefestigt, Schreiben leer", () => {
    const log: LogEntry[] = [0, 1, 2].map((d) => entry({ ts: T0 + d * DAY, stability: 8 }));
    const sums = summarize(log, { "letter:ba|visual": { stability: 8, difficulty: 5, reps: 3, lapses: 0, lastAt: T0, dueAt: T0 + 9 * DAY } });
    expect(sums.find((x) => x.id === "visual")!.counts.consolidated).toBe(1);
    expect(sums.find((x) => x.id === "motor")!.total).toBe(0);
    expect(sums.find((x) => x.id === "phonological")!.total).toBe(0);
  });
});

describe("Stufen aus echten Antworten", () => {
  const mem = (stability: number) => ({ stability, difficulty: 5, reps: 3, lapses: 0, lastAt: T0, dueAt: T0 });
  it("keine Antworten → none; letzter Fehler → unsure; ein richtiger Nachweis → unsure", () => {
    expect(levelOf([], undefined)).toBe("none");
    expect(levelOf([entry({ correct: false })], mem(1))).toBe("unsure");
    expect(levelOf([entry({})], mem(1))).toBe("unsure");
  });
  it("zwei richtige → verstanden; gefestigt erst bei 3 richtigen an 2 Tagen und Stabilität ≥ 6", () => {
    expect(levelOf([entry({ ts: T0 }), entry({ ts: T0 + 1000 })], mem(1))).toBe("understood");
    const three = [0, 0.5, 2].map((d) => entry({ ts: T0 + d * DAY }));
    expect(levelOf(three, mem(3))).toBe("understood");
    expect(levelOf(three, mem(7))).toBe("consolidated");
    const sameDay = [0, 0.1, 0.2].map((d) => entry({ ts: T0 + d * DAY }));
    expect(levelOf(sameDay, mem(9))).toBe("understood"); // nicht über Tage bestätigt
  });
  it("ein Fehler am Ende setzt auch Gefestigtes zurück auf unsicher", () => {
    expect(levelOf([...[0, 1, 2].map((d) => entry({ ts: T0 + d * DAY })), entry({ ts: T0 + 3 * DAY, correct: false })], mem(9))).toBe("unsure");
  });
});

describe("Merkhilfen werden abgebaut", () => {
  it("Stufe wächst mit richtigen visuellen Antworten, nur für diesen Buchstaben und diese Kompetenz", () => {
    const ok = (n: number, over: Partial<LogEntry> = {}) => Array.from({ length: n }, (_, i) => entry({ ts: T0 + i, ...over }));
    expect(mnemonicStage([], "ba")).toBe(1);
    expect(mnemonicStage(ok(2), "ba")).toBe(2);
    expect(mnemonicStage(ok(4), "ba")).toBe(3);
    expect(mnemonicStage(ok(6), "ba")).toBe(4);
    expect(mnemonicStage(ok(6), "ta")).toBe(1);
    expect(mnemonicStage(ok(6, { competence: "listen", key: "letter:ba|listen" }), "ba")).toBe(1);
    expect(mnemonicStage([...ok(5), entry({ correct: false })], "ba")).toBe(3);
  });
});

describe("Adaptivität: Verwechslungen", () => {
  it("wiederholte Verwechslung wird aktiv, einmalige nicht; Auflösung nur durch resolve", () => {
    let s = initialLesson(T0);
    s = lessonReducer(s, { t: "results", unit: 1, phase: 5, now: T0, results: [res("letter:ba", "visual", 0, "letter:ta")] });
    expect(activeConfusions(s)).toHaveLength(0);
    s = lessonReducer(s, { t: "results", unit: 1, phase: 5, now: T0 + 1, results: [res("letter:ta", "visual", 0, "letter:ba")] });
    const act = activeConfusions(s);
    expect(act).toHaveLength(1);
    expect([act[0].a, act[0].b].sort()).toEqual(["letter:ba", "letter:ta"]);
    expect(act[0].count).toBe(2);
    s = lessonReducer(s, { t: "resolve", a: "letter:ta", b: "letter:ba" });
    expect(activeConfusions(s)).toHaveLength(0);
    s = lessonReducer(s, { t: "results", unit: 1, phase: 5, now: T0 + 2, results: [res("letter:ba", "visual", 0, "letter:ta")] });
    expect(activeConfusions(s)).toHaveLength(0); // nach Lösung beginnt die Zählung neu
  });
  it("„Weiß ich nicht“ und richtige Antworten zählen nicht als Verwechslung", () => {
    let s = initialLesson(T0);
    s = lessonReducer(s, { t: "results", unit: 1, phase: 5, now: T0, results: [res("letter:ba", "visual", 2, "letter:ta"), res("letter:ba", "visual", 0)] });
    expect(Object.keys(s.confusions)).toHaveLength(0);
  });
});

describe("Entscheidung statt erzwungener Linearität", () => {
  it("Einheit 2 ist erst nach einer Entscheidung freigeschaltet; „weiter üben“ schaltet nicht frei", () => {
    let s = initialLesson(T0);
    expect(s.unit).toBe(1);
    s = lessonReducer(s, { t: "decide", unit: 1, choice: "more", now: T0 });
    expect(s.unit).toBe(1);
    s = lessonReducer(s, { t: "decide", unit: 1, choice: "continue", now: T0 });
    expect(s.unit).toBe(2);
    for (let u = 2; u <= 6; u++) s = lessonReducer(s, { t: "decide", unit: u, choice: "continue", now: T0 });
    expect(s.unit).toBe(UNIT_COUNT);
  });
  it("Phasen-Aktivität ist getrennt von Können: phaseDone ändert keinen Kompetenzstand", () => {
    let s = initialLesson(T0);
    s = lessonReducer(s, { t: "phaseDone", unit: 1, phase: 5 });
    expect(summarize(s.log, s.srs).every((x) => x.total === 0)).toBe(true);
  });
});

describe("Simulation getrennt vom echten Plan", () => {
  it("Simulierte Wiederholungen verändern den echten Plan nicht; Zeitsprung macht fällig", () => {
    let s = initialLesson(T0);
    s = lessonReducer(s, { t: "results", unit: 1, phase: 6, now: T0, results: [res("letter:ba", "visual", 2), res("word:bab", "word", 3)] });
    const real = JSON.stringify(s.srs);
    s = lessonReducer(s, { t: "simStart", now: T0 });
    expect(dueEntries(s.sim!.srs, simNow(s.sim!))).toHaveLength(0);
    const jump = daysToNextDue(s.sim!.srs, simNow(s.sim!))!;
    s = lessonReducer(s, { t: "simAdvance", days: jump });
    const due = dueEntries(s.sim!.srs, simNow(s.sim!));
    expect(due.length).toBeGreaterThan(0);
    const before = s.sim!.srs[due[0].key];
    s = lessonReducer(s, { t: "simResults", unit: 1, results: [res(due[0].key.split("|")[0], due[0].key.split("|")[1] as "visual", 2)] });
    expect(s.sim!.srs[due[0].key].stability).toBeGreaterThan(before.stability);
    expect(JSON.stringify(s.srs)).toBe(real);
    expect(s.sim!.sessions).toHaveLength(1);
  });
  it("Kurve: springt bei Wiederholung auf 100 % und fällt vorher monoton", () => {
    let s = initialLesson(T0);
    s = lessonReducer(s, { t: "results", unit: 1, phase: 6, now: T0, results: [res("letter:tha", "visual", 2)] });
    s = lessonReducer(s, { t: "results", unit: 1, phase: 7, now: T0 + 2 * DAY, results: [res("letter:tha", "visual", 2)] });
    const pts = curvePoints(s.log, "letter:tha|visual", T0, T0 + 10 * DAY, 10);
    expect(pts.find((p) => Math.abs(p.x - 2) < 1e-9)!.r).toBeCloseTo(1, 5);
    for (let i = 1; i < 2; i++) expect(pts[i].r).toBeLessThanOrEqual(pts[i - 1].r + 1e-9);
  });
});

describe("Speicherung", () => {
  it("Roundtrip, kaputte Daten und alte Version fallen auf Standard, Teilschäden werden verworfen", () => {
    let s = initialLesson(T0);
    s = lessonReducer(s, { t: "phaseDone", unit: 1, phase: 1 });
    s = lessonReducer(s, { t: "hyp", id: "u1-h1", answer: { choice: 0, confidence: "sure" } });
    s = lessonReducer(s, { t: "results", unit: 1, phase: 5, now: T0, results: [res("letter:ba", "visual", 2, undefined)] });
    s = lessonReducer(s, { t: "simStart", now: T0 });
    expect(parseLesson(JSON.stringify(s), T0)).toEqual(s);
    expect(parseLesson("{kaputt", T0)).toEqual(initialLesson(T0));
    expect(parseLesson(null, T0)).toEqual(initialLesson(T0));
    expect(parseLesson(JSON.stringify({ v: 1 }), T0)).toEqual(initialLesson(T0));
    const dmg = parseLesson(JSON.stringify({ ...s, srs: { ...s.srs, "x|y": { stability: -1 } }, log: [...s.log, { nonsense: 1 }], unit: 99 }), T0);
    expect(Object.keys(dmg.srs)).toEqual(["letter:ba|visual"]);
    expect(dmg.log).toHaveLength(1);
    expect(dmg.unit).toBe(UNIT_COUNT);
  });
  it("Reset", () => {
    const s = lessonReducer(lessonReducer(initialLesson(T0), { t: "phaseDone", unit: 2, phase: 3 }), { t: "reset", now: T0 + 5 });
    expect(s.phaseDone).toEqual({}); expect(s.startedAt).toBe(T0 + 5);
  });
});
