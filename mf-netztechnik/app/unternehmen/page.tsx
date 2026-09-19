import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import CTASection from "@/components/CTASection";
import ProcessSteps from "@/components/ProcessSteps";
import SectionHeading from "@/components/SectionHeading";
import ServiceCard from "@/components/ServiceCard";
import Reveal from "@/components/Reveal";
import { services } from "@/lib/site";

export const metadata: Metadata = {
  title: "Für Unternehmen – Glasfaser- & Netzwerkmontage",
  description:
    "Sie planen eine neue Netzwerk- oder Glasfaserinfrastruktur? M&F Netztechnik übernimmt die fachgerechte Montage und Verkabelung für Unternehmen in ganz NRW.",
  alternates: { canonical: "/unternehmen" },
};

const points = [
  {
    title: "Neubau & Erweiterung",
    description:
      "Aufbau neuer Netzwerk- und Glasfaserinfrastruktur oder Erweiterung bestehender Anlagen.",
  },
  {
    title: "Nachrüstung",
    description:
      "Nachträgliche Verkabelung in bestehenden Gebäuden und Gewerbeflächen.",
  },
  {
    title: "Saubere Dokumentation",
    description:
      "Mess- und Prüfergebnisse werden nachvollziehbar dokumentiert übergeben.",
  },
  {
    title: "NRW-weiter Einsatz",
    description:
      "Mit Sitz in Dortmund sind wir im gesamten Bundesland einsetzbar.",
  },
];

export default function UnternehmenPage() {
  return (
    <>
      <PageHero
        eyebrow="Für Unternehmen"
        title="Ihre Netzwerk- und Glasfaserinfrastruktur – fachgerecht montiert."
        description="Sie planen eine neue Netzwerk- oder Glasfaserinfrastruktur? Wir übernehmen die fachgerechte Montage und Verkabelung – strukturiert, sauber und dokumentiert."
      />

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {points.map((point, i) => (
            <Reveal key={point.title} delay={i * 80}>
              <div className="h-full rounded-2xl border border-line bg-bg-elevated/50 p-7">
                <h3 className="font-display text-base font-semibold text-fg">
                  {point.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-fg-muted">
                  {point.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-bg-elevated/30">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-28">
          <SectionHeading
            eyebrow="Leistungen"
            title="Leistungen für Ihr Projekt"
            description="Vier Kernbereiche, die wir direkt für Unternehmen und Gewerbekunden umsetzen."
            className="mb-14"
          />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service, i) => (
              <ServiceCard key={service.id} service={service} delay={i * 90} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-28">
        <SectionHeading
          eyebrow="Ablauf"
          title="So läuft die Zusammenarbeit"
          className="mb-14"
        />
        <ProcessSteps />
      </section>

      <CTASection />
    </>
  );
}
