import { Link } from "react-router-dom";
import { GROUP_COUNT, lettersOfGroup } from "@/content/letters";
import { unlockedGroups } from "@/domain/session";
import { masteryFor } from "@/domain/progress";
import { useApp } from "./AppContext";
import { Ar, Mastery } from "@/ui/parts";

export function Path() {
  const { introduced, progress } = useApp();
  const open = unlockedGroups(introduced);
  return (
    <div className="stack-lg fade">
      <header className="stack"><p className="eyebrow">Weg</p><h1>Buchstabe für Buchstabe</h1>
        <p className="muted">Die Reihenfolge ist die traditionelle. Eine Gruppe öffnet sich, wenn die vorherige kennengelernt wurde. Gesperrte Gruppen kannst du trotzdem ansehen.</p></header>
      {Array.from({ length: GROUP_COUNT }, (_, i) => i + 1).map((g) => {
        const ls = lettersOfGroup(g);
        const isOpen = open.includes(g);
        return (
          <section key={g} className="stack" aria-labelledby={`g${g}`} style={{ opacity: isOpen ? 1 : 0.6 }}>
            <div className="row between">
              <h2 id={`g${g}`}>Gruppe {g}</h2>
              <span className="chip">{isOpen ? "offen" : "folgt"}</span>
            </div>
            <div className="grid">
              {ls.map((l) => (
                <Link key={l.id} className="tile" to={`/buchstaben/${l.id}`}>
                  <Ar size="body" className="ar-tile">{l.ch}</Ar>
                  <small>{l.name}</small>
                  <Mastery level={introduced.has(l.id) ? masteryFor(progress, l.id, "visual").level : "new"} />
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
