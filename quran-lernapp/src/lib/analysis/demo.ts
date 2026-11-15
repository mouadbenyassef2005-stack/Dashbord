import { describeCluster, toClusters } from "@/lib/arabic";
import type { AnalysisRequest, AnalysisResult, PronunciationAnalyzer, SegmentResult } from "./types";

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
const rnd = (seed: number, n: number) => ((hash(`${seed}:${n}`) % 1000) / 1000);

export const MIN_DURATION_MS = 500;
export const MIN_PEAK = 0.02;

/**
 * DEMO-Analyse. Prüft nur echte Signaleigenschaften (wurde überhaupt gesprochen?).
 * Die Bewertung der Aussprache ist SIMULIERT (deterministisch aus Item-ID + Versuch).
 * Jeder vierte Beginn schlägt bewusst fehl, damit der Übe-Ablauf testbar ist.
 */
export class DemoAnalyzer implements PronunciationAnalyzer {
  readonly id = "demo";
  readonly simulated = true;

  async analyze({ item, signal, attempt }: AnalysisRequest): Promise<AnalysisResult> {
    await new Promise((r) => setTimeout(r, 650)); // „Analyse läuft“ sichtbar machen
    const clusters = toClusters(item.arabic);

    if (signal.durationMs < MIN_DURATION_MS || signal.peak < MIN_PEAK) {
      return {
        engine: this.id, simulated: true, status: "no-signal", passed: false, score: 0, segments: [],
        headline: "Ich habe fast nichts gehört",
        detail: "Sprich etwas lauter oder näher am Mikrofon und lies den ganzen Text, bevor du stoppst.",
      };
    }

    const seed = hash(item.id);
    const shouldFail = attempt === 1 && seed % 4 === 0 && clusters.length > 0;
    const focusIdx = shouldFail ? seed % clusters.length : -1;

    const segments: SegmentResult[] = clusters.map((c, i) => {
      const d = describeCluster(c);
      const bad = i === focusIdx;
      const score = Math.round(bad ? 38 + rnd(seed, i) * 20 : 78 + rnd(seed + attempt, i) * 20);
      return { key: c.base, text: c.text, title: d.title, tip: d.tip, score, ok: !bad };
    });
    const score = Math.round(segments.reduce((s, x) => s + x.score, 0) / Math.max(1, segments.length));

    if (shouldFail) {
      const focus = segments[focusIdx];
      return {
        engine: this.id, simulated: true, status: "ok", passed: false, score, segments, focus,
        headline: `Fast – achte auf „${focus.text}“`,
        detail: focus.tip + " Höre den Teil noch einmal an und versuche es erneut.",
      };
    }
    return {
      engine: this.id, simulated: true, status: "ok", passed: true, score, segments,
      headline: attempt > 1 ? "Gut – das war besser!" : "Sauber gelesen",
      detail: "Demo-Bewertung: In der echten Version prüft eine Sprachanalyse jeden Laut.",
    };
  }
}
