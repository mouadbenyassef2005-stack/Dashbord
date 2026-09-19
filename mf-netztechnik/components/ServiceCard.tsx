import Link from "next/link";
import type { ServiceCategory } from "@/lib/site";
import {
  GlasfaserIcon,
  MontageIcon,
  NetzwerkIcon,
  SchrankIcon,
} from "./icons/ServiceIcons";
import Reveal from "./Reveal";

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  glasfaser: GlasfaserIcon,
  "netzwerk-kupfer": NetzwerkIcon,
  schraenke: SchrankIcon,
  montage: MontageIcon,
};

export default function ServiceCard({
  service,
  delay = 0,
}: {
  service: ServiceCategory;
  delay?: number;
}) {
  const Icon = icons[service.id] ?? GlasfaserIcon;

  return (
    <Reveal delay={delay} className="h-full">
      <Link
        href={service.href}
        id={service.id}
        className="group relative flex h-full scroll-mt-28 flex-col justify-between overflow-hidden rounded-2xl border border-line bg-bg-elevated/60 p-7 transition-all duration-500 hover:border-accent/50 hover:bg-bg-elevated"
      >
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/0 blur-3xl transition-all duration-500 group-hover:bg-accent/10"
          aria-hidden="true"
        />
        <div>
          <div className="mb-8 flex items-start justify-between">
            <span className="font-display text-sm font-medium text-fg-faint">
              {service.number}
            </span>
            <Icon className="h-9 w-9 text-fg-muted transition-colors duration-500 group-hover:text-accent" />
          </div>
          <h3 className="font-display text-xl font-semibold text-fg mb-3">
            {service.title}
          </h3>
          <p className="text-sm leading-relaxed text-fg-muted mb-6">
            {service.description}
          </p>
          <ul className="space-y-2 mb-8">
            {service.items.slice(0, 4).map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-sm text-fg-muted"
              >
                <span className="h-1 w-1 flex-none rounded-full bg-accent/70" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-fg transition-colors duration-300 group-hover:text-accent">
          Mehr erfahren
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className="transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          >
            <path
              d="M1 7H13M13 7L7.5 1.5M13 7L7.5 12.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </Link>
    </Reveal>
  );
}
