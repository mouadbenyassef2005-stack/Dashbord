import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum und Anbieterkennzeichnung von M&F Netztechnik.",
  alternates: { canonical: "/impressum" },
  robots: { index: false, follow: true },
};

export default function ImpressumPage() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-20 sm:px-8 sm:py-28">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
        Impressum
      </h1>
      <p className="mt-3 text-sm text-fg-faint">
        Angaben gemäß § 5 TMG
      </p>

      <div className="mt-12 space-y-10 text-sm leading-relaxed text-fg-muted">
        <div>
          <h2 className="font-display text-lg font-semibold text-fg">
            Anbieter
          </h2>
          <p className="mt-3">
            {siteConfig.name}
            <br />
            {siteConfig.address}
            <br />
            {siteConfig.city}, {siteConfig.region}
          </p>
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold text-fg">
            Vertreten durch
          </h2>
          <p className="mt-3">{siteConfig.ceo}</p>
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold text-fg">
            Kontakt
          </h2>
          <p className="mt-3">
            Telefon: {siteConfig.phone}
            <br />
            E-Mail: {siteConfig.email}
          </p>
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold text-fg">
            Umsatzsteuer-Identifikationsnummer
          </h2>
          <p className="mt-3">[USt-IdNr. EINFÜGEN]</p>
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold text-fg">
            Handelsregister
          </h2>
          <p className="mt-3">
            [REGISTERGERICHT EINFÜGEN]
            <br />
            [REGISTERNUMMER EINFÜGEN]
          </p>
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold text-fg">
            Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
          </h2>
          <p className="mt-3">
            {siteConfig.ceo}
            <br />
            {siteConfig.address}
          </p>
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold text-fg">
            EU-Streitschlichtung
          </h2>
          <p className="mt-3">
            Die Europäische Kommission stellt eine Plattform zur
            Online-Streitbeilegung (OS) bereit. Unsere E-Mail-Adresse finden
            Sie oben. Wir sind nicht verpflichtet und nicht bereit, an
            Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
            teilzunehmen.
          </p>
        </div>
      </div>
    </section>
  );
}
