import { describe, expect, it } from "vitest";
import { hasAudio } from "@/lektion/audio/manifest";
import { LESSONS, LESSON_BY_ID, STRECKEN, HYPS, errorSlides, hypAvailable, lessonsOf, type Slide } from "@/lektion/content/path";
import { UNITS } from "@/lektion/content/later/units-einheit-1-bis-4";
import { VOWEL_INFO, WORDS, SYLLABLES } from "@/lektion/content/lektion1";
import { pathTask, type PathTaskSpec } from "@/lektion/domain/lektion/tasks";
import { expand } from "@/lektion/features/play/LessonPlayer";

const rnd = () => 0.4;
const specsOf = (slides: Slide[]): PathTaskSpec[] => slides.flatMap((s) => (s.k === "task" ? [s.spec] : []));
const text = (slides: Slide[]) => JSON.stringify(slides);

describe("Lernpfad: Reihenfolge und Inhalt", () => {
  it("vier Strecken in der verbindlichen Reihenfolge Buchstaben → Tashkeel → Buchstabe + Tashkeel → Silben", () => {
    expect(STRECKEN.map((s) => s.title)).toEqual(["Buchstaben", "Tashkeel", "Buchstabe + Tashkeel", "Silben festigen"]);
    const order = LESSONS.map((l) => l.strecke);
    expect([...order].sort()).toEqual(order);
    expect(new Set(LESSONS.map((l) => l.id)).size).toBe(LESSONS.length);
  });
  it("Strecke 1: nur Buchstaben. Keine Vokalzeichen, keine Silben, keine Wörter", () => {
    for (const l of lessonsOf(1)) {
      const raw = text(l.slides);
      for (const sp of specsOf(l.slides)) expect(["letter", "custom"], `${l.id}`).toContain(sp.t);
      expect(raw, l.id).not.toMatch(/[ً-ْ]/);       // keine Tashkeel-Zeichen
      expect(l.slides.some((s) => ["markShow", "markPlace", "markMeaning", "markSet", "compose"].includes(s.k)), l.id).toBe(false);
    }
  });
  it("Strecke 1: ein Buchstabe pro Einführung; die Familie ب ت ث erscheint erst, wenn die einzelnen Zeichen bekannt sind", () => {
    const intro = lessonsOf(1).filter((l) => l.kind === "einfuehrung");
    expect(intro.map((l) => l.id)).toEqual(["b-alif", "b-ba", "b-ta", "b-tha"]);
    const pools = (id: string) => new Set(specsOf(LESSON_BY_ID.get(id)!.slides).flatMap((s) => (s.t === "letter" ? [...s.pool, s.letter] : [])));
    expect([...pools("b-alif")]).toEqual(["alif"]);
    expect(pools("b-ba").has("ta")).toBe(false); expect(pools("b-ba").has("tha")).toBe(false);
    expect(pools("b-ta").has("tha")).toBe(false);
    expect(pools("b-tha").size).toBe(4);
    // Die Familien-Entdeckung kommt nach allen vier Einführungen
    const ids = lessonsOf(1).map((l) => l.id);
    expect(ids.indexOf("b-entdecken")).toBeGreaterThan(ids.indexOf("b-tha"));
  });
  it("Strecke 2: jedes Zeichen eine eigene Mini-Lektion, ohne Buchstaben und Silben", () => {
    const single = lessonsOf(2).slice(0, 3).map((l) => l.id);
    expect(single).toEqual(["t-fatha", "t-kasra", "t-damma"]);
    for (const l of lessonsOf(2)) {
      for (const sp of specsOf(l.slides)) expect(sp.t, l.id).toBe("mark");
      expect(l.slides.some((s) => s.k === "compose"), l.id).toBe(false);
    }
    const fatha = LESSON_BY_ID.get("t-fatha")!.slides;
    expect(fatha.slice(0, 3).map((s) => s.k)).toEqual(["markShow", "markPlace", "markMeaning"]);
    // Einführungen nutzen nur bereits bekannte Zeichen als Pool
    expect(specsOf(fatha).every((s) => s.t === "mark" && s.pool.every((v) => v === "fatha"))).toBe(true);
    const kasra = specsOf(LESSON_BY_ID.get("t-kasra")!.slides);
    expect(kasra.every((s) => s.t === "mark" && !s.pool.includes("damma"))).toBe(true);
  });
  it("Strecke 3 beginnt ausschließlich mit ب, ت und ث folgen danach", () => {
    const first = LESSON_BY_ID.get("k-ba")!.slides;
    expect(first.filter((s) => s.k === "compose").map((s) => (s as { letter: string }).letter)).toEqual(["ba", "ba", "ba"]);
    for (const sp of specsOf(first)) expect(sp.t === "syl" && sp.id.startsWith("syl:ba-")).toBe(true);
    const ids = lessonsOf(3).map((l) => l.id);
    expect(ids.indexOf("k-ta")).toBeGreaterThan(ids.indexOf("k-ba"));
    expect(ids.indexOf("k-tha")).toBeGreaterThan(ids.indexOf("k-ta"));
    // Silbenaufgaben der ب-Lektion zeigen nur ب-Silben als Optionen
    for (const sp of specsOf(first)) { const t = pathTask(sp, rnd)!; if (t.type === "choice") for (const it of t.optionItems) expect(it!.startsWith("syl:ba-")).toBe(true); }
  });
  it("Strecke 4: nur Silben (kurz), gemischt, zuordnen, neue Kombinationen, Fehler gezielt", () => {
    for (const l of lessonsOf(4)) for (const sp of specsOf(l.slides)) expect(sp.t === "syl" && !sp.id.endsWith("-long")).toBe(true);
    expect(lessonsOf(4).some((l) => l.dynamic === "fehler")).toBe(true);
  });
  it("Nirgends im Pfad: Wörter, lange Vokale, Alif als Dehnung, Verbindungsregeln, Schreibaufgaben", () => {
    const raw = LESSONS.map((l) => text(l.slides)).join(" ") + JSON.stringify(HYPS);
    for (const w of WORDS) expect(raw).not.toContain(w.ar);
    expect(raw).not.toMatch(/word:|-long|concept:alif|verbind|Dehn|Pausal|schreib/i);
    expect(raw).not.toMatch(/بَا/);
    for (const l of LESSONS) expect(l.slides.some((s) => (s as { k: string }).k === "write"), l.id).toBe(false);
  });
  it("Keine lange Silbe (ā) und kein Wort taucht in irgendeiner Antwortoption des Pfads auf", () => {
    for (const l of LESSONS.filter((x) => !x.dynamic)) for (const st of expand(l.slides, rnd)) if (st.kind === "task") {
      expect(st.task.itemId, l.id).not.toMatch(/-long|word:/);
      if (st.task.type === "choice") for (const o of st.task.options) { expect(o, `${l.id}: ${o}`).not.toMatch(/^(b|t|th)ā$|[\u0628\u062A\u062B]\u064E\u0627/); for (const w of WORDS) expect(o).not.toBe(w.tr); }
    }
    for (const st of expand(errorSlides([], 9), rnd)) if (st.kind === "task" && st.task.type === "choice") for (const o of st.task.options) expect(o).not.toMatch(/^(b|t|th)ā$|[\u0628\u062A\u062B]\u064E\u0627/);
  });
  it("Fehler-Lektion nutzt nur kurze Silben und stellt Fehlerhaftes zuerst", () => {
    const log = [{ key: "syl:tha-kasra|syllable", itemId: "syl:tha-kasra", competence: "syllable" as const, ts: 1, grade: 0, correct: false, src: "t", stability: 0.2 }];
    const sl = errorSlides(log, 9);
    expect(sl).toHaveLength(9);
    expect((sl[0] as { spec: { id: string } }).spec.id).toBe("syl:tha-kasra");
    for (const s of sl) expect((s as { spec: { id: string } }).spec.id).not.toMatch(/long/);
  });
});

describe("Mini-Lektionen: Aufbau", () => {
  it("jede Lektion lässt sich in Schritte auflösen; Aufgaben mit fehlender Aufnahme fallen weg, nie Hörübungen ohne Ton", () => {
    for (const l of LESSONS.filter((x) => !x.dynamic)) {
      const steps = expand(l.slides, rnd);
      expect(steps.length, l.id).toBeGreaterThanOrEqual(4);
      expect(steps.length, `${l.id} zu lang für 2 bis 4 Minuten`).toBeLessThanOrEqual(14);
      for (const st of steps) if (st.kind === "task" && st.task.audioId) expect(hasAudio(st.task.audioId)).toBe(true);
    }
  });
  it("ungefähre Dauer 2 bis 4 Minuten", () => { for (const l of LESSONS) { expect(l.minutes).toBeGreaterThanOrEqual(2); expect(l.minutes).toBeLessThanOrEqual(4); } });
  it("jede Aufgabe hat genau eine richtige Antwort und nur eindeutige Optionen", () => {
    for (const l of LESSONS.filter((x) => !x.dynamic))
      for (const st of expand(l.slides, rnd)) if (st.kind === "task" && st.task.type === "choice") {
        expect(new Set(st.task.options).size, `${l.id}: ${st.task.id}`).toBe(st.task.options.length);
        expect(st.task.options.length).toBeGreaterThanOrEqual(2);
        expect(st.task.options[st.task.answer]).toBeTruthy();
      }
  });
  it("Einführungslektionen für Buchstaben nutzen nur Ablenker, die nicht zur Lernstrecke gehören", () => {
    const t = pathTask({ t: "letter", letter: "alif", mode: "find", pool: ["alif"], fill: 2 }, rnd)!;
    expect(t.type === "choice" && t.options).toHaveLength(3);
    if (t.type === "choice") expect(t.options.filter((o) => "ابتث".includes(o))).toEqual(["ا"]);
  });
  it("Tashkeel-Aufgaben: Auswahl nur aus bekannten Zeichen plus neutralen Ablenkern; Position unter/über stimmt", () => {
    const f = pathTask({ t: "mark", vowel: "fatha", mode: "find", pool: ["fatha"] }, rnd)!;
    expect(f.type === "choice" && f.options).toHaveLength(3);
    const k = pathTask({ t: "mark", vowel: "kasra", mode: "place", pool: ["kasra"] }, rnd)!;
    expect(k.type === "choice" && k.options[k.answer]).toBe("unter dem Buchstaben");
    const d = pathTask({ t: "mark", vowel: "damma", mode: "place", pool: ["damma"] }, rnd)!;
    expect(d.type === "choice" && d.options[d.answer]).toBe("über dem Buchstaben");
    expect(pathTask({ t: "mark", vowel: "fatha", mode: "name", pool: ["fatha"] }, rnd)).toBeNull();
  });
});

describe("Hypothesen aus Bekanntem ableitbar", () => {
  it("jede Hypothese: gültige Antwort, kurze Begründung, bei Vokalzeichen oder Ton Vorwissen vorgegeben", () => {
    for (const h of Object.values(HYPS)) {
      expect(h.answer).toBeLessThan(h.options.length);
      expect(new Set(h.options).size).toBe(h.options.length);
      expect(h.why.split(/[.!?]/).filter((x) => x.trim()).length, h.id).toBeLessThanOrEqual(3);
      if (/[َُِ]/.test(h.stimulus ?? "") || h.audioIds) expect(h.given?.length ?? 0, h.id).toBeGreaterThan(0);
    }
  });
  it("Hörhypothesen nur mit vorhandener Aufnahme; Erklär-Lektionen verweisen auf vorhandene Hypothesen", () => {
    expect(Object.values(HYPS).every((h) => (h.audioIds ?? []).every(hasAudio))).toBe(true);
    expect(Object.values(HYPS).every(hypAvailable)).toBe(true);
    for (const l of LESSONS) for (const s of l.slides) if (s.k === "hypReview") for (const id of s.ids) expect(HYPS[id], id).toBeTruthy();
  });
  it("Entdecken-Lektionen geben kein Feedback (nur Hypothesen), Erklären-Lektionen lösen jede Hypothese auf", () => {
    for (const l of LESSONS.filter((x) => x.kind === "entdecken")) expect(l.slides.some((s) => s.k === "task"), l.id).toBe(false);
    const e = LESSON_BY_ID.get("b-entdecken")!.slides.filter((s) => s.k === "hyp").map((s) => (s as { hyp: { id: string } }).hyp.id);
    const r = LESSON_BY_ID.get("b-erklaeren")!.slides.find((s) => s.k === "hypReview") as { ids: string[] };
    expect(r.ids).toEqual(e);
  });
  it("ein erster Vokal-Hypothese-Block gibt ba/bi/bu vor (kein Raten)", () => {
    expect(HYPS["h-ti"].given!.join(" ")).toMatch(/بَ = ba.*بِ = bi.*بُ = bu/);
  });
});

describe("Aufbewahrt für später", () => {
  it("Wörter, lange Silben und das alte 4-Einheiten-Material sind weiter vorhanden (nicht gelöscht)", () => {
    expect(WORDS.map((w) => w.ar)).toEqual(["بَاب", "ثَابِت", "تَاب", "ثَبَات"]);
    expect(SYLLABLES.filter((s) => s.vowel === "long")).toHaveLength(3);
    expect(UNITS).toHaveLength(4);
    expect(UNITS[3].guided.map((g) => g.kind)).toEqual(["longAlif", "join", "words"]);
  });
  it("Phonetik der Tashkeel: Kasra über Zungenposition, nicht über breite Lippen", () => {
    expect(VOWEL_INFO.kasra.tongue + VOWEL_INFO.kasra.mouth).toMatch(/Zunge/);
    expect(VOWEL_INFO.kasra.mouth.toLowerCase()).not.toMatch(/lippen breit/);
    expect(VOWEL_INFO.damma.mouth).toMatch(/gerundet/);
  });
});
