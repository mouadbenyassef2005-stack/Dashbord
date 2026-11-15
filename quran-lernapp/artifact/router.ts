import { useSyncExternalStore } from "react";

/** Pfad ("/pfad", "/lektion/A1") ↔ Hash ("#pfad", "#lektion-A1"): nur Buchstaben, Ziffern, Bindestriche. */
export const toHash = (path: string) => {
  const p = path.replace(/^\/+|\/+$/g, "");
  return p === "" ? "start" : p.replace(/\//g, "-");
};
export const fromHash = (hash: string) => {
  const h = hash.replace(/^#/, "");
  if (!h || h === "start") return "/";
  return "/" + h.replace(/^lektion-/, "lektion/");
};
const subs = new Set<() => void>();
let path = typeof location !== "undefined" ? fromHash(location.hash) : "/";
const sync = () => { path = fromHash(location.hash); subs.forEach((f) => f()); try { window.scrollTo(0, 0); } catch { /* egal */ } };
if (typeof window !== "undefined") window.addEventListener("hashchange", sync);
export function navigate(p: string) {
  const h = toHash(p);
  if (location.hash.replace(/^#/, "") === h) return;
  location.hash = h;
  sync();
}
export const usePath = () => useSyncExternalStore((cb) => (subs.add(cb), () => subs.delete(cb)), () => path, () => "/");
