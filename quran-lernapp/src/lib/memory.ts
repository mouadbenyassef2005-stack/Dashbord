import { LETTER_BY_CH, formsOf } from "@/content/letters";
import { rng } from "./quiz";

export type MemoryMode = "name" | "form";

export interface Card {
  id: number;
  /** Buchstabe, zu dem die Karte gehört (Paarschlüssel) */
  key: string;
  face: string;
  /** arabische Darstellung (true) oder Text (false) */
  arabic: boolean;
}

export interface MemoryState {
  cards: Card[];
  open: number[];
  matched: string[];
  moves: number;
  /** Buchstaben, bei denen es mindestens einen Fehlgriff gab */
  missed: string[];
  /** Buchstaben, die beim ersten Aufdecken des Paares passten */
  clean: string[];
}

export function createDeck(letters: string[], mode: MemoryMode, seed = Date.now()): Card[] {
  const r = rng(seed);
  const cards: Card[] = [];
  letters.forEach((ch) => {
    const l = LETTER_BY_CH.get(ch)!;
    const f = formsOf(l);
    cards.push({ id: 0, key: ch, face: ch, arabic: true });
    cards.push({ id: 0, key: ch, face: mode === "name" ? l.name : l.joinsNext ? f.final : f.initial, arabic: mode === "form" });
  });
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards.map((c, i) => ({ ...c, id: i }));
}

export const newGame = (cards: Card[]): MemoryState => ({ cards, open: [], matched: [], moves: 0, missed: [], clean: [] });

/** Karte aufdecken. Bei zwei offenen Karten wird sofort ausgewertet; Fehlgriffe bleiben bis `closeMismatch` sichtbar. */
export function flip(s: MemoryState, idx: number): MemoryState {
  const card = s.cards[idx];
  if (!card || s.open.length >= 2 || s.open.includes(idx) || s.matched.includes(card.key)) return s;
  const open = [...s.open, idx];
  if (open.length < 2) return { ...s, open };
  const [a, b] = open.map((i) => s.cards[i]);
  const moves = s.moves + 1;
  if (a.key === b.key) {
    const clean = s.missed.includes(a.key) ? s.clean : [...s.clean, a.key];
    return { ...s, open: [], matched: [...s.matched, a.key], moves, clean };
  }
  const missed = Array.from(new Set([...s.missed, a.key, b.key]));
  return { ...s, open, moves, missed };
}

export const isMismatch = (s: MemoryState) => s.open.length === 2 && s.cards[s.open[0]].key !== s.cards[s.open[1]].key;
export const closeMismatch = (s: MemoryState): MemoryState => ({ ...s, open: [] });
export const isWon = (s: MemoryState) => s.matched.length * 2 === s.cards.length;
