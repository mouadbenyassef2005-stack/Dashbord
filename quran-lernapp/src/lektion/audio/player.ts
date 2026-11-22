import { AUDIO_MANIFEST } from "./manifest";
import { audioUrl } from "@/lektion/audio/urls";

export type PlayState = "idle" | "playing" | "missing" | "error";
export const SLOW_RATE = 0.65;

let current: HTMLAudioElement | null = null;

export function stopAudio() {
  if (current) { current.pause(); current = null; }
}

/**
 * Spielt eine Aufnahme ab. Liefert „missing“, wenn keine Datei existiert, und „error“, wenn der Browser sie nicht abspielen kann.
 * „slow“ verlangsamt dieselbe Aufnahme technisch (Tonhöhe bleibt erhalten); es ist keine eigene Langsam-Aufnahme.
 */
export async function playAudio(id: string, opts: { slow?: boolean; onEnd?: () => void } = {}): Promise<"played" | "missing" | "error"> {
  const file = AUDIO_MANIFEST[id];
  if (!file) return "missing";
  stopAudio();
  try {
    const el = new Audio(audioUrl(file));
    el.playbackRate = opts.slow ? SLOW_RATE : 1;
    (el as HTMLAudioElement & { preservesPitch?: boolean }).preservesPitch = true;
    el.onended = () => { if (current === el) current = null; opts.onEnd?.(); };
    current = el;
    await el.play();
    return "played";
  } catch {
    current = null;
    return "error";
  }
}

/** Spielt mehrere Aufnahmen nacheinander (Hörvergleich). Bricht beim ersten Fehler ab. */
export async function playSequence(ids: string[], onStep?: (i: number) => void, slow = false): Promise<"played" | "missing" | "error"> {
  for (let i = 0; i < ids.length; i++) {
    onStep?.(i);
    const r: "played" | "missing" | "error" = await new Promise((res) => {
      let ended = false;
      void playAudio(ids[i], { slow, onEnd: () => { ended = true; res("played"); } }).then((x) => { if (x !== "played") res(x); else if (ended) res("played"); });
    });
    if (r !== "played") { onStep?.(-1); return r; }
  }
  onStep?.(-1);
  return "played";
}
