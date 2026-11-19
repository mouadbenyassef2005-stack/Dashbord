import { SKILLS, type ReviewEvent } from "@/domain/types";

/**
 * Append-only Ereignislog in IndexedDB. Fällt IndexedDB aus (privater Modus, blockiert), läuft die App
 * mit einem Speicher-Log weiter und meldet `persistent: false`, damit die UI es ehrlich anzeigen kann.
 */
export interface EventStore {
  readonly persistent: boolean;
  all(): Promise<ReviewEvent[]>;
  append(e: ReviewEvent): Promise<void>;
  clear(): Promise<void>;
  /** Import mit Validierung; gibt Anzahl neu übernommener Ereignisse zurück (Duplikate per id ignoriert). */
  importEvents(raw: unknown): Promise<number>;
}

const DB = "qaidah";
const STORE = "events";

export function isReviewEvent(x: unknown): x is ReviewEvent {
  if (!x || typeof x !== "object") return false;
  const e = x as Record<string, unknown>;
  return typeof e.id === "string" && typeof e.ts === "number" && Number.isFinite(e.ts) &&
    typeof e.letterId === "string" && typeof e.activity === "string" &&
    (SKILLS as readonly string[]).includes(e.skill as string) &&
    [0, 1, 2, 3].includes(e.grade as number) &&
    ["recognition", "recall", "production", "self"].includes(e.evidence as string) &&
    (e.confusedWith === undefined || typeof e.confusedWith === "string");
}

export function memoryStore(): EventStore {
  let log: ReviewEvent[] = [];
  return {
    persistent: false,
    all: async () => [...log],
    append: async (e) => { log.push(e); },
    clear: async () => { log = []; },
    importEvents: async (raw) => {
      const list = Array.isArray(raw) ? raw.filter(isReviewEvent) : [];
      const have = new Set(log.map((e) => e.id));
      const fresh = list.filter((e) => !have.has(e.id));
      log.push(...fresh);
      return fresh.length;
    },
  };
}

const wrap = <T,>(r: IDBRequest<T>) => new Promise<T>((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });

export async function openEventStore(idb: IDBFactory | undefined = globalThis.indexedDB): Promise<EventStore> {
  if (!idb) return memoryStore();
  try {
    const db = await new Promise<IDBDatabase>((res, rej) => {
      const req = idb.open(DB, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "id" });
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
      req.onblocked = () => rej(new Error("blocked"));
    });
    const tx = (mode: IDBTransactionMode) => db.transaction(STORE, mode).objectStore(STORE);
    return {
      persistent: true,
      all: async () => ((await wrap(tx("readonly").getAll())) as ReviewEvent[]).filter(isReviewEvent),
      append: async (e) => { await wrap(tx("readwrite").put(e)); },
      clear: async () => { await wrap(tx("readwrite").clear()); },
      importEvents: async (raw) => {
        const list = Array.isArray(raw) ? raw.filter(isReviewEvent) : [];
        const have = new Set(((await wrap(tx("readonly").getAllKeys())) as string[]));
        const fresh = list.filter((e) => !have.has(e.id));
        const store = tx("readwrite");
        await Promise.all(fresh.map((e) => wrap(store.put(e))));
        return fresh.length;
      },
    };
  } catch {
    return memoryStore();
  }
}

export const exportJson = (events: ReviewEvent[]) =>
  JSON.stringify({ app: "qaidah", version: 1, exportedAt: new Date().toISOString(), events }, null, 2);

export function parseExport(text: string): { ok: true; events: unknown[] } | { ok: false; error: string } {
  try {
    const j = JSON.parse(text);
    if (j?.app !== "qaidah" || !Array.isArray(j.events)) return { ok: false, error: "Das ist keine QAIDAH-Sicherung." };
    return { ok: true, events: j.events };
  } catch {
    return { ok: false, error: "Die Datei ist kein gültiges JSON." };
  }
}
