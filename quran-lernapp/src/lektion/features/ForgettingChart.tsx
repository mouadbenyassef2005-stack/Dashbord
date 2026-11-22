"use client";
import { DAY } from "@/lektion/domain/scheduler";
import type { LogEntry } from "@/lektion/domain/lektion/competence";
import { estimatedRecall } from "@/lektion/domain/lektion/competence";
import { curvePoints } from "@/lektion/domain/lektion/state";
import type { MemoryState } from "@/lektion/domain/types";

const W = 640, H = 240, M = { l: 40, r: 12, t: 12, b: 28 };

/** Modellschätzung der Abrufwahrscheinlichkeit über die Zeit (Sägezahn: jede Wiederholung setzt zurück und flacht die Kurve ab). */
export function ForgettingChart({ log, keyId, now, srs, label }: { log: LogEntry[]; keyId: string; now: number; srs: MemoryState; label: string }) {
  const entries = log.filter((e) => e.key === keyId);
  if (!entries.length) return null;
  const from = Math.min(...entries.map((e) => e.ts));
  const horizonDays = Math.max(14, Math.ceil((now - from) / DAY) + 7);
  const pts = curvePoints(log, keyId, from, from + horizonDays * DAY, 160);
  const nowX = (now - from) / DAY;
  const x = (d: number) => M.l + (d / horizonDays) * (W - M.l - M.r);
  const y = (r: number) => M.t + (1 - r) * (H - M.t - M.b);
  const line = (a: typeof pts) => a.map((p, i) => `${i ? "L" : "M"}${x(p.x).toFixed(1)} ${y(p.r).toFixed(1)}`).join(" ");
  const past = pts.filter((p) => p.x <= nowX + 1e-9), future = pts.filter((p) => p.x >= nowX - 1e-9);
  const rNow = estimatedRecall(srs, now);
  const xt = Array.from({ length: Math.floor(horizonDays / 7) + 1 }, (_, i) => i * 7).filter((d) => x(d) < W - M.r - 24);
  return (
    <figure style={{ margin: 0 }}>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Vergessenskurve laut Modell für ${label}: geschätzt ${Math.round(rNow * 100)} Prozent am simulierten Tag ${Math.round(nowX)}. ${entries.length} Wiederholungen.`}>
        {[0, 0.5, 0.9, 1].map((t) => <g key={t}><line className={t === 0.9 ? "thr" : "grid"} x1={M.l} x2={W - M.r} y1={y(t)} y2={y(t)} /><text x={M.l - 6} y={y(t) + 4} textAnchor="end">{Math.round(t * 100)} %</text></g>)}
        {xt.map((d) => <text key={d} x={x(d)} y={H - 8} textAnchor="middle">{d === 0 ? "Start" : `Tag ${d}`}</text>)}
        {entries.map((e, i) => <g key={i}><line className="rev" x1={x((e.ts - from) / DAY)} x2={x((e.ts - from) / DAY)} y1={y(1)} y2={y(0)} opacity=".35" /><circle cx={x((e.ts - from) / DAY)} cy={y(1)} r="3.5" /></g>)}
        <path className="ln" d={line(future)} strokeDasharray="5 5" opacity=".55" />
        <path className="ln" d={line(past)} />
        <line x1={x(nowX)} x2={x(nowX)} y1={M.t} y2={H - M.b} stroke="var(--text)" strokeWidth="1" strokeDasharray="2 3" />
        <text x={Math.min(x(nowX) + 4, W - 40)} y={M.t + 10}>jetzt</text>
      </svg>
      <figcaption className="muted" style={{ fontSize: 13 }}>Linie: Modellschätzung der Erinnerung, keine Messung. Punkte: Wiederholungen. Gestrichelt: Prognose ohne weitere Wiederholung. Die gestrichelte gelbe Linie (90 %) ist die Fälligkeitsgrenze.</figcaption>
    </figure>
  );
}
