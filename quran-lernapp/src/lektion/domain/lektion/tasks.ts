import {
  ALIF, DOTTED, FEATURE, ITEM_BY_ID, L1_LETTER_IDS, MARK, SYLLABLES, VOWEL_INFO, VOWEL_LATIN, VOWEL_NAME, WORDS,
  letterCh, letterName, type VowelId,
} from "@/lektion/content/lektion1";
import { audioIdForItem } from "@/lektion/audio/manifest";
import type { Grade } from "../types";
import type { Competence } from "./competence";

export type Rnd = () => number;
export type Family = "letter" | "vowel" | "syllable" | "word" | "concept";

interface Base {
  id: string;
  itemId: string;
  family: Family;
  competence: Competence;
  prompt: string;
  /** Großer arabischer Reiz */
  ar?: string;
  /** Aufnahme, die zur Aufgabe gehört (Hörauftrag). Der Reiz ist dann Ton, nicht Schrift. */
  audioId?: string;
  hint?: string;
  explain: string;
  /** Wurde der Stoff im Lehrteil nicht gezeigt? (Transfer) */
  novel: boolean;
}
export interface ChoiceTask extends Base {
  type: "choice"; options: string[]; optionsAr: boolean; answer: number;
  /** Parallel zu options: Lern-Item, das die Option darstellt (für Verwechslungsanalyse), sonst null. */
  optionItems: (string | null)[];
}
export interface TypeTask extends Base { type: "type"; accepted: string; placeholder: string }
export type Task = ChoiceTask | TypeTask;

export type Correctness = "right" | "lengthOnly" | "wrong";
export interface TaskResult {
  taskId: string;
  itemId: string;
  competence: Competence;
  type: Task["type"] | "write";
  correctness: Correctness;
  grade: Grade;
  hintUsed: boolean;
  answer: string;
  /** Falsch gewählte Option; „unknown“ = „Weiß ich nicht“ */
  chosen?: string;
  /** Lern-Item, mit dem fälschlich verwechselt wurde (nur bei Auswahlaufgaben) */
  confusedWith?: string;
  ms?: number;
}

/* ---------- Hilfen ---------- */
const shuffle = <T,>(a: T[], rnd: Rnd): T[] => {
  const out = [...a];
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
};

interface Opt { text: string; item: string | null }
function choice(base: Omit<ChoiceTask, "type" | "options" | "answer" | "optionsAr" | "optionItems">, correct: Opt, wrong: Opt[], optionsAr: boolean, rnd: Rnd, n = 4): ChoiceTask {
  const seen = new Set([correct.text]);
  const distract = wrong.filter((w) => !seen.has(w.text) && seen.add(w.text)).slice(0, n - 1);
  const all = shuffle([correct, ...distract], rnd);
  return { ...base, type: "choice", options: all.map((o) => o.text), optionItems: all.map((o) => o.item), optionsAr, answer: all.findIndex((o) => o === correct) };
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

/**
 * Note aus Korrektheit, Hilfe und (nur wenn didaktisch sinnvoll) Antwortzeit.
 * Zeit zählt nur bei Aufgaben ohne Hörreiz, weil dort Abruf-Flüssigkeit (Automatisierung) gemeint ist:
 * schnell und richtig → 3, sehr langsam und richtig → 1. Die Schwellen sind Startwerte, nicht kalibriert.
 */
export const FAST_MS = { choice: 3500, type: 6000 };
export const SLOW_MS = { choice: 20000, type: 30000 };
export function gradeFor(c: Correctness, type: Task["type"], hintUsed: boolean, ms?: number, timed = false): Grade {
  if (c === "wrong") return 0;
  if (c === "lengthOnly" || hintUsed) return 1;
  if (timed && ms !== undefined) {
    if (ms >= SLOW_MS[type]) return 1;
    if (ms <= FAST_MS[type]) return 3;
    return 2;
  }
  return type === "type" ? 3 : 2;
}

/* ---------- Aufgaben pro Item ---------- */
const syllableById = new Map(SYLLABLES.map((s) => [s.id, s]));
const wordById = new Map(WORDS.map((w) => [w.id, w]));
const syllableExplain = (s: (typeof SYLLABLES)[number]) =>
  s.vowel === "long"
    ? `${s.ar} = ${letterName(s.letterId)} + Fatha + Alif. Alif dehnt das a: „${s.tr}“ (lang).`
    : `${s.ar} = ${letterName(s.letterId)} + ${VOWEL_NAME[s.vowel]}: „${s.tr}“.`;

const letterId = (itemId: string) => itemId.split(":")[1];
const audioOf = (itemId: string) => audioIdForItem(itemId);

export function variantCount(itemId: string): number {
  const k = ITEM_BY_ID.get(itemId)?.kind;
  const a = audioOf(itemId) ? 1 : 0;
  return k === "letter" ? 3 + a : k === "vowel" ? 2 + 2 * a : k === "syllable" ? 3 + 2 * a : k === "word" ? 3 : k === "concept" ? 1 : 0;
}

export interface Scope { letters?: string[]; vowels?: string[] }

export function makeTask(itemId: string, variant: number, rnd: Rnd = Math.random, scope: Scope = {}): Task {
  const item = ITEM_BY_ID.get(itemId);
  if (!item) throw new Error(`Unbekanntes Item ${itemId}`);
  if (variant >= variantCount(itemId)) throw new Error(`Variante ${variant} existiert nicht für ${itemId}`);
  const id = `${itemId}#${variant}`;
  const base = (family: Family, competence: Competence, prompt: string, explain: string, extra: Partial<Base> = {}) =>
    ({ id, itemId, family, competence, prompt, explain, novel: item.novel, ...extra });
  const aud = audioOf(itemId);

  if (item.kind === "letter") {
    const lid = letterId(itemId) as (typeof L1_LETTER_IDS)[number];
    const ch = letterCh(lid), nm = letterName(lid);
    const names: Opt[] = L1_LETTER_IDS.map((x) => ({ text: letterName(x), item: `letter:${x}` }));
    const chars: Opt[] = L1_LETTER_IDS.map((x) => ({ text: letterCh(x), item: `letter:${x}` }));
    const mine = (list: Opt[]) => list.find((o) => o.item === itemId)!;
    const ex = `${ch} heißt ${nm}: ${FEATURE[lid].text}.`;
    if (variant === 0) return choice(base("letter", "visual", "Wie heißt dieser Buchstabe?", ex, { ar: ch, hint: "Zähle die Punkte und achte auf oben und unten." }), mine(names), names, false, rnd);
    if (variant === 1) return choice(base("letter", "visual", `Welcher Buchstabe ist ${nm}?`, ex, { hint: "Denk an die Punkte." }), mine(chars), chars, true, rnd);
    if (variant === 2) return choice(base("letter", "visual", `Welcher Buchstabe ist ${FEATURE[lid].text}?`, ex, { hint: "Vergleiche Bogen und Punkte." }), mine(chars), chars, true, rnd);
    return choice(base("letter", "sound", "Hör zu: Welcher Buchstabe wird gesprochen?", `${ch} wird mit kurzem a gesprochen: ${lid === "alif" ? "„Alif“ (der Name)" : `„${SYLLABLES.find((s) => s.letterId === lid && s.vowel === "fatha")!.tr}“`}.`, { audioId: aud!, hint: "Hör die Aufnahme noch einmal, auch langsam." }), mine(chars), chars, true, rnd);
  }

  if (item.kind === "vowel") {
    const v = letterId(itemId) as VowelId;
    const all = (["fatha", "kasra", "damma"] as const);
    const names: Opt[] = all.map((x) => ({ text: VOWEL_NAME[x], item: `vowel:${x}` }));
    const marks: Opt[] = all.map((x) => ({ text: DOTTED + MARK[x], item: `vowel:${x}` }));
    const sounds: Opt[] = all.map((x) => ({ text: VOWEL_LATIN[x], item: `vowel:${x}` }));
    const mine = (l: Opt[]) => l.find((o) => o.item === itemId)!;
    const ex = `${VOWEL_NAME[v]} steht ${VOWEL_INFO[v].place} und steht für kurzes „${VOWEL_LATIN[v]}“.`;
    if (variant === 0) return choice(base("vowel", "vowel", "Wie heißt dieses Vokalzeichen?", ex, { ar: DOTTED + MARK[v], hint: "Oben oder unten? Mit oder ohne Schlaufe?" }), mine(names), names, false, rnd, 3);
    if (variant === 1) return choice(base("vowel", "vowel", `Welches Zeichen steht für kurzes „${VOWEL_LATIN[v]}“?`, ex, { hint: `${VOWEL_NAME[v]} steht ${VOWEL_INFO[v].place}.` }), mine(marks), marks, true, rnd, 3);
    if (variant === 2) return choice(base("vowel", "listen", "Hör zu: Welchen kurzen Vokal hörst du?", ex, { audioId: aud!, hint: "Hör die Aufnahme noch einmal, auch langsam." }), mine(sounds), sounds, false, rnd, 3);
    return choice(base("vowel", "sound", "Hör zu: Welches Vokalzeichen gehört zu diesem Laut?", ex, { audioId: aud!, hint: "Oben oder unten? Mit oder ohne Schlaufe?" }), mine(marks), marks, true, rnd, 3);
  }

  if (item.kind === "syllable") {
    const s = syllableById.get(itemId)!;
    const ex = syllableExplain(s);
    // Kurze Silben werden nie mit langen (ā) gemischt, solange ausdrücklich nichts anderes verlangt ist: Längen gehören nicht in den ersten Lernpfad.
    const vowelScope = scope.vowels ?? (s.vowel === "long" ? undefined : ["fatha", "kasra", "damma"]);
    const inScope = (o: (typeof SYLLABLES)[number]) => (!scope.letters || scope.letters.includes(o.letterId)) && (!vowelScope || vowelScope.includes(o.vowel));
    const near = SYLLABLES.filter((o) => o.id !== s.id && inScope(o) && (o.letterId === s.letterId || o.vowel === s.vowel));
    const nearFirst = shuffle(near, rnd);
    const twin = SYLLABLES.find((o) => inScope(o) && o.letterId === s.letterId && ((s.vowel === "long" && o.vowel === "fatha") || (s.vowel === "fatha" && o.vowel === "long")));
    const ordered = twin ? [twin, ...nearFirst.filter((o) => o !== twin)] : nearFirst;
    const trOpts = (list: typeof ordered): Opt[] => list.map((o) => ({ text: o.tr, item: o.id }));
    const arOpts = (list: typeof ordered): Opt[] => list.map((o) => ({ text: o.ar, item: o.id }));
    const me = (kind: "tr" | "ar"): Opt => ({ text: s[kind], item: s.id });
    const hint = s.vowel === "long" ? "Folgt ein Alif? Dann ist das a lang." : "Welches Zeichen steht am Buchstaben, und über oder unter ihm?";
    if (variant === 0) return choice(base("syllable", "syllable", "Wie wird diese Silbe gelesen?", ex, { ar: s.ar, hint }), me("tr"), trOpts(ordered), false, rnd);
    if (variant === 1) return choice(base("syllable", "sound", `Welche Silbe ist „${s.tr}“?`, ex, { hint }), me("ar"), arOpts(ordered), true, rnd);
    if (variant === 2) return { ...base("syllable", "syllable", "Schreibe auf, wie die Silbe gelesen wird.", ex, { ar: s.ar, hint }), type: "type", accepted: s.tr, placeholder: "z. B. ba" };
    const heard = audioIdForItem(itemId)!;
    // Hörunterscheidung: nur Silben mit Aufnahme als Distraktoren, damit nichts Unhörbares gefragt wird
    const withAudio = ordered.filter((o) => audioIdForItem(o.id));
    if (variant === 3) return choice(base("syllable", "listen", "Hör zu: Welche Silbe hörst du?", ex, { audioId: heard, hint: "Achte auf den Vokal: a, i oder u? Und auf den Anfangslaut." }), me("tr"), trOpts(withAudio), false, rnd);
    return choice(base("syllable", "sound", "Hör zu: Welche Silbe ist das?", ex, { audioId: heard, hint: "Achte auf den Vokal und auf Punkte und Zeichen." }), me("ar"), arOpts(withAudio), true, rnd);
  }

  if (item.kind === "word") {
    const w = wordById.get(itemId)!;
    const ex = `${w.ar} = „${w.tr}“ (${w.de}). Von rechts nach links lesen: ${w.letters.map(letterName).join(" · ")}.`;
    const hint = "Lies von rechts nach links, Buchstabe für Buchstabe. Alif dehnt.";
    if (variant === 0) {
      const others: Opt[] = WORDS.filter((o) => o.id !== w.id).map((o) => ({ text: o.tr, item: o.id }));
      return choice(base("word", "word", "Wie wird dieses Wort gelesen?", ex, { ar: w.ar, hint }), { text: w.tr, item: w.id }, [{ text: w.tr.replace(/ā/g, "a"), item: null }, ...others], false, rnd);
    }
    if (variant === 1) return choice(base("word", "word", "Was bedeutet dieses Wort?", ex, { ar: w.ar, hint: `${hint} Gelesen: „${w.tr}“.` }), { text: w.de, item: w.id }, WORDS.filter((o) => o.id !== w.id).map((o) => ({ text: o.de, item: o.id })), false, rnd);
    return { ...base("word", "word", "Schreibe auf, wie das Wort gelesen wird.", ex, { ar: w.ar, hint }), type: "type", accepted: w.tr, placeholder: "z. B. bāb (oder baab)" };
  }

  // Konzepte
  const none = (a: string[]): Opt[] => a.map((text) => ({ text, item: null }));
  if (itemId === "concept:alif-role")
    return choice(base("concept", "vowel", "Was tut ا in بَا?", "Alif ist hier ein Dehnungsbuchstabe: Fatha + ا = ā. Das kurze a schreibt die Fatha, nicht das Alif.", { ar: "بَا", hint: "Denk an Fatha und die Länge." }),
      { text: "Es dehnt das a zu ā", item: null }, none(["Es steht für ein kurzes a", "Es ist der Konsonant „b“", "Es bleibt stumm und ändert nichts"]), false, rnd);
  if (itemId === "concept:alif-join")
    return choice(base("concept", "visual", "Welcher dieser Buchstaben verbindet sich nicht mit dem folgenden Buchstaben?", "Alif ist ein Nicht-Verbinder; ب ت ث verbinden nach links.", { hint: "Er ist der gerade Strich." }),
      { text: ALIF, item: "letter:alif" }, L1_LETTER_IDS.map((x) => ({ text: letterCh(x), item: `letter:${x}` })), true, rnd);
  return choice(base("concept", "vowel", "Wo steht das Kasra?", "Fatha und Damma stehen über, Kasra steht unter dem Buchstaben.", { ar: "بِ", hint: "Fatha und Damma stehen oben." }),
    { text: "unter dem Buchstaben", item: null }, none(["über dem Buchstaben", "hinter dem Buchstaben", "im Buchstaben"]), false, rnd);
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

export type Spec = [itemId: string, variant: number];

/** Aufgabensatz aus Spezifikationen. Spezifikationen ohne vorhandene Aufnahme werden still weggelassen (kein Hörauftrag ohne Ton). */
export function buildSet(spec: Spec[], rnd: Rnd = Math.random, interleave = true): Task[] {
  const tasks = spec.filter(([id, v]) => v < variantCount(id)).map(([id, v]) => makeTask(id, v, rnd));
  return interleave ? interleaveTasks(tasks) : tasks;
}

/** Wiederholungsaufgabe für ein Item und eine Kompetenz; die Variante wechselt mit der Wiederholungszahl. */
export function reviewTaskFor(itemId: string, competence: Competence, reps: number, rnd: Rnd = Math.random): Task | null {
  const n = variantCount(itemId);
  const fits: number[] = [];
  for (let v = 0; v < n; v++) if (makeTask(itemId, v, () => 0.5).competence === competence) fits.push(v);
  if (!fits.length) return null;
  return makeTask(itemId, fits[reps % fits.length], rnd);
}

/** Aufgabe aus ihrer ID (`item#variante`) wiederherstellen, z. B. für die Auswertung. */
export function taskFromId(id: string, rnd: Rnd = Math.random): Task {
  const [itemId, v] = id.split("#");
  return makeTask(itemId, Number(v) || 0, rnd);
}
export const correctAnswerOf = (t: Task) => (t.type === "choice" ? t.options[t.answer] : t.accepted);

/** Gezielte Vergleichsübung für zwei verwechselte Items: bunte Mischung aller Aufgabenvarianten beider Items. */
export function drillTasks(a: string, b: string, n: number, rnd: Rnd = Math.random, interleave = true): Task[] {
  const pairs: Spec[] = [];
  for (const id of [a, b]) for (let v = 0; v < variantCount(id); v++) pairs.push([id, v]);
  const picked = shuffle(pairs, rnd).slice(0, n);
  return buildSet(picked, rnd, interleave);
}

/** Zusatzübung nach einem Test: pro falsch beantwortetem Item eine ANDERE Variante als die gescheiterte. */
export function extraTasks(wrong: TaskResult[], max: number, rnd: Rnd = Math.random): Task[] {
  const out: Task[] = [];
  const seen = new Set<string>();
  for (const r of wrong) {
    if (seen.has(r.itemId)) continue;
    seen.add(r.itemId);
    const failed = Number(r.taskId.split("#")[1]);
    const alt = Array.from({ length: variantCount(r.itemId) }, (_, v) => v).filter((v) => v !== failed);
    const sameComp = alt.filter((v) => makeTask(r.itemId, v, () => 0.5).competence === r.competence);
    const pool = sameComp.length ? sameComp : alt;
    if (pool.length) out.push(makeTask(r.itemId, pool[Math.floor(rnd() * pool.length)], rnd));
    if (out.length >= max) break;
  }
  return interleaveTasks(out);
}

/* ---------- Aufgaben für den Lernpfad (kleine, schrittweise Pools) ---------- */
/** Neutrale Ablenker-Zeichen, die in dieser Lernstrecke NICHT gelernt werden. Sie dienen nur dem Unterscheiden. */
export const FILLER_LETTERS = ["ل", "د", "ر", "و", "م", "ح", "ع", "س"];
const FILLER_MARKS = ["\u0652", "\u0651"]; // Sukun, Shadda: später

export type PathTaskSpec =
  | { t: "letter"; letter: string; mode: "find" | "name" | "hear" | "feature"; pool: string[]; fill?: number }
  | { t: "mark"; vowel: VowelId; mode: "find" | "name" | "place" | "sound" | "hear"; pool: VowelId[] }
  | { t: "syl"; id: string; v: number; letters?: string[]; vowels?: string[] }
  | { t: "custom"; id: string; itemId: string; competence: Competence; prompt: string; ar?: string; options: string[]; optionsAr?: boolean; answer: number; explain: string };

const SOUNDS: Opt[] = (["fatha", "kasra", "damma"] as const).map((v) => ({ text: VOWEL_LATIN[v], item: `vowel:${v}` }));

/**
 * Baut eine Aufgabe für den Lernpfad. Optionen kommen nur aus dem angegebenen Pool plus neutralen Ablenkern,
 * damit nie Buchstaben oder Zeichen auftauchen, die noch nicht eingeführt sind. Gibt null zurück, wenn die Aufgabe
 * mit dem Pool nicht sinnvoll ist (z. B. Auswahl mit nur einer Option) oder eine Aufnahme fehlt.
 */
export function pathTask(spec: PathTaskSpec, rnd: Rnd = Math.random): Task | null {
  if (spec.t === "custom") {
    const correct = spec.options[spec.answer];
    return choice({ id: spec.id, itemId: spec.itemId, family: "letter", competence: spec.competence, prompt: spec.prompt, ar: spec.ar, explain: spec.explain, novel: true }, { text: correct, item: null }, spec.options.map((text) => ({ text, item: null })), !!spec.optionsAr, rnd, spec.options.length);
  }
  if (spec.t === "syl") return variantCount(spec.id) > spec.v ? makeTask(spec.id, spec.v, rnd, { letters: spec.letters, vowels: spec.vowels }) : null;

  if (spec.t === "letter") {
    const lid = spec.letter as (typeof L1_LETTER_IDS)[number];
    const itemId = `letter:${lid}`;
    const poolIds = spec.pool.includes(lid) ? spec.pool : [...spec.pool, lid];
    const glyphs: Opt[] = poolIds.map((x) => ({ text: letterCh(x), item: `letter:${x}` }));
    const fillN = Math.max(0, Math.min(spec.fill ?? Math.max(0, 3 - glyphs.length), FILLER_LETTERS.length));
    const filler: Opt[] = shuffle(FILLER_LETTERS, rnd).slice(0, fillN).map((c) => ({ text: c, item: null }));
    const all = [...glyphs, ...filler];
    const mine = glyphs.find((o) => o.item === itemId)!;
    const nm = letterName(lid), ch = letterCh(lid);
    const base = (competence: Competence, prompt: string, extra: Partial<Base> = {}) =>
      ({ id: `${itemId}#p-${spec.mode}-${spec.pool.join("")}`, itemId, family: "letter" as Family, competence, prompt, explain: `${ch} ist ${nm}: ${FEATURE[lid].text}.`, novel: false, ...extra });
    if (spec.mode === "find") return choice(base("visual", `Tippe auf ${nm}.`), mine, all, true, rnd);
    if (spec.mode === "feature") return choice(base("visual", `Welches Zeichen ist ${FEATURE[lid].text}?`), mine, all, true, rnd);
    if (spec.mode === "hear") {
      const aud = audioOf(itemId);
      return aud ? choice(base("sound", "Welches Zeichen hörst du?", { audioId: aud }), mine, all, true, rnd) : null;
    }
    const names: Opt[] = poolIds.map((x) => ({ text: letterName(x), item: `letter:${x}` }));
    return names.length >= 3 ? choice(base("visual", "Wie heißt dieses Zeichen?", { ar: ch }), names.find((o) => o.item === itemId)!, names, false, rnd) : null;
  }

  const v = spec.vowel;
  const itemId = `vowel:${v}`;
  const poolIds = spec.pool.includes(v) ? spec.pool : [...spec.pool, v];
  const marks: Opt[] = poolIds.map((x) => ({ text: DOTTED + MARK[x], item: `vowel:${x}` }));
  const fillMarks: Opt[] = FILLER_MARKS.map((m) => ({ text: DOTTED + m, item: null }));
  const base = (competence: Competence, prompt: string, extra: Partial<Base> = {}) =>
    ({ id: `${itemId}#p-${spec.mode}-${spec.pool.join("")}`, itemId, family: "vowel" as Family, competence, prompt, explain: `${VOWEL_NAME[v]}: kurzes „${VOWEL_LATIN[v]}“, steht ${VOWEL_INFO[v].place}.`, novel: false, ...extra });
  const mine = marks.find((o) => o.item === itemId)!;
  if (spec.mode === "find") return choice(base("vowel", `Tippe auf die ${VOWEL_NAME[v]}.`), mine, [...marks, ...fillMarks], true, rnd, 3);
  if (spec.mode === "name") {
    const names: Opt[] = poolIds.map((x) => ({ text: VOWEL_NAME[x], item: `vowel:${x}` }));
    return names.length >= 2 ? choice(base("vowel", "Wie heißt dieses Zeichen?", { ar: DOTTED + MARK[v] }), names.find((o) => o.item === itemId)!, names, false, rnd, 3) : null;
  }
  if (spec.mode === "place")
    return choice(base("vowel", `Wo steht die ${VOWEL_NAME[v]}?`, { ar: DOTTED + MARK[v] }), { text: v === "kasra" ? "unter dem Buchstaben" : "über dem Buchstaben", item: null }, [{ text: v === "kasra" ? "über dem Buchstaben" : "unter dem Buchstaben", item: null }], false, rnd, 2);
  if (spec.mode === "sound") return choice(base("vowel", "Welchen kurzen Vokal zeigt es an?", { ar: DOTTED + MARK[v] }), SOUNDS.find((o) => o.item === itemId)!, SOUNDS.filter((o) => poolIds.includes(o.item!.split(":")[1] as VowelId) || true), false, rnd, 3);
  const aud = audioOf(itemId);
  return aud ? choice(base("listen", "Welchen kurzen Vokal hörst du?", { audioId: aud }), SOUNDS.find((o) => o.item === itemId)!, SOUNDS, false, rnd, 3) : null;
}

export function pathTasks(specs: PathTaskSpec[], rnd: Rnd = Math.random): Task[] {
  return specs.map((sp) => pathTask(sp, rnd)).filter((t): t is Task => !!t);
}

/** Übungs- und Nachtest-Aufgaben für ein verwechseltes Paar. Beide Sätze sind disjunkt: Der Nachtest enthält nie eine Aufgabe aus der Übung. */
export function drillSets(a: string, b: string, rnd: Rnd = Math.random, size = { practice: 4, retest: 4 }): { practice: Task[]; retest: Task[] } {
  const pairs: Spec[] = [];
  for (const id of [a, b]) for (let v = 0; v < variantCount(id); v++) pairs.push([id, v]);
  const mixed = shuffle(pairs, rnd);
  return { practice: buildSet(mixed.slice(0, size.practice), rnd), retest: buildSet(mixed.slice(size.practice, size.practice + size.retest), rnd) };
}
