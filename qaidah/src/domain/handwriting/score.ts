import { bbox, chamfer, normalize, pathLength, resampleCloud, type Pt, type Stroke } from "./geometry";
import { TEMPLATES, TEMPLATE_BY_ID, type Template } from "./templates";

/** Schwellen: Startwerte, per Kalibrierung an Probenmaterial zu prüfen (siehe tests/handwriting.test.ts und #/labor). */
export const TH = {
  good: 0.07, near: 0.12,        // Chamfer-Distanz der Körperform (normiert)
  dotStrokeRatio: 0.3,           // Strich < 30 % der längsten Strichlänge zählt als Punkt
  minExtent: 0.25,               // Zeichnung muss mind. 25 % der Zeichenfläche einnehmen
  reversedCos: -0.3,
  margin: 0.04,                  // Freies Schreiben: Abstand zur zweitbesten Hypothese
};

export interface Split { body: Stroke[]; dots: Pt[] }

/** Trennt Körperstriche von Punkten (kurze Striche). */
export function splitStrokes(strokes: Stroke[]): Split {
  const valid = strokes.filter((s) => s.length > 0);
  if (!valid.length) return { body: [], dots: [] };
  const lens = valid.map(pathLength);
  const max = Math.max(...lens);
  const body: Stroke[] = [], dots: Pt[] = [];
  valid.forEach((s, i) => {
    if (valid.length > 1 && lens[i] < TH.dotStrokeRatio * max) {
      const b = bbox(s); dots.push({ x: b.cx, y: b.cy });
    } else body.push(s);
  });
  return { body, dots };
}

const bodyCloud = (body: Stroke[]) => normalize(resampleCloud(body, 64));
export const shapeDistance = (body: Stroke[], t: Template) => body.length ? chamfer(bodyCloud(body), bodyCloud(t.body)) : Infinity;

const dotPositions = (dots: Pt[], body: Stroke[]) => {
  const c = bbox(body.flat()).cy;
  return dots.map((d) => (d.y < c ? "above" : "below"));
};

export type DotLevel = "ok" | "missing" | "extra" | "wrongPlace";
export interface WritingResult {
  empty: boolean;
  tooSmall: boolean;
  shape: { distance: number; level: "good" | "near" | "off" };
  dots: { expected: number; found: number; level: DotLevel };
  direction: "ok" | "reversed" | "unknown";
  grade: 0 | 1 | 2;
  messages: string[];
}

const cos = (a: Pt, b: Pt) => (a.x * b.x + a.y * b.y) / ((Math.hypot(a.x, a.y) * Math.hypot(b.x, b.y)) || 1);
const vec = (s: Stroke): Pt => ({ x: s[s.length - 1].x - s[0].x, y: s[s.length - 1].y - s[0].y });

/** Prüft Striche gegen ein Template: Form, Punkte (Anzahl/Lage), Richtung. `area` = Kantenlänge der Zeichenfläche. */
export function analyze(strokes: Stroke[], t: Template, area: number): WritingResult {
  const { body, dots } = splitStrokes(strokes);
  const base: WritingResult = {
    empty: body.length === 0, tooSmall: false, shape: { distance: Infinity, level: "off" },
    dots: { expected: t.dots.length, found: dots.length, level: "ok" }, direction: "unknown", grade: 0, messages: [],
  };
  if (base.empty) return { ...base, messages: ["Noch nichts gezeichnet."] };
  const all = strokes.flat();
  const ext = bbox(all);
  if (Math.max(ext.w, ext.h) < TH.minExtent * area) return { ...base, tooSmall: true, messages: ["Zu klein – schreibe größer, damit man die Form erkennt."] };

  const distance = shapeDistance(body, t);
  const level = distance <= TH.good ? "good" : distance <= TH.near ? "near" : "off";

  let dotLevel: DotLevel = "ok";
  if (dots.length < t.dots.length) dotLevel = "missing";
  else if (dots.length > t.dots.length) dotLevel = "extra";
  else if (t.dots.length) {
    const want = dotPositions(t.dots, t.body).sort().join();
    const got = dotPositions(dots, body).sort().join();
    if (want !== got) dotLevel = "wrongPlace";
  }

  let direction: WritingResult["direction"] = "unknown";
  if (body.length === t.body.length) {
    const nb = body.map((s) => s.length > 1 ? vec(s) : { x: 0, y: 0 });
    const c = nb.map((v, i) => cos(v, vec(t.body[i])));
    direction = c.every((x) => x > TH.reversedCos) ? "ok" : "reversed";
  }

  const messages: string[] = [];
  if (level === "off") messages.push("Die Grundform weicht noch deutlich ab. Schau dir die Vorlage an.");
  if (level === "near") messages.push("Die Form passt ungefähr. Etwas ruhiger und genauer.");
  if (direction === "reversed") messages.push("Schreibrichtung beachten: Arabisch schreibt man von rechts nach links; das Alif von oben nach unten.");

  let grade: 0 | 1 | 2 = level === "good" ? 2 : level === "near" ? 1 : 0;
  if (dotLevel !== "ok") grade = 0;
  if (direction === "reversed") grade = Math.min(grade, 1) as 0 | 1;
  return { ...base, shape: { distance, level }, dots: { expected: t.dots.length, found: dots.length, level: dotLevel }, direction, grade, messages };
}

export interface Candidate { letterId: string; cost: number; shape: number }

/** Freies Schreiben: Rangfolge über Körperform + Punktanzahl/-lage. */
export function rank(strokes: Stroke[], templates: Template[] = TEMPLATES): Candidate[] {
  const { body, dots } = splitStrokes(strokes);
  return templates.map((t) => {
    const shape = shapeDistance(body, t);
    let cost = shape + 0.12 * Math.abs(dots.length - t.dots.length);
    if (dots.length === t.dots.length && dots.length && body.length) {
      if (dotPositions(dots, body).sort().join() !== dotPositions(t.dots, t.body).sort().join()) cost += 0.1;
    }
    return { letterId: t.letterId, cost, shape };
  }).sort((a, b) => a.cost - b.cost);
}

export interface FreeResult extends WritingResult { recognizedAs?: string; confident: boolean }

/** Freies Schreiben: Zielbuchstabe muss klar bester Treffer sein; sonst keine Note ≥ 1. */
export function analyzeFree(strokes: Stroke[], targetId: string, area: number, templates: Template[] = TEMPLATES): FreeResult {
  const t = TEMPLATE_BY_ID.get(targetId)!;
  const base = analyze(strokes, t, area);
  if (base.empty || base.tooSmall) return { ...base, confident: false };
  const r = rank(strokes, templates);
  const best = r[0], second = r[1];
  const confident = best.letterId === targetId && (!second || second.cost - best.cost >= TH.margin);
  if (best.letterId !== targetId) {
    return { ...base, grade: 0, recognizedAs: best.letterId, confident: false, messages: [`Das sieht eher aus wie ein anderer Buchstabe.`, ...base.messages] };
  }
  if (!confident) return { ...base, grade: Math.min(base.grade, 1) as 0 | 1 | 2, confident: false, messages: ["Nicht eindeutig zu erkennen. Achte auf Form und Punkte.", ...base.messages] };
  return { ...base, confident: true };
}

