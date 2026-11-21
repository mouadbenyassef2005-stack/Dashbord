/**
 * Lektion 1: Alif (ا), Bā (ب), Tā (ت), Thā (ث) und die Kurzvokale Fatha, Kasra, Damma.
 *
 * Fachliche Eckpunkte (bewusst so umgesetzt):
 * - Alif ist KEIN Konsonant wie ب ت ث. Ohne Zeichen ist es ein Dehnungsbuchstabe (Fatha + ا = ā).
 *   Als Träger der Hamza (أ إ) wird es später behandelt; das ا dieser Lektion hat keinen eigenen Konsonantenlaut.
 * - Alif verbindet sich nicht mit dem Folgebuchstaben (Nicht-Verbinder); ب ت ث verbinden beidseitig.
 * - ب ت ث teilen dieselbe Grundform; nur Punkte (Zahl, Lage) unterscheiden sie.
 * - Wörter stehen in Pausalform (ohne Endvokal); das Sukun-Zeichen folgt in einer späteren Lektion.
 * Alle Beispiele sind vollständig vokalisiert. Eine fachliche Abnahme durch Arabisch-Lehrkräfte steht aus.
 */
import { LETTER_BY_ID } from "./letters";
import { VOWELS } from "./vowels";

export type VowelId = (typeof VOWELS)[number]["id"];
export const L1_LETTER_IDS = ["alif", "ba", "ta", "tha"] as const;
export const CONSONANT_IDS = ["ba", "ta", "tha"] as const;
export type ConsonantId = (typeof CONSONANT_IDS)[number];

export const ONSET: Record<ConsonantId, string> = { ba: "b", ta: "t", tha: "th" };
export const VOWEL_LATIN: Record<VowelId, string> = { fatha: "a", kasra: "i", damma: "u" };
export const MARK = Object.fromEntries(VOWELS.map((v) => [v.id, v.mark])) as Record<VowelId, string>;
export const VOWEL_NAME = Object.fromEntries(VOWELS.map((v) => [v.id, v.name])) as Record<VowelId, string>;
/** Gepunkteter Kreis: Platzhalter, um ein Vokalzeichen allein darzustellen. */
export const DOTTED = "◌";
export const ALIF = "ا";

export const letterName = (id: string) => LETTER_BY_ID.get(id)!.name;
export const letterCh = (id: string) => LETTER_BY_ID.get(id)!.ch;

export interface Syllable {
  id: string;
  ar: string;
  tr: string;
  letterId: ConsonantId;
  vowel: VowelId | "long";
  /** Wird im Lehrteil nicht gezeigt: dient dem Transfer in Phase 5. */
  novel: boolean;
}

export const SYLLABLES: Syllable[] = CONSONANT_IDS.flatMap((c) => [
  ...(["fatha", "kasra", "damma"] as const).map((v): Syllable => ({
    id: `syl:${c}-${v}`, ar: letterCh(c) + MARK[v], tr: ONSET[c] + VOWEL_LATIN[v], letterId: c, vowel: v,
    novel: c !== "ba" && v !== "fatha",
  })),
  { id: `syl:${c}-long`, ar: letterCh(c) + MARK.fatha + ALIF, tr: ONSET[c] + "ā", letterId: c, vowel: "long", novel: c !== "ba" },
]);

export interface Word { id: string; ar: string; tr: string; de: string; letters: string[]; novel: boolean; note?: string }
export const WORDS: Word[] = [
  { id: "word:bab", ar: "بَاب", tr: "bāb", de: "Tür", letters: ["ba", "alif", "ba"], novel: false },
  { id: "word:thabit", ar: "ثَابِت", tr: "thābit", de: "fest, beständig", letters: ["tha", "alif", "ba", "ta"], novel: false },
  { id: "word:tab", ar: "تَاب", tr: "tāb", de: "er bereute (kehrte um)", letters: ["ta", "alif", "ba"], novel: true, note: "Pausalform von tāba" },
  { id: "word:thabat", ar: "ثَبَات", tr: "thabāt", de: "Beständigkeit, Festigkeit", letters: ["tha", "ba", "alif", "ta"], novel: true },
];

export type ItemKind = "letter" | "vowel" | "syllable" | "word" | "concept";
export interface Item { id: string; kind: ItemKind; label: string; novel: boolean }

export const CONCEPT_IDS = ["concept:alif-role", "concept:alif-join", "concept:vowel-place"] as const;

export const ITEMS: Item[] = [
  ...L1_LETTER_IDS.map((id): Item => ({ id: `letter:${id}`, kind: "letter", label: `${letterCh(id)} ${letterName(id)}`, novel: false })),
  ...(["fatha", "kasra", "damma"] as const).map((v): Item => ({ id: `vowel:${v}`, kind: "vowel", label: `${VOWEL_NAME[v]} (${VOWEL_LATIN[v]})`, novel: false })),
  ...SYLLABLES.map((s): Item => ({ id: s.id, kind: "syllable", label: `${s.ar} · ${s.tr}`, novel: s.novel })),
  ...WORDS.map((w): Item => ({ id: w.id, kind: "word", label: `${w.ar} · ${w.tr}`, novel: w.novel })),
  { id: "concept:alif-role", kind: "concept", label: "Rolle des Alif", novel: false },
  { id: "concept:alif-join", kind: "concept", label: "Alif verbindet nicht", novel: false },
  { id: "concept:vowel-place", kind: "concept", label: "Lage der Vokalzeichen", novel: false },
];
export const ITEM_BY_ID = new Map(ITEMS.map((i) => [i.id, i]));

/** Beschreibungen für Merkmals-Aufgaben und Bildanker (Dual Coding: Wort + Bild). */
export const FEATURE: Record<(typeof L1_LETTER_IDS)[number], { text: string; anchor: string }> = {
  alif: { text: "ein senkrechter Strich, ohne Bogen und ohne Punkte", anchor: "Ein Pfahl: gerade, schlank, steht allein." },
  ba: { text: "ein Bogen mit einem Punkt darunter", anchor: "Ein Boot (Bā) mit einem Anker im Wasser darunter." },
  ta: { text: "ein Bogen mit zwei Punkten darüber", anchor: "Eine Tasse (Tā) mit zwei Dampfwölkchen darüber." },
  tha: { text: "ein Bogen mit drei Punkten darüber", anchor: "Drei Punkte: „three“, th wie in „think“." },
};

/** Mund- und Merkhilfen der Vokalzeichen. */
export const VOWEL_INFO: Record<VowelId, { place: string; look: string; mouth: string }> = {
  fatha: { place: "über dem Buchstaben", look: "kleiner schräger Strich", mouth: "Mund offen, wie das „a“ in „Mama“" },
  kasra: { place: "unter dem Buchstaben", look: "kleiner schräger Strich", mouth: "Lippen breit, wie das „i“ in „Wind“" },
  damma: { place: "über dem Buchstaben", look: "winziges „و“ mit Schlaufe", mouth: "Lippen rund, wie das „u“ in „Mund“" },
};

/* ---------- Phase 3: Hypothesen (Productive Failure) ---------- */
export type Confidence = "sure" | "unsure" | "guess";
export const CONFIDENCE_LABEL: Record<Confidence, string> = { sure: "Ich bin mir sicher", unsure: "Eher vermutet", guess: "Geraten" };

export interface Hypothesis {
  id: string;
  title: string;
  /** Aufgabenstellung; „given“ zeigt Vorwissen als Muster. */
  question: string;
  given?: string[];
  stimulus: string;
  options: string[];
  optionsAr?: boolean;
  /** Index der fachlich richtigen Option */
  answer: number;
  /** Auflösung in Phase 4 */
  reveal: string;
}

export const UNKNOWN_OPTION = "Weiß ich nicht";

export const HYPOTHESES: Hypothesis[] = [
  {
    id: "h-kasra", title: "Das Zeichen unter dem Buchstaben",
    question: "Dieses Zeichen unter dem ب kennst du noch nicht. Wie klingt die Silbe?",
    given: ["بَ = ba", "تَ = ta", "ثَ = tha"], stimulus: "بِ",
    options: ["ba", "bi", "bu"], answer: 1,
    reveal: "Das Zeichen unter dem Buchstaben heißt Kasra und steht für ein kurzes „i“: بِ = bi. Der Punkt gehört zum ب, das kleine schräge Zeichen darunter ist das Kasra.",
  },
  {
    id: "h-damma", title: "Das Zeichen mit der Schlaufe",
    question: "Und dieses Zeichen über dem ب? Es sieht anders aus als das erste, das du kennst.",
    given: ["بَ = ba", "بِ = bi (deine Vermutung gilt)"], stimulus: "بُ",
    options: ["ba", "bi", "bu"], answer: 2,
    reveal: "Das Zeichen heißt Damma und steht für ein kurzes „u“: بُ = bu. Es ist ein winziges „و“ (Wāw) über dem Buchstaben, daran erkennst du es.",
  },
  {
    id: "h-analogy", title: "Übertragen auf einen anderen Buchstaben",
    question: "Du kennst ت = t. Wie klingt diese Silbe?",
    stimulus: "تِ",
    options: ["ta", "ti", "tu", "thi"], answer: 1,
    reveal: "Die Vokalzeichen funktionieren bei jedem Konsonanten gleich: Buchstabe + Kasra = Konsonant + i. Also تِ = ti. Das Zeichen ändert nur den Vokal, der Buchstabe liefert den Konsonanten.",
  },
  {
    id: "h-alif-long", title: "Was macht das Alif?",
    question: "Du kennst بَ = ba. Hier steht dahinter ein ا. Was bewirkt es?",
    stimulus: "بَا",
    options: ["Es verlängert das a: bā (ā = langes a)", "Es fügt einen eigenen Konsonanten hinzu", "Es ist stumm und ändert nichts"], answer: 0,
    reveal: "Fatha + ا dehnt das a: بَا = bā, etwa doppelt so lang wie بَ = ba. Alif ist hier kein Konsonant, sondern ein Dehnungsbuchstabe.",
  },
  {
    id: "h-alif-join", title: "Warum hängt das zweite ب nicht an?",
    question: "In diesem Wort ist das erste ب mit dem Alif verbunden, das zweite steht frei. Warum?",
    stimulus: "بَاب",
    options: ["Es ist ein anderer Buchstabe", "Alif verbindet sich nicht mit dem folgenden Buchstaben", "Das ist nur Schönschrift"], answer: 1,
    reveal: "Alif ist ein Nicht-Verbinder: Es hängt sich nach links an nichts an. Deshalb beginnt das nächste Zeichen neu und das zweite ب steht in seiner freien Form. Es bleibt derselbe Buchstabe.",
  },
  {
    id: "h-alif-consonant", title: "Ist Alif ein Konsonant wie ب?",
    question: "Welche Aussage über ا stimmt am ehesten?",
    stimulus: "ا",
    options: ["Alif ist der Buchstabe für „a“, so wie ب der Buchstabe für „b“ ist", "Alif hat hier keinen eigenen Konsonantenlaut, er dehnt einen Vokal", UNKNOWN_OPTION], answer: 1,
    reveal: "Häufiger Irrtum: „Alif = a“. Das kurze a schreibt die Fatha. Alif selbst ist hier ein Dehnungsbuchstabe. (Als Träger der Hamza hat er später eine weitere Rolle.)",
  },
];

/* ---------- Phase 4: Elaboration ---------- */
export interface ElabPrompt { id: string; question: string; model: string }
export const ELAB: ElabPrompt[] = [
  { id: "e-who", question: "Was liefert den Konsonanten und was den Vokal in بِ? Erkläre in eigenen Worten.",
    model: "Der Buchstabe ب liefert den Konsonanten b. Das Kasra darunter liefert den kurzen Vokal i. Zusammen ergeben sie die Silbe bi." },
  { id: "e-dots", question: "ب, ت und ث haben dieselbe Grundform. Warum ist es beim Lesen wichtig, zuerst auf die Punkte zu achten?",
    model: "Weil nur die Punkte (Zahl und Lage) die drei Buchstaben unterscheiden. Ein Punkt unten ist ب, zwei oben ت, drei oben ث. Wer die Punkte übersieht, liest den falschen Buchstaben." },
  { id: "e-alif", question: "Warum ist Alif kein Konsonant wie ب? Nenne zwei Unterschiede.",
    model: "Alif hat keinen eigenen Konsonantenlaut, sondern dehnt den Vokal davor (بَا = bā). Außerdem hat es keine Punkte und verbindet sich nicht mit dem folgenden Buchstaben." },
];

export const ALIF_CONTRAST: { feature: string; alif: string; others: string }[] = [
  { feature: "Rolle", alif: "Dehnungsbuchstabe: macht ein kurzes a lang (ā)", others: "Konsonanten: b, t, th" },
  { feature: "Eigener Konsonantenlaut", alif: "nein (hier)", others: "ja" },
  { feature: "Punkte", alif: "keine", others: "ب 1 unten · ت 2 oben · ث 3 oben" },
  { feature: "Verbindung nach links", alif: "nie (Nicht-Verbinder)", others: "ja, beidseitig" },
  { feature: "Form", alif: "senkrechter Strich", others: "gemeinsame Bogen-Grundform" },
];
