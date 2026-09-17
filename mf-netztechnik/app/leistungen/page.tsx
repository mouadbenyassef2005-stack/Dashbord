import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import CTASection from "@/components/CTASection";
import Reveal from "@/components/Reveal";
import Button from "@/components/Button";
import { services } from "@/lib/site";
import {
  GlasfaserIcon,
  MontageIcon,
  NetzwerkIcon,
  SchrankIcon,
} from "@/components/icons/ServiceIcons";

export const metadata: Metadata = {
  title: "Leistungen – Glasfaser, Netzwerk & Kupferverkabelung",
  description:
    "Glasfaser verlegen, spleißen und messen, strukturierte Netzwerk- und Kupferverkabelung, Server- und Netzwerkschränke sowie Montage- und Projektunterstützung in ganz NRW.",
  alternates: { canonical: "/leistungen" },
};

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  glasfaser: GlasfaserIcon,
  "netzwerk-kupfer": NetzwerkIcon,
  schraenke: SchrankIcon,
  montage: MontageIcon,
};

export default function LeistungenPage() {
  return (
    <>
      <PageHero
        eyebrow="Leistungen"
        title="Montage & Verkabelung – präzise umgesetzt."
        description="Von der Glasfaserstrecke bis zum fertigen Netzwerkschrank: M&F Netztechnik übernimmt die fachgerechte Montage passiver Netzwerk- und Glasfaserinfrastruktur für Unternehmen in ganz NRW."
      />

      <div className="divide-y divide-line">
        {services.map((service, index) => {
          const Icon = icons[service.id] ?? GlasfaserIcon;
          const reversed = index % 2 === 1;

          return (
            <section
              key={service.id}
              id={service.id}
              className="scroll-mt-24 py-20 sm:py-28"
            >
              <div className="mx-auto max-w-7xl px-5 sm:px-8">
                <div
                  className={`grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20 ${
                    reversed ? "lg:[&>*:first-child]:order-2" : ""
                  }`}
                >
                  <div>
                    <Reveal>
                      <div className="flex items-center gap-4">
                        <span className="font-display text-sm text-fg-faint">
                          {service.number}
                        </span>
                        <span className="h-px flex-1 max-w-16 bg-line" />
                        <Icon className="h-8 w-8 text-accent" />
                      </div>
                    </Reveal>
                    <Reveal delay={80}>
                      <h2 className="mt-6 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
                        {service.title}
                      </h2>
                    </Reveal>
                    <Reveal delay={140}>
                      <p className="mt-4 max-w-lg text-base leading-relaxed text-fg-muted sm:text-lg">
                        {service.description}
                      </p>
                    </Reveal>
                    <Reveal delay={200}>
                      <div className="mt-8 flex gap-4">
                        <Button href="/kontakt" variant="primary">
                          Projekt anfragen
                        </Button>
                      </div>
                    </Reveal>
                  </div>

                  <Reveal delay={120}>
                    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
                      {service.items.map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-3 bg-bg-elevated/60 px-5 py-4"
                        >
                          <span className="h-1.5 w-1.5 flex-none rounded-full bg-accent" />
                          <span className="text-sm text-fg">{item}</span>
                        </div>
                      ))}
                    </div>
                  </Reveal>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <CTASection />
    </>
  );
}
