import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource/noto-naskh-arabic/arabic-400.css";
import "@fontsource/scheherazade-new/arabic-400.css";
import "@fontsource/scheherazade-new/arabic-700.css";
import "./globals.css";
import "@/lektion/lektion.css";
import { AppShell } from "@/components/AppShell";

export const instant = false;

export const metadata: Metadata = {
  title: "Qaidah – Arabisch lesen lernen",
  description: "Interaktive Lektion für erwachsene Anfänger: Alif, Bā, Tā, Thā und die Kurzvokale, in sieben Lernphasen.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f5f8f5" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="min-h-dvh">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
