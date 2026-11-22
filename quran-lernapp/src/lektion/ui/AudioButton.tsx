"use client";
import { useState } from "react";
import { audioId, playAsset, type AudioKind } from "@/lektion/ui/audio";
import { Icon } from "./parts";

/** Funktionaler Audio-Button. Fehlt die Aufnahme, sagt er das – er tut nicht so, als würde er etwas abspielen. */
export function AudioButton({ letterId, kind, label }: { letterId: string; kind: AudioKind; label: string }) {
  const [state, setState] = useState<"idle" | "missing" | "error">("idle");
  return (
    <div>
      <button className="btn btn-secondary" onClick={async () => {
        const r = await playAsset(audioId(letterId, kind));
        setState(r === "played" ? "idle" : r);
      }}>
        {Icon.speaker} {label}
      </button>
      {state !== "idle" && (
        <p role="status" className="muted" style={{ fontSize: 13, marginTop: 6 }}>
          {state === "missing" ? "Aufnahme noch nicht verfügbar. Hier folgt eine echte Sprecher-Aufnahme." : "Wiedergabe fehlgeschlagen. Prüfe die Lautstärke und versuche es erneut."}
        </p>
      )}
    </div>
  );
}
