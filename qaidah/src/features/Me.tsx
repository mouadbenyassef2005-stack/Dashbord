import { useRef, useState } from "react";
import { exportJson, parseExport } from "@/persistence/eventStore";
import { useApp } from "./AppContext";
import { Link } from "react-router-dom";

export function Me() {
  const { events, theme, setTheme, store, reload, resetAll, persistent } = useApp();
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [confirm, setConfirm] = useState(false);
  const file = useRef<HTMLInputElement>(null);

  function download() {
    const url = URL.createObjectURL(new Blob([exportJson(events)], { type: "application/json" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `qaidah-sicherung-${new Date().toISOString().slice(0, 10)}.json` });
    a.click();
    URL.revokeObjectURL(url);
  }
  async function upload(f: File) {
    const parsed = parseExport(await f.text());
    if (!parsed.ok) return setMsg({ kind: "err", text: parsed.error });
    const n = await store!.importEvents(parsed.events);
    await reload();
    setMsg({ kind: "ok", text: `${n} Einträge übernommen.` });
  }

  return (
    <div className="stack-lg fade">
      <header className="stack"><p className="eyebrow">Ich</p><h1>Einstellungen und Daten</h1></header>

      <section className="stack"><h2>Darstellung</h2>
        <div className="row" role="radiogroup" aria-label="Farbschema">
          {(["dark", "light"] as const).map((t) => (
            <button key={t} role="radio" aria-checked={theme === t} className={`btn ${theme === t ? "btn-primary" : "btn-secondary"}`} onClick={() => setTheme(t)}>{t === "dark" ? "Dunkel" : "Hell"}</button>
          ))}
        </div>
        <Link className="muted" to="/specimen">Schrift- und Farbprüfseite öffnen</Link>
      </section>

      <section className="stack"><h2>Aussprache</h2>
        <p className="notice">Die App bewertet deine Aussprache nicht automatisch. Es gibt aktuell keine verlässliche Lautbewertung, deshalb zeigen wir auch keine Punktzahl. Vorgesehen ist: Referenz anhören, selbst aufnehmen, vergleichen. Aufnahmen mit echter Sprecherstimme fehlen noch.</p>
      </section>

      <section className="stack"><h2>Sicherung</h2>
        <p className="muted">{events.length} Einträge. {persistent ? "Gespeichert auf diesem Gerät." : "Nicht dauerhaft gespeichert: nutze die Sicherung."}</p>
        <div className="row">
          <button className="btn btn-secondary" onClick={download} disabled={events.length === 0}>Sicherung laden</button>
          <button className="btn btn-secondary" onClick={() => file.current?.click()}>Sicherung einspielen</button>
          <input ref={file} type="file" accept="application/json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f); e.target.value = ""; }} />
        </div>
        {msg && <p role="status" className={`notice ${msg.kind === "err" ? "err" : ""}`}>{msg.text}</p>}
      </section>

      <section className="stack"><h2>Zurücksetzen</h2>
        {!confirm ? <button className="btn btn-secondary" onClick={() => setConfirm(true)}>Lernstand löschen …</button> : (
          <div className="stack"><p>Das löscht deinen gesamten Lernstand auf diesem Gerät. Das lässt sich nicht rückgängig machen.</p>
            <div className="row"><button className="btn btn-primary" onClick={async () => { await resetAll(); setConfirm(false); }}>Ja, löschen</button>
              <button className="btn btn-ghost" onClick={() => setConfirm(false)}>Abbrechen</button></div></div>
        )}
      </section>
    </div>
  );
}
