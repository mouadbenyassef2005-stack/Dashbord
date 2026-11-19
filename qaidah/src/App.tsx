import { NavLink, Route, Routes } from "react-router-dom";
import { useApp } from "./features/AppContext";
import { Icon } from "./ui/parts";
import { Today } from "./features/Today";
import { Path } from "./features/Path";
import { LettersPage, LetterDetail } from "./features/Letters";
import { Practice } from "./features/Practice";
import { Me } from "./features/Me";
import { Specimen } from "./features/Specimen";

const NAV = [
  { to: "/", label: "Heute", icon: Icon.today, end: true },
  { to: "/weg", label: "Weg", icon: Icon.path },
  { to: "/buchstaben", label: "Buchstaben", icon: Icon.letters },
  { to: "/ueben", label: "Üben", icon: Icon.practice },
  { to: "/ich", label: "Ich", icon: Icon.me },
];

export function App() {
  const { status, reload } = useApp();
  return (
    <div className="shell">
      <nav className="nav" aria-label="Hauptnavigation">
        <div className="brand"><span className="wordmark">QAID<b>A</b>H</span></div>
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end}>{n.icon}<span>{n.label}</span></NavLink>
        ))}
      </nav>
      <main>
        {status === "loading" && <p role="status" className="muted">Lernstand wird geladen …</p>}
        {status === "error" && (
          <div className="notice err stack" role="alert">
            <p>Der Lernstand konnte nicht geladen werden.</p>
            <button className="btn btn-secondary" onClick={() => void reload()}>Erneut versuchen</button>
          </div>
        )}
        {status === "ready" && (
          <Routes>
            <Route path="/" element={<Today />} />
            <Route path="/weg" element={<Path />} />
            <Route path="/buchstaben" element={<LettersPage />} />
            <Route path="/buchstaben/:id" element={<LetterDetail />} />
            <Route path="/ueben" element={<Practice />} />
            <Route path="/ich" element={<Me />} />
            <Route path="/specimen" element={<Specimen />} />
            <Route path="*" element={<p>Seite nicht gefunden.</p>} />
          </Routes>
        )}
      </main>
    </div>
  );
}
