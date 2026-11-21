import { createContext, useCallback, useContext, useEffect, useReducer, type ReactNode } from "react";
import { LS_LESSON, lessonReducer, parseLesson, type Action, type LessonState } from "@/domain/lektion/state";

interface Ctx { s: LessonState; dispatch(a: Action): void }
const C = createContext<Ctx | null>(null);
export const useLesson = () => {
  const c = useContext(C);
  if (!c) throw new Error("LessonProvider fehlt");
  return c;
};

const read = () => { try { return localStorage.getItem(LS_LESSON); } catch { return null; } };

export function LessonProvider({ children }: { children: ReactNode }) {
  const [s, d] = useReducer(lessonReducer, undefined, () => parseLesson(read()));
  useEffect(() => { try { localStorage.setItem(LS_LESSON, JSON.stringify(s)); } catch { /* ohne Speicher läuft die Lektion weiter */ } }, [s]);
  const dispatch = useCallback((a: Action) => d(a), []);
  return <C.Provider value={{ s, dispatch }}>{children}</C.Provider>;
}
