import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource/amiri-quran/arabic-400.css";
import "@fontsource/scheherazade-new/arabic-400.css";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Qaidah – Quran lesen lernen",
  description: "Schritt für Schritt vom ersten Buchstaben zum selbstständigen Quran-Lesen. MVP mit Demo-Sprachfeedback.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f7f4ee" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="min-h-dvh">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
