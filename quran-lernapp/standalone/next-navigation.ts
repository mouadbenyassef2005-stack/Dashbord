import { useSyncExternalStore } from "react";

const subscribe = (cb: () => void) => { window.addEventListener("hashchange", cb); return () => window.removeEventListener("hashchange", cb); };
export const currentPath = () => window.location.hash.replace(/^#/, "") || "/";
/** Ersatz für next/navigation im Einzeldatei-Build. */
export const usePathname = () => useSyncExternalStore(subscribe, currentPath, () => "/");
