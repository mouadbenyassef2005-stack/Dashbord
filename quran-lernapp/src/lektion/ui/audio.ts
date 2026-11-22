/**
 * Audio: Name und Laut sind getrennte Assets. Es liegen derzeit KEINE Aufnahmen vor.
 * Solange ein Asset fehlt, meldet `playAsset` 'missing' und die UI sagt das offen – es wird nichts ersetzt/synthetisiert.
 * Aufnahmen kommen als public/audio/<id>.mp3 und werden hier im Manifest eingetragen.
 */
export type AudioKind = "name" | "sound";
export const audioId = (letterId: string, kind: AudioKind) => `${kind}-${letterId}`;

/** id → URL. Leer, bis echte Aufnahmen mit klarer Lizenz vorliegen. */
export const AUDIO_MANIFEST: Record<string, string> = {};

export type PlayResult = "played" | "missing" | "error";

export async function playAsset(id: string, manifest: Record<string, string> = AUDIO_MANIFEST): Promise<PlayResult> {
  const url = manifest[id];
  if (!url) return "missing";
  try {
    await new Audio(url).play();
    return "played";
  } catch {
    return "error";
  }
}

export const hasAudio = (id: string, manifest: Record<string, string> = AUDIO_MANIFEST) => id in manifest;
