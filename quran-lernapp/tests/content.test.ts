import { describe, expect, it } from "vitest";
import { LESSONS, UNITS } from "@/content/lessons";
import { WORDS, QURAN_SOURCE_INFO } from "@/content/quran";
import { toClusters } from "@/lib/arabic";

describe("Lerninhalte", () => {
  it("hat eindeutige Lektions-IDs und gültige Einheiten", () => {
    const ids = LESSONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const l of LESSONS) expect(UNITS.some((u) => u.id === l.unitId)).toBe(true);
  });
  it("hat pro Lektion eindeutige Item-IDs, Lernziel und Items", () => {
    for (const l of LESSONS) {
      expect(l.goal.length).toBeGreaterThan(5);
      expect(l.items.length).toBeGreaterThan(2);
      const ids = l.items.map((i) => i.id);
      expect(new Set(ids).size, l.id).toBe(ids.length);
    }
  });
  it("Choose-Items haben gültige Antwort und eindeutige Optionen", () => {
    for (const l of LESSONS)
      for (const i of l.items)
        if (i.kind === "choose") {
          expect(i.answer).toBeGreaterThanOrEqual(0);
          expect(i.answer).toBeLessThan(i.options.length);
          expect(new Set(i.options).size, i.id).toBe(i.options.length);
        }
  });
  it("Quran-Wörter stammen aus der Quelldatei und haben Fundstellen", () => {
    expect(WORDS.length).toBeGreaterThan(50);
    expect(QURAN_SOURCE_INFO.license).toContain("CC BY-SA");
    for (const w of WORDS) {
      expect(w.id).toMatch(/^\d+:\d+:\d+$/);
      expect(w.letters.length).toBeGreaterThan(0);
    }
  });
  it("zerlegt Wörter in Buchstaben + Zeichen", () => {
    const c = toClusters("رَبِّ");
    expect(c.map((x) => x.base)).toEqual(["ر", "ب"]);
    expect(c[1].marks.length).toBe(2);
  });
});

import { UNIQUE_WORDS } from "@/content/quran";
describe("Wort-Lektionen", () => {
  it("decken genau die lernbaren Quran-Wörter ab", () => {
    const inLessons = LESSONS.flatMap((l) => l.items).filter((i) => i.id.startsWith("w:")).map((i) => i.id.slice(2));
    expect(new Set(inLessons).size).toBe(inLessons.length);
    expect(inLessons.sort()).toEqual(UNIQUE_WORDS.map((w) => w.id).sort());
  });
  it("Passagen-Items tragen Fundstelle", () => {
    for (const l of LESSONS.filter((x) => x.unitId === "passagen"))
      for (const i of l.items) expect(i.kind === "read" && i.ref).toMatch(/^\d+:\d+$/);
  });
});
