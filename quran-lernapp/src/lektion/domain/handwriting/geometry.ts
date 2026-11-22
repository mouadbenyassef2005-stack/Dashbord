export interface Pt { x: number; y: number }
export type Stroke = Pt[];

export const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
export const pathLength = (s: Stroke) => s.slice(1).reduce((n, p, i) => n + dist(s[i], p), 0);

export function bbox(pts: Pt[]) {
  const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  return { minX, maxX, minY, maxY, w: maxX - minX, h: maxY - minY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
}

/** k gleichmäßig nach Bogenlänge verteilte Punkte (Strich mit Länge 0 → k-mal derselbe Punkt). */
export function resampleStroke(s: Stroke, k: number): Pt[] {
  if (s.length === 0) return [];
  const total = pathLength(s);
  if (total === 0 || k < 2) return Array.from({ length: Math.max(1, k) }, () => s[0]);
  const step = total / (k - 1);
  const out: Pt[] = [s[0]];
  let acc = 0;
  let prev = s[0];
  for (let i = 1; i < s.length && out.length < k; ) {
    const d = dist(prev, s[i]);
    if (acc + d >= step && d > 0) {
      const t = (step - acc) / d;
      const q = { x: prev.x + t * (s[i].x - prev.x), y: prev.y + t * (s[i].y - prev.y) };
      out.push(q); prev = q; acc = 0;
    } else { acc += d; prev = s[i]; i++; }
  }
  while (out.length < k) out.push(s[s.length - 1]);
  return out;
}

/** Punktwolke aus mehreren Strichen; Punkte je Strich proportional zur Länge. Reihenfolge und Strichanzahl spielen keine Rolle. */
export function resampleCloud(strokes: Stroke[], n = 64): Pt[] {
  const lens = strokes.map(pathLength);
  const total = lens.reduce((a, b) => a + b, 0) || 1;
  return strokes.flatMap((s, i) => resampleStroke(s, Math.max(2, Math.round((n * lens[i]) / total))));
}

/** Auf Mittelpunkt 0 und längste Kante 1 normieren – unabhängig von Größe und Position. */
export function normalize(pts: Pt[]): Pt[] {
  const b = bbox(pts);
  const scale = Math.max(b.w, b.h) || 1;
  return pts.map((p) => ({ x: (p.x - b.cx) / scale, y: (p.y - b.cy) / scale }));
}

/** Symmetrische mittlere Nächste-Nachbar-Distanz (Chamfer) zweier normierter Wolken. */
export function chamfer(a: Pt[], b: Pt[]): number {
  const one = (u: Pt[], v: Pt[]) => {
    let sum = 0;
    for (const p of u) { let m = Infinity; for (const q of v) { const d = (p.x - q.x) ** 2 + (p.y - q.y) ** 2; if (d < m) m = d; } sum += Math.sqrt(m); }
    return sum / u.length;
  };
  return (one(a, b) + one(b, a)) / 2;
}
