import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(" ");

const btn = "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-[15px] font-semibold transition duration-200 active:scale-[0.98] disabled:opacity-45 disabled:pointer-events-none select-none";
const variants = {
  primary: "bg-primary text-white shadow-sm shadow-primary/15 hover:bg-primary-strong",
  soft: "bg-primary-soft text-primary-strong hover:bg-primary-soft/80",
  ghost: "text-ink/80 hover:bg-ink/5",
  outline: "border border-line/90 bg-surface text-ink shadow-sm shadow-ink/5 hover:border-primary/30 hover:bg-primary-soft/40",
  danger: "bg-warn-soft text-warn hover:bg-warn-soft/80",
};
export type Variant = keyof typeof variants;

export function Button({ variant = "primary", className, ...p }: ComponentProps<"button"> & { variant?: Variant }) {
  return <button type="button" {...p} className={cx(btn, variants[variant], className)} />;
}
export function ButtonLink({ variant = "primary", className, ...p }: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link {...p} className={cx(btn, variants[variant], className)} />;
}

export function Card({ className, ...p }: ComponentProps<"div">) {
  return <div {...p} className={cx("rounded-[1.75rem] border border-line/80 bg-surface p-5 shadow-card transition-shadow sm:p-6", className)} />;
}

export function ProgressBar({ value, className, label }: { value: number; className?: string; label?: string }) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(v * 100)} aria-label={label} className={cx("h-2 w-full overflow-hidden rounded-full bg-ink/8", className)}>
      <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${v * 100}%` }} />
    </div>
  );
}

export function Ring({ value, size = 88, children }: { value: number; size?: number; children?: ReactNode }) {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-line)" strokeWidth="8" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-primary)" strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v)} className="transition-[stroke-dashoffset] duration-700" />
      </svg>
      <div className="absolute text-center text-sm font-semibold">{children}</div>
    </div>
  );
}

export function Chip({ tone = "neutral", children, className }: { tone?: "neutral" | "ok" | "warn" | "gold" | "primary"; children: ReactNode; className?: string }) {
  const tones = {
    neutral: "bg-ink/6 text-ink/70",
    ok: "bg-ok-soft text-ok",
    warn: "bg-warn-soft text-warn",
    gold: "bg-gold-soft text-gold",
    primary: "bg-primary-soft text-primary-strong",
  };
  return <span className={cx("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium", tones[tone], className)}>{children}</span>;
}

/** Kennzeichnung für simuliertes Feedback. Muss überall sichtbar sein, wo Demo-Ergebnisse stehen. */
export function DemoBadge({ className }: { className?: string }) {
  return <Chip tone="gold" className={className}>DEMO · simuliert</Chip>;
}

export function PageHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <header className="mb-5 flex items-end justify-between gap-4 border-b border-line/70 pb-5 sm:mb-7">
      <div>
        <h1 className="text-[1.75rem] font-semibold leading-tight tracking-[-0.035em] sm:text-[2rem]">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-muted">{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}
