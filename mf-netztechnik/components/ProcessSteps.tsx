import { process } from "@/lib/site";
import Reveal from "./Reveal";

export default function ProcessSteps() {
  return (
    <div className="relative grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
      {process.map((step, i) => (
        <Reveal key={step.number} delay={i * 90} className="h-full">
          <div className="group relative h-full bg-bg p-8 transition-colors duration-500 hover:bg-bg-elevated">
            <span className="font-display text-sm text-fg-faint">
              {step.number}
            </span>
            <h3 className="mt-6 font-display text-lg font-semibold text-fg">
              {step.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-fg-muted">
              {step.description}
            </p>
            {i < process.length - 1 && (
              <span
                className="absolute right-0 top-1/2 hidden h-px w-4 -translate-y-1/2 translate-x-full bg-line lg:block"
                aria-hidden="true"
              />
            )}
          </div>
        </Reveal>
      ))}
    </div>
  );
}
