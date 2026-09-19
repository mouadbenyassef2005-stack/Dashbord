import Button from "./Button";
import Reveal from "./Reveal";

export default function CTASection() {
  return (
    <section className="relative overflow-hidden border-t border-line">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-px w-full max-w-4xl -translate-x-1/2 line-sweep"
        aria-hidden="true"
      />
      <div className="mx-auto max-w-4xl px-5 py-24 text-center sm:px-8 sm:py-32">
        <Reveal>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-fg text-balance sm:text-4xl md:text-5xl">
            Bereit für das nächste Projekt?
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-fg-muted sm:text-lg">
            Besprechen Sie Ihr Projekt mit M&amp;F Netztechnik.
          </p>
        </Reveal>
        <Reveal delay={200}>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button href="/kontakt" variant="primary">
              Projekt anfragen
            </Button>
            <Button href="/kontakt" variant="secondary">
              Kontakt aufnehmen
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
