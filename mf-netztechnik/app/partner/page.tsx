import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import ProcessSteps from "@/components/ProcessSteps";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";
import Button from "@/components/Button";
import { partnerAdvantages } from "@/lib/site";

export const metadata: Metadata = {
  title: "Für Partner – Montagepartner & Subunternehmer NRW",
  description:
    "Mehr Aufträge als Montagekapazität? M&F Netztechnik unterstützt Elektroinstallations-, IT- und Netzausbauunternehmen als flexibler Montagepartner für Glasfaser- und Netzwerkverkabelung in NRW.",
  alternates: { canonical: "/partner" },
};

const partnerTypes = [
  "Elektroinstallationsbetriebe",
  "IT-Systemhäuser",
  "Glasfaserunternehmen",
  "Netzwerktechnik-Unternehmen",
  "Bauunternehmen",
  "Generalunternehmer",
  "Tiefbau-/Netzausbauunternehmen",
  "Hausverwaltungen",
  "Gewerbliche Immobilienbetreiber",
];

export default function PartnerPage() {
  return (
    <>
      <PageHero
        eyebrow="Für Partner"
        title="Mehr Aufträge als Montagekapazität?"
        description="Sie haben das Projekt. Wir unterstützen bei der Umsetzung. M&F Netztechnik arbeitet als flexibler Montagepartner für Unternehmen, die kurzfristig zusätzliche Kapazität für Glasfaser- und Netzwerkmontage benötigen."
      />

      {/* VORTEILE */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <SectionHeading
          eyebrow="Vorteile"
          title="Warum M&F Netztechnik als Montagepartner"
          className="mb-14"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {partnerAdvantages.map((advantage, i) => (
            <Reveal key={advantage.title} delay={i * 70}>
              <div className="h-full rounded-2xl border border-line bg-bg-elevated/50 p-7">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 font-display text-base font-semibold text-fg">
                  {advantage.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-fg-muted">
                  {advantage.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* PARTNERTYPEN */}
      <section className="border-y border-line bg-bg-elevated/30">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-28">
          <SectionHeading
            eyebrow="Zusammenarbeit"
            title="Für wen wir als Montagepartner arbeiten"
            description="M&F Netztechnik unterstützt Unternehmen, die Montageleistungen im Bereich Glasfaser- und Netzwerkverkabelung an einen zuverlässigen Partner auslagern möchten."
            className="mb-12"
          />
          <Reveal delay={160}>
            <div className="flex flex-wrap gap-3">
              {partnerTypes.map((type) => (
                <span
                  key={type}
                  className="rounded-full border border-line bg-bg px-5 py-2.5 text-sm font-medium text-fg-muted"
                >
                  {type}
                </span>
              ))}
            </div>
          </Reveal>
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

      {/* PARTNER CTA */}
      <section className="relative overflow-hidden border-t border-line bg-bg-elevated/30">
        <div
          className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-3xl px-5 py-24 text-center sm:px-8 sm:py-28">
          <Reveal>
            <h2 className="text-3xl font-semibold leading-tight tracking-tight text-fg text-balance sm:text-4xl">
              Werden Sie Montagepartner von M&amp;F Netztechnik.
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-fg-muted sm:text-lg">
              Schildern Sie uns Ihr Projekt – wir melden uns zeitnah zur
              Abstimmung von Umfang und Terminen.
            </p>
          </Reveal>
          <Reveal delay={200}>
            <div className="mt-9">
              <Button href="/kontakt" variant="primary">
                Montagepartner werden
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
