import "@fontsource-variable/instrument-sans";
import "@fontsource/scheherazade-new/400.css";
import "@fontsource/scheherazade-new/700.css";
import "@fontsource/noto-naskh-arabic/400.css";
import "./styles/app.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { App } from "./App";
import { AppProvider } from "./features/AppContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </HashRouter>
  </StrictMode>,
);
