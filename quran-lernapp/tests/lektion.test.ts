import { describe, expect, it } from "vitest";
import { ALIF, ITEMS, L1_LETTER_IDS, MARK, SYLLABLES, WORDS, letterCh } from "@/lektion/content/lektion1";
import { LETTER_BY_ID } from "@/lektion/content/letters";
import { AUDIO_MANIFEST, audioIdForItem, hasAudio } from "@/lektion/audio/manifest";
import { buildSet, checkTyped, drillSets, drillTasks, extraTasks, gradeFor, interleaveTasks, makeTask, normalizeTyped, reviewTaskFor, variantCount, type Task, type TaskResult } from "@/lektion/domain/lektion/tasks";
import { existsSync } from "node:fs";
import path from "node:path";

const seeded = (seed = 7) => () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const ARABIC_ALLOWED = new Set([..."ابتث", ...Object.values(MARK), "\u0640", "ي", "ن"]);
const TASHKEEL = /[ً-ٟ]/;

describe("Inhalt: Orthografie und Fachlogik", () => {
  it("Silben und Wörter verwenden nur ا ب ت ث und die drei Kurzvokale", () => {
    for (const ch of [...SYLLABLES.map((s) => s.ar), ...WORDS.map((w) => w.ar)].join("")) expect(ARABIC_ALLOWED.has(ch), `U+${ch.codePointAt(0)!.toString(16)}`).toBe(true);
  });
  it("12 Silben mit korrekter Umschrift; Kasra U+0650, Fatha U+064E, Damma U+064F", () => {
    expect(SYLLABLES).toHaveLength(12);
    const by = Object.fromEntries(SYLLABLES.map((s) => [s.id, s]));
    expect([by["syl:ba-fatha"].ar, by["syl:ba-fatha"].tr]).toEqual(["بَ", "ba"]);
    expect([by["syl:ba-kasra"].ar, by["syl:ba-kasra"].tr]).toEqual(["بِ", "bi"]);
    expect([by["syl:ta-damma"].ar, by["syl:ta-damma"].tr]).toEqual(["تُ", "tu"]);
    expect([by["syl:tha-long"].ar, by["syl:tha-long"].tr]).toEqual(["ثَا", "thā"]);
    expect(new Set(SYLLABLES.map((s) => s.tr)).size).toBe(12);
    expect([MARK.fatha, MARK.kasra, MARK.damma]).toEqual(["َ", "ِ", "ُ"]);
  });
  it("Wörter: Buchstabenfolge, ā nur nach Fatha, Alif trägt kein Zeichen, Endbuchstabe ohne Zeichen (Pausalform)", () => {
    expect(WORDS.map((w) => w.ar)).toEqual(["بَاب", "ثَابِت", "تَاب", "ثَبَات"]);
    for (const w of WORDS) {
      expect([...w.ar].filter((c) => !TASHKEEL.test(c)).join(""), w.id).toBe(w.letters.map(letterCh).join(""));
      expect((w.tr.match(/ā/g) ?? []).length, w.id).toBe(w.letters.filter((l) => l === "alif").length);
      for (let i = 0; i < w.ar.length; i++) if (w.ar[i] === ALIF) expect(w.ar[i - 1], `${w.id}: ā nur nach Fatha`).toBe(MARK.fatha);
      expect(TASHKEEL.test(w.ar.at(-1)!), `${w.id}: kein Zeichen am Wortende`).toBe(false);
    }
  });
  it("Alif ist Nicht-Verbinder ohne Punkte; ب ت ث verbinden und haben 1 unten, 2 oben, 3 oben", () => {
    expect(LETTER_BY_ID.get("alif")!.joinsNext).toBe(false);
    expect(LETTER_BY_ID.get("alif")!.dots.count).toBe(0);
    for (const id of ["ba", "ta", "tha"]) expect(LETTER_BY_ID.get(id)!.joinsNext).toBe(true);
    expect(LETTER_BY_ID.get("ba")!.dots).toMatchObject({ count: 1, pos: "below" });
    expect(LETTER_BY_ID.get("ta")!.dots).toMatchObject({ count: 2, pos: "above" });
    expect(LETTER_BY_ID.get("tha")!.dots).toMatchObject({ count: 3, pos: "above" });
  });
  it("Items eindeutig; 4 Buchstaben, 3 Vokale", () => {
    expect(new Set(ITEMS.map((i) => i.id)).size).toBe(ITEMS.length);
    expect(ITEMS.filter((i) => i.kind === "letter")).toHaveLength(4);
    expect(ITEMS.filter((i) => i.kind === "vowel")).toHaveLength(3);
    expect(L1_LETTER_IDS.length).toBe(4);
  });
});

describe("Audio", () => {
  it("jede Manifest-Datei existiert in public/audio", () => {
    for (const [id, file] of Object.entries(AUDIO_MANIFEST)) expect(existsSync(path.join(__dirname, "../public/audio", file)), `${id} → ${file}`).toBe(true);
  });
  it("Aufnahmen: 3 Vokale, 9 Kurzsilben, Alif; für lange Silben und Wörter gibt es keine (ehrlich: nicht vorhanden)", () => {
    expect(["vowel-fatha", "vowel-kasra", "vowel-damma", "name-alif", "syl-ba-kasra", "syl-tha-damma"].every(hasAudio)).toBe(true);
    expect(hasAudio("syl-ba-long")).toBe(false);
    expect(WORDS.some((w) => hasAudio(`word-${w.id.split(":")[1]}`))).toBe(false);
  });
  it("Zuordnung Item → Aufnahme", () => {
    expect(audioIdForItem("letter:alif")).toBe("name-alif");
    expect(audioIdForItem("letter:tha")).toBe("sound-tha");
    expect(audioIdForItem("vowel:kasra")).toBe("vowel-kasra");
    expect(audioIdForItem("syl:ta-damma")).toBe("syl-ta-damma");
    expect(audioIdForItem("syl:ba-long")).toBeNull();
    expect(audioIdForItem("word:bab")).toBeNull();
  });
});

describe("Aufgaben", () => {
  const rnd = seeded();
  it("alle Items × Varianten sind erzeugbar, gültig und haben genau eine richtige Option", () => {
    for (const item of ITEMS)
      for (let v = 0; v < variantCount(item.id); v++) {
        const t = makeTask(item.id, v, rnd);
        expect(t.explain.length).toBeGreaterThan(10);
        if (t.type === "choice") {
          expect(new Set(t.options).size, t.id).toBe(t.options.length);
          expect(t.options.length, t.id).toBeGreaterThanOrEqual(3);
          expect(t.optionItems).toHaveLength(t.options.length);
        } else expect(t.accepted.length).toBeGreaterThan(0);
      }
  });
  it("Hörvariante nur, wenn es eine Aufnahme gibt; Hörreiz trägt audioId, die im Manifest steht", () => {
    expect(variantCount("syl:ba-long")).toBe(3);
    expect(variantCount("syl:ba-kasra")).toBe(5);
    expect(() => makeTask("syl:ba-long", 3)).toThrow();
    for (const item of ITEMS) for (let v = 0; v < variantCount(item.id); v++) { const t = makeTask(item.id, v, rnd); if (t.audioId) expect(hasAudio(t.audioId)).toBe(true); }
  });
  it("jede Kompetenz kommt vor; Hören ≠ Erkennen ≠ Lesen", () => {
    const comps = new Set<string>();
    for (const item of ITEMS) for (let v = 0; v < variantCount(item.id); v++) comps.add(makeTask(item.id, v, rnd).competence);
    expect([...comps].sort()).toEqual(["listen", "sound", "syllable", "visual", "vowel", "word"].sort());
    expect(makeTask("letter:ba", 0).competence).toBe("visual");
    expect(makeTask("syl:ba-fatha", 3).competence).toBe("listen");
    expect(makeTask("syl:ba-fatha", 0).competence).toBe("syllable");
  });
  it("Hörunterscheidung bietet nur Silben mit Aufnahme als Optionen an", () => {
    for (let k = 1; k < 15; k++) {
      const t = makeTask("syl:ta-kasra", 3, seeded(k)) as Extract<Task, { type: "choice" }>;
      expect(t.options[t.answer]).toBe("ti");
      for (const it of t.optionItems) expect(audioIdForItem(it!)).not.toBeNull();
    }
  });
  it("ā-Silbe: das kurze a ist immer Distraktor (Länge wird geprüft)", () => {
    for (let k = 1; k < 15; k++) { const t = makeTask("syl:ba-long", 0, seeded(k)) as Extract<Task, { type: "choice" }>; expect(t.options).toContain("ba"); expect(t.options[t.answer]).toBe("bā"); }
  });
  it("Verwechslungsdaten: Distraktor kennt sein Item", () => {
    const t = makeTask("letter:ba", 1, seeded(3)) as Extract<Task, { type: "choice" }>;
    expect(t.optionItems[t.answer]).toBe("letter:ba");
    expect(t.options.map((o, i) => (o === letterCh("ta") ? t.optionItems[i] : null)).filter(Boolean)).toContain("letter:ta");
  });
  it("Tippantworten: Normalisierung und Längenunterscheidung", () => {
    expect(normalizeTyped("  BAA ")).toBe("bā");
    expect(checkTyped("bāb", "baab")).toBe("right");
    expect(checkTyped("bāb", "bab")).toBe("lengthOnly");
    expect(checkTyped("tha", "ta")).toBe("wrong");
    expect(checkTyped("thābit", "ṯābit")).toBe("right");
  });
  it("Note: falsch 0, Länge/Hilfe 1; Zeit zählt nur bei Aufgaben ohne Hörreiz", () => {
    expect(gradeFor("wrong", "type", false)).toBe(0);
    expect(gradeFor("lengthOnly", "type", false)).toBe(1);
    expect(gradeFor("right", "choice", true)).toBe(1);
    expect(gradeFor("right", "choice", false, 2000, true)).toBe(3);
    expect(gradeFor("right", "choice", false, 9000, true)).toBe(2);
    expect(gradeFor("right", "choice", false, 25000, true)).toBe(1);
    expect(gradeFor("right", "choice", false, 2000, false)).toBe(2); // Hörreiz: Zeit ignoriert
  });
  it("Interleaving: nie dasselbe Item direkt hintereinander", () => {
    const tasks = buildSet(ITEMS.slice(0, 10).map((i) => [i.id, 0] as [string, number]), seeded(5), false);
    const mixed = interleaveTasks([...tasks].sort((a, b) => a.family.localeCompare(b.family)));
    for (let i = 1; i < mixed.length; i++) expect(mixed[i].itemId).not.toBe(mixed[i - 1].itemId);
  });
  it("Wiederholungsaufgabe passt zur Kompetenz und wechselt die Variante", () => {
    const a = reviewTaskFor("syl:ba-fatha", "listen", 0, seeded(1))!;
    expect(a.competence).toBe("listen");
    expect(reviewTaskFor("syl:ba-long", "listen", 0)).toBeNull();
    expect(reviewTaskFor("syl:ba-fatha", "sound", 0, seeded(1))!.id).not.toBe(reviewTaskFor("syl:ba-fatha", "sound", 1, seeded(1))!.id);
  });
  it("Vergleichsübung: Übung und Nachtest sind disjunkt und nicht leer", () => {
    for (let k = 1; k < 20; k++) {
      const { practice, retest } = drillSets("letter:ba", "letter:ta", seeded(k));
      expect(practice.length).toBe(4); expect(retest.length).toBe(4);
      expect(retest.some((t) => practice.some((p) => p.id === t.id))).toBe(false);
    }
  });
  it("Vergleichsübung und Zusatzübung: andere Varianten, nur beteiligte Items", () => {
    const d = drillTasks("letter:ba", "letter:ta", 6, seeded(2));
    expect(d.length).toBeGreaterThan(0);
    for (const t of d) expect(["letter:ba", "letter:ta"]).toContain(t.itemId);
    const wrong: TaskResult[] = [{ taskId: "letter:ba#0", itemId: "letter:ba", competence: "visual", type: "choice", correctness: "wrong", grade: 0, hintUsed: false, answer: "" }];
    const e = extraTasks(wrong, 8, seeded(2));
    expect(e).toHaveLength(1);
    expect(e[0].id).not.toBe("letter:ba#0");
    expect(e[0].competence).toBe("visual");
  });
});

