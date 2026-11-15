import { LETTER_BY_CH, MARKS } from "@/content/letters";

export interface Cluster {
  /** Grundbuchstabe */
  base: string;
  /** Zeichen darüber/darunter (Harakat, Shadda, ...) */
  marks: string[];
  /** komplette Darstellung */
  text: string;
}

const ZW = /[‌‍]/g;

/** Basis-Buchstaben im arabischen Block (inkl. Alif-Wasla, Hamza-Formen). */
export function isBaseLetter(c: string): boolean {
  const cp = c.codePointAt(0)!;
  return (cp >= 0x0621 && cp <= 0x064a) || cp === 0x0671 || cp === 0x06e5 || cp === 0x06e6 || cp === 0x0675;
}

/** Zerlegt arabischen Text in Buchstaben + angehängte Zeichen. */
export function toClusters(text: string): Cluster[] {
  const out: Cluster[] = [];
  for (const c of Array.from(text.replace(ZW, ""))) {
    if (c === " ") continue;
    if (isBaseLetter(c) || out.length === 0) {
      out.push({ base: c, marks: [], text: c });
    } else {
      const last = out[out.length - 1];
      last.marks.push(c);
      last.text += c;
    }
  }
  return out;
}

const NAME = (b: string) => LETTER_BY_CH.get(b)?.name;

/** Verständliche Beschreibung eines Segments für Feedback. */
export function describeCluster(c: Cluster): { title: string; tip: string } {
  const letter = LETTER_BY_CH.get(c.base);
  const markTips = c.marks.map((m) => MARKS[m]?.tip).filter(Boolean) as string[];
  const name = NAME(c.base) ?? "Buchstabe";
  const tips = [letter?.tip, ...markTips].filter(Boolean) as string[];
  return { title: name, tip: tips.join(" ") };
}

const HARAKAT = new Set(["َ", "ُ", "ِ", "ْ", "ۡ", "ّ", "ً", "ٌ", "ٍ", "ٰ", "ٓ"]);

export function lettersOf(text: string): string[] {
  return toClusters(text)
    .map((c) => c.base)
    .filter((b) => LETTER_BY_CH.has(b) || isBaseLetter(b));
}

export function harakatOf(text: string): string[] {
  return toClusters(text).flatMap((c) => c.marks.filter((m) => HARAKAT.has(m)));
}

/** Schwierigkeit: Anzahl besonderer Regeln + Länge. */
export function difficultyOf(text: string): 1 | 2 | 3 {
  const marks = harakatOf(text);
  const special = marks.filter((m) => m === "ّ" || m === "ٰ" || m === "ٓ" || m === "ْ" || m === "ۡ").length;
  const len = toClusters(text).length;
  const score = special + (len > 5 ? 1 : 0) + (len > 8 ? 1 : 0);
  return score <= 1 ? 1 : score <= 3 ? 2 : 3;
}
