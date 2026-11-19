import { LETTERS, formsOf } from "@/content/letters";
import { EXAMPLE_WORDS, VOWELS } from "@/content/vowels";
import { Ar } from "@/ui/parts";

const SW = [
  ["Anthrazit", "--bg"], ["Graphit", "--surface"], ["Grau", "--line"], ["Text 2", "--text-2"], ["Orange", "--accent"],
  ["Amber", "--amber"], ["Koralle", "--coral"], ["Richtig", "--ok"],
];

/** Prüfseite für Typografie und Farben. Hier werden Formen/Harakat/Ligaturen geprüft, bevor Inhalte darauf aufbauen. */
export function Specimen() {
  return (
    <div className="stack-lg">
      <header className="stack"><p className="eyebrow">Prüfseite</p><h1>Schrift und Farbe</h1>
        <p className="muted">Zeigt alle Formen, Kurzvokale und Beispielwörter. Zum Prüfen von Verbindungen, Harakat-Platz und RTL.</p></header>

      <section className="stack"><h2>Farben</h2>
        <div className="swatches">{SW.map(([n, v]) => <div className="sw" key={v}><i style={{ background: `var(${v})` }} /><span>{n}<br />{v}</span></div>)}</div>
      </section>

      <section className="stack"><h2>Beispielwörter (vokalisiert)</h2>
        {EXAMPLE_WORDS.map((w) => (
          <div className="row between panel" key={w.id}><Ar size="teach">{w.ar}</Ar><span className="muted">{w.tr} · {w.de}</span></div>
        ))}
        <div className="row panel">
          {VOWELS.map((v) => <span key={v.id} className="row"><Ar size="teach">{"ب" + v.mark}</Ar><span className="muted">{v.name} „{v.sound}“</span></span>)}
        </div>
        <div className="panel" style={{ textAlign: "center" }}><Ar size="teach">لا</Ar> <span className="muted">Lām-Alif-Ligatur</span></div>
      </section>

      <section className="stack"><h2>Alle Formen</h2>
        <div style={{ overflowX: "auto" }}>
          <table className="spec" data-testid="forms">
            <thead><tr><th>Name</th><th>Einzeln</th><th>Anfang</th><th>Mitte</th><th>Ende</th></tr></thead>
            <tbody>
              {LETTERS.map((l) => { const f = formsOf(l); return (
                <tr key={l.id}><th scope="row">{l.name}</th>
                  <td><Ar size="body">{f.isolated}</Ar></td><td><Ar size="body">{f.initial}</Ar></td>
                  <td><Ar size="body">{f.medial}</Ar></td><td><Ar size="body">{f.final}</Ar></td></tr>); })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
