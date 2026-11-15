"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useProgress } from "@/lib/store";
import type { ReactNode } from "react";
import { IconHome, IconPath, IconTrain, IconTrophy, IconUser } from "./icons";
import { cx } from "./ui";

const NAV = [
  { href: "/", label: "Start", icon: IconHome },
  { href: "/pfad", label: "Lernpfad", icon: IconPath },
  { href: "/training", label: "Lesetraining", icon: IconTrain },
  { href: "/erfolge", label: "Erfolge", icon: IconTrophy },
  { href: "/profil", label: "Profil", icon: IconUser },
];

export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { progress, hydrated } = useProgress();
  const immersive = path.startsWith("/lektion") || path.startsWith("/spiele") || path.startsWith("/onboarding");
  const needsOnboarding = hydrated && !progress.onboarded;
  useEffect(() => {
    if (!immersive && needsOnboarding) router.replace("/onboarding");
  }, [immersive, needsOnboarding, router]);
  if (immersive) return <>{children}</>;
  if (!hydrated || needsOnboarding) return <div className="grid min-h-dvh place-items-center text-muted" aria-busy>Lade …</div>;
  const active = (href: string) => (href === "/" ? path === "/" : href === "/training" ? path.startsWith("/training") || path.startsWith("/woerter") : path.startsWith(href));
  return (
    <div className="mx-auto min-h-dvh max-w-5xl">
      <header className="hidden items-center justify-between px-8 py-6 sm:flex">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Qaidah<span className="text-gold">.</span>
        </Link>
        <nav className="flex items-center gap-1" aria-label="Hauptnavigation">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={active(n.href) ? "page" : undefined} className={cx("rounded-full px-4 py-2 text-sm font-medium transition", active(n.href) ? "bg-primary text-white" : "text-ink/70 hover:bg-ink/5")}>
              {n.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="px-4 pb-28 pt-5 sm:px-8 sm:pb-16 sm:pt-2">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden" aria-label="Hauptnavigation">
        <ul className="mx-auto flex max-w-md justify-around px-2 py-1.5">
          {NAV.map((n) => (
            <li key={n.href}>
              <Link href={n.href} aria-current={active(n.href) ? "page" : undefined} className={cx("flex min-w-14 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[11px] font-medium", active(n.href) ? "text-primary" : "text-muted")}>
                <n.icon className="size-6" />
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
