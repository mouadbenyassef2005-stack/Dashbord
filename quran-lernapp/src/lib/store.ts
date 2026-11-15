"use client";
import { useCallback, useSyncExternalStore } from "react";
import { DEFAULT_PROGRESS, migrate, type Progress } from "./progress";

const KEY = "qaidah.progress.v1";
let state: Progress = DEFAULT_PROGRESS;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = migrate(JSON.parse(raw));
  } catch {
    /* Storage blockiert/defekt → Standardwerte */
  }
}

function persist() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* privater Modus o. ä. */
  }
}

function subscribe(cb: () => void) {
  load();
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      try { state = e.newValue ? migrate(JSON.parse(e.newValue)) : DEFAULT_PROGRESS; } catch { /* ignorieren */ }
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

const getSnapshot = () => {
  load();
  return state;
};
const getServerSnapshot = () => DEFAULT_PROGRESS;
const noopSub = () => () => undefined;

export function setProgress(fn: (p: Progress) => Progress) {
  load();
  state = fn(state);
  persist();
  listeners.forEach((l) => l());
}

export function resetProgress() {
  state = DEFAULT_PROGRESS;
  persist();
  listeners.forEach((l) => l());
}

/** true erst nach Hydration → verhindert Flackern gespeicherter Inhalte. */
export function useHydrated() {
  return useSyncExternalStore(noopSub, () => true, () => false);
}

export function useProgress() {
  const progress = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hydrated = useHydrated();
  const update = useCallback((fn: (p: Progress) => Progress) => setProgress(fn), []);
  return { progress, hydrated, update };
}
