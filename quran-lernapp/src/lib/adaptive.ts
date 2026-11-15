import { LESSONS, LESSON_INDEX, wordItem } from "@/content/lessons";
import { LETTERS, LETTER_BY_CH } from "@/content/letters";
import { TRANSFER_WORDS } from "@/content/quran";
import type { Lesson, ReadItem } from "@/content/types";
import { toClusters } from "./arabic";
import { dueItemIds, isCompleted, statusOf, topErrors, type Progress } from "./progress";
import { READ_ITEM_BY_ID } from "./review";

export interface PlanItem {
  item: ReadItem;
  reasons: string[];
  score: number;
}

const DAY = 86400000;

/**
 * Adaptive Übungsauswahl. Bewertet jedes bereits geübte (oder als unsicher markierte) Lese-Item:
 * fällig (+4), niedrige Box (+2), Fehlerquote (bis +3), markiert (+5), enthält Fehler-Buchstabe (+2), lange nicht geübt (bis +2).
 * Sicher sitzende Items (Box ≥ 3, nicht fällig, nicht markiert) kommen nicht vor.
 */
export function buildPersonalPlan(p: Progress, size = 8, now = Date.now()): PlanItem[] {
  const due = new Set(dueItemIds(p, now));
  const weak = topErrors(p, 4).map(([k]) => k);
  const ids = new Set([...Object.keys(p.items), ...Object.keys(p.flagged)]);
  const out: PlanItem[] = [];
  for (const id of ids) {
    const item = READ_ITEM_BY_ID.get(id);
    if (!item) continue;
    const st = p.items[id];
    const reasons: string[] = [];
    let score = 0;
    if (p.flagged[id]) { score += 5; reasons.push("Von dir als unsicher markiert"); }
    if (due.has(id)) { score += 4; reasons.push("Zur Wiederholung fällig"); }
    if (st && st.attempts > 0) {
      const rate = st.fails / st.attempts;
      if (rate > 0) { score += Math.min(3, rate * 4); if (rate >= 0.34) reasons.push(`Schwierig: ${st.fails} von ${st.attempts} Versuchen daneben`); }
      if (st.box < 2) score += 2;
      score += Math.min(2, (now - st.lastAt) / (7 * DAY));
    }
    const letters = new Set(toClusters(item.arabic).map((c) => c.base));
    const hits = weak.filter((w) => letters.has(w));
    if (hits.length) { score += 2 * Math.min(2, hits.length); reasons.push(`Enthält Fehlerstelle ${hits.map((h) => LETTER_BY_CH.get(h)?.name ?? h).join(", ")}`); }
    const keep = p.flagged[id] || due.has(id) || (st && st.fails > 0 && st.box < 3) || hits.length > 0 && st && st.box < 3;
    if (keep && score > 0) out.push({ item, reasons: reasons.length ? reasons : ["Zum Festigen"], score });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, size);
}

export function flaggedItems(p: Progress): ReadItem[] {
  return Object.entries(p.flagged)
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => READ_ITEM_BY_ID.get(id))
    .filter((x): x is ReadItem => !!x);
}

/** Buchstaben, die der Nutzer laut Lernstand kennen darf (A-Lektionen oder späterer Einstieg). */
export function knownLetters(p: Progress): Set<string> {
  const startIdx = LESSON_INDEX.get(p.startLessonId) ?? 0;
  const a4 = LESSON_INDEX.get("A4")!;
  if (startIdx > a4 || isCompleted(p, "A4")) return new Set(LETTERS.map((l) => l.ch));
  const set = new Set<string>();
  for (const l of LESSONS.filter((x) => x.unitId === "buchstaben" && (isCompleted(p, x.id) || LESSON_INDEX.get(x.id)! < startIdx)))
    for (const i of l.items) if (i.kind === "read") set.add(i.arabic);
  for (const [id, s] of Object.entries(p.items)) if (id.startsWith("l:") && s.passes > 0) set.add(id.slice(2));
  return set;
}

export interface TransferResult {
  lesson: Lesson | null;
  /** Wenn null: Begründung, was noch fehlt. */
  blocked?: string;
  available: number;
}

/**
 * Transfer: unbekannte Quran-Wörter aus Suren außerhalb des Lernpfads.
 * Nur Wörter, deren Buchstaben der Nutzer kennt; leichtere zuerst; höchstens 6 pro Einheit.
 */
export function buildTransfer(p: Progress, size = 6): TransferResult {
  const harakatDone = isCompleted(p, "C3") || (LESSON_INDEX.get(p.startLessonId) ?? 0) >= LESSON_INDEX.get("C4")!;
  if (!harakatDone) return { lesson: null, available: 0, blocked: "Schließe zuerst die Lektionen zu Fatha, Kasra und Damma ab." };
  const letters = knownLetters(p);
  const diffCap = isCompleted(p, "H1") || isCompleted(p, "W1") ? 3 : 2;
  const pool = TRANSFER_WORDS.filter((w) => w.letters.every((l) => letters.has(l)) && w.difficulty <= diffCap && statusOf(p, `w:${w.id}`) !== "known")
    .sort((a, b) => Number(!!p.items[`w:${a.id}`]) - Number(!!p.items[`w:${b.id}`]) || a.difficulty - b.difficulty || a.letters.length - b.letters.length);
  const picked = pool.slice(0, size);
  if (!picked.length) return { lesson: null, available: 0, blocked: "Keine passenden neuen Wörter mehr – stark! Wiederhole stattdessen deine schwierigen Stellen." };
  return {
    available: pool.length,
    lesson: {
      id: "transfer", stage: 1, unitId: "training", title: "Unbekannte Wörter lesen",
      goal: "Du liest neue Quran-Wörter selbstständig – nur mit dem, was du schon gelernt hast.",
      minutes: Math.max(3, picked.length), 
      intro: {
        title: "Selbstständig lesen",
        body: ["Diese Wörter hast du noch nie geübt. Zerlege sie Zeichen für Zeichen und lies sie dann als Ganzes. Lautschrift ist nur eine Hilfe, versuche es erst ohne.", "Fehler sind hier ausdrücklich erlaubt – so findest du heraus, was noch fehlt."],
      },
      items: picked.map((w) => ({ ...wordItem(w.id) })),
    },
  };
}

export function buildPersonalLesson(p: Progress, now = Date.now()): Lesson | null {
  const plan = buildPersonalPlan(p, 8, now);
  if (!plan.length) return null;
  return {
    id: "personal", stage: 1, unitId: "training", title: "Persönliche Übung",
    goal: "Du übst genau die Stellen, die bei dir noch nicht sicher sitzen.",
    minutes: Math.max(2, Math.round(plan.length * 0.5)),
    intro: {
      title: "Für dich ausgewählt",
      body: ["Diese Übungen sind nach deinem bisherigen Lesen zusammengestellt:", ...plan.map((x, i) => `${i + 1}. ${x.item.arabic}  –  ${x.reasons[0]}`)],
    },
    items: plan.map((x) => ({ ...x.item, prompt: x.reasons[0] })),
  };
}

export function buildFlaggedLesson(p: Progress): Lesson | null {
  const items = flaggedItems(p).slice(0, 10);
  if (!items.length) return null;
  return {
    id: "flagged", stage: 1, unitId: "training", title: "Unsichere Stellen",
    goal: "Du festigst alles, was du selbst als unsicher markiert hast.",
    minutes: Math.max(2, Math.round(items.length * 0.5)),
    intro: { title: "Deine Markierungen", body: ["Hier übst du, was du als unsicher markiert hast. Sobald etwas sicher sitzt, verschwindet die Markierung von selbst."] },
    items: items.map((i) => ({ ...i, prompt: "Von dir als unsicher markiert" })),
  };
}

export function buildDynamic(kind: string, p: Progress): Lesson | null {
  if (kind === "personal" || kind === "review") return buildPersonalLesson(p);
  if (kind === "flagged") return buildFlaggedLesson(p);
  if (kind === "transfer") return buildTransfer(p).lesson;
  return null;
}
export const DYNAMIC_IDS = ["personal", "review", "flagged", "transfer"];
