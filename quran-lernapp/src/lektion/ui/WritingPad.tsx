"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Pt, Stroke } from "@/lektion/domain/handwriting/geometry";
import type { Template } from "@/lektion/domain/handwriting/templates";

export const PAD = 360;

interface Props {
  guide?: Template | null;
  disabled?: boolean;
  onChange(strokes: Stroke[]): void;
}

const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#888";
const toPad = (p: Pt): Pt => ({ x: PAD * (0.12 + (p.x / 100) * 0.76), y: PAD * (0.12 + (p.y / 100) * 0.76) });

/** Zeichenfläche mit echter Strichaufnahme (Pointer Events: Finger, Stift, Maus). */
export function WritingPad({ guide, disabled, onChange }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Stroke[]>([]);
  const active = useRef<Stroke | null>(null);
  const [count, setCount] = useState(0);

  const draw = useCallback(() => {
    const c = canvas.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    c.width = PAD * dpr; c.height = PAD * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, PAD, PAD);
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    // Grundlinie als Orientierung
    ctx.strokeStyle = css("--line"); ctx.lineWidth = 1; ctx.setLineDash([4, 6]);
    ctx.beginPath(); ctx.moveTo(PAD * 0.06, PAD * 0.7); ctx.lineTo(PAD * 0.94, PAD * 0.7); ctx.stroke(); ctx.setLineDash([]);
    if (guide) {
      ctx.strokeStyle = css("--text-3"); ctx.globalAlpha = 0.45; ctx.lineWidth = 16;
      for (const s of guide.body) {
        const q = s.map(toPad);
        ctx.beginPath(); ctx.moveTo(q[0].x, q[0].y);
        for (let i = 1; i < q.length - 1; i++) ctx.quadraticCurveTo(q[i].x, q[i].y, (q[i].x + q[i + 1].x) / 2, (q[i].y + q[i + 1].y) / 2);
        ctx.lineTo(q[q.length - 1].x, q[q.length - 1].y); ctx.stroke();
      }
      ctx.fillStyle = css("--text-3");
      for (const d of guide.dots) { const p = toPad(d); ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, Math.PI * 2); ctx.fill(); }
      ctx.globalAlpha = 1;
      ctx.fillStyle = css("--accent");  // Startpunkte
      for (const s of guide.body) { const p = toPad(s[0]); ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.strokeStyle = css("--text"); ctx.fillStyle = css("--text"); ctx.lineWidth = 7;
    for (const s of strokes.current) {
      if (s.length === 1) { ctx.beginPath(); ctx.arc(s[0].x, s[0].y, 4, 0, Math.PI * 2); ctx.fill(); continue; }
      ctx.beginPath(); s.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.stroke();
    }
  }, [guide]);

  useEffect(draw, [draw, count]);

  const pos = (e: React.PointerEvent): Pt => {
    const r = canvas.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * PAD, y: ((e.clientY - r.top) / r.height) * PAD };
  };
  const commit = () => { setCount(strokes.current.length); onChange(strokes.current.map((s) => [...s])); };

  return (
    <div className="pad">
      <canvas
        ref={canvas} className="pad-canvas" role="img"
        aria-label="Zeichenfläche. Mit Finger, Stift oder Maus schreiben. Wenn das nicht geht, nutze „Überspringen“."
        onPointerDown={(e) => { if (disabled) return; e.currentTarget.setPointerCapture(e.pointerId); active.current = [pos(e)]; strokes.current.push(active.current); draw(); }}
        onPointerMove={(e) => {
          if (!active.current) return;
          const evs = (e.nativeEvent as PointerEvent).getCoalescedEvents?.() ?? [];
          const list = evs.length ? evs : [e.nativeEvent as PointerEvent];
          const r = canvas.current!.getBoundingClientRect();
          for (const ev of list) active.current.push({ x: ((ev.clientX - r.left) / r.width) * PAD, y: ((ev.clientY - r.top) / r.height) * PAD });
          draw();
        }}
        onPointerUp={() => { if (active.current) { active.current = null; commit(); } }}
        onPointerCancel={() => { if (active.current) { active.current = null; commit(); } }}
      />
      <div className="row">
        <button className="btn btn-ghost" disabled={count === 0 || disabled} onClick={() => { strokes.current.pop(); commit(); }}>Rückgängig</button>
        <button className="btn btn-ghost" disabled={count === 0 || disabled} onClick={() => { strokes.current = []; commit(); }}>Leeren</button>
      </div>
    </div>
  );
}
