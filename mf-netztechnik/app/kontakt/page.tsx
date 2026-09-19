import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import ContactForm from "@/components/ContactForm";
import Reveal from "@/components/Reveal";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Projekt anfragen oder Montagepartner werden – kontaktieren Sie M&F Netztechnik aus Dortmund für Glasfaser-, Netzwerk- und Kupferverkabelung in NRW.",
  alternates: { canonical: "/kontakt" },
};

export default function KontaktPage() {
  return (
    <>
      <PageHero
        eyebrow="Kontakt"
        title="Besprechen Sie Ihr Projekt mit uns."
        description="Ob Direktanfrage oder Subunternehmer-Anfrage: Nutzen Sie das Formular oder kontaktieren Sie uns direkt."
      />

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <div>
            <Reveal>
              <h2 className="font-display text-xl font-semibold text-fg">
                Kontaktdaten
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <dl className="mt-8 space-y-6">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-fg-faint">
                    Unternehmen
                  </dt>
                  <dd className="mt-2 text-base text-fg">{siteConfig.name}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-fg-faint">
                    Anschrift
                  </dt>
                  <dd className="mt-2 text-base text-fg">{siteConfig.address}</dd>
                  <dd className="text-base text-fg">
                    {siteConfig.city}, {siteConfig.region}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-fg-faint">
                    Telefon
                  </dt>
                  <dd className="mt-2 text-base text-fg">{siteConfig.phone}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-fg-faint">
                    E-Mail
                  </dt>
                  <dd className="mt-2 text-base text-fg">{siteConfig.email}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-fg-faint">
                    Einsatzgebiet
                  </dt>
                  <dd className="mt-2 text-base text-fg">
                    Ganz Nordrhein-Westfalen
                  </dd>
                </div>
              </dl>
            </Reveal>
          </div>

          <Reveal delay={100}>
            <div className="rounded-3xl border border-line bg-bg-elevated/40 p-6 sm:p-10">
              <ContactForm />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
