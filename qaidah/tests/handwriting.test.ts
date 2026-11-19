import { describe, expect, it } from "vitest";
import { writeFileSync } from "node:fs";
import type { Pt, Stroke } from "@/domain/handwriting/geometry";
import { analyze, analyzeFree, rank, splitStrokes } from "@/domain/handwriting/score";
import { TEMPLATES, TEMPLATE_BY_ID } from "@/domain/handwriting/templates";

/** Seeded RNG, damit Tests reproduzierbar sind. */
function rng(seed: number) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32); }
const gauss = (r: () => number) => Math.sqrt(-2 * Math.log(r() || 1e-9)) * Math.cos(2 * Math.PI * r());

const AREA = 360;
interface Opts { noise?: number; rot?: number; sx?: number; sy?: number; dense?: boolean; reverse?: boolean; dropDots?: number; extraDot?: boolean; flipDotsAbove?: boolean }

/** Simuliert eine handgezeichnete Eingabe aus einem Template: Skalierung, Drehung, Versatz, Jitter, ungleichmäßige Abtastung. */
function synth(id: string, seed: number, o: Opts = {}): Stroke[] {
  const t = TEMPLATE_BY_ID.get(id)!;
  const r = rng(seed);
  const ang = ((o.rot ?? 8) * Math.PI / 180) * (r() * 2 - 1);
  const k = (0.5 + r() * 0.9) * (AREA / 100) * 0.75;
  const sx = k * (o.sx ?? 1) , sy = k * (o.sy ?? 1);
  const ox = 40 + r() * 80, oy = 30 + r() * 60;
  const nz = (o.noise ?? 0.8) * (AREA / 100);
  const xf = (p: Pt): Pt => {
    const x = (p.x - 50) * sx + (r() - .5) * 0 , y = (p.y - 50) * sy;
    return { x: ox + AREA / 2 + x * Math.cos(ang) - y * Math.sin(ang) + gauss(r) * nz, y: oy + AREA / 2 + x * Math.sin(ang) + y * Math.cos(ang) + gauss(r) * nz };
  };
  const dense = (s: Pt[]) => {
    const out: Pt[] = [];
    for (let i = 0; i < s.length - 1; i++) { const n = o.dense ? 6 : 2 + Math.floor(r() * 4); for (let j = 0; j < n; j++) { const u = j / n; out.push({ x: s[i].x + (s[i + 1].x - s[i].x) * u, y: s[i].y + (s[i + 1].y - s[i].y) * u }); } }
    out.push(s[s.length - 1]); return out;
  };
  let body = t.body.map((s) => dense(s).map(xf));
  if (o.reverse) body = body.map((s) => [...s].reverse());
  let dots = t.dots.map((d) => ({ ...d }));
  if (o.dropDots) dots = dots.slice(o.dropDots);
  if (o.extraDot) dots.push({ x: 50, y: t.dots.length && t.dots[0].y > 50 ? 20 : 86 });
  if (o.flipDotsAbove) dots = dots.map((d) => ({ x: d.x, y: 100 - d.y }));
  const dotStrokes = dots.map((d) => { const c = xf(d); return [c, { x: c.x + r() * 4, y: c.y + r() * 4 }]; });
  return [...body, ...dotStrokes];
}
const N = 200;
const ids = TEMPLATES.map((t) => t.letterId);

describe("Handschrift: Aufteilung", () => {
  it("trennt Punkte (kurze Striche) vom Körper", () => {
    const s = splitStrokes(synth("tha", 1));
    expect(s.body).toHaveLength(1);
    expect(s.dots).toHaveLength(3);
  });
  it("Alif allein: ein Strich, keine Punkte", () => {
    const s = splitStrokes(synth("alif", 2));
    expect(s.body).toHaveLength(1);
    expect(s.dots).toHaveLength(0);
  });
});

describe("Handschrift: Treffer bei plausiblen Eingaben (synthetisch)", () => {
  it.each(ids)("%s: korrekte Eingaben bestehen (Note ≥ 1) fast immer, meistens mit Note 2", (id) => {
    let pass = 0, top = 0;
    for (let i = 0; i < N; i++) {
      const strokes = synth(id, i + 1);
      const a = analyze(strokes, TEMPLATE_BY_ID.get(id)!, AREA);
      if (a.grade >= 1) pass++;
      if (a.grade === 2) top++;
    }
    expect(pass / N).toBeGreaterThanOrEqual(0.95);
    expect(top / N).toBeGreaterThanOrEqual(0.8);
  });

  it("Freies Schreiben: Zielbuchstabe wird erkannt und nicht mit anderen verwechselt", () => {
    const stats: Record<string, { ok: number; wrongAccepted: number }> = {};
    for (const id of ids) {
      stats[id] = { ok: 0, wrongAccepted: 0 };
      for (let i = 0; i < N; i++) {
        const r = rank(synth(id, i + 500));
        if (r[0].letterId === id) stats[id].ok++;
        for (const other of ids.filter((x) => x !== id)) {
          const f = analyzeFree(synth(id, i + 900), other, AREA);
          if (f.grade >= 1 && f.confident) stats[id].wrongAccepted++;
        }
      }
      expect(stats[id].ok / N, `Top-1 für ${id}`).toBeGreaterThanOrEqual(0.95);
      expect(stats[id].wrongAccepted, `Falsch akzeptiert bei ${id}`).toBe(0);
    }
    writeFileSync("/tmp/hw-stats.json", JSON.stringify(stats));
  }, 60_000);
});

describe("Handschrift: Fehlerarten werden erkannt", () => {
  const t = (id: string) => TEMPLATE_BY_ID.get(id)!;
  it("Punkt fehlt → Note 0 + Hinweis", () => {
    let hit = 0;
    for (let i = 0; i < 50; i++) { const a = analyze(synth("ta", i + 1, { dropDots: 1 }), t("ta"), AREA); if (a.dots.level === "missing" && a.grade === 0) hit++; }
    expect(hit).toBe(50);
  });
  it("zusätzlicher Punkt → Note 0", () => {
    let hit = 0;
    for (let i = 0; i < 50; i++) { const a = analyze(synth("ba", i + 1, { extraDot: true }), t("ba"), AREA); if (a.dots.level === "extra" && a.grade === 0) hit++; }
    expect(hit).toBe(50);
  });
  it("Punkte auf falscher Seite (ب mit Punkt oben) → falsche Lage", () => {
    let hit = 0;
    for (let i = 0; i < 50; i++) { const a = analyze(synth("ba", i + 1, { flipDotsAbove: true }), t("ba"), AREA); if (a.dots.level === "wrongPlace" && a.grade === 0) hit++; }
    expect(hit).toBe(50);
  });
  it("Umgekehrte Schreibrichtung wird erkannt und mit höchstens Note 1 bewertet", () => {
    for (const id of ["alif", "ba"]) {
      let hit = 0;
      for (let i = 0; i < 50; i++) { const a = analyze(synth(id, i + 1, { reverse: true }), t(id), AREA); if (a.direction === "reversed" && a.grade <= 1) hit++; }
      expect(hit, id).toBe(50);
    }
  });
  it("Alif wird nicht als Bā akzeptiert (und umgekehrt)", () => {
    expect(analyze(synth("alif", 3), t("ba"), AREA).grade).toBe(0);
    expect(analyze(synth("ba", 3), t("alif"), AREA).grade).toBe(0);
  });
  it("leere oder winzige Eingabe: keine Wertung", () => {
    expect(analyze([], t("ba"), AREA).empty).toBe(true);
    const tiny = [[{ x: 10, y: 10 }, { x: 14, y: 12 }, { x: 16, y: 10 }]];
    expect(analyze(tiny, t("ba"), AREA).tooSmall).toBe(true);
  });
  it("Freies Schreiben: ت als ب geschrieben → erkannt als anderer Buchstabe", () => {
    const res = analyzeFree(synth("ta", 7), "ba", AREA);
    expect(res.grade).toBe(0);
    expect(res.recognizedAs).toBe("ta");
  });
});
