export interface Letter {
  ch: string;
  name: string; // Lernhilfe: Buchstabenname
  sound: string; // Laut in Worten
  tip: string; // Ausspracheanleitung (DE)
  /** verbindet sich mit dem folgenden Buchstaben */
  joinsNext: boolean;
}

const ZWJ = "‍";

export const LETTERS: Letter[] = [
  { ch: "ا", name: "Alif", sound: "Träger / langer Vokal", tip: "Alif ist ein Träger für Vokale. Als Buchstabenname sprichst du „Alif“.", joinsNext: false },
  { ch: "ب", name: "Bā", sound: "b", tip: "Wie deutsches „b“, beide Lippen schließen sich kurz.", joinsNext: true },
  { ch: "ت", name: "Tā", sound: "t", tip: "Wie „t“, aber ohne Hauch. Zungenspitze an den oberen Zähnen.", joinsNext: true },
  { ch: "ث", name: "Thā", sound: "th (stimmlos)", tip: "Zungenspitze leicht zwischen die Zähne, Luft strömen lassen (wie englisch „think“).", joinsNext: true },
  { ch: "ج", name: "Jīm", sound: "dsch", tip: "Wie „dsch“ in „Dschungel“.", joinsNext: true },
  { ch: "ح", name: "Ḥā", sound: "ḥ (Rachen-h)", tip: "Ein kräftiges, gehauchtes „h“ tief aus dem Rachen – wie beim Anhauchen einer Brille.", joinsNext: true },
  { ch: "خ", name: "Khā", sound: "ch", tip: "Wie „ch“ in „Bach“, hinten im Rachen gerieben.", joinsNext: true },
  { ch: "د", name: "Dāl", sound: "d", tip: "Wie deutsches „d“.", joinsNext: false },
  { ch: "ذ", name: "Dhāl", sound: "dh (stimmhaft)", tip: "Zungenspitze zwischen den Zähnen, mit Stimme (wie englisch „this“).", joinsNext: false },
  { ch: "ر", name: "Rā", sound: "r (gerollt)", tip: "Mit der Zungenspitze gerolltes „r“.", joinsNext: false },
  { ch: "ز", name: "Zāy", sound: "s (stimmhaft)", tip: "Stimmhaftes „s“ wie in „Sonne“.", joinsNext: false },
  { ch: "س", name: "Sīn", sound: "s (scharf)", tip: "Scharfes „s“ wie in „Wasser“.", joinsNext: true },
  { ch: "ش", name: "Shīn", sound: "sch", tip: "Wie „sch“ in „Schule“.", joinsNext: true },
  { ch: "ص", name: "Ṣād", sound: "ṣ (dunkles s)", tip: "Dunkles, „schweres“ s: Zunge hebt sich nach hinten, der Mund wird rund.", joinsNext: true },
  { ch: "ض", name: "Ḍād", sound: "ḍ (dunkles d)", tip: "Dunkles, „schweres“ d: Zungenrand drückt gegen die oberen Seitenzähne.", joinsNext: true },
  { ch: "ط", name: "Ṭā", sound: "ṭ (dunkles t)", tip: "Dunkles, „schweres“ t mit gehobenem Zungenrücken, ohne Hauch.", joinsNext: true },
  { ch: "ظ", name: "Ẓā", sound: "ẓ (dunkles dh)", tip: "Wie „dh“ (ذ), aber dunkel und „schwer“.", joinsNext: true },
  { ch: "ع", name: "ʿAyn", sound: "ʿ (Kehlkopflaut)", tip: "Ein gepresster Laut aus der Kehle – kein deutscher Laut. Kehle leicht verengen und Stimme durchlassen.", joinsNext: true },
  { ch: "غ", name: "Ghayn", sound: "gh", tip: "Wie ein weiches Gaumen-„r“ (französisches „r“), mit Stimme.", joinsNext: true },
  { ch: "ف", name: "Fā", sound: "f", tip: "Wie deutsches „f“.", joinsNext: true },
  { ch: "ق", name: "Qāf", sound: "q", tip: "Ein „k“ ganz hinten im Hals gebildet, tiefer als das normale „k“.", joinsNext: true },
  { ch: "ك", name: "Kāf", sound: "k", tip: "Wie „k“ im vorderen Mundraum, mit leichtem Hauch.", joinsNext: true },
  { ch: "ل", name: "Lām", sound: "l", tip: "Wie deutsches „l“.", joinsNext: true },
  { ch: "م", name: "Mīm", sound: "m", tip: "Wie deutsches „m“.", joinsNext: true },
  { ch: "ن", name: "Nūn", sound: "n", tip: "Wie deutsches „n“.", joinsNext: true },
  { ch: "ه", name: "Hā", sound: "h", tip: "Leichtes „h“ wie in „Haus“.", joinsNext: true },
  { ch: "و", name: "Wāw", sound: "w", tip: "Wie englisches „w“, Lippen gerundet.", joinsNext: false },
  { ch: "ي", name: "Yā", sound: "j / y", tip: "Wie „j“ in „ja“.", joinsNext: true },
];

export const LETTER_BY_CH = new Map(LETTERS.map((l) => [l.ch, l]));

/** Buchstabenformen (isoliert, Anfang, Mitte, Ende) via Zero-Width-Joiner. */
export function formsOf(l: Letter) {
  return {
    isolated: l.ch,
    initial: l.joinsNext ? l.ch + ZWJ : l.ch,
    medial: l.joinsNext ? ZWJ + l.ch + ZWJ : ZWJ + l.ch,
    final: ZWJ + l.ch,
  };
}

export interface Mark {
  ch: string;
  name: string;
  tip: string;
  /** Anzeige-Trägerzeichen */
  sample: string;
}

export const MARKS: Record<string, Mark> = {
  "َ": { ch: "َ", name: "Fatha", tip: "Fatha: kurzer „a“-Laut.", sample: "بَ" },
  "ِ": { ch: "ِ", name: "Kasra", tip: "Kasra: kurzer „i“-Laut.", sample: "بِ" },
  "ُ": { ch: "ُ", name: "Damma", tip: "Damma: kurzer „u“-Laut.", sample: "بُ" },
  "ْ": { ch: "ْ", name: "Sukoon", tip: "Sukoon: der Buchstabe hat keinen Vokal und wird „stumm“ an den vorherigen gebunden.", sample: "بْ" },
  "ۡ": { ch: "ۡ", name: "Sukoon", tip: "Sukoon (Uthmani-Form): kein Vokal – der Buchstabe wird ohne Vokal gesprochen.", sample: "بۡ" },
  "ّ": { ch: "ّ", name: "Shadda", tip: "Shadda: der Buchstabe wird verdoppelt – kurz anhalten, dann nachdrücken.", sample: "بّ" },
  "ً": { ch: "ً", name: "Tanwin Fath", tip: "Tanwin Fath: Endung „-an“.", sample: "بً" },
  "ٌ": { ch: "ٌ", name: "Tanwin Damm", tip: "Tanwin Damm: Endung „-un“.", sample: "بٌ" },
  "ٍ": { ch: "ٍ", name: "Tanwin Kasr", tip: "Tanwin Kasr: Endung „-in“.", sample: "بٍ" },
  "ٰ": { ch: "ٰ", name: "Hochgestelltes Alif", tip: "Hochgestelltes Alif: lange „ā“-Dehnung (zwei Zählzeiten).", sample: "بٰ" },
  "ٓ": { ch: "ٓ", name: "Madd-Zeichen", tip: "Madd-Zeichen: der Laut wird länger gedehnt.", sample: "آ" },
};

/** Lateinische Lautwerte der Konsonanten für Silben-Hinweise. */
export const LATIN: Record<string, string> = {
  ب: "b", ت: "t", ث: "th", ج: "j", ح: "ḥ", خ: "kh", د: "d", ذ: "dh", ر: "r", ز: "z", س: "s", ش: "sh",
  ص: "ṣ", ض: "ḍ", ط: "ṭ", ظ: "ẓ", ع: "ʿ", غ: "gh", ف: "f", ق: "q", ك: "k", ل: "l", م: "m", ن: "n", ه: "h",
  و: "w", ي: "y", ا: "ʾ",
};

export const FATHA = "َ";
export const KASRA = "ِ";
export const DAMMA = "ُ";
export const SUKOON = "ۡ";
export const SHADDA = "ّ";
export const VOWEL_LATIN: Record<string, string> = { [FATHA]: "a", [KASRA]: "i", [DAMMA]: "u" };
