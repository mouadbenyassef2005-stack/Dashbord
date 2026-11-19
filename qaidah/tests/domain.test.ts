import { describe, expect, it } from "vitest";
import { DAY, retrievability, review } from "@/domain/scheduler";
import { buildProgress, confusionsOf, masteryFor } from "@/domain/progress";
import { dueItems, interleave, pickDistractors } from "@/domain/selection";
import type { Grade, ReviewEvent, Evidence } from "@/domain/types";

const T0 = Date.UTC(2026, 0, 1, 10);
let n = 0;
const ev = (over: Partial<ReviewEvent> & { dayOffset?: number }): ReviewEvent => ({
  id: `e${n++}`, ts: T0 + (over.dayOffset ?? 0) * DAY, letterId: "ba", skill: "visual", activity: "find",
  grade: 2, evidence: "recognition", ...over,
});

describe("Scheduler", () => {
  it("R = 0,9 genau bei t = Stabilität", () => {
    const s = review(undefined, 2, "recall", T0);
    expect(retrievability(s, T0 + s.stability * DAY)).toBeCloseTo(0.9, 5);
  });
  it("Intervalle wachsen bei Erfolg, schrumpfen bei Fehler", () => {
    let s = review(undefined, 2, "recall", T0);
    let now = T0;
    const stabs = [s.stability];
    for (let i = 0; i < 4; i++) { now = s.dueAt; s = review(s, 2, "recall", now); stabs.push(s.stability); }
    for (let i = 1; i < stabs.length; i++) expect(stabs[i]).toBeGreaterThan(stabs[i - 1]);
    const failed = review(s, 0, "recall", s.dueAt);
    expect(failed.stability).toBeLessThan(s.stability);
    expect(failed.lapses).toBe(1);
  });
  it("Bessere Note und stärkerer Nachweis wachsen schneller; Erkennen weniger als Abruf", () => {
    const base = review(undefined, 2, "recall", T0);
    const at = base.dueAt;
    const g = (grade: Grade, e: Evidence) => review(base, grade, e, at).stability;
    expect(g(3, "recall")).toBeGreaterThan(g(2, "recall"));
    expect(g(2, "recall")).toBeGreaterThan(g(1, "recall"));
    expect(g(2, "recall")).toBeGreaterThan(g(2, "recognition"));
    expect(g(2, "production")).toBeGreaterThan(g(2, "recall"));
  });
  it("Spätes Abrufen erfolgreich → größerer Zuwachs als zu frühes", () => {
    const base = review(undefined, 2, "recall", T0);
    const early = review(base, 2, "recall", T0 + 0.1 * DAY).stability;
    const late = review(base, 2, "recall", base.dueAt + 5 * DAY).stability;
    expect(late).toBeGreaterThan(early);
  });
  it("Neu-Fehler ergibt kurzes Intervall", () => {
    const s = review(undefined, 0, "recall", T0);
    expect((s.dueAt - T0) / DAY).toBeLessThan(0.5);
  });
});

describe("Mastery", () => {
  const run = (events: ReviewEvent[]) => masteryFor(buildProgress(events), "ba", events[0].skill);

  it("ein einziger richtiger Versuch ist nie 'gemeistert'", () => {
    expect(run([ev({})]).level).not.toBe("mastered");
  });
  it("viele richtige Erkennungen am selben Tag in einer Aufgabe → nicht gemeistert", () => {
    const events = Array.from({ length: 10 }, () => ev({}));
    const m = run(events);
    expect(m.level).not.toBe("mastered");
    expect(m.missing.join()).toMatch(/Aufgabenart|anderen Tag/);
  });
  it("Erkennen-Skill: mehrere Tage + Aufgabenarten + Stabilität → gemeistert", () => {
    const events = [
      ev({ dayOffset: 0, activity: "find" }), ev({ dayOffset: 1, activity: "match" }),
      ev({ dayOffset: 4, activity: "find" }), ev({ dayOffset: 10, activity: "match" }),
      ev({ dayOffset: 20, activity: "find" }), ev({ dayOffset: 40, activity: "match" }),
      ev({ dayOffset: 70, activity: "find" }), ev({ dayOffset: 110, activity: "match" }),
    ];
    expect(run(events).level).toBe("mastered");
  });
  it("Schreiben braucht Produktion/Abruf – reine Erkennung genügt nicht", () => {
    const mk = (evidence: Evidence) => [0, 1, 4, 10, 20, 40, 70, 110].map((d, i) =>
      ev({ skill: "writing", dayOffset: d, activity: i % 2 ? "trace" : "free", evidence }));
    expect(run(mk("recognition")).level).not.toBe("mastered");
    expect(run(mk("production")).level).toBe("mastered");
  });
  it("Ein Fehler als letzter Versuch nimmt den Status wieder weg", () => {
    const good = [0, 1, 4, 10, 20, 40, 70, 110].map((d, i) => ev({ dayOffset: d, activity: i % 2 ? "a" : "b" }));
    expect(run(good).level).toBe("mastered");
    expect(run([...good, ev({ dayOffset: 150, grade: 0 })]).level).not.toBe("mastered");
  });
  it("Aussprache (Selbsteinschätzung) erreicht nie 'gemeistert'", () => {
    const events = [0, 1, 4, 10, 20, 40, 70, 110].map((d, i) =>
      ev({ skill: "pronunciation", dayOffset: d, activity: i % 2 ? "a" : "b", evidence: "self", grade: 3 }));
    expect(run(events).level).toBe("familiar");
  });
  it("Zustand ist reihenfolgeunabhängig (deterministisch aus dem Log)", () => {
    const events = [0, 1, 4].map((d) => ev({ dayOffset: d }));
    const a = buildProgress(events);
    const b = buildProgress([...events].reverse());
    expect(b.states.get("ba:visual")).toEqual(a.states.get("ba:visual"));
  });
});

describe("Auswahl", () => {
  it("Fällige Items sind gedeckelt, schwächste zuerst, ohne direkte Buchstaben-Wiederholung", () => {
    const events: ReviewEvent[] = [];
    for (const id of ["ba", "ta", "tha", "nun", "ya"])
      for (const skill of ["visual", "association"] as const) events.push(ev({ letterId: id, skill, grade: 0 }));
    const p = buildProgress(events);
    const due = dueItems(p, T0 + 3 * DAY, 6);
    expect(due).toHaveLength(6);
    for (let i = 1; i < due.length; i++) expect(due[i].letterId).not.toBe(due[i - 1].letterId);
    expect(dueItems(p, T0, 6)).toHaveLength(0);
  });
  it("interleave lässt unvermeidbare Wiederholungen zu", () => {
    const out = interleave([{ letterId: "a" }, { letterId: "a" }, { letterId: "a" }]);
    expect(out).toHaveLength(3);
  });
  it("Distraktoren: Verwechslungen vor Ähnlichen vor Zufall, ohne Ziel und Duplikate", () => {
    const pool = ["ba", "ta", "tha", "nun", "ya", "mim", "ra"];
    const d = pickDistractors("ba", ["ta", "tha"], ["ra", "ta"], pool, 3, () => 0.3);
    expect(d).toEqual(["ra", "ta", "tha"]);
    expect(d).not.toContain("ba");
  });
  it("Verwechslungen werden nur bei Fehlern gezählt", () => {
    const p = buildProgress([
      ev({ grade: 0, confusedWith: "ta" }), ev({ grade: 0, confusedWith: "ta" }),
      ev({ grade: 0, confusedWith: "nun" }), ev({ grade: 2, confusedWith: "ya" }),
    ]);
    expect(confusionsOf(p, "ba")).toEqual([["ta", 2], ["nun", 1]]);
  });
});

import { buildExercise } from "@/domain/exercises";
import { openEventStore, parseExport, exportJson, memoryStore } from "@/persistence/eventStore";
import { IDBFactory } from "fake-indexeddb";

describe("Aufgaben", () => {
  const pool = ["ba", "ta", "tha", "nun", "ya", "mim"];
  const p = buildProgress([]);
  it("jede Aufgabe enthält die richtige Antwort genau einmal, ohne doppelte Optionen", () => {
    for (const type of ["find-letter", "letter-to-sound", "contrast"] as const)
      for (const id of pool) {
        const ex = buildExercise(type, id, pool, p);
        expect(ex.options[ex.answerIndex].letterId).toBe(id);
        expect(new Set(ex.options.map((o) => o.label)).size).toBe(ex.options.length);
      }
  });
  it("Kontrastaufgabe nutzt ähnliche Buchstaben als Konkurrenten", () => {
    const ex = buildExercise("contrast", "ba", pool, p);
    const ids = ex.options.map((o) => o.letterId);
    expect(ids).toContain("ba");
    expect(ids.some((i) => ["ta", "tha", "nun", "ya"].includes(i!))).toBe(true);
  });
  it("bekannte Verwechslung erscheint bevorzugt als Distraktor", () => {
    const prog = buildProgress([ev({ letterId: "ba", grade: 0, confusedWith: "mim" })]);
    const ex = buildExercise("find-letter", "ba", pool, prog);
    expect(ex.options.map((o) => o.letterId)).toContain("mim");
  });
});

describe("Persistenz", () => {
  const sample = ev({ letterId: "ba", skill: "writing", evidence: "production" });
  it("IndexedDB: anhängen, lesen, löschen, Import ohne Duplikate", async () => {
    const store = await openEventStore(new IDBFactory());
    expect(store.persistent).toBe(true);
    await store.append(sample);
    expect(await store.all()).toEqual([sample]);
    const json = exportJson(await store.all());
    const parsed = parseExport(json);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(await store.importEvents(parsed.events)).toBe(0);
    await store.clear();
    if (parsed.ok) expect(await store.importEvents(parsed.events)).toBe(1);
  });
  it("Import verwirft ungültige Einträge und lehnt fremde Dateien ab", async () => {
    const s = memoryStore();
    expect(await s.importEvents([{ id: 1 }, null, { ...sample, grade: 7 }, sample])).toBe(1);
    expect(parseExport("kein json").ok).toBe(false);
    expect(parseExport(JSON.stringify({ app: "x", events: [] })).ok).toBe(false);
  });
  it("ohne IndexedDB: Speicher-Fallback mit persistent=false", async () => {
    expect((await openEventStore(undefined)).persistent).toBe(false);
  });
});

import { planSession, unlockedGroups, nextToIntroduce } from "@/domain/session";
describe("Sitzungsplanung", () => {
  it("Gruppen schalten der Reihe nach frei", () => {
    expect(unlockedGroups(new Set())).toEqual([1]);
    expect(unlockedGroups(new Set(["alif", "ba", "ta"]))).toEqual([1]);
    expect(unlockedGroups(new Set(["alif", "ba", "ta", "tha"]))).toEqual([1, 2]);
    expect(nextToIntroduce(new Set(["alif"]))).toBe("ba");
  });
  it("neu eingeführte Buchstaben ergeben Aufgaben, nicht eingeführte nie", () => {
    const plan = planSession(buildProgress([]), new Set(["ba", "ta"]), T0, 20);
    expect(plan.every((x) => ["ba", "ta"].includes(x.letterId))).toBe(true);
    expect(plan).toHaveLength(6);
    expect(plan.every((x) => x.why === "new")).toBe(true);
  });
  it("Fälliges kommt vor Neuem", () => {
    const p = buildProgress([ev({ letterId: "ba", skill: "visual", grade: 0 })]);
    const plan = planSession(p, new Set(["ba", "ta"]), T0 + 2 * DAY, 4);
    expect(plan[0]).toMatchObject({ letterId: "ba", type: "find-letter", why: "due" });
  });
  it("leer, wenn nichts eingeführt wurde", () => {
    expect(planSession(buildProgress([]), new Set(), T0)).toEqual([]);
  });
});
