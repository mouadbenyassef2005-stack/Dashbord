"use client";
import { createContext, useCallback, useContext, useEffect, useReducer, useState, type ReactNode } from "react";
import { LS_LESSON, initialLesson, lessonReducer, parseLesson, type Action, type LessonState } from "@/lektion/domain/lektion/state";

interface Ctx { s: LessonState; dispatch(a: Action): void; hydrated: boolean }
const C = createContext<Ctx | null>(null);
export const useLesson = () => {
  const c = useContext(C);
  if (!c) throw new Error("LessonProvider fehlt");
  return c;
};

const read = () => { try { return localStorage.getItem(LS_LESSON); } catch { return null; } };

/**
 * Lektionszustand aus localStorage. Der Server und der erste Client-Render zeigen den Anfangszustand,
 * der gespeicherte Stand wird erst nach dem Mounten geladen (kein Hydration-Fehler).
 * `children` werden erst danach gerendert, damit Zufall und Uhrzeit nie beim Prerender laufen.
 */
export function LessonProvider({ children }: { children: ReactNode }) {
  const [s, d] = useReducer(lessonReducer, 0, () => initialLesson(0));
  const [hydrated, setHydrated] = useState(false);
  // Hydration: gespeicherter Stand wird bewusst erst nach dem Mounten geladen (Server und erster Render sind identisch).
  useEffect(() => {
    d({ t: "load", state: parseLesson(read()) });
    setHydrated(true); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(LS_LESSON, JSON.stringify(s)); } catch { /* ohne Speicher läuft die Lektion weiter */ }
  }, [s, hydrated]);
  const dispatch = useCallback((a: Action) => d(a), []);
  if (!hydrated) return <p role="status" className="text-muted">Wird geladen …</p>;
  return <C.Provider value={{ s, dispatch, hydrated }}>{children}</C.Provider>;
}
