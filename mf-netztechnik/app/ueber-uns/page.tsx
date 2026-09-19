import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import CTASection from "@/components/CTASection";
import Reveal from "@/components/Reveal";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Über uns",
  description:
    "M&F Netztechnik aus Dortmund ist spezialisiert auf die Montage von Glasfaser-, Netzwerk- und Kupferverkabelung für Unternehmen und Partnerbetriebe in NRW.",
  alternates: { canonical: "/ueber-uns" },
};

const principles = [
  {
    title: "Spezialisierung",
    description:
      "Der Fokus liegt auf passiver Netzwerk- und Glasfaserinfrastruktur – Verkabelung, Montage und Messung.",
  },
  {
    title: "Zwei Monteure",
    description:
      "Ein eingespieltes Team für Projekte im Bereich Glasfaser- und Netzwerkmontage.",
  },
  {
    title: "Zwei Wege der Zusammenarbeit",
    description:
      "Direkt für Unternehmen und Gewerbekunden oder als Montage-/Subunternehmer für Partnerbetriebe.",
  },
  {
    title: "NRW-weiter Einsatz",
    description:
      "Mit Sitz in Dortmund sind wir im gesamten Bundesland einsetzbar.",
  },
];

export default function UeberUnsPage() {
  return (
    <>
      <PageHero
        eyebrow="Über uns"
        title="Ein spezialisierter Montagepartner für Netzwerkinfrastruktur."
        description="M&F Netztechnik mit Sitz in Dortmund hat sich auf die professionelle Montage und Installation von Glasfaser-, Netzwerk-, Kupfer- und IT-Verkabelung spezialisiert."
      />

      <section className="mx-auto max-w-4xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal>
          <p className="text-lg leading-relaxed text-fg-muted sm:text-xl">
            Wir übernehmen die handwerkliche Umsetzung passiver
            Netzwerkinfrastruktur – von der Glasfaserstrecke bis zum fertig
            gepatchten Netzwerkschrank. Dabei arbeiten wir sowohl direkt für
            Unternehmen als auch im Auftrag von Elektroinstallationsbetrieben,
            IT-Systemhäusern, Glasfaserunternehmen und anderen
            Partnerbetrieben, die für ihre Projekte zusätzliche
            Montagekapazität benötigen.
          </p>
        </Reveal>
        <Reveal delay={100}>
          <p className="mt-6 text-lg leading-relaxed text-fg-muted sm:text-xl">
            Unser Anspruch: saubere, strukturierte und dokumentierte
            Ausführung – unabhängig davon, ob wir als direkter Ansprechpartner
            oder als Montagepartner im Hintergrund arbeiten.
          </p>
        </Reveal>
      </section>

      <section className="border-y border-line bg-bg-elevated/30">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((item, i) => (
              <Reveal key={item.title} delay={i * 80}>
                <div className="h-full rounded-2xl border border-line bg-bg p-7">
                  <h3 className="font-display text-base font-semibold text-fg">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-fg-muted">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal>
          <h2 className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
            Kontaktdaten
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <dl className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-fg-faint">
                Unternehmen
              </dt>
              <dd className="mt-2 text-base text-fg">{siteConfig.name}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-fg-faint">
                Sitz
              </dt>
              <dd className="mt-2 text-base text-fg">
                {siteConfig.city}, {siteConfig.region}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-fg-faint">
                Geschäftsführung
              </dt>
              <dd className="mt-2 text-base text-fg">{siteConfig.ceo}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-fg-faint">
                Anschrift
              </dt>
              <dd className="mt-2 text-base text-fg">{siteConfig.address}</dd>
            </div>
          </dl>
        </Reveal>
      </section>

      <CTASection />
    </>
  );
}
