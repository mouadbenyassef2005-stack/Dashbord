import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Datenschutz",
  description: "Datenschutzerklärung von M&F Netztechnik.",
  alternates: { canonical: "/datenschutz" },
  robots: { index: false, follow: true },
};

const sections = [
  {
    title: "1. Verantwortlicher",
    body: (
      <>
        <p>Verantwortlich für die Datenverarbeitung auf dieser Website ist:</p>
        <p className="mt-3">
          {siteConfig.name}
          <br />
          {siteConfig.address}
          <br />
          {siteConfig.city}, {siteConfig.region}
          <br />
          E-Mail: {siteConfig.email}
          <br />
          Telefon: {siteConfig.phone}
        </p>
      </>
    ),
  },
  {
    title: "2. Erhebung und Speicherung personenbezogener Daten",
    body: (
      <p>
        Beim Aufruf dieser Website werden durch den Hosting-Anbieter
        automatisch Informationen in sogenannten Server-Logfiles erfasst, die
        Ihr Browser übermittelt. Dies können unter anderem IP-Adresse,
        Datum und Uhrzeit der Anfrage, Browsertyp und -version sowie das
        verwendete Betriebssystem sein. Diese Daten sind nicht bestimmten
        Personen zuordenbar und werden ausschließlich zur Sicherstellung
        eines störungsfreien Betriebs der Website ausgewertet.
      </p>
    ),
  },
  {
    title: "3. Kontaktformular",
    body: (
      <p>
        Wenn Sie uns über das Kontaktformular Anfragen zukommen lassen,
        werden Ihre Angaben aus dem Formular inklusive der von Ihnen dort
        angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den
        Fall von Anschlussfragen gespeichert. Diese Daten geben wir nicht
        ohne Ihre Einwilligung weiter. Die Verarbeitung der in das
        Kontaktformular eingegebenen Daten erfolgt auf Grundlage eines
        berechtigten Interesses (Art. 6 Abs. 1 lit. f DSGVO) an der
        Bearbeitung Ihrer Anfrage bzw. zur Durchführung vorvertraglicher
        Maßnahmen (Art. 6 Abs. 1 lit. b DSGVO).
      </p>
    ),
  },
  {
    title: "4. Speicherdauer",
    body: (
      <p>
        Personenbezogene Daten werden nur so lange gespeichert, wie es für
        die Erfüllung des jeweiligen Zwecks erforderlich ist oder sofern dies
        gesetzlich vorgesehen ist.
      </p>
    ),
  },
  {
    title: "5. Ihre Rechte",
    body: (
      <p>
        Sie haben jederzeit das Recht auf Auskunft, Berichtigung, Löschung
        oder Einschränkung der Verarbeitung Ihrer gespeicherten
        personenbezogenen Daten sowie ein Widerspruchsrecht gegen die
        Verarbeitung und ein Recht auf Datenübertragbarkeit. Zur
        Geltendmachung dieser Rechte wenden Sie sich bitte an die oben
        genannten Kontaktdaten.
      </p>
    ),
  },
  {
    title: "6. Änderung dieser Datenschutzerklärung",
    body: (
      <p>
        Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit
        sie stets den aktuellen rechtlichen Anforderungen entspricht.
      </p>
    ),
  },
];

export default function DatenschutzPage() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-20 sm:px-8 sm:py-28">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
        Datenschutzerklärung
      </h1>

      <div className="mt-12 space-y-10 text-sm leading-relaxed text-fg-muted">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="font-display text-lg font-semibold text-fg">
              {section.title}
            </h2>
            <div className="mt-3 space-y-3">{section.body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
