import { hasAudio } from "@/lektion/audio/manifest";
import type { VowelId } from "./lektion1";
import type { PathTaskSpec, Task } from "@/lektion/domain/lektion/tasks";
import type { LogEntry } from "@/lektion/domain/lektion/competence";

/**
 * Der erste Lernpfad: vier Strecken aus kurzen Mini-Lektionen (2 bis 4 Minuten), eine Aufgabe pro Bildschirm.
 * Reihenfolge verbindlich: 1 Buchstaben → 2 Tashkeel einzeln → 3 Buchstabe + Tashkeel → 4 Silben festigen.
 * NICHT enthalten (aufbewahrt in content/lektion1.ts und content/later/): Wörter, lange Vokale, Alif als Dehnung,
 * Verbindungsregeln, Schreibübungen. Ein Test stellt sicher, dass kein Pfad-Inhalt darauf verweist.
 */
export interface HypCard {
  id: string;
  title: string;
  question: string;
  /** Bekannte Informationen, aus denen sich die Antwort ableiten lässt */
  given?: string[];
  stimulus?: string;
  audioIds?: string[];
  options: string[];
  optionsAr?: boolean;
  answer: number;
  /** Warum die Antwort stimmt (höchstens zwei kurze Sätze, wird in der Erklär-Lektion gezeigt) */
  why: string;
}

export type Slide =
  | { k: "hero"; ar?: string; title: string; text?: string; audio?: string }
  | { k: "look"; letter: string }
  | { k: "sound"; letter: string }
  | { k: "dots"; letters: string[]; title: string; text?: string }
  | { k: "explore" }
  | { k: "markShow"; vowel: VowelId }
  | { k: "markPlace"; vowel: VowelId }
  | { k: "markMeaning"; vowel: VowelId }
  | { k: "markSet" }
  | { k: "compose"; letter: string; vowel: VowelId }
  | { k: "rule"; title: string; lines: string[]; visual?: "compose-ta" | "dotsvsmark" }
  | { k: "hearSet"; title: string; items: { id: string; ar: string; tr: string }[] }
  | { k: "hyp"; hyp: HypCard }
  | { k: "hypReview"; title: string; ids: string[] }
  | { k: "hypItem"; id: string }
  | { k: "compare"; a: string; b: string }
  | { k: "taskobj"; task: Task; deferred?: boolean }
  | { k: "task"; spec: PathTaskSpec; deferred?: boolean };

export type LessonKind = "einfuehrung" | "entdecken" | "erklaeren" | "anwenden" | "wiederholung" | "gezielt";
export interface Lesson {
  id: string;
  strecke: 1 | 2 | 3 | 4;
  title: string;
  sub: string;
  minutes: number;
  kind: LessonKind;
  slides: Slide[];
  /** Dynamische Lektion: Aufgaben entstehen zur Laufzeit aus dem Lernstand */
  dynamic?: "fehler";
}
export interface Strecke { id: 1 | 2 | 3 | 4; title: string; goal: string }

export const STRECKEN: Strecke[] = [
  { id: 1, title: "Buchstaben", goal: "Vier Zeichen erkennen und unterscheiden" },
  { id: 2, title: "Tashkeel", goal: "Die drei kurzen Vokalzeichen verstehen" },
  { id: 3, title: "Buchstabe + Tashkeel", goal: "Zeichen und Laut zusammenbringen" },
  { id: 4, title: "Silben festigen", goal: "Silben sicher lesen und hören" },
];

/* ---------- Abkürzungen für Aufgaben ---------- */
const find = (letter: string, pool: string[], fill?: number): Slide => ({ k: "task", spec: { t: "letter", letter, mode: "find", pool, fill } });
const hear = (letter: string, pool: string[], fill?: number): Slide => ({ k: "task", spec: { t: "letter", letter, mode: "hear", pool, fill } });
const feat = (letter: string, pool: string[], fill?: number): Slide => ({ k: "task", spec: { t: "letter", letter, mode: "feature", pool, fill } });
const name = (letter: string, pool: string[]): Slide => ({ k: "task", spec: { t: "letter", letter, mode: "name", pool } });
const mk = (vowel: VowelId, mode: "find" | "name" | "place" | "sound" | "hear", pool: VowelId[]): Slide => ({ k: "task", spec: { t: "mark", vowel, mode, pool } });
const syl = (id: string, v: number, letters?: string[], vowels?: string[]): Slide => ({ k: "task", spec: { t: "syl", id, v, letters, vowels } });
const custom = (id: string, itemId: string, prompt: string, options: string[], answer: number, explain: string, ar?: string, optionsAr = false): Slide =>
  ({ k: "task", spec: { t: "custom", id, itemId, competence: "visual", prompt, ar, options, answer, explain, optionsAr } });

const ALL4 = ["alif", "ba", "ta", "tha"];
const V3: VowelId[] = ["fatha", "kasra", "damma"];

/* ---------- Hypothesen (aus Bekanntem ableitbar) ---------- */
export const HYPS: Record<string, HypCard> = {
  "h-dots": {
    id: "h-dots", title: "Was ist anders?", stimulus: "ب ت ث",
    given: ["ب: 1 Punkt unten", "ت: 2 Punkte oben", "ث: 3 Punkte oben"],
    question: "Die drei Zeichen haben dieselbe Grundform. Was unterscheidet sie?",
    options: ["Die Punkte: Zahl und Ort", "Die Größe des Bogens", "Die Dicke der Linie"], answer: 0,
    why: "Nur die Punkte unterscheiden sie. Größe und Strichstärke tragen keine Bedeutung.",
  },
  "h-yaa": {
    id: "h-yaa", title: "Zwei Punkte, aber unten", stimulus: "ي",
    given: ["ت: 2 Punkte oben"],
    question: "Gleicher Bogen, 2 Punkte, aber UNTEN. Ist das ت?",
    options: ["Ja, nur anders geschrieben", "Nein, der Ort der Punkte zählt mit"], answer: 1,
    why: "Oben und unten ergeben verschiedene Buchstaben. Dieses Zeichen ist ي, das du später lernst.",
  },
  "h-nun": {
    id: "h-nun", title: "Ein Punkt oben", stimulus: "ن",
    given: ["Bekannt: ب, ت, ث"],
    question: "Bogen mit 1 Punkt OBEN. Kennst du dieses Zeichen schon?",
    options: ["Nein, es ist keiner der drei", "Ja, es ist ب"], answer: 0,
    why: "1 Punkt oben kommt bei ب, ت, ث nicht vor. Es ist ن, ein weiterer Buchstabe.",
  },
  "h-ti": {
    id: "h-ti", title: "Gleiches Muster, neuer Buchstabe", stimulus: "تِ",
    given: ["بَ = ba", "بِ = bi", "بُ = bu"],
    question: "Wie liest du تِ?", options: ["ti", "ta", "tu"], answer: 0,
    why: "Das Zeichen unter dem Buchstaben ergab bei ب ein i. Bei ت ist es genauso: t + i.",
  },
  "h-thu": {
    id: "h-thu", title: "Noch einmal übertragen", stimulus: "ثُ",
    given: ["بُ = bu", "ث = Thā"],
    question: "Wie liest du ثُ?", options: ["thu", "tha", "thi"], answer: 0,
    why: "Das Zeichen mit der kleinen Schlaufe ergab u. ث liefert th. Zusammen: thu.",
  },
  "h-dotkasra": {
    id: "h-dotkasra", title: "Zwei Dinge unter dem Buchstaben", stimulus: "بِ",
    given: ["ب hat einen runden Punkt unten", "Vokalzeichen sind kurze Striche"],
    question: "Was ist der Punkt, was das Vokalzeichen?",
    options: ["Der runde Punkt gehört zu ب, der Strich ist das Kasra", "Der Strich gehört zu ب, der Punkt ist das Kasra"], answer: 0,
    why: "Punkte sind rund und gehören zum Buchstaben. Das Kasra ist der kurze Strich.",
  },
  "h-hear-tu": {
    id: "h-hear-tu", title: "Hören und zuordnen", audioIds: ["syl-ta-damma"],
    given: ["بَ = ba · بِ = bi · بُ = bu"],
    question: "Du hörst „t“ plus Vokal. Welche Schrift passt?", options: ["تَ", "تِ", "تُ"], optionsAr: true, answer: 2,
    why: "Der Vokal klingt wie das u in bu. Dazu gehört das Zeichen mit der Schlaufe: تُ.",
  },
};

/** Hypothesen mit Aufnahme nur, wenn sie existiert. */
export const hypAvailable = (h: HypCard) => !h.audioIds || h.audioIds.every(hasAudio);

/* ---------- Lektionen ---------- */
export const LESSONS: Lesson[] = [
  /* === Strecke 1: Buchstaben === */
  { id: "b-alif", strecke: 1, title: "Alif", sub: "Der gerade Strich", minutes: 3, kind: "einfuehrung", slides: [
    { k: "hero", ar: "ا", audio: "name-alif", title: "Das ist Alif", text: "Ein gerader Strich, ohne Punkte." },
    { k: "sound", letter: "alif" },
    { k: "look", letter: "alif" },
    find("alif", ["alif"], 2), hear("alif", ["alif"], 2), feat("alif", ["alif"], 2),
  ] },
  { id: "b-ba", strecke: 1, title: "Bā", sub: "Ein Punkt unten", minutes: 3, kind: "einfuehrung", slides: [
    { k: "hero", ar: "ب", audio: "sound-ba", title: "Das ist Bā", text: "Ein Bogen mit einem Punkt darunter." },
    { k: "sound", letter: "ba" },
    { k: "look", letter: "ba" },
    find("ba", ["alif", "ba"], 1), hear("ba", ["alif", "ba"], 1), feat("ba", ["alif", "ba"], 1), find("alif", ["alif", "ba"], 1),
  ] },
  { id: "b-ta", strecke: 1, title: "Tā", sub: "Zwei Punkte oben", minutes: 3, kind: "einfuehrung", slides: [
    { k: "hero", ar: "ت", audio: "sound-ta", title: "Das ist Tā", text: "Ein Bogen mit zwei Punkten darüber." },
    { k: "sound", letter: "ta" },
    { k: "look", letter: "ta" },
    find("ta", ["alif", "ba", "ta"], 0), hear("ta", ["alif", "ba", "ta"], 0), feat("ta", ["alif", "ba", "ta"], 0), find("ba", ["alif", "ba", "ta"], 0),
  ] },
  { id: "b-tha", strecke: 1, title: "Thā", sub: "Drei Punkte oben", minutes: 3, kind: "einfuehrung", slides: [
    { k: "hero", ar: "ث", audio: "sound-tha", title: "Das ist Thā", text: "Ein Bogen mit drei Punkten darüber." },
    { k: "sound", letter: "tha" },
    { k: "look", letter: "tha" },
    find("tha", ALL4, 0), hear("tha", ALL4, 0), feat("tha", ALL4, 0), find("ta", ALL4, 0), hear("ta", ALL4, 0),
  ] },
  { id: "b-entdecken", strecke: 1, title: "Entdecken", sub: "Was unterscheidet ب ت ث?", minutes: 3, kind: "entdecken", slides: [
    { k: "explore" },
    { k: "hyp", hyp: HYPS["h-dots"] }, { k: "hyp", hyp: HYPS["h-yaa"] }, { k: "hyp", hyp: HYPS["h-nun"] },
  ] },
  { id: "b-erklaeren", strecke: 1, title: "Erklären", sub: "Die Punkte-Regel", minutes: 2, kind: "erklaeren", slides: [
    { k: "hypReview", title: "Deine Vermutungen", ids: ["h-dots", "h-yaa", "h-nun"] },
    { k: "dots", letters: ["ba", "ta", "tha"], title: "Die Regel", text: "Erst: oben oder unten? Dann: wie viele?" },
    { k: "rule", title: "Merke", lines: ["Gleiche Grundform: nur die Punkte entscheiden.", "Alif hat keinen Bogen und keine Punkte."] },
    feat("ba", ["ba", "ta", "tha"], 0), feat("tha", ["ba", "ta", "tha"], 0),
  ] },
  { id: "b-anwenden", strecke: 1, title: "Anwenden", sub: "Neue Beispiele", minutes: 3, kind: "anwenden", slides: [
    custom("dots-1", "letter:ba", "Wie viele Punkte, und wo?", ["1 unten", "2 oben", "3 oben", "2 unten"], 0, "ب hat einen Punkt unter dem Bogen.", "ب"),
    custom("dots-2", "letter:tha", "Wie viele Punkte, und wo?", ["1 unten", "2 oben", "3 oben", "2 unten"], 2, "ث hat drei Punkte über dem Bogen.", "ث"),
    custom("dots-3", "letter:ta", "Wie viele Punkte, und wo?", ["1 unten", "2 oben", "3 oben", "2 unten"], 1, "ت hat zwei Punkte über dem Bogen.", "ت"),
    custom("dots-yaa", "letter:ta", "Ist das ب, ت oder ث?", ["ب", "ت", "ث", "keiner der drei"], 3, "Zwei Punkte unten gibt es bei ب, ت, ث nicht. Es ist ein anderer Buchstabe (ي).", "ي", true),
    custom("dots-nun", "letter:ba", "Ist das ب, ت oder ث?", ["ب", "ت", "ث", "keiner der drei"], 3, "Ein Punkt oben gibt es bei ب, ت, ث nicht. Es ist ein anderer Buchstabe (ن).", "ن", true),
    hear("ta", ALL4, 0), hear("tha", ALL4, 0), find("ba", ALL4, 0),
  ] },
  { id: "b-wdh", strecke: 1, title: "Wiederholung", sub: "Buchstaben", minutes: 3, kind: "wiederholung", slides: [
    find("tha", ALL4, 0), hear("ba", ALL4, 0), feat("ta", ALL4, 0), find("alif", ALL4, 0), name("ba", ALL4), hear("tha", ALL4, 0), feat("ba", ALL4, 0), name("ta", ALL4), find("ta", ALL4, 0), hear("alif", ALL4, 0),
  ] },

  /* === Strecke 2: Tashkeel === */
  { id: "t-fatha", strecke: 2, title: "Fatha", sub: "Kurzes a", minutes: 3, kind: "einfuehrung", slides: [
    { k: "markShow", vowel: "fatha" }, { k: "markPlace", vowel: "fatha" }, { k: "markMeaning", vowel: "fatha" },
    mk("fatha", "find", ["fatha"]), mk("fatha", "place", ["fatha"]), mk("fatha", "sound", ["fatha"]), mk("fatha", "hear", ["fatha"]),
  ] },
  { id: "t-kasra", strecke: 2, title: "Kasra", sub: "Kurzes i", minutes: 3, kind: "einfuehrung", slides: [
    { k: "markShow", vowel: "kasra" }, { k: "markPlace", vowel: "kasra" }, { k: "markMeaning", vowel: "kasra" },
    mk("kasra", "find", ["fatha", "kasra"]), mk("kasra", "place", ["kasra"]), mk("kasra", "hear", ["kasra"]), mk("fatha", "find", ["fatha", "kasra"]), mk("kasra", "name", ["fatha", "kasra"]),
  ] },
  { id: "t-damma", strecke: 2, title: "Damma", sub: "Kurzes u", minutes: 3, kind: "einfuehrung", slides: [
    { k: "markShow", vowel: "damma" }, { k: "markPlace", vowel: "damma" }, { k: "markMeaning", vowel: "damma" },
    mk("damma", "find", V3), mk("damma", "place", V3), mk("damma", "hear", V3), mk("kasra", "find", V3), mk("damma", "name", V3),
  ] },
  { id: "t-wdh", strecke: 2, title: "Wiederholung", sub: "Die drei Zeichen", minutes: 3, kind: "wiederholung", slides: [
    { k: "markSet" },
    { k: "hearSet", title: "Drei kurze Vokale", items: V3.map((v) => ({ id: `vowel-${v}`, ar: "", tr: v === "fatha" ? "a" : v === "kasra" ? "i" : "u" })) },
    mk("kasra", "find", V3), mk("fatha", "hear", V3), mk("damma", "name", V3), mk("kasra", "hear", V3), mk("fatha", "name", V3), mk("damma", "hear", V3), mk("damma", "find", V3), mk("kasra", "sound", V3),
  ] },

  /* === Strecke 3: Buchstabe + Tashkeel === */
  { id: "k-ba", strecke: 3, title: "ب mit den drei Zeichen", sub: "ba · bi · bu", minutes: 4, kind: "einfuehrung", slides: [
    { k: "compose", letter: "ba", vowel: "fatha" }, { k: "compose", letter: "ba", vowel: "kasra" }, { k: "compose", letter: "ba", vowel: "damma" },
    syl("syl:ba-kasra", 1, ["ba"]), syl("syl:ba-fatha", 0, ["ba"]), syl("syl:ba-damma", 1, ["ba"]), syl("syl:ba-kasra", 0, ["ba"]),
    syl("syl:ba-damma", 3, ["ba"]), syl("syl:ba-fatha", 4, ["ba"]),
  ] },
  { id: "k-entdecken", strecke: 3, title: "Entdecken", sub: "Gilt das Muster auch für ت?", minutes: 3, kind: "entdecken", slides: [
    { k: "hyp", hyp: HYPS["h-ti"] }, { k: "hyp", hyp: HYPS["h-thu"] }, { k: "hyp", hyp: HYPS["h-dotkasra"] }, { k: "hyp", hyp: HYPS["h-hear-tu"] },
  ] },
  { id: "k-erklaeren", strecke: 3, title: "Erklären", sub: "Konsonant + Zeichen", minutes: 2, kind: "erklaeren", slides: [
    { k: "hypReview", title: "Deine Vermutungen", ids: ["h-ti", "h-thu", "h-dotkasra", "h-hear-tu"] },
    { k: "rule", title: "Die Regel", lines: ["Der Buchstabe liefert den Konsonanten.", "Das Zeichen liefert den kurzen Vokal."], visual: "compose-ta" },
    { k: "rule", title: "Punkt oder Zeichen?", lines: ["Punkte sind rund: Sie gehören zum Buchstaben.", "Vokalzeichen sind kurze Striche."], visual: "dotsvsmark" },
    syl("syl:ta-kasra", 0, ["ba", "ta"]),
  ] },
  { id: "k-ta", strecke: 3, title: "ت mit den drei Zeichen", sub: "ta · ti · tu", minutes: 3, kind: "anwenden", slides: [
    { k: "compose", letter: "ta", vowel: "fatha" }, { k: "compose", letter: "ta", vowel: "kasra" }, { k: "compose", letter: "ta", vowel: "damma" },
    syl("syl:ta-damma", 1, ["ba", "ta"]), syl("syl:ta-kasra", 0, ["ba", "ta"]), syl("syl:ta-fatha", 1, ["ba", "ta"]), syl("syl:ta-damma", 3, ["ba", "ta"]), syl("syl:ta-kasra", 4, ["ba", "ta"]), syl("syl:ba-damma", 0, ["ba", "ta"]),
  ] },
  { id: "k-tha", strecke: 3, title: "ث mit den drei Zeichen", sub: "tha · thi · thu", minutes: 3, kind: "anwenden", slides: [
    { k: "compose", letter: "tha", vowel: "fatha" }, { k: "compose", letter: "tha", vowel: "kasra" }, { k: "compose", letter: "tha", vowel: "damma" },
    syl("syl:tha-damma", 1), syl("syl:tha-kasra", 0), syl("syl:tha-fatha", 1), syl("syl:tha-fatha", 3, ["ta", "tha"], ["fatha"]), syl("syl:tha-damma", 4), syl("syl:ta-fatha", 3, ["ta", "tha"], ["fatha"]),
  ] },
  { id: "k-wdh", strecke: 3, title: "Wiederholung", sub: "Alle neun Silben", minutes: 3, kind: "wiederholung", slides: [
    syl("syl:ba-kasra", 0), syl("syl:ta-damma", 1), syl("syl:tha-fatha", 0), syl("syl:ta-kasra", 3), syl("syl:tha-damma", 0), syl("syl:ba-fatha", 1), syl("syl:tha-kasra", 4), syl("syl:ta-fatha", 0), syl("syl:ba-damma", 3), syl("syl:tha-damma", 3),
  ] },

  /* === Strecke 4: Silben festigen === */
  { id: "s-lesen", strecke: 4, title: "Silben lesen", sub: "Gemischt", minutes: 3, kind: "wiederholung", slides: [
    syl("syl:ta-kasra", 0), syl("syl:ba-damma", 0), syl("syl:tha-fatha", 0), syl("syl:ba-kasra", 0), syl("syl:tha-damma", 0), syl("syl:ta-fatha", 0), syl("syl:ba-fatha", 0), syl("syl:tha-kasra", 0), syl("syl:ta-damma", 0),
  ] },
  { id: "s-hoeren", strecke: 4, title: "Silben hören", sub: "Welche Silbe?", minutes: 3, kind: "wiederholung", slides: [
    { k: "hearSet", title: "Hör genau hin", items: [{ id: "syl-ta-fatha", ar: "تَ", tr: "ta" }, { id: "syl-tha-fatha", ar: "ثَ", tr: "tha" }, { id: "syl-ba-fatha", ar: "بَ", tr: "ba" }] },
    syl("syl:tha-kasra", 3), syl("syl:ta-damma", 3), syl("syl:ba-fatha", 3), syl("syl:tha-fatha", 3), syl("syl:ta-kasra", 3), syl("syl:ba-damma", 3), syl("syl:tha-damma", 3), syl("syl:ta-fatha", 3),
  ] },
  { id: "s-zuordnen", strecke: 4, title: "Schrift und Laut", sub: "Zuordnen", minutes: 3, kind: "wiederholung", slides: [
    syl("syl:ba-damma", 1), syl("syl:tha-kasra", 4), syl("syl:ta-fatha", 1), syl("syl:tha-damma", 4), syl("syl:ba-kasra", 1), syl("syl:ta-damma", 4), syl("syl:tha-fatha", 1), syl("syl:ba-fatha", 4), syl("syl:ta-kasra", 1),
  ] },
  { id: "s-neu", strecke: 4, title: "Neue Kombinationen", sub: "Selbst lesen", minutes: 3, kind: "anwenden", slides: [
    syl("syl:tha-damma", 0), syl("syl:ta-kasra", 1), syl("syl:tha-kasra", 0), syl("syl:ta-damma", 2), syl("syl:tha-fatha", 2), syl("syl:ba-kasra", 2), syl("syl:tha-damma", 3), syl("syl:ta-kasra", 2),
  ] },
  { id: "s-fehler", strecke: 4, title: "Fehler gezielt wiederholen", sub: "Nach deinen Antworten", minutes: 3, kind: "gezielt", dynamic: "fehler", slides: [] },
];

export const LESSON_BY_ID = new Map(LESSONS.map((l) => [l.id, l]));
export const lessonsOf = (strecke: number) => LESSONS.filter((l) => l.strecke === strecke);
export const LESSON_KIND_LABEL: Record<LessonKind, string> = {
  einfuehrung: "Einführung", entdecken: "Entdecken", erklaeren: "Erklären", anwenden: "Anwenden", wiederholung: "Wiederholung", gezielt: "Gezielt üben",
};

/**
 * Aufgaben für „Fehler gezielt wiederholen“: Silben, die zuletzt falsch oder noch selten richtig waren, zuerst; sonst eine Mischung.
 * Nutzt nur Silben mit Hör-/Zuordnungsvarianten des Pfads (keine Wörter, keine langen Vokale).
 */
export function errorSlides(log: LogEntry[], max = 9): Slide[] {
  const SYLS = ["ba", "ta", "tha"].flatMap((c) => ["fatha", "kasra", "damma"].map((v) => `syl:${c}-${v}`));
  const score = (id: string) => {
    const e = log.filter((x) => x.itemId === id);
    if (!e.length) return 0.5;
    const wrong = e.filter((x) => !x.correct).length;
    const last = e[e.length - 1];
    return wrong * 2 + (last.correct ? 0 : 3) - e.filter((x) => x.correct).length * 0.2;
  };
  const ranked = [...SYLS].sort((a, b) => score(b) - score(a) || a.localeCompare(b));
  const variants = [0, 3, 1, 4, 0, 3, 1, 4, 0];
  return ranked.slice(0, max).map((id, i) => syl(id, variants[i % variants.length]));
}
