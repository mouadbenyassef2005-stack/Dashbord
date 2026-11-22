import type { Pt, Stroke } from "./geometry";

/**
 * Referenz für isolierte Formen: Koordinaten in einer 100×100-Box, y nach unten.
 * `body` = Hauptstriche in Schreibrichtung; `dots` = Punktmittelpunkte.
 * ACHTUNG: Selbst entworfene, vereinfachte Skelette. Es gibt keine allgemein verbindliche Strichreihenfolge
 * für Arabisch; fachliche Abnahme steht aus. Der Vergleich ist größen-/positionsunabhängig und tolerant.
 */
export interface Template { letterId: string; body: Stroke[]; dots: Pt[] }

const P = (...xy: number[]): Pt[] => xy.reduce<Pt[]>((a, _, i) => (i % 2 ? a : [...a, { x: xy[i], y: xy[i + 1] }]), []);
const BOWL = P(94, 38, 90, 54, 78, 64, 60, 68, 40, 68, 22, 64, 10, 52, 6, 44); // rechts → links

export const TEMPLATES: Template[] = [
  { letterId: "alif", body: [P(51, 6, 50, 50, 49, 94)], dots: [] },
  { letterId: "ba", body: [BOWL], dots: P(50, 86) },
  { letterId: "ta", body: [BOWL], dots: P(38, 24, 62, 24) },
  { letterId: "tha", body: [BOWL], dots: P(38, 26, 62, 26, 50, 10) },
];
export const TEMPLATE_BY_ID = new Map(TEMPLATES.map((t) => [t.letterId, t]));
