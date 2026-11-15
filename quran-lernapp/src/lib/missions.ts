import { dayKey, dayOf, todayCount, type Progress } from "./progress";

export interface Mission {
  id: string;
  title: string;
  hint: string;
  progress: number;
  target: number;
  done: boolean;
  href?: string;
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/**
 * Tägliche Missionen: Tagesziel immer, dazu 2 aus 4 – nach Datum festgelegt (stabil über den Tag).
 * Sie belohnen Aktivität und sorgfältiges Üben; es gibt keine Strafen, wenn man sie auslässt.
 */
export function dailyMissions(p: Progress, now = Date.now()): Mission[] {
  const d = dayOf(p, now);
  const all: Mission[] = [
    { id: "firsttry", title: "5 Übungen auf Anhieb richtig", hint: "Lies langsam und genau.", progress: d.firstTry, target: 5, done: false, href: "/pfad" },
    { id: "lesson", title: "Eine Lektion abschließen", hint: "Ein kleiner Schritt auf dem Lernpfad.", progress: d.lessons, target: 1, done: false, href: "/pfad" },
    { id: "personal", title: "3 persönliche Übungen machen", hint: "Zugeschnitten auf deine Fehlerstellen.", progress: d.personal, target: 3, done: false, href: "/lektion/personal" },
    { id: "hard", title: "2 knifflige Übungen meistern", hint: "Etwas, das dir zuvor nicht gelang.", progress: d.hard, target: 2, done: false, href: "/lektion/personal" },
  ];
  const seed = hash(dayKey(now));
  const a = seed % 4;
  const b = (a + 1 + ((seed >> 3) % 3)) % 4;
  const goal: Mission = { id: "goal", title: `Tagesziel: ${p.dailyGoal} Übungen`, hint: "Dein persönliches Tagesziel.", progress: todayCount(p, now), target: p.dailyGoal, done: false, href: "/pfad" };
  return [goal, all[a], all[b]].map((m) => ({ ...m, progress: Math.min(m.progress, m.target), done: m.progress >= m.target }));
}
