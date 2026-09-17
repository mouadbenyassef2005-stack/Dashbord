import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { siteConfig } from "@/lib/site";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} – Glasfaser- & Netzwerkmontage in NRW`,
    template: `%s – ${siteConfig.name}`,
  },
  description:
    "M&F Netztechnik übernimmt die professionelle Montage von Glasfaser-, Netzwerk- und Kupferverkabelung für Unternehmen in ganz NRW – auch als Montagepartner für Elektro-, IT- und Netzausbauunternehmen.",
  keywords: [
    "Glasfaser Montage NRW",
    "Glasfaser Montage Dortmund",
    "Netzwerkverkabelung NRW",
    "Netzwerkverkabelung Dortmund",
    "CAT Verkabelung NRW",
    "Kupferverkabelung NRW",
    "IT Verkabelung NRW",
    "Glasfaser Spleißen NRW",
    "Netzwerk Montage",
    "Glasfaser Subunternehmer NRW",
    "Netzwerk Subunternehmer NRW",
  ],
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: siteConfig.name,
    title: `${siteConfig.name} – Glasfaser- & Netzwerkmontage in NRW`,
    description:
      "Professionelle Montage von Glasfaser-, Netzwerk- und Kupferverkabelung für Unternehmen in ganz NRW.",
    url: siteConfig.url,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="de"
      className={`${spaceGrotesk.variable} ${inter.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-bg text-fg antialiased">
        <div className="noise-overlay" aria-hidden="true" />
        <Navigation />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
