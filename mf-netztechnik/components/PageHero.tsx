import type { ReactNode } from "react";
import Reveal from "./Reveal";

type PageHeroProps = {
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
};

export default function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div
        className="pointer-events-none absolute inset-0 grid-fade-mask opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(var(--line-soft) 1px, transparent 1px), linear-gradient(90deg, var(--line-soft) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-5xl px-5 pb-16 pt-20 sm:px-8 sm:pb-20 sm:pt-28">
        <Reveal>
          <div className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent pulse-dot" />
            {eyebrow}
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight text-fg text-balance sm:text-5xl md:text-6xl">
            {title}
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-fg-muted sm:text-lg">
            {description}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
