import { describe, expect, it } from "vitest";
import { hasAudio } from "@/lektion/audio/manifest";
import { ITEM_BY_ID, VOWEL_INFO } from "@/lektion/content/lektion1";
import { UNITS } from "@/lektion/content/units";
import { buildSet, variantCount } from "@/lektion/domain/lektion/tasks";

describe("Lerneinheiten", () => {
  it("vier Einheiten, jede mit Ziel, Einführung, geführter Übung, Hypothesen, Check, Übung, Test und Schwellen", () => {
    expect(UNITS.map((u) => u.id)).toEqual([1, 2, 3, 4]);
    for (const u of UNITS) {
      expect(u.goal.length, `goal ${u.id}`).toBeGreaterThan(20);
      expect(u.news.length).toBeGreaterThan(0);
      expect(u.guided.length).toBeGreaterThan(0);
      expect(u.hyps.length).toBeGreaterThanOrEqual(3);
      expect(u.check.length).toBe(4);
      expect(u.practice.length).toBeGreaterThanOrEqual(9);
      expect(u.test.length).toBeGreaterThanOrEqual(8);
      expect(u.gates.length).toBeGreaterThan(0);
    }
  });
  it("Progression: neue Konzepte erst nach ihren Voraussetzungen", () => {
    const uses = (u: (typeof UNITS)[number]) => [...u.practice, ...u.test, ...u.check].map(([id]) => id).join(" ");
    expect(uses(UNITS[0])).not.toMatch(/syl:|word:|vowel:/);            // Einheit 1: nur Buchstaben
    expect(uses(UNITS[1])).not.toMatch(/kasra|damma|long|word:/);       // Einheit 2: nur Fatha
    expect(uses(UNITS[2])).not.toMatch(/long|word:/);                   // Einheit 3: noch keine Länge/Wörter
    expect(uses(UNITS[3])).toMatch(/word:/);                            // Einheit 4: Wörter
  });
  it("alle Aufgaben-Spezifikationen existieren; Test weicht in der Mehrzahl von der Übung ab", () => {
    for (const u of UNITS) {
      for (const [name, spec] of [["check", u.check], ["practice", u.practice], ["test", u.test], ["warm", u.warm]] as const)
        for (const [id, v] of spec) { expect(ITEM_BY_ID.has(id), `${u.id}.${name}: ${id}`).toBe(true); expect(v, `${u.id}.${name}: ${id}#${v}`).toBeLessThan(variantCount(id)); }
      const p = new Set(u.practice.map(([i, v]) => `${i}#${v}`));
      expect(u.test.filter(([i, v]) => p.has(`${i}#${v}`)).length, `Einheit ${u.id}`).toBeLessThanOrEqual(Math.ceil(u.test.length * 0.4));
      expect(buildSet(u.test, () => 0.4)).toHaveLength(u.test.length);
    }
  });
  it("Test jeder Einheit prüft Hören UND Lesen/Erkennen getrennt (mindestens zwei Kompetenzen)", () => {
    for (const u of UNITS) expect(new Set(buildSet(u.test, () => 0.4).map((t) => t.competence)).size, `Einheit ${u.id}`).toBeGreaterThanOrEqual(2);
  });
  it("Hypothesen: eine gültige richtige Antwort, Ableitung, Auflösung und Fehlannahme vorhanden, kein reines Raten bei Vokalen", () => {
    for (const u of UNITS) for (const h of u.hyps) {
      expect(h.answer).toBeGreaterThanOrEqual(0); expect(h.answer).toBeLessThan(h.options.length);
      expect(new Set(h.options).size).toBe(h.options.length);
      for (const f of [h.derivation, h.reveal, h.misconception]) expect(f.length, `${h.id}`).toBeGreaterThan(30);
      // Aufgaben, die einen unbekannten Vokal benennen sollen, müssen Informationen vorgeben
      if (/[َُِ]/.test(h.stimulus ?? "") || h.audioIds) expect(h.given?.length ?? 0, `${h.id} braucht „Was du schon weißt“`).toBeGreaterThan(0);
    }
  });
  it("Einheit 1 stellt keine Hypothese zu Vokalzeichen; erste Kasra-/Damma-Hypothese kommt erst in Einheit 3 und gibt bi/bu vor", () => {
    expect(UNITS[0].hyps.some((h) => /[َُِ]/.test(h.stimulus ?? ""))).toBe(false);
    expect(UNITS[1].hyps.some((h) => /[ُِ]/.test(h.stimulus ?? ""))).toBe(false);
    expect(UNITS[2].hyps[0].given!.join(" ")).toMatch(/بِ = bi/);
    expect(UNITS[2].hyps[0].given!.join(" ")).toMatch(/بُ = bu/);
  });
  it("Hörhypothesen verweisen nur auf vorhandene Aufnahmen", () => {
    for (const u of UNITS) for (const h of u.hyps) for (const a of h.audioIds ?? []) expect(hasAudio(a), a).toBe(true);
  });
  it("Phonetik: Kasra und Damma werden über die Zungenposition erklärt, nicht nur über die Lippen", () => {
    expect(VOWEL_INFO.kasra.mouth + VOWEL_INFO.kasra.tongue).toMatch(/Zunge/);
    expect(VOWEL_INFO.kasra.mouth.toLowerCase()).not.toMatch(/lippen breit/);
    expect(VOWEL_INFO.damma.mouth).toMatch(/Zungenrücken/);
    expect(VOWEL_INFO.damma.mouth).toMatch(/gerundet/);
    expect(VOWEL_INFO.fatha.caution).toMatch(/nicht|Annäherung|je nach/i);
  });
});
