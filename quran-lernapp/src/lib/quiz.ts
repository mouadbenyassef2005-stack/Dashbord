import { LESSONS, LESSON_INDEX } from "@/content/lessons";
import { LETTER_BY_CH, LETTERS } from "@/content/letters";
import type { Lesson, ReadItem } from "@/content/types";
import { toClusters } from "./arabic";
import { isCompleted, type Progress } from "./progress";
import { READ_ITEM_BY_ID } from "./review";

export type QuestionKind = "pick-translit" | "pick-arabic" | "find-letter" | "build-word";

interface Base {
  id: string;
  /** Item, auf das sich die Frage bezieht (für Fortschritt/Fehlerstatistik) */
  itemId: string;
  explain: string;
}
export interface PickTranslit extends Base { kind: "pick-translit"; arabic: string; options: string[]; answer: number }
export interface PickArabic extends Base { kind: "pick-arabic"; hint: string; options: string[]; answer: number }
export interface FindLetter extends Base { kind: "find-letter"; arabic: string; clusters: string[]; targetName: string; targetCh: string; correct: number[] }
export interface BuildWord extends Base { kind: "build-word"; hint: string; target: string[]; pieces: string[] }
export type Question = PickTranslit | PickArabic | FindLetter | BuildWord;

/** Deterministischer Zufall (testbar). */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle<T>(a: T[], r: () => number): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

const isForm = (i: ReadItem) => i.id.startsWith("f:");
const textOnly = (i: ReadItem) => i.arabic.replace(/[‌‍]/g, "");

function eligible(i: ReadItem, pool: ReadItem[]): QuestionKind[] {
  const out: QuestionKind[] = [];
  const cl = toClusters(i.arabic);
  const hints = new Set(pool.map((x) => x.hint).filter(Boolean));
  const arabics = new Set(pool.map((x) => textOnly(x)));
  if (i.hint && hints.size >= 3) out.push("pick-translit");
  if (i.hint && arabics.size >= 3) out.push("pick-arabic");
  if (!isForm(i) && cl.length >= 3 && cl.some((c) => LETTER_BY_CH.has(c.base))) out.push("find-letter");
  if (!isForm(i) && i.hint && cl.length >= 3 && cl.length <= 7) out.push("build-word");
  return out;
}

function pickOptions(correct: string, candidates: string[], r: () => number): { options: string[]; answer: number } {
  const others = shuffle(Array.from(new Set(candidates.filter((c) => c && c !== correct))), r).slice(0, 2);
  const options = shuffle([correct, ...others], r);
  return { options, answer: options.indexOf(correct) };
}

export function makeQuestion(i: ReadItem, kind: QuestionKind, pool: ReadItem[], r: () => number): Question | null {
  const base = { id: `${kind}:${i.id}`, itemId: i.id };
  const cl = toClusters(i.arabic);
  if (kind === "pick-translit") {
    const { options, answer } = pickOptions(i.hint, pool.map((x) => x.hint), r);
    if (options.length < 3) return null;
    return { ...base, kind, arabic: i.arabic, options, answer, explain: `${textOnly(i)} liest man „${i.hint}“.` };
  }
  if (kind === "pick-arabic") {
    const { options, answer } = pickOptions(textOnly(i), pool.map(textOnly), r);
    if (options.length < 3) return null;
    return { ...base, kind, hint: i.hint, options, answer, explain: `„${i.hint}“ schreibt man ${textOnly(i)}.` };
  }
  if (kind === "find-letter") {
    const letters = Array.from(new Set(cl.map((c) => c.base).filter((b) => LETTER_BY_CH.has(b))));
    const ch = letters[Math.floor(r() * letters.length)];
    const correct = cl.map((c, idx) => (c.base === ch ? idx : -1)).filter((x) => x >= 0);
    const name = LETTER_BY_CH.get(ch)!.name;
    return { ...base, kind, arabic: i.arabic, clusters: cl.map((c) => c.text), targetCh: ch, targetName: name, correct, explain: `${name} (${ch}) steckt hier ${correct.length}× – ${LETTER_BY_CH.get(ch)!.tip}` };
  }
  const target = cl.map((c) => c.text);
  const pieces = shuffle(target, r);
  if (pieces.join("") === target.join("") && new Set(target).size > 1) pieces.reverse();
  return { ...base, kind: "build-word", hint: i.hint, target, pieces, explain: `Richtig ist ${target.join("")} („${i.hint}“).` };
}

/** Erzeugt n Fragen aus Lese-Items (abwechslungsreiche Fragearten, jedes Item höchstens einmal, solange genug Items da sind). */
export function makeQuestions(items: ReadItem[], n: number, seed = Date.now(), only?: QuestionKind[], pool: ReadItem[] = items): Question[] {
  const r = rng(seed);
  const out: Question[] = [];
  const order = shuffle(items, r);
  let rot = 0;
  for (let round = 0; round < 2 && out.length < n; round++) {
    for (const it of order) {
      if (out.length >= n) break;
      if (round === 0 && out.some((q) => q.itemId === it.id)) continue;
      const kinds = eligible(it, pool).filter((k) => !only || only.includes(k));
      if (!kinds.length) continue;
      // reihum, damit alle Arten vorkommen
      const kind = kinds[(rot++) % kinds.length];
      const q = makeQuestion(it, kind, pool, r);
      if (q) out.push(q);
    }
  }
  return out;
}

export const CHECK_QUESTIONS = 5;
export const CHECK_PASS_RATIO = 0.6;

export function lessonCheckQuestions(lesson: Lesson, seed = Date.now()): Question[] {
  const reads = lesson.items.filter((i): i is ReadItem => i.kind === "read");
  return makeQuestions(reads, Math.min(CHECK_QUESTIONS, reads.length), seed);
}

/** Items, aus denen freie Quizrunden schöpfen: abgeschlossene Lektionen + Einstiegs-Vorwissen + bereits geübte Items. */
export function quizPool(p: Progress): ReadItem[] {
  const start = LESSON_INDEX.get(p.startLessonId) ?? 0;
  const ids = new Set<string>();
  for (const l of LESSONS) if (isCompleted(p, l.id) || LESSON_INDEX.get(l.id)! < start) for (const i of l.items) if (i.kind === "read") ids.add(i.id);
  for (const [id, s] of Object.entries(p.items)) if (s.attempts > 0) ids.add(id);
  return [...ids].map((id) => READ_ITEM_BY_ID.get(id)).filter((x): x is ReadItem => !!x);
}

export const ALL_LETTER_NAMES = LETTERS.map((l) => l.name);
