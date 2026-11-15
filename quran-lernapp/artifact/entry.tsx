import { createRoot } from "react-dom/client";
import { AppShell } from "@/components/AppShell";
import { LessonLoader } from "@/components/lesson/LessonLoader";
import Dashboard from "@/app/page";
import Pfad from "@/app/pfad/page";
import Training from "@/app/training/page";
import Erfolge from "@/app/erfolge/page";
import Profil from "@/app/profil/page";
import Woerter from "@/app/woerter/page";
import Onboarding from "@/app/onboarding/page";
import { usePath } from "./router";

function Routes() {
  const path = usePath();
  let page;
  if (path.startsWith("/lektion/")) page = <LessonLoader key={path} lessonId={path.slice(9)} />;
  else if (path === "/pfad") page = <Pfad />;
  else if (path === "/training") page = <Training />;
  else if (path === "/erfolge") page = <Erfolge />;
  else if (path === "/profil") page = <Profil />;
  else if (path === "/woerter") page = <Woerter />;
  else if (path === "/onboarding") page = <Onboarding />;
  else page = <Dashboard />;
  return <AppShell>{page}</AppShell>;
}
createRoot(document.getElementById("root")!).render(<Routes />);
