import { describe, expect, it } from "vitest";
import { DAY, retrievability, review } from "@/lektion/domain/scheduler";
import type { Evidence, Grade } from "@/lektion/domain/types";

const T0 = Date.UTC(2026, 0, 1, 10);

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

