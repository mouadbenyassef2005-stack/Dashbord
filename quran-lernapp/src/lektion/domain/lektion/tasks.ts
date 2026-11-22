import {
  ALIF, DOTTED, FEATURE, ITEM_BY_ID, L1_LETTER_IDS, MARK, SYLLABLES, VOWEL_INFO, VOWEL_LATIN, VOWEL_NAME, WORDS,
  letterCh, letterName, type VowelId,
} from "@/lektion/content/lektion1";
import type { Grade } from "../types";

export type Rnd = () => number;
export type Family = "letter" | "vowel" | "syllable" | "word" | "concept";

interface Base {
  id: string;
  itemId: string;
  family: Family;
  prompt: string;
  /** Großer arabischer Reiz */
  ar?: string;
  /** Kleinerer Zusatztext zum Reiz (z. B. Merkmal) */
  hint?: string;
  explain: string;
  /** Wurde der Stoff im Lehrteil nicht gezeigt? (Transfer) */
  novel: boolean;
}
export interface ChoiceTask extends Base { type: "choice"; options: string[]; optionsAr: boolean; answer: number }
export interface TypeTask extends Base { type: "type"; accepted: string; placeholder: string }
export type Task = ChoiceTask | TypeTask;

export type Correctness = "right" | "lengthOnly" | "wrong";
export interface TaskResult {
  taskId: string;
  itemId: string;
  type: Task["type"];
  correctness: Correctness;
  grade: Grade;
  hintUsed: boolean;
  answer: string;
  /** Falsch gewählter Buchstabe/Option, soweit sinnvoll */
  chosen?: string;
}

/* ---------- Hilfen ---------- */
const shuffle = <T,>(a: T[], rnd: Rnd): T[] => {
  const out = [...a];
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
};
const uniq = <T,>(a: T[]) => [...new Set(a)];

function choice(base: Omit<ChoiceTask, "type" | "options" | "answer" | "optionsAr">, correct: string, wrong: string[], optionsAr: boolean, rnd: Rnd, n = 4): ChoiceTask {
  const distract = uniq(wrong.filter((w) => w !== correct)).slice(0, n - 1);
  const options = shuffle([correct, ...distract], rnd);
  return { ...base, type: "choice", options, optionsAr, answer: options.indexOf(correct) };
}

/** Tippantwort normalisieren: Kleinschreibung, „aa“/„â“/„a:“ als langes ā, „ṯ“ als th. */
export function normalizeTyped(s: string): string {
  return s.normalize("NFC").trim().toLowerCase()
    .replace(/[âáà]/g, "ā").replace(/aa|a:/g, "ā").replace(/ṯ/g, "th").replace(/\s+/g, "");
}
const stripLength = (s: string) => s.replace(/ā/g, "a");

export function checkTyped(accepted: string, input: string): Correctness {
  const a = normalizeTyped(accepted);
  const i = normalizeTyped(input);
  if (!i) return "wrong";
  if (i === a) return "right";
  return stripLength(i) === stripLength(a) ? "lengthOnly" : "wrong";
}

export function gradeFor(c: Correctness, type: Task["type"], hintUsed: boolean): Grade {
  if (c === "wrong") return 0;
  if (c === "lengthOnly") return 1;
  if (hintUsed) return 1;
  return type === "type" ? 3 : 2;
}

/* ---------- Aufgaben pro Item ---------- */
const syllableById = new Map(SYLLABLES.map((s) => [s.id, s]));
const wordById = new Map(WORDS.map((w) => [w.id, w]));
const syllableExplain = (s: (typeof SYLLABLES)[number]) =>
  s.vowel === "long"
    ? `${s.ar} = ${letterName(s.letterId)} + Fatha + Alif. Alif dehnt das a: „${s.tr}“ (lang).`
    : `${s.ar} = ${letterName(s.letterId)} + ${VOWEL_NAME[s.vowel]}: „${s.tr}“.`;

export function variantCount(itemId: string): number {
  const k = ITEM_BY_ID.get(itemId)?.kind;
  return k === "letter" ? 3 : k === "vowel" ? 2 : k === "syllable" ? 3 : k === "word" ? 3 : k === "concept" ? 1 : 0;
}

export function makeTask(itemId: string, variant: number, rnd: Rnd = Math.random): Task {
  const item = ITEM_BY_ID.get(itemId);
  if (!item) throw new Error(`Unbekanntes Item ${itemId}`);
  const id = `${itemId}#${variant}`;
  const base = (family: Family, prompt: string, explain: string, extra: Partial<Base> = {}) =>
    ({ id, itemId, family, prompt, explain, novel: item.novel, ...extra });

  if (item.kind === "letter") {
    const lid = itemId.split(":")[1] as (typeof L1_LETTER_IDS)[number];
    const ch = letterCh(lid), nm = letterName(lid);
    const names = L1_LETTER_IDS.map(letterName);
    const chars = L1_LETTER_IDS.map(letterCh);
    const ex = `${ch} heißt ${nm}: ${FEATURE[lid].text}.`;
    if (variant === 0) return choice(base("letter", "Wie heißt dieser Buchstabe?", ex, { ar: ch, hint: "Zähle die Punkte und achte auf oben und unten." }), nm, names, false, rnd);
    if (variant === 1) return choice(base("letter", `Welcher Buchstabe ist ${nm}?`, ex, { hint: "Denk an die Punkte." }), ch, chars, true, rnd);
    return choice(base("letter", `Welcher Buchstabe ist ${FEATURE[lid].text}?`, ex, { hint: "Vergleiche Bogen und Punkte." }), ch, chars, true, rnd);
  }

  if (item.kind === "vowel") {
    const v = itemId.split(":")[1] as VowelId;
    const all = (["fatha", "kasra", "damma"] as const);
    const ex = `${VOWEL_NAME[v]} steht ${VOWEL_INFO[v].place} und steht für kurzes „${VOWEL_LATIN[v]}“.`;
    if (variant === 0) return choice(base("vowel", "Wie heißt dieses Vokalzeichen?", ex, { ar: DOTTED + MARK[v], hint: "Oben oder unten? Mit oder ohne Schlaufe?" }), VOWEL_NAME[v], all.map((x) => VOWEL_NAME[x]), false, rnd, 3);
    return choice(base("vowel", `Welches Zeichen steht für kurzes „${VOWEL_LATIN[v]}“?`, ex, { hint: `${VOWEL_NAME[v]} steht ${VOWEL_INFO[v].place}.` }), DOTTED + MARK[v], all.map((x) => DOTTED + MARK[x]), true, rnd, 3);
  }

  if (item.kind === "syllable") {
    const s = syllableById.get(itemId)!;
    const ex = syllableExplain(s);
    const near = SYLLABLES.filter((o) => o.id !== s.id && (o.letterId === s.letterId || o.vowel === s.vowel));
    const nearFirst = shuffle(near, rnd);
    // Bei langem ā ist der Gegenspieler das kurze a desselben Buchstabens; bei kurzem a das lange.
    const twin = SYLLABLES.find((o) => o.letterId === s.letterId && ((s.vowel === "long" && o.vowel === "fatha") || (s.vowel === "fatha" && o.vowel === "long")));
    const ordered = twin ? [twin, ...nearFirst.filter((o) => o !== twin)] : nearFirst;
    const hint = s.vowel === "long" ? "Folgt ein Alif? Dann ist das a lang." : "Welches Zeichen steht am Buchstaben, und über oder unter ihm?";
    if (variant === 0) return choice(base("syllable", "Wie wird diese Silbe gelesen?", ex, { ar: s.ar, hint }), s.tr, ordered.map((o) => o.tr), false, rnd);
    if (variant === 1) return choice(base("syllable", `Welche Silbe ist „${s.tr}“?`, ex, { hint }), s.ar, ordered.map((o) => o.ar), true, rnd);
    return { ...base("syllable", "Schreibe auf, wie die Silbe gelesen wird.", ex, { ar: s.ar, hint }), type: "type", accepted: s.tr, placeholder: "z. B. ba" };
  }

  if (item.kind === "word") {
    const w = wordById.get(itemId)!;
    const ex = `${w.ar} = „${w.tr}“ (${w.de}). Von rechts nach links lesen: ${w.letters.map(letterName).join(" · ")}.`;
    const hint = "Lies von rechts nach links, Buchstabe für Buchstabe. Alif dehnt.";
    if (variant === 0) {
      const others = WORDS.filter((o) => o.id !== w.id).map((o) => o.tr);
      const shortened = w.tr.replace(/ā/g, "a");
      return choice(base("word", "Wie wird dieses Wort gelesen?", ex, { ar: w.ar, hint }), w.tr, [shortened, ...others], false, rnd);
    }
    if (variant === 1) return choice(base("word", "Was bedeutet dieses Wort?", ex, { ar: w.ar, hint: `${hint} Gelesen: „${w.tr}“.` }), w.de, WORDS.filter((o) => o.id !== w.id).map((o) => o.de), false, rnd);
    return { ...base("word", "Schreibe auf, wie das Wort gelesen wird.", ex, { ar: w.ar, hint }), type: "type", accepted: w.tr, placeholder: "z. B. bāb (oder baab)" };
  }

  // Konzepte
  if (itemId === "concept:alif-role")
    return choice(base("concept", "Was tut ا in بَا?", "Alif ist hier ein Dehnungsbuchstabe: Fatha + ا = ā. Das kurze a schreibt die Fatha, nicht das Alif.", { ar: "بَا", hint: "Denk an Fatha und die Länge." }),
      "Es dehnt das a zu ā", ["Es steht für ein kurzes a", "Es ist der Konsonant „b“", "Es bleibt stumm und ändert nichts"], false, rnd);
  if (itemId === "concept:alif-join")
    return choice(base("concept", "Welcher dieser Buchstaben verbindet sich nicht mit dem folgenden Buchstaben?", "Alif ist ein Nicht-Verbinder; ب ت ث verbinden nach links.", { hint: "Er ist der gerade Strich." }),
      ALIF, L1_LETTER_IDS.map(letterCh), true, rnd);
  return choice(base("concept", "Wo steht das Kasra?", "Fatha und Damma stehen über, Kasra steht unter dem Buchstaben.", { ar: "بِ", hint: "Fatha und Damma stehen oben." }),
    "unter dem Buchstaben", ["über dem Buchstaben", "hinter dem Buchstaben", "im Buchstaben"], false, rnd);
}

/* ---------- Interleaving ---------- */
/**
 * Mischt so, dass nie dasselbe Item direkt hintereinander kommt und möglichst nicht dieselbe Aufgabenfamilie oder -art.
 * Greedy, stabil: bei gleichen Kosten gewinnt die frühere Aufgabe.
 */
export function interleaveTasks<T extends { itemId: string; family: Family; type?: string }>(tasks: T[]): T[] {
  const rest = [...tasks];
  const out: T[] = [];
  while (rest.length) {
    const p1 = out[out.length - 1], p2 = out[out.length - 2];
    let best = 0, bestCost = Infinity;
    rest.forEach((t, i) => {
      const cost = (p1?.itemId === t.itemId ? 100 : 0) + (p2?.itemId === t.itemId ? 10 : 0) + (p1?.family === t.family ? 4 : 0) + (p1?.type && p1.type === t.type ? 1 : 0);
      if (cost < bestCost) { best = i; bestCost = cost; }
    });
    out.push(...rest.splice(best, 1));
  }
  return out;
}

/* ---------- Aufgabensätze der Phasen ---------- */
type Spec = [itemId: string, variant: number];

export const PRETEST_SPEC: Spec[] = [["letter:alif", 0], ["letter:ba", 0], ["letter:ta", 0], ["letter:tha", 0]];

/** Phase 4: Verständnis-Check mit sofortigem Feedback. */
export const CHECK_SPEC: Spec[] = [["concept:vowel-place", 0], ["concept:alif-role", 0], ["syl:ba-damma", 0], ["concept:alif-join", 0]];

/** Phase 5: gemischte Anwendung inkl. Transfer (neu kombinierte Silben und Wörter). */
export const PRACTICE_SPEC: Spec[] = [
  ["letter:tha", 2], ["syl:ta-kasra", 0], ["vowel:damma", 0], ["word:bab", 0], ["syl:tha-damma", 1], ["letter:alif", 1],
  ["word:tab", 0], ["syl:ba-long", 0], ["concept:alif-role", 0], ["syl:ta-long", 1], ["letter:ba", 0], ["word:thabat", 1],
  ["vowel:kasra", 1], ["syl:tha-kasra", 2],
];

/** Phase 6: Abruf ohne Hilfen, überwiegend freie Antworten und andere Varianten als in Phase 5. */
export const RETRIEVAL_SPEC: Spec[] = [
  ["syl:ba-kasra", 2], ["letter:ta", 0], ["word:thabit", 2], ["syl:tha-fatha", 2], ["vowel:fatha", 0], ["syl:ta-damma", 2],
  ["letter:tha", 1], ["letter:ba", 1], ["word:tab", 2], ["syl:ba-long", 2], ["letter:alif", 2], ["concept:alif-join", 0], ["word:thabat", 2],
];

export function buildSet(spec: Spec[], rnd: Rnd = Math.random, interleave = true): Task[] {
  const tasks = spec.map(([id, v]) => makeTask(id, v, rnd));
  return interleave ? interleaveTasks(tasks) : tasks;
}

/** Phase 7: für jedes fällige Item eine Variante, die mit der Wiederholungszahl wechselt. */
export function reviewTask(itemId: string, reps: number, rnd: Rnd = Math.random): Task {
  const n = variantCount(itemId);
  return makeTask(itemId, reps % n, rnd);
}

/** Aufgabe aus ihrer ID (`item#variante`) wiederherstellen, z. B. für die Auswertung. */
export function taskFromId(id: string, rnd: Rnd = Math.random): Task {
  const [itemId, v] = id.split("#");
  return makeTask(itemId, Number(v) || 0, rnd);
}
export const correctAnswerOf = (t: Task) => (t.type === "choice" ? t.options[t.answer] : t.accepted);
