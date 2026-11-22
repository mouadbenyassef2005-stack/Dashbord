/**
 * Audio-Manifest: Asset-ID → Dateiname in `public/audio/`.
 * Nur Aufnahmen, die wirklich als Datei vorliegen, stehen hier. Was fehlt, steht in `docs/AUDIO-ASSETS.md`
 * und wird in der Oberfläche als „Audio noch nicht verfügbar“ gezeigt, nie als abgespielt.
 *
 * Sprecher und Aufnahmequalität sind nicht fachlich abgenommen. Siehe docs/PHONETIK-PRUEFLISTE.md.
 */
export const AUDIO_MANIFEST: Record<string, string> = {
  "name-alif": "name-alif.m4a",
  "vowel-fatha": "vowel-fatha.m4a",
  "vowel-kasra": "vowel-kasra.m4a",
  "vowel-damma": "vowel-damma.m4a",
  "syl-ba-fatha": "syl-ba-fatha.m4a", "syl-ba-kasra": "syl-ba-kasra.m4a", "syl-ba-damma": "syl-ba-damma.m4a",
  "syl-ta-fatha": "syl-ta-fatha.m4a", "syl-ta-kasra": "syl-ta-kasra.m4a", "syl-ta-damma": "syl-ta-damma.m4a",
  "syl-tha-fatha": "syl-tha-fatha.m4a", "syl-tha-kasra": "syl-tha-kasra.m4a", "syl-tha-damma": "syl-tha-damma.m4a",
  // Buchstabenlaut: Konsonant mit kurzem a gesprochen (ein Konsonant allein ist nicht sprechbar). Dieselbe Datei wie die Fatha-Silbe.
  "sound-ba": "syl-ba-fatha.m4a", "sound-ta": "syl-ta-fatha.m4a", "sound-tha": "syl-tha-fatha.m4a",
};

export const hasAudio = (id: string) => id in AUDIO_MANIFEST;

/** Asset-ID eines Lern-Items (Buchstabe, Vokal, Silbe), falls vorhanden. */
export function audioIdForItem(itemId: string): string | null {
  const [kind, key] = itemId.split(":");
  const id = kind === "letter" ? (key === "alif" ? "name-alif" : `sound-${key}`) : kind === "vowel" ? `vowel-${key}` : kind === "syllable" || kind === "syl" ? `syl-${key}` : null;
  return id && hasAudio(id) ? id : null;
}
