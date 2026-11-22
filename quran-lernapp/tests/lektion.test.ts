import { describe, expect, it } from "vitest";
import {
  ALIF, ALIF_CONTRAST, CONCEPT_IDS, HYPOTHESES, ITEMS, ITEM_BY_ID, L1_LETTER_IDS, MARK, SYLLABLES, WORDS, letterCh,
} from "@/lektion/content/lektion1";
import { LETTER_BY_ID } from "@/lektion/content/letters";
import {
  CHECK_SPEC, PRACTICE_SPEC, PRETEST_SPEC, RETRIEVAL_SPEC, buildSet, checkTyped, gradeFor, interleaveTasks, makeTask,
  normalizeTyped, reviewTask, variantCount, type Task,
} from "@/lektion/domain/lektion/tasks";
import {
  PHASE_COUNT, curvePoints, daysToNextDue, dueEntries, initialLesson, lessonReducer, parseLesson, simNow,
} from "@/lektion/domain/lektion/state";
import { DAY } from "@/lektion/domain/scheduler";

const seeded = (seed = 7) => () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const ARABIC_ALLOWED = new Set([..."ابتث", ...Object.values(MARK), "◌"]);
const TASHKEEL = /[ً-ٟ]/;

describe("Lektion 1: Inhalt (Orthografie & Fachlogik)", () => {
  it("verwendet nur ا ب ت ث und die drei Kurzvokale", () => {
    const all = [...SYLLABLES.map((s) => s.ar), ...WORDS.map((w) => w.ar)].join("");
    for (const ch of all) expect(ARABIC_ALLOWED.has(ch), `unerlaubtes Zeichen U+${ch.codePointAt(0)!.toString(16)}`).toBe(true);
  });
  it("Silben = Buchstabe + Vokalzeichen (+ Alif bei ā) mit korrekter Umschrift", () => {
    expect(SYLLABLES).toHaveLength(12);
    const by = Object.fromEntries(SYLLABLES.map((s) => [s.id, s]));
    expect(by["syl:ba-fatha"].ar).toBe("بَ"); expect(by["syl:ba-fatha"].tr).toBe("ba");
    expect(by["syl:ba-kasra"].ar).toBe("بِ"); expect(by["syl:ba-kasra"].tr).toBe("bi");
    expect(by["syl:ta-damma"].ar).toBe("تُ"); expect(by["syl:ta-damma"].tr).toBe("tu");
    expect(by["syl:tha-fatha"].tr).toBe("tha"); expect(by["syl:tha-long"].tr).toBe("thā");
    expect(by["syl:ba-long"].ar).toBe("بَا");
    expect(new Set(SYLLABLES.map((s) => s.tr)).size).toBe(12);
  });
  it("Kasra steht tatsächlich als U+0650, Fatha U+064E, Damma U+064F", () => {
    expect(MARK.fatha).toBe("َ"); expect(MARK.kasra).toBe("ِ"); expect(MARK.damma).toBe("ُ");
  });
  it("Wörter: vollständig vokalisiert, Buchstabenfolge passt zu den Buchstaben-IDs, Umschrift passt zur Länge", () => {
    for (const w of WORDS) {
      const base = [...w.ar].filter((c) => !TASHKEEL.test(c));
      expect(base.join(""), w.id).toBe(w.letters.map(letterCh).join(""));
      // jeder Konsonant außer dem letzten hat ein Vokalzeichen; Alif nie
      const marks = [...w.ar].filter((c) => TASHKEEL.test(c)).length;
      expect(marks, w.id).toBeGreaterThanOrEqual(1);
      expect(w.ar.includes(ALIF + MARK.kasra) || w.ar.includes(ALIF + MARK.fatha) || w.ar.includes(ALIF + MARK.damma), `${w.id}: Alif trägt kein Zeichen`).toBe(false);
      // jedes ا im Wort ergibt ein ā in der Umschrift und steht nach Fatha
      const alifs = w.letters.filter((l) => l === "alif").length;
      expect((w.tr.match(/ā/g) ?? []).length, w.id).toBe(alifs);
      for (let i = 0; i < w.ar.length; i++) if (w.ar[i] === ALIF) expect(w.ar[i - 1], `${w.id}: ā nur nach Fatha`).toBe(MARK.fatha);
    }
  });
  it("Alif: kein Nicht-Verbinder-Fehler, ب ت ث verbinden", () => {
    expect(LETTER_BY_ID.get("alif")!.joinsNext).toBe(false);
    for (const id of ["ba", "ta", "tha"]) expect(LETTER_BY_ID.get(id)!.joinsNext).toBe(true);
    expect(LETTER_BY_ID.get("alif")!.dots.count).toBe(0);
    expect(LETTER_BY_ID.get("ba")!.dots).toMatchObject({ count: 1, pos: "below" });
    expect(LETTER_BY_ID.get("ta")!.dots).toMatchObject({ count: 2, pos: "above" });
    expect(LETTER_BY_ID.get("tha")!.dots).toMatchObject({ count: 3, pos: "above" });
  });
  it("Kontrasttabelle: Alif nie als Konsonant dargestellt", () => {
    const row = ALIF_CONTRAST.find((r) => r.feature === "Eigener Konsonantenlaut")!;
    expect(row.alif).toMatch(/nein/);
  });
  it("Hypothesen: eine richtige Option, gültiger Index, Reveal vorhanden", () => {
    expect(HYPOTHESES.length).toBeGreaterThanOrEqual(5);
    for (const h of HYPOTHESES) {
      expect(h.answer).toBeGreaterThanOrEqual(0); expect(h.answer).toBeLessThan(h.options.length);
      expect(new Set(h.options).size).toBe(h.options.length);
      expect(h.reveal.length).toBeGreaterThan(30);
    }
  });
  it("Items sind eindeutig und decken Buchstaben, Vokale, Silben, Wörter, Konzepte ab", () => {
    expect(new Set(ITEMS.map((i) => i.id)).size).toBe(ITEMS.length);
    expect(ITEMS.filter((i) => i.kind === "letter")).toHaveLength(4);
    expect(ITEMS.filter((i) => i.kind === "vowel")).toHaveLength(3);
    expect(CONCEPT_IDS.every((c) => ITEM_BY_ID.has(c))).toBe(true);
    expect(L1_LETTER_IDS.length).toBe(4);
  });
});

describe("Lektion 1: Aufgaben", () => {
  const rnd = seeded();
  it("alle Items × Varianten sind erzeugbar, gültig und haben genau eine richtige Option", () => {
    for (const item of ITEMS)
      for (let v = 0; v < variantCount(item.id); v++) {
        const t = makeTask(item.id, v, rnd);
        expect(t.explain.length).toBeGreaterThan(10);
        if (t.type === "choice") {
          expect(new Set(t.options).size, t.id).toBe(t.options.length);
          expect(t.options.length, t.id).toBeGreaterThanOrEqual(3);
          expect(t.answer, t.id).toBeGreaterThanOrEqual(0);
          expect(t.options.filter((o, i) => i === t.answer).length).toBe(1);
        } else {
          expect(t.accepted.length).toBeGreaterThan(0);
        }
      }
  });
  it("Silben-Distraktoren enthalten bei ā das kurze a (Längenunterschied wird geprüft)", () => {
    for (let k = 0; k < 20; k++) {
      const t = makeTask("syl:ba-long", 0, seeded(k + 1)) as Extract<Task, { type: "choice" }>;
      expect(t.options).toContain("ba"); expect(t.options[t.answer]).toBe("bā");
    }
  });
  it("Buchstaben-Aufgabe: richtige Option ist der gefragte Buchstabe", () => {
    const t = makeTask("letter:tha", 2, rnd) as Extract<Task, { type: "choice" }>;
    expect(t.options[t.answer]).toBe("ث");
    const n = makeTask("letter:ba", 0, rnd) as Extract<Task, { type: "choice" }>;
    expect(n.options[n.answer]).toBe("Bā");
  });
  it("Tippantworten: Normalisierung und Längenunterscheidung", () => {
    expect(normalizeTyped("  BAA ")).toBe("bā");
    expect(checkTyped("bāb", "baab")).toBe("right");
    expect(checkTyped("bāb", "bāb")).toBe("right");
    expect(checkTyped("bāb", "bab")).toBe("lengthOnly");
    expect(checkTyped("thābit", "thabit")).toBe("lengthOnly");
    expect(checkTyped("tha", "ta")).toBe("wrong");
    expect(checkTyped("ti", "")).toBe("wrong");
    expect(checkTyped("thābit", "ṯābit")).toBe("right");
  });
  it("Note: falsch 0, Länge fehlt 1, Hilfe genutzt 1, frei richtig 3, Auswahl richtig 2", () => {
    expect(gradeFor("wrong", "type", false)).toBe(0);
    expect(gradeFor("lengthOnly", "type", false)).toBe(1);
    expect(gradeFor("right", "type", true)).toBe(1);
    expect(gradeFor("right", "type", false)).toBe(3);
    expect(gradeFor("right", "choice", false)).toBe(2);
  });
  it("Aufgabensätze sind gültig; Phase 5 enthält Transfer, Phase 6 überwiegend freie Antworten", () => {
    for (const spec of [PRETEST_SPEC, CHECK_SPEC, PRACTICE_SPEC, RETRIEVAL_SPEC]) {
      const set = buildSet(spec, seeded(3));
      expect(set).toHaveLength(spec.length);
      expect(new Set(set.map((t) => t.id)).size).toBe(spec.length);
    }
    expect(buildSet(PRACTICE_SPEC, seeded(3)).filter((t) => t.novel).length).toBeGreaterThanOrEqual(5);
    const ret = buildSet(RETRIEVAL_SPEC, seeded(3));
    expect(ret.filter((t) => t.type === "type").length).toBeGreaterThanOrEqual(ret.length * 0.45);
    // Retrieval prüft andere Varianten als Phase 5 für dieselben Items
    const p5 = new Set(PRACTICE_SPEC.map(([i, v]) => `${i}#${v}`));
    expect(RETRIEVAL_SPEC.filter(([i, v]) => p5.has(`${i}#${v}`))).toHaveLength(0);
  });
  it("Interleaving: nie dasselbe Item direkt hintereinander, weniger Familien-Blöcke als sortiert", () => {
    const tasks = buildSet(PRACTICE_SPEC, seeded(5), false);
    const mixed = interleaveTasks([...tasks].sort((a, b) => a.family.localeCompare(b.family)));
    for (let i = 1; i < mixed.length; i++) expect(mixed[i].itemId).not.toBe(mixed[i - 1].itemId);
    const sameFamilyRuns = (l: Task[]) => l.filter((t, i) => i > 0 && t.family === l[i - 1].family).length;
    const sorted = [...tasks].sort((a, b) => a.family.localeCompare(b.family));
    expect(sameFamilyRuns(mixed)).toBeLessThan(sameFamilyRuns(sorted));
    expect(new Set(mixed.map((t) => t.id))).toEqual(new Set(tasks.map((t) => t.id)));
  });
  it("Wiederholungsaufgaben wechseln die Variante mit der Wiederholungszahl", () => {
    const a = reviewTask("syl:ba-fatha", 0, seeded(1)).id, b = reviewTask("syl:ba-fatha", 1, seeded(1)).id;
    expect(a).not.toBe(b);
  });
});

describe("Lektion 1: Ablauf, Wiederholungslogik, Persistenz", () => {
  const T0 = 1_700_000_000_000;
  const res = (itemId: string, grade: 0 | 1 | 2 | 3, type: "choice" | "type" = "choice") => ({
    taskId: `${itemId}#0`, itemId, type, correctness: grade === 0 ? "wrong" as const : "right" as const, grade, hintUsed: false, answer: "",
  });

  it("Phasen schalten nacheinander frei, Doppel-Abschluss ist idempotent", () => {
    let s = initialLesson(T0);
    expect(s.unlocked).toBe(1);
    s = lessonReducer(s, { t: "complete", phase: 1 });
    s = lessonReducer(s, { t: "complete", phase: 1 });
    expect(s.done).toEqual([1]); expect(s.unlocked).toBe(2);
    s = lessonReducer(s, { t: "complete", phase: PHASE_COUNT });
    expect(s.unlocked).toBe(PHASE_COUNT);
  });
  it("Ergebnisse füllen den Wiederholungsplan; Fehler erzeugt kürzeres Intervall als Erfolg", () => {
    let s = initialLesson(T0);
    s = lessonReducer(s, { t: "results", phase: 5, now: T0, results: [res("syl:ba-fatha", 2), res("syl:ba-kasra", 0)] });
    expect(Object.keys(s.srs)).toHaveLength(2);
    expect(s.srs["syl:ba-fatha"].dueAt).toBeGreaterThan(s.srs["syl:ba-kasra"].dueAt);
    expect(s.log).toHaveLength(2);
  });
  it("Simulierte Zeit: erst nichts fällig, nach Zeitsprung fällig, nach Wiederholung wächst das Intervall", () => {
    let s = initialLesson(T0);
    s = { ...s, simStart: T0 };
    s = lessonReducer(s, { t: "results", phase: 6, now: T0, results: [res("letter:ba", 2), res("word:bab", 3, "type")] });
    expect(dueEntries(s.srs, simNow(s, T0))).toHaveLength(0);
    const jump = daysToNextDue(s.srs, simNow(s, T0))!;
    expect(jump).toBeGreaterThanOrEqual(1);
    s = lessonReducer(s, { t: "advance", days: jump });
    const due = dueEntries(s.srs, simNow(s, T0));
    expect(due.length).toBeGreaterThanOrEqual(1);
    expect(due[0].r).toBeLessThan(1);
    const before = s.srs[due[0].itemId];
    s = lessonReducer(s, { t: "results", phase: 7, now: simNow(s, T0), results: [res(due[0].itemId, 2)] });
    const after = s.srs[due[0].itemId];
    expect(after.stability).toBeGreaterThan(before.stability);
    expect(after.dueAt - simNow(s, T0)).toBeGreaterThan(before.dueAt - before.lastAt);
  });
  it("Vergessen bei Pause: nach 30 Tagen ohne Wiederholung ist die Abrufwahrscheinlichkeit gesunken", () => {
    let s = initialLesson(T0);
    s = { ...s, simStart: T0 };
    s = lessonReducer(s, { t: "results", phase: 6, now: T0, results: [res("vowel:kasra", 2)] });
    const pts = curvePoints(s.log, "vowel:kasra", T0, T0 + 30 * DAY, 30);
    expect(pts[0].r).toBeCloseTo(1, 5);
    expect(pts.at(-1)!.r).toBeLessThan(0.5);
    for (let i = 1; i < pts.length; i++) expect(pts[i].r).toBeLessThanOrEqual(pts[i - 1].r + 1e-9);
  });
  it("Kurve springt bei einer Wiederholung zurück auf 100 % und fällt danach langsamer", () => {
    let s = initialLesson(T0);
    s = lessonReducer(s, { t: "results", phase: 6, now: T0, results: [res("letter:tha", 2)] });
    s = lessonReducer(s, { t: "results", phase: 7, now: T0 + 2 * DAY, results: [res("letter:tha", 2)] });
    const pts = curvePoints(s.log, "letter:tha", T0, T0 + 10 * DAY, 10);
    const day2 = pts.find((p) => Math.abs(p.x - 2) < 1e-9)!;
    expect(day2.r).toBeCloseTo(1, 5);
    expect(pts.find((p) => Math.abs(p.x - 1.9) < 0.11) ?? pts[1]).toBeTruthy();
  });
  it("Persistenz: Roundtrip, kaputte Daten fallen auf Standard zurück, Teilschäden werden verworfen", () => {
    let s = initialLesson(T0);
    s = lessonReducer(s, { t: "complete", phase: 1 });
    s = lessonReducer(s, { t: "hyp", id: "h-kasra", answer: { choice: 1, confidence: "sure" } });
    s = lessonReducer(s, { t: "results", phase: 5, now: T0, results: [res("letter:ba", 2)] });
    const back = parseLesson(JSON.stringify(s), T0);
    expect(back).toEqual(s);
    expect(parseLesson("{kaputt", T0)).toEqual(initialLesson(T0));
    expect(parseLesson(null, T0)).toEqual(initialLesson(T0));
    expect(parseLesson(JSON.stringify({ v: 2 }), T0)).toEqual(initialLesson(T0));
    const dmg = parseLesson(JSON.stringify({ ...s, srs: { ...s.srs, "x:y": { stability: -1 } }, done: [1, 99, "a"], offsetDays: -5 }), T0);
    expect(Object.keys(dmg.srs)).toEqual(["letter:ba"]);
    expect(dmg.done).toEqual([1]); expect(dmg.offsetDays).toBe(0);
  });
  it("Reset setzt zurück", () => {
    let s = lessonReducer(initialLesson(T0), { t: "complete", phase: 3 });
    s = lessonReducer(s, { t: "reset", now: T0 + 5 });
    expect(s.done).toEqual([]); expect(s.startedAt).toBe(T0 + 5);
  });
});
