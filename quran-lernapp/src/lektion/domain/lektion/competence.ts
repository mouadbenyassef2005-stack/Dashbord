import { DAY, retrievability } from "../scheduler";
import type { MemoryState } from "../types";

/**
 * Sieben wiederholbare Kompetenzen. Jede wird pro Lern-Item getrennt geplant: Ein Erfolg beim Erkennen (visual)
 * erhöht nie die Stabilität des Hörens (listen) oder Lesens (syllable).
 */
export const COMPETENCES = ["visual", "sound", "listen", "vowel", "syllable", "word", "write"] as const;
export type Competence = (typeof COMPETENCES)[number];

export const COMPETENCE_LABEL: Record<Competence, string> = {
  visual: "Erkennen und Unterscheiden",
  sound: "Laut und Schrift zuordnen",
  listen: "Laute hören und unterscheiden",
  vowel: "Vokalzeichen",
  syllable: "Silben lesen",
  word: "Wörter lesen",
  write: "Schreiben",
};

export type AreaId = "visual" | "phonological" | "motor" | "decoding";
/** Die vier Kompetenzbereiche werden nie zu einem Gesamtwert verrechnet. */
export const AREAS: { id: AreaId; title: string; question: string; comps: Competence[] }[] = [
  { id: "visual", title: "Visuell", question: "Ich erkenne und unterscheide Zeichen.", comps: ["visual"] },
  { id: "phonological", title: "Phonologisch", question: "Ich höre Laute und ordne sie der Schrift zu.", comps: ["sound", "listen"] },
  { id: "motor", title: "Motorisch", question: "Ich schreibe Buchstaben selbst.", comps: ["write"] },
  { id: "decoding", title: "Dekodieren", question: "Ich lese Vokalzeichen, Silben und Wörter.", comps: ["vowel", "syllable", "word"] },
];

export const srsKey = (itemId: string, c: Competence) => `${itemId}|${c}`;
export const parseSrsKey = (k: string) => { const [itemId, c] = k.split("|"); return { itemId, competence: c as Competence }; };

export interface LogEntry {
  key: string;
  itemId: string;
  competence: Competence;
  ts: number;
  grade: number;
  correct: boolean;
  unit: number;
  phase: number;
  /** Stabilität (Tage) laut Modell nach dieser Wiederholung */
  stability: number;
  ms?: number;
}

export type Level = "none" | "unsure" | "understood" | "consolidated";
export const LEVEL_LABEL: Record<Level, string> = { none: "Noch nicht geübt", unsure: "Noch unsicher", understood: "Verstanden", consolidated: "Gefestigt" };
export const LEVEL_HELP: Record<Level, string> = {
  none: "Dazu gibt es noch keine Antwort von dir.",
  unsure: "Dein letzter Versuch war falsch oder es gibt erst einen richtigen Nachweis.",
  understood: "Mindestens zwei richtige Antworten, zuletzt richtig. Noch nicht über Tage bestätigt.",
  consolidated: "Mindestens drei richtige Antworten an mindestens zwei verschiedenen Tagen, Stabilität laut Modell ab 6 Tagen.",
};

/**
 * Stand einer einzelnen Kompetenz eines Items aus echten Antworten. Regeln sind didaktische Startwerte, nicht kalibriert.
 */
export function levelOf(entries: LogEntry[], mem: MemoryState | undefined): Level {
  if (!entries.length) return "none";
  const e = [...entries].sort((a, b) => a.ts - b.ts);
  const last = e[e.length - 1];
  if (!last.correct) return "unsure";
  const correct = e.filter((x) => x.correct);
  const recent = e.slice(-3);
  const recentAcc = recent.filter((x) => x.correct).length / recent.length;
  const days = new Set(correct.map((x) => Math.floor(x.ts / DAY))).size;
  if (correct.length >= 3 && days >= 2 && (mem?.stability ?? 0) >= 6 && recentAcc >= 2 / 3) return "consolidated";
  if (correct.length >= 2 && recentAcc >= 2 / 3) return "understood";
  return "unsure";
}

export type LevelCounts = Record<Level, number>;
export interface AreaSummary { id: AreaId; counts: LevelCounts; total: number; byComp: Record<string, LevelCounts> }

const empty = (): LevelCounts => ({ none: 0, unsure: 0, understood: 0, consolidated: 0 });

/** Zählt Items je Stufe. `keys` sind die geplanten Schlüssel (item|kompetenz), die zum Bereich gehören. */
export function summarize(log: LogEntry[], srs: Record<string, MemoryState>, now = Date.now()): AreaSummary[] {
  void now;
  const byKey = new Map<string, LogEntry[]>();
  for (const e of log) byKey.set(e.key, [...(byKey.get(e.key) ?? []), e]);
  return AREAS.map((a) => {
    const counts = empty();
    const byComp: Record<string, LevelCounts> = {};
    for (const c of a.comps) byComp[c] = empty();
    for (const [key, entries] of byKey) {
      const { competence } = parseSrsKey(key);
      if (!a.comps.includes(competence)) continue;
      const lv = levelOf(entries, srs[key]);
      counts[lv]++; byComp[competence][lv]++;
    }
    return { id: a.id, counts, total: Object.values(counts).reduce((x, y) => x + y, 0), byComp };
  });
}

/** Modellschätzung der Abrufwahrscheinlichkeit. KEINE gemessene individuelle Wahrscheinlichkeit. */
export const estimatedRecall = (m: MemoryState, now: number) => retrievability(m, now);

/**
 * Merkhilfen werden abgebaut: 1 = Bild + Merkhilfe, 2 = nur Stichwort, 3 = keine Merkhilfe, 4 = Erkennung im Kontext.
 * Stufe richtet sich nach richtigen visuellen Antworten zu diesem Buchstaben.
 */
export type MnemonicStage = 1 | 2 | 3 | 4;
export function mnemonicStage(log: LogEntry[], letterId: string): MnemonicStage {
  const ok = log.filter((e) => e.itemId === `letter:${letterId}` && e.competence === "visual" && e.correct).length;
  return ok >= 6 ? 4 : ok >= 4 ? 3 : ok >= 2 ? 2 : 1;
}
export const MNEMONIC_STAGE_LABEL: Record<MnemonicStage, string> = {
  1: "Merkhilfe und Bild", 2: "Nur Stichwort", 3: "Ohne Merkhilfe", 4: "Erkennung im Kontext",
};

/* ---------- Verwechslungen ---------- */
export interface Confusion { a: string; b: string; count: number; resolved: boolean; lastAt: number }
export const pairKey = (a: string, b: string) => [a, b].sort().join("~");
export const CONFUSION_THRESHOLD = 2;
export const isActive = (c: Confusion) => !c.resolved && c.count >= CONFUSION_THRESHOLD;
