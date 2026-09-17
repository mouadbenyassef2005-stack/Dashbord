import Link from "next/link";
import { footerNav, legalNav, siteConfig } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-bg">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="font-display text-lg font-semibold tracking-tight text-fg"
            >
              M&amp;F <span className="text-accent">NETZTECHNIK</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-fg-muted">
              {siteConfig.city} · {siteConfig.region}
            </p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-fg-muted">
              Glasfaser-, Netzwerk- und Kupferverkabelung für Unternehmen in
              ganz NRW.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-fg-faint">
              Navigation
            </p>
            <ul className="mt-4 space-y-3">
              {footerNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-fg-muted transition-colors hover:text-accent"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-fg-faint">
              Kontakt
            </p>
            <ul className="mt-4 space-y-3 text-sm text-fg-muted">
              <li>{siteConfig.address}</li>
              <li>{siteConfig.phone}</li>
              <li>{siteConfig.email}</li>
            </ul>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.15em] text-fg-faint">
              Rechtliches
            </p>
            <ul className="mt-4 space-y-3">
              {legalNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-fg-muted transition-colors hover:text-accent"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-line-soft pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-fg-faint">
            © {new Date().getFullYear()} {siteConfig.name}. Alle Rechte
            vorbehalten.
          </p>
          <p className="text-xs text-fg-faint">
            Geschäftsführung: {siteConfig.ceo}
          </p>
        </div>
      </div>
    </footer>
  );
}
