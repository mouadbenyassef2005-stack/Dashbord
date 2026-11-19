import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { buildProgress, type Progress } from "@/domain/progress";
import type { ReviewEvent } from "@/domain/types";
import { openEventStore, type EventStore } from "@/persistence/eventStore";

type Theme = "dark" | "light";
interface Ctx {
  status: "loading" | "ready" | "error";
  persistent: boolean;
  events: ReviewEvent[];
  progress: Progress;
  introduced: Set<string>;
  theme: Theme;
  setTheme(t: Theme): void;
  record(e: Omit<ReviewEvent, "id" | "ts">): Promise<boolean>;
  introduce(letterId: string): void;
  store: EventStore | null;
  reload(): Promise<void>;
  resetAll(): Promise<void>;
}
const AppCtx = createContext<Ctx | null>(null);
export const useApp = () => {
  const c = useContext(AppCtx);
  if (!c) throw new Error("AppProvider fehlt");
  return c;
};

const LS_INTRO = "qaidah.introduced";
const LS_THEME = "qaidah.theme";
const ls = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* optional */ } },
  del: (k: string) => { try { localStorage.removeItem(k); } catch { /* optional */ } },
};
const uid = () => (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);

export function AppProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<EventStore | null>(null);
  const [events, setEvents] = useState<ReviewEvent[]>([]);
  const [status, setStatus] = useState<Ctx["status"]>("loading");
  const [introduced, setIntroduced] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(ls.get(LS_INTRO) ?? "[]") as string[]); } catch { return new Set(); }
  });
  const [theme, setThemeState] = useState<Theme>(() => (ls.get(LS_THEME) === "light" ? "light" : "dark"));

  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);

  const load = useCallback(async () => {
    try {
      const s = await openEventStore();
      setStore(s);
      setEvents(await s.all());
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const progress = useMemo(() => buildProgress(events), [events]);

  const record: Ctx["record"] = useCallback(async (e) => {
    const full: ReviewEvent = { ...e, id: uid(), ts: Date.now() };
    setEvents((prev) => [...prev, full]);
    try { await store?.append(full); return true; } catch { return false; }
  }, [store]);

  const introduce = useCallback((id: string) => {
    setIntroduced((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev).add(id);
      ls.set(LS_INTRO, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const value: Ctx = {
    status, persistent: store?.persistent ?? false, events, progress, introduced, theme, store,
    setTheme: (t) => { setThemeState(t); ls.set(LS_THEME, t); },
    record, introduce, reload: load,
    resetAll: async () => { await store?.clear(); ls.del(LS_INTRO); setIntroduced(new Set()); setEvents([]); },
  };
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
