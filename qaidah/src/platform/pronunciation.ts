/**
 * Schnittstelle für eine spätere Aussprachebewertung. Es gibt bewusst KEINE Standardimplementierung,
 * die Zahlen erfindet. Browser-Spracherkennung bewertet Wörter, keine Laute, und ist hierfür ungeeignet.
 */
export interface PronunciationFeedback { score?: number; phonemes?: { symbol: string; ok: boolean }[]; provider: string }
export interface PronunciationProvider {
  readonly id: string;
  evaluate(input: { target: string; audio: Blob }): Promise<PronunciationFeedback>;
}
export const activeProvider: PronunciationProvider | null = null;
