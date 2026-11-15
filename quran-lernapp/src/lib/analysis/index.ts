import { DemoAnalyzer } from "./demo";
import type { PronunciationAnalyzer } from "./types";

export * from "./types";

let instance: PronunciationAnalyzer | null = null;

/**
 * Zentrale Stelle zum Austauschen der Analyse.
 * Später: `NEXT_PUBLIC_ANALYZER=live` → LiveAnalyzer, der Audio an eine API-Route sendet.
 */
export function getAnalyzer(): PronunciationAnalyzer {
  return (instance ??= new DemoAnalyzer());
}
