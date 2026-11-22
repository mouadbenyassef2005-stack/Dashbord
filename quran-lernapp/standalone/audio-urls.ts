// Einzeldatei-Build: Aufnahmen werden als Daten-URLs in die HTML-Datei eingebettet.
const files = import.meta.glob("../public/audio/*.m4a", { query: "?url", import: "default", eager: true }) as Record<string, string>;
const byName = Object.fromEntries(Object.entries(files).map(([p, u]) => [p.split("/").pop()!, u]));
export const audioUrl = (file: string) => byName[file] ?? "";
