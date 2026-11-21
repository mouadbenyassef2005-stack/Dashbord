import { TEMPLATE_BY_ID } from "@/domain/handwriting/templates";
import type { Pt } from "@/domain/handwriting/geometry";
import { Ar } from "@/ui/parts";

const TASHKEEL = /[ً-ٟ]/;

/** Arabischer Text, bei dem Vokalzeichen farblich abgesetzt sind (Dual Coding: Farbe trägt Bedeutung). */
export function Colored({ text, size = "teach" }: { text: string; size?: "hero" | "teach" | "body" }) {
  const parts: { t: string; mark: boolean }[] = [];
  for (const c of text) {
    const mark = TASHKEEL.test(c);
    const last = parts[parts.length - 1];
    if (last && last.mark === mark) last.t += c; else parts.push({ t: c, mark });
  }
  return <Ar size={size}>{parts.map((p, i) => (p.mark ? <span key={i} className="mk">{p.t}</span> : p.t))}</Ar>;
}

const path = (pts: Pt[]) => {
  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length - 1; i++) d += ` Q${pts[i].x} ${pts[i].y} ${(pts[i].x + pts[i + 1].x) / 2} ${(pts[i].y + pts[i + 1].y) / 2}`;
  return d + ` L${pts[pts.length - 1].x} ${pts[pts.length - 1].y}`;
};

/** Skelett eines Buchstabens als Zeichnung (aus den Schreib-Templates): Grundform neutral, Punkte farbig. */
export function Skeleton({ letterId, label }: { letterId: string; label: string }) {
  const t = TEMPLATE_BY_ID.get(letterId);
  if (!t) return null;
  return (
    <div className="svgbox">
      <svg viewBox="0 0 100 100" role="img" aria-label={label}>
        <line x1="4" y1="70" x2="96" y2="70" stroke="var(--line)" strokeDasharray="3 4" />
        {t.body.map((b, i) => <path key={i} d={path(b)} fill="none" stroke="var(--text-2)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />)}
        {t.dots.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="6.5" fill="var(--accent)" />)}
      </svg>
    </div>
  );
}

export function Explode({ letters }: { letters: string[] }) {
  return (
    <div className="order" role="img" aria-label={`Leserichtung von rechts nach links: ${letters.join(", ")}`}>
      {letters.map((c, i) => <div key={i}><sup aria-hidden>{i + 1}</sup><Ar size="teach">{c}</Ar></div>)}
    </div>
  );
}
