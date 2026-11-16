import { LESSONS, wordItem } from "@/content/lessons";
import { TRANSFER_WORDS, WORDS } from "@/content/quran";
import type { Lesson, ReadItem } from "@/content/types";
import { dueItemIds, type Progress } from "./progress";

export const READ_ITEM_BY_ID = new Map<string, ReadItem>([
  ...LESSONS.flatMap((l) => l.items.filter((i): i is ReadItem => i.kind === "read").map((i) => [i.id, i] as const)),
  ...TRANSFER_WORDS.map((w) => [`w:${w.id}`, wordItem(w.id)] as const),
  // Wörter aus dem Live-Lesemodus (Sure 85): falsch gelesene Wörter lassen sich als Übung wiederholen
  ...WORDS.filter((w) => w.surah === 85).map((w) => [`w:${w.id}`, wordItem(w.id)] as const),
]);

/** Fällige/problematische Lese-Items als Wiederholungs-Lektion (max. 8). */
export function buildReview(p: Progress, now = Date.now()): Lesson | null {
  const ids = dueItemIds(p, now).filter((id) => READ_ITEM_BY_ID.has(id)).slice(0, 8);
  if (!ids.length) return null;
  return {
    id: "review",
    stage: 1,
    unitId: "review",
    title: "Wiederholung",
    goal: "Du festigst, was dir noch nicht sicher gelingt.",
    minutes: Math.max(2, Math.round(ids.length * 0.5)),
    intro: { title: "Kurze Wiederholung", body: ["Diese Übungen sind fällig oder waren zuletzt schwierig. Wiederholen festigt das Gelernte."] },
    items: ids.map((id) => READ_ITEM_BY_ID.get(id)!),
  };
}
