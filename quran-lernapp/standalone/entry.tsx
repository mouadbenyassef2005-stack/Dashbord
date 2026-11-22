import "@fontsource-variable/inter";
import "@fontsource/noto-naskh-arabic/arabic-400.css";
import "@fontsource/scheherazade-new/arabic-400.css";
import "@fontsource/scheherazade-new/arabic-700.css";
import "../src/app/globals.css";
import "../src/lektion/lektion.css";
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { AppShell } from "../src/components/AppShell";
import { Practice } from "../src/lektion/features/Practice";
import { Profil } from "../src/lektion/features/Profil";
import { Start } from "../src/lektion/features/Start";
import { usePathname } from "./next-navigation";

function Routes() {
  const path = usePathname();
  useEffect(() => { window.scrollTo({ top: 0 }); }, [path]);
  if (path.startsWith("/ueben")) return <div className="mx-auto max-w-3xl"><Practice /></div>;
  if (path.startsWith("/profil")) return <div className="mx-auto max-w-3xl"><Profil /></div>;
  return <Start />;
}

createRoot(document.getElementById("root")!).render(<StrictMode><AppShell><Routes /></AppShell></StrictMode>);
