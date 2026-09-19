import type { Metadata } from "next";
import Button from "@/components/Button";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import ServiceCard from "@/components/ServiceCard";
import ProcessSteps from "@/components/ProcessSteps";
import CTASection from "@/components/CTASection";
import HeroVisual from "@/components/visuals/HeroVisual";
import NRWMap from "@/components/visuals/NRWMap";
import { nrwCities, partnerAdvantages, services } from "@/lib/site";

export const metadata: Metadata = {
  title: "Glasfaser- & Netzwerkmontage für Unternehmen in NRW",
  description:
    "M&F Netztechnik aus Dortmund übernimmt Glasfaser-, Netzwerk- und Kupferverkabelung für Unternehmen in ganz NRW – direkt oder als Montagepartner für Ihr Team.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 grid-fade-mask opacity-50"
          style={{
            backgroundImage:
              "linear-gradient(var(--line-soft) 1px, transparent 1px), linear-gradient(90deg, var(--line-soft) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-20 lg:grid-cols-2 lg:gap-10 lg:pt-24">
          <div>
            <Reveal>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-bg-elevated/60 px-4 py-1.5 text-xs font-medium text-fg-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-accent pulse-dot" />
                Montage &amp; Installation für B2B-Projekte in NRW
              </div>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="text-4xl font-semibold leading-[1.04] tracking-tight text-fg text-balance sm:text-5xl md:text-6xl">
                Netzwerkinfrastruktur.
                <br />
                Sauber installiert.
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-6 max-w-md text-base leading-relaxed text-fg-muted sm:text-lg">
                Glasfaser-, Kupfer- und Netzwerkverkabelung für Unternehmen in
                ganz NRW.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Button href="/kontakt" variant="primary">
                  Projekt anfragen
                </Button>
                <Button href="/partner" variant="secondary">
                  Montagepartner werden
                </Button>
              </div>
            </Reveal>
          </div>
          <Reveal delay={200} className="flex justify-center lg:justify-end">
            <HeroVisual />
          </Reveal>
        </div>
      </section>

      {/* TRUST / POSITIONIERUNG */}
      <section className="border-y border-line bg-bg-elevated/30">
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-8 sm:py-28">
          <SectionHeading
            align="center"
            eyebrow="M&F Netztechnik"
            title="Wir verbinden Gebäude, Arbeitsplätze und technische Infrastruktur."
            description="M&F Netztechnik ist auf die Montage passiver Netzwerk- und Glasfaserinfrastruktur spezialisiert – von der einzelnen Verkabelung bis zur Unterstützung größerer Projekte in ganz Nordrhein-Westfalen."
          />
        </div>
      </section>

      {/* LEISTUNGEN */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <SectionHeading
          eyebrow="Leistungen"
          title="Was wir für Sie umsetzen"
          description="Vier Kernbereiche rund um Glasfaser-, Netzwerk- und Kupferverkabelung."
          className="mb-14"
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, i) => (
            <ServiceCard key={service.id} service={service} delay={i * 90} />
          ))}
        </div>
      </section>

      {/* B2B SECTION */}
      <section className="border-y border-line bg-bg-elevated/30">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-14 px-5 py-24 sm:px-8 sm:py-28 lg:grid-cols-2 lg:gap-20">
          <SectionHeading
            eyebrow="Arbeitsweise"
            title="Eine technische Infrastruktur ist nur so gut wie ihre Ausführung."
            description="Wir setzen Montage- und Verkabelungsarbeiten strukturiert und sauber um – nachvollziehbar dokumentiert und abgestimmt auf Ihr Projekt."
          />
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
            {[
              {
                title: "Strukturierte Arbeitsweise",
                description: "Klar geplante Abläufe von der Planung bis zur Abnahme.",
              },
              {
                title: "Saubere Installation",
                description: "Ordentliche Kabelführung und fachgerechte Montage.",
              },
              {
                title: "Nachvollziehbare Dokumentation",
                description: "Messwerte und Ergebnisse werden dokumentiert übergeben.",
              },
              {
                title: "Flexible Projektunterstützung",
                description: "Einsatzbereit für Einzelaufträge und größere Projekte.",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 90} className="h-full">
                <div className="h-full bg-bg p-7">
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

      {/* DIREKTKUNDEN */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-28">
        <div className="grid grid-cols-1 items-center gap-12 rounded-3xl border border-line bg-bg-elevated/50 p-10 sm:p-14 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <Reveal>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Für Unternehmen
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-fg text-balance sm:text-4xl">
                Sie planen ein Projekt?
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-fg-muted sm:text-lg">
                Ob Neubau, Erweiterung oder Nachrüstung – wir unterstützen
                Unternehmen bei der Umsetzung ihrer passiven Netzwerk- und
                Glasfaserinfrastruktur.
              </p>
            </Reveal>
          </div>
          <Reveal delay={220} className="flex lg:justify-end">
            <Button href="/kontakt" variant="primary">
              Projekt anfragen
            </Button>
          </Reveal>
        </div>
      </section>

      {/* SUBUNTERNEHMER / PARTNER */}
      <section className="relative overflow-hidden border-y border-line bg-bg-elevated/30">
        <div
          className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-28">
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
            <div>
              <Reveal>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                  Für Partner
                </span>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-fg text-balance sm:text-4xl md:text-5xl">
                  Mehr Aufträge als Montagekapazität?
                </h2>
              </Reveal>
              <Reveal delay={160}>
                <p className="mt-5 max-w-md text-base leading-relaxed text-fg-muted sm:text-lg">
                  Sie haben das Projekt. Wir unterstützen bei der Umsetzung –
                  als flexibler Montagepartner für Elektroinstallations-,
                  IT- und Netzausbauunternehmen.
                </p>
              </Reveal>
              <Reveal delay={240}>
                <div className="mt-9">
                  <Button href="/partner" variant="primary">
                    Montagepartner werden
                  </Button>
                </div>
              </Reveal>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {partnerAdvantages.map((advantage, i) => (
                <Reveal key={advantage.title} delay={i * 80}>
                  <div className="h-full rounded-xl border border-line bg-bg p-6">
                    <h3 className="font-display text-sm font-semibold text-fg">
                      {advantage.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                      {advantage.description}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ABLAUF */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-28">
        <SectionHeading
          eyebrow="Ablauf"
          title="So läuft die Zusammenarbeit"
          className="mb-14"
        />
        <ProcessSteps />
      </section>

      {/* EINSATZGEBIET */}
      <section className="border-y border-line bg-bg-elevated/30">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-5 py-24 sm:px-8 sm:py-28 lg:grid-cols-2 lg:gap-10">
          <div>
            <SectionHeading
              eyebrow="Einsatzgebiet"
              title="Unterwegs in ganz NRW"
              description="Mit Sitz in Dortmund sind wir im gesamten Bundesland unterwegs – unter anderem in folgenden Regionen. Die Verfügbarkeit vor Ort klären wir je nach Projekt und Terminlage individuell ab."
            />
            <Reveal delay={200}>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                {nrwCities.map((city) => (
                  <li
                    key={city}
                    className="flex items-center gap-2 text-sm font-medium text-fg-muted"
                  >
                    <span className="h-1 w-1 rounded-full bg-accent" />
                    {city}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={260}>
              <p className="mt-6 text-sm text-fg-faint">
                und Umgebung
              </p>
            </Reveal>
          </div>
          <Reveal delay={160}>
            <NRWMap />
          </Reveal>
        </div>
      </section>

      <CTASection />
    </>
  );
}
