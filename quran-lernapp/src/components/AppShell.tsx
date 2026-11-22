"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { LessonProvider } from "@/lektion/features/LessonContext";
import { IconBook, IconHome, IconTrain, IconUser } from "./icons";
import { cx } from "./ui";

const NAV = [
  { href: "/", label: "Start", icon: IconHome },
  { href: "/lektion", label: "Lektion", icon: IconBook },
  { href: "/ueben", label: "Üben", icon: IconTrain },
  { href: "/profil", label: "Profil", icon: IconUser },
];

export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  return (
    <div className="mx-auto min-h-dvh max-w-6xl">
      <header className="sticky top-0 z-30 border-b border-line/60 bg-bg/90 px-4 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 rounded-xl" aria-label="Qaidah Startseite">
            <span className="grid size-10 place-items-center rounded-2xl bg-primary text-white shadow-sm shadow-primary/20"><IconBook className="size-5" /></span>
            <span>
              <span className="block text-[17px] font-bold leading-tight tracking-tight">Qaidah</span>
              <span className="block text-[9px] font-semibold uppercase tracking-[0.2em] text-muted">Arabisch lesen</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 rounded-2xl border border-line/70 bg-surface/80 p-1 shadow-sm sm:flex" aria-label="Hauptnavigation">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} aria-current={active(n.href) ? "page" : undefined} className={cx("rounded-xl px-4 py-2.5 text-[13px] font-semibold transition", active(n.href) ? "bg-primary-soft text-primary-strong" : "text-muted hover:bg-bg hover:text-ink")}>
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="px-4 pb-28 pt-5 sm:px-8 sm:pb-16 sm:pt-8"><LessonProvider>{children}</LessonProvider></main>
      <nav className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 mx-auto max-w-lg rounded-[1.35rem] border border-line/90 bg-surface/95 p-1.5 shadow-card backdrop-blur-xl sm:hidden" aria-label="Hauptnavigation">
        <ul className="flex justify-around">
          {NAV.map((n) => (
            <li key={n.href}>
              <Link href={n.href} aria-current={active(n.href) ? "page" : undefined} className={cx("flex min-w-[3.5rem] flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-semibold transition", active(n.href) ? "bg-primary-soft text-primary-strong" : "text-muted hover:bg-bg")}>
                <n.icon className="size-[21px]" />
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
