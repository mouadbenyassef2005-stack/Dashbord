/**
 * Die 28 Buchstaben in traditioneller Reihenfolge.
 * Gruppen folgen den Formfamilien (Rasm), die Reihenfolge innerhalb und zwischen den Gruppen bleibt traditionell.
 * Deutsche Ausspracheanleitungen sind Lernhilfen und noch nicht von einer Arabisch-Lehrkraft gegengelesen.
 */
export type Dots = { count: 0 | 1 | 2 | 3; pos: "none" | "above" | "below" | "inside" };

export interface Letter {
  id: string;
  ch: string;
  /** Arabischer Buchstabenname, vokalisiert */
  nameAr: string;
  /** Lateinische Umschrift des Namens */
  name: string;
  /** Laut als Konsonant + Fatha (ein Konsonant allein ist nicht sprechbar) */
  syllable: string;
  /** Laut in Worten */
  sound: string;
  tip: string;
  joinsNext: boolean;
  group: number;
  dots: Dots;
  /** Optisch leicht zu verwechselnde Buchstaben (symmetrisch gepflegt, siehe Test) */
  similar: string[];
}

const L = (
  id: string, ch: string, nameAr: string, name: string, syllable: string, sound: string, tip: string,
  joinsNext: boolean, group: number, dots: Dots, similar: string[],
): Letter => ({ id, ch, nameAr, name, syllable, sound, tip, joinsNext, group, dots, similar });

const d = (count: Dots["count"], pos: Dots["pos"]): Dots => ({ count, pos });
const none = d(0, "none");

export const LETTERS: Letter[] = [
  L("alif", "ا", "أَلِف", "Alif", "ā", "Träger / langer Vokal ā", "Alif trägt Vokale und dehnt als Langvokal ein „a“. Als Name sprichst du „Alif“.", false, 1, none, ["lam"]),
  L("ba", "ب", "بَاء", "Bā", "ba", "b", "Wie deutsches „b“, beide Lippen schließen sich kurz.", true, 1, d(1, "below"), ["ta", "tha", "nun", "ya"]),
  L("ta", "ت", "تَاء", "Tā", "ta", "t", "Wie „t“, aber ohne Hauch. Zungenspitze an den oberen Zähnen.", true, 1, d(2, "above"), ["ba", "tha", "nun", "ya"]),
  L("tha", "ث", "ثَاء", "Thā", "tha", "th (stimmlos)", "Zungenspitze leicht zwischen den Zähnen, Luft strömen lassen (wie englisch „think“).", true, 1, d(3, "above"), ["ba", "ta", "nun", "ya"]),
  L("jim", "ج", "جِيم", "Jīm", "ja", "dsch", "Wie „dsch“ in „Dschungel“.", true, 2, d(1, "inside"), ["ha", "kha"]),
  L("ha", "ح", "حَاء", "Ḥā", "ḥa", "ḥ (Rachen-h)", "Ein kräftiges, gehauchtes „h“ tief aus dem Rachen, wie beim Anhauchen einer Brille.", true, 2, none, ["jim", "kha"]),
  L("kha", "خ", "خَاء", "Khā", "kha", "ch", "Wie „ch“ in „Bach“, hinten im Rachen gerieben.", true, 2, d(1, "above"), ["jim", "ha"]),
  L("dal", "د", "دَال", "Dāl", "da", "d", "Wie deutsches „d“.", false, 3, none, ["dhal", "ra", "zay"]),
  L("dhal", "ذ", "ذَال", "Dhāl", "dha", "dh (stimmhaft)", "Zungenspitze zwischen den Zähnen, mit Stimme (wie englisch „this“).", false, 3, d(1, "above"), ["dal", "ra", "zay"]),
  L("ra", "ر", "رَاء", "Rā", "ra", "r (gerollt)", "Mit der Zungenspitze gerolltes „r“.", false, 3, none, ["zay", "dal", "dhal", "waw"]),
  L("zay", "ز", "زَاي", "Zāy", "za", "z (stimmhaftes s)", "Stimmhaftes „s“ wie in „Sonne“.", false, 3, d(1, "above"), ["ra", "dal", "dhal", "waw"]),
  L("sin", "س", "سِين", "Sīn", "sa", "s (scharf)", "Scharfes „s“ wie in „Wasser“.", true, 4, none, ["shin"]),
  L("shin", "ش", "شِين", "Shīn", "sha", "sch", "Wie „sch“ in „Schule“.", true, 4, d(3, "above"), ["sin"]),
  L("sad", "ص", "صَاد", "Ṣād", "ṣa", "ṣ (dunkles s)", "Dunkles, „schweres“ s: Zunge hebt sich nach hinten, der Mund wird rund.", true, 4, none, ["dad"]),
  L("dad", "ض", "ضَاد", "Ḍād", "ḍa", "ḍ (dunkles d)", "Dunkles, „schweres“ d: Zungenrand drückt gegen die oberen Seitenzähne.", true, 4, d(1, "above"), ["sad"]),
  L("tah", "ط", "طَاء", "Ṭā", "ṭa", "ṭ (dunkles t)", "Dunkles, „schweres“ t mit gehobenem Zungenrücken, ohne Hauch.", true, 5, none, ["zah"]),
  L("zah", "ظ", "ظَاء", "Ẓā", "ẓa", "ẓ (dunkles dh)", "Wie „dh“ (ذ), aber dunkel und „schwer“.", true, 5, d(1, "above"), ["tah"]),
  L("ayn", "ع", "عَيْن", "ʿAyn", "ʿa", "ʿ (Kehlkopflaut)", "Gepresster Laut aus der Kehle, kein deutscher Laut. Kehle leicht verengen und Stimme durchlassen.", true, 5, none, ["ghayn"]),
  L("ghayn", "غ", "غَيْن", "Ghayn", "gha", "gh", "Wie ein weiches Gaumen-„r“ (französisches „r“), mit Stimme.", true, 5, d(1, "above"), ["ayn"]),
  L("fa", "ف", "فَاء", "Fā", "fa", "f", "Wie deutsches „f“.", true, 6, d(1, "above"), ["qaf"]),
  L("qaf", "ق", "قَاف", "Qāf", "qa", "q", "Ein „k“ ganz hinten im Hals, tiefer als das normale „k“.", true, 6, d(2, "above"), ["fa"]),
  L("kaf", "ك", "كَاف", "Kāf", "ka", "k", "Wie „k“ im vorderen Mundraum, mit leichtem Hauch.", true, 6, none, ["lam"]),
  L("lam", "ل", "لَام", "Lām", "la", "l", "Wie deutsches „l“.", true, 6, none, ["alif", "kaf"]),
  L("mim", "م", "مِيم", "Mīm", "ma", "m", "Wie deutsches „m“.", true, 7, none, []),
  L("nun", "ن", "نُون", "Nūn", "na", "n", "Wie deutsches „n“.", true, 7, d(1, "above"), ["ba", "ta", "tha", "ya"]),
  L("ha2", "ه", "هَاء", "Hā", "ha", "h", "Leichtes „h“ wie in „Haus“.", true, 7, none, []),
  L("waw", "و", "وَاو", "Wāw", "wa", "w", "Wie englisches „w“, Lippen gerundet.", false, 8, none, ["ra", "zay"]),
  L("ya", "ي", "يَاء", "Yā", "ya", "j / y", "Wie „j“ in „ja“.", true, 8, d(2, "below"), ["ba", "ta", "tha", "nun"]),
];

export const LETTER_BY_ID = new Map(LETTERS.map((l) => [l.id, l]));
export const LETTER_BY_CH = new Map(LETTERS.map((l) => [l.ch, l]));
export const GROUP_COUNT = Math.max(...LETTERS.map((l) => l.group));
export const lettersOfGroup = (g: number) => LETTERS.filter((l) => l.group === g);

const ZWJ = "‍";
export type FormPos = "isolated" | "initial" | "medial" | "final";

/** Kontextformen per Zero-Width-Joiner. Die Darstellung hängt vom Font ab und wird in /specimen geprüft. */
export function formsOf(l: Letter): Record<FormPos, string> {
  return {
    isolated: l.ch,
    initial: l.joinsNext ? l.ch + ZWJ : l.ch,
    medial: l.joinsNext ? ZWJ + l.ch + ZWJ : ZWJ + l.ch,
    final: ZWJ + l.ch,
  };
}

export function dotsText(dots: Dots): string {
  if (dots.count === 0) return "kein Punkt";
  const n = ["", "ein Punkt", "zwei Punkte", "drei Punkte"][dots.count];
  const p = { above: "oben", below: "unten", inside: "im Körper", none: "" }[dots.pos];
  return `${n} ${p}`;
}
