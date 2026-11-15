import type { ReadItem } from "@/content/types";

/** Messwerte der Aufnahme (lokal berechnet). */
export interface RecordingSignal {
  durationMs: number;
  /** höchster Pegel 0..1 */
  peak: number;
  rms: number;
  blob?: Blob;
  mimeType?: string;
}

export interface SegmentResult {
  key: string; // Buchstabe, für Fehlerstatistik
  text: string; // Darstellung inkl. Zeichen
  title: string;
  tip: string;
  score: number; // 0..100
  ok: boolean;
}

export interface AnalysisResult {
  /** Welche Engine hat das Ergebnis erzeugt? */
  engine: string;
  /** true = Ergebnis ist simuliert und KEINE echte Ausspracheanalyse. */
  simulated: boolean;
  status: "ok" | "no-signal";
  passed: boolean;
  score: number;
  segments: SegmentResult[];
  focus?: SegmentResult;
  headline: string;
  detail: string;
}

export interface AnalysisRequest {
  item: ReadItem;
  signal: RecordingSignal;
  /** Wievielter Versuch für dieses Item (ab 1). */
  attempt: number;
}

/**
 * Austauschbare Schnittstelle: Später kann hier eine echte Speech-Recognition-/
 * Pronunciation-Analysis-API (z. B. Server-Route mit ASR + Forced Alignment) angebunden werden.
 */
export interface PronunciationAnalyzer {
  readonly id: string;
  readonly simulated: boolean;
  analyze(req: AnalysisRequest): Promise<AnalysisResult>;
}
