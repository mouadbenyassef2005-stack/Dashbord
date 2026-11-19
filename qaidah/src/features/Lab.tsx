import { useState } from "react";
import { LETTER_BY_ID } from "@/content/letters";
import type { Stroke } from "@/domain/handwriting/geometry";
import { analyze, rank } from "@/domain/handwriting/score";
import { TEMPLATES, TEMPLATE_BY_ID } from "@/domain/handwriting/templates";
import { PAD, WritingPad } from "@/ui/WritingPad";

interface Sample { letterId: string; label: "ok" | "bad"; pointerType: string; area: number; strokes: Stroke[] }

/** Labor: echte Striche sammeln, beschriften und exportieren, um Schwellen am echten Material zu kalibrieren. Daten bleiben lokal. */
export function Lab() {
  const [letterId, setLetterId] = useState(TEMPLATES[1].letterId);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [key, setKey] = useState(0);
  const a = strokes.length ? analyze(strokes, TEMPLATE_BY_ID.get(letterId)!, PAD) : null;
  const r = strokes.length ? rank(strokes) : [];

  const add = (label: Sample["label"]) => { setSamples((s) => [...s, { letterId, label, pointerType: "unknown", area: PAD, strokes }]); setKey((k) => k + 1); };
  const download = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ app: "qaidah-lab", samples }, null, 2)], { type: "application/json" }));
    Object.assign(document.createElement("a"), { href: url, download: "qaidah-striche.json" }).click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="stack-lg">
      <header className="stack"><p className="eyebrow">Labor</p><h1>Striche sammeln</h1>
        <p className="muted">Zum Kalibrieren der Schreibbewertung: Buchstaben wählen, schreiben, als „gut“ oder „schlecht“ ablegen und die Datei exportieren. Es werden keine Daten gesendet.</p></header>
      <div className="row" role="radiogroup" aria-label="Buchstabe">
        {TEMPLATES.map((t) => <button key={t.letterId} role="radio" aria-checked={letterId === t.letterId} className={`btn ${letterId === t.letterId ? "btn-primary" : "btn-secondary"}`} onClick={() => { setLetterId(t.letterId); setKey((k) => k + 1); }}>{LETTER_BY_ID.get(t.letterId)!.name}</button>)}
      </div>
      <WritingPad resetKey={key} onChange={setStrokes} />
      {a && (
        <p data-testid="lab-readout" className="muted">
          Form {Number.isFinite(a.shape.distance) ? a.shape.distance.toFixed(3) : "–"} ({a.shape.level}) · Punkte {a.dots.found}/{a.dots.expected} ({a.dots.level}) · Richtung {a.direction} · Note {a.grade}
          {r[0] && <> · bester Treffer: {LETTER_BY_ID.get(r[0].letterId)?.name}</>}
        </p>
      )}
      <div className="row">
        <button className="btn btn-primary" disabled={!strokes.length} onClick={() => add("ok")}>Als gut ablegen</button>
        <button className="btn btn-secondary" disabled={!strokes.length} onClick={() => add("bad")}>Als schlecht ablegen</button>
        <button className="btn btn-ghost" disabled={!samples.length} onClick={download}>Export ({samples.length})</button>
      </div>
    </div>
  );
}
