import type { ReactNode } from "react";
import Reveal from "./Reveal";

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className = "",
}: SectionHeadingProps) {
  return (
    <div
      className={`max-w-2xl ${
        align === "center" ? "mx-auto text-center" : ""
      } ${className}`}
    >
      {eyebrow && (
        <Reveal>
          <div
            className={`flex items-center gap-2 mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-accent ${
              align === "center" ? "justify-center" : "justify-start"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent pulse-dot" />
            {eyebrow}
          </div>
        </Reveal>
      )}
      <Reveal delay={80}>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-[1.08] tracking-tight text-fg text-balance">
          {title}
        </h2>
      </Reveal>
      {description && (
        <Reveal delay={160}>
          <p className="mt-5 text-base sm:text-lg leading-relaxed text-fg-muted text-balance">
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
}
