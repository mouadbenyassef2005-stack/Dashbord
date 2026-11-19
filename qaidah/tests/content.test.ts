import { describe, expect, it } from "vitest";
import { LETTERS, LETTER_BY_ID, formsOf, GROUP_COUNT } from "@/content/letters";

describe("Buchstaben-Inhalt", () => {
  it("hat genau 28 eindeutige Buchstaben in traditioneller Reihenfolge", () => {
    expect(LETTERS).toHaveLength(28);
    expect(new Set(LETTERS.map((l) => l.id)).size).toBe(28);
    expect(new Set(LETTERS.map((l) => l.ch)).size).toBe(28);
    expect(LETTERS.map((l) => l.ch).join("")).toBe("ابتثجحخدذرزسشصضطظعغفقكلمنهوي");
  });
  it("Ähnlichkeiten sind symmetrisch und verweisen auf existierende Buchstaben", () => {
    for (const l of LETTERS)
      for (const s of l.similar) {
        expect(LETTER_BY_ID.has(s), `${l.id}→${s}`).toBe(true);
        expect(LETTER_BY_ID.get(s)!.similar, `${s} sollte ${l.id} enthalten`).toContain(l.id);
      }
  });
  it("Gruppen sind lückenlos und wachsen mit der Reihenfolge", () => {
    const groups = LETTERS.map((l) => l.group);
    expect([...groups].sort((a, b) => a - b)).toEqual(groups);
    expect(new Set(groups).size).toBe(GROUP_COUNT);
  });
  it("Nicht-Verbinder (ا د ذ ر ز و) verbinden nicht mit dem Folgebuchstaben", () => {
    const non = LETTERS.filter((l) => !l.joinsNext).map((l) => l.ch).join("");
    expect(non).toBe("ادذرزو");
  });
  it("Formen: Nicht-Verbinder haben keine Anfangs-/Mittelverlängerung", () => {
    const f = formsOf(LETTER_BY_ID.get("ra")!);
    expect(f.initial).toBe("ر");
    expect(formsOf(LETTER_BY_ID.get("ba")!).initial).toBe("ب‍");
  });
});
