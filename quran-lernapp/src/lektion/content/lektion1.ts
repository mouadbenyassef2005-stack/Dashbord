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

/** Alle Wörter stehen in Pausalform: Kurzvokale im Wort sind geschrieben, der Endvokal und das Sukun-Zeichen (ْ) am Wortende nicht. */
export const WORD_VOCALIZATION_NOTE = "Teilweise vokalisiert (Pausalform): Die Vokale im Wort sind geschrieben. Am Wortende steht kein Vokalzeichen. Du liest dort ohne Vokal. Das Zeichen für „kein Vokal“ (Sukun) und Endvokale lernst du später.";
export const WORDS: Word[] = [
  { id: "word:bab", ar: "بَاب", tr: "bāb", de: "Tür", letters: ["ba", "alif", "ba"], novel: false },
  { id: "word:thabit", ar: "ثَابِت", tr: "thābit", de: "fest, beständig", letters: ["tha", "alif", "ba", "ta"], novel: false },
  { id: "word:tab", ar: "تَاب", tr: "tāb", de: "er bereute (kehrte um)", letters: ["ta", "alif", "ba"], novel: true, note: "Pausalform des Verbs tāba (تَابَ, „er bereute“). Das Verb steht normalerweise mit Endvokal." },
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
export const FEATURE: Record<(typeof L1_LETTER_IDS)[number], { text: string; anchor: string; keyword: string }> = {
  alif: { text: "ein senkrechter Strich, ohne Bogen und ohne Punkte", anchor: "Ein Pfahl: gerade, schlank, steht allein.", keyword: "Pfahl" },
  ba: { text: "ein Bogen mit einem Punkt darunter", anchor: "Ein Boot (Bā) mit einem Anker im Wasser darunter.", keyword: "Boot + Anker" },
  ta: { text: "ein Bogen mit zwei Punkten darüber", anchor: "Eine Tasse (Tā) mit zwei Dampfwölkchen darüber.", keyword: "Tasse" },
  tha: { text: "ein Bogen mit drei Punkten darüber", anchor: "Drei Punkte: „three“, th wie in „think“.", keyword: "drei oben" },
};

/**
 * Aussprachehilfen der Vokalzeichen. Entscheidend ist bei i und u die ZUNGENPOSITION, bei u zusätzlich die Lippenrundung.
 * Deutsche Vergleichswörter sind Annäherungen, keine Gleichsetzung. Nicht von einer arabischsprachigen Person abgenommen
 * (siehe docs/PHONETIK-PRUEFLISTE.md).
 */
export const VOWEL_INFO: Record<VowelId, { place: string; look: string; mouth: string; tongue: string; caution: string }> = {
  fatha: {
    place: "über dem Buchstaben", look: "kleiner schräger Strich",
    mouth: "Mund offen, Zunge flach und entspannt, kurzer a-Laut.",
    tongue: "Zunge liegt flach im Mund, Kiefer ist geöffnet.",
    caution: "Das deutsche „a“ in „Wasser“ ist ein guter Start. Das arabische kurze a wird aber je nach Nachbarlaut etwas heller oder dunkler gesprochen.",
  },
  kasra: {
    place: "unter dem Buchstaben", look: "kleiner schräger Strich",
    mouth: "Kurzer i-Laut: Der vordere Zungenrücken hebt sich nah an den harten Gaumen, die Zungenspitze liegt hinter den unteren Schneidezähnen.",
    tongue: "Zunge vorn und hoch.",
    caution: "Kurz und ungespannt wie das „i“ in „Wind“, nicht gedehnt wie in „Biene“. Die Lippen sind dabei entspannt.",
  },
  damma: {
    place: "über dem Buchstaben", look: "winziges „و“ mit Schlaufe",
    mouth: "Kurzer u-Laut: Der hintere Zungenrücken hebt sich zum weichen Gaumen, die Zunge zieht sich zurück, die Lippen sind gerundet.",
    tongue: "Zunge hinten und hoch, Lippen rund.",
    caution: "Kurz wie das „u“ in „Mund“, nicht gedehnt wie in „Mut“.",
  },
};

/** Artikulationshilfen für die Konsonanten dieser Lektion. */
export const ARTICULATION: Record<string, { title: string; steps: string[]; common: string }> = {
  alif: { title: "Alif", steps: ["Alif hat hier keinen eigenen Konsonantenlaut.", "Im Namen „Alif“ hörst du am Anfang einen kleinen Stimmeinsatz (Hamza). Der gehört nicht zum Zeichen ا selbst."], common: "Nicht „Alif = a“ merken: Das kurze a schreibt die Fatha." },
  ba: { title: "Bā /b/", steps: ["Beide Lippen schließen sich kurz, dann öffnen sie sich.", "Die Stimme schwingt mit (stimmhaft), wie beim deutschen „b“."], common: "Kaum ein Problem für Deutschsprachige." },
  ta: { title: "Tā /t/", steps: ["Die Zungenspitze berührt die oberen Schneidezähne oder den Zahndamm direkt dahinter.", "Der Laut wird ohne Stimme gesprochen und nicht stark behaucht."], common: "Am Wortanfang sprechen Deutsche „t“ meist mit einem kräftigen Hauch. Im Arabischen ist er schwächer." },
  tha: { title: "Thā /θ/ (stimmloser dentaler Reibelaut)", steps: ["Schiebe die Zungenspitze leicht zwischen oder an die oberen Schneidezähne.", "Blase Luft durch den engen Spalt. Die Stimmbänder schwingen nicht: Leg eine Hand an den Hals, es soll nichts brummen.", "Übung: Sprich ein langes „sss“ und schiebe dabei die Zungenspitze langsam nach vorn an die Zähne."], common: "Es gibt keinen deutschen Laut dafür. Häufige Ersatzlaute sind „s“ (Zunge zu weit hinten) oder „f“. Das englische „th“ in „think“ ist derselbe Laut." },
};

export const UNKNOWN_OPTION = "Weiß ich nicht";
export type Confidence = "sure" | "unsure" | "guess";
export const CONFIDENCE_LABEL: Record<Confidence, string> = { sure: "Ich bin mir sicher", unsure: "Eher vermutet", guess: "Geraten" };
