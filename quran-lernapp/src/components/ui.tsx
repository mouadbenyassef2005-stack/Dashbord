import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(" ");

const btn = "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-[15px] font-medium transition active:scale-[0.98] disabled:opacity-45 disabled:pointer-events-none select-none";
const variants = {
  primary: "bg-primary text-white hover:bg-primary-strong shadow-sm",
  soft: "bg-primary-soft text-primary-strong hover:bg-[#d6e6e2]",
  ghost: "text-ink/80 hover:bg-ink/5",
  outline: "border border-line bg-surface text-ink hover:border-primary/40",
  danger: "bg-warn-soft text-warn hover:bg-[#f3d9d2]",
};
export type Variant = keyof typeof variants;

export function Button({ variant = "primary", className, ...p }: ComponentProps<"button"> & { variant?: Variant }) {
  return <button type="button" {...p} className={cx(btn, variants[variant], className)} />;
}
export function ButtonLink({ variant = "primary", className, ...p }: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link {...p} className={cx(btn, variants[variant], className)} />;
}

export function Card({ className, ...p }: ComponentProps<"div">) {
  return <div {...p} className={cx("rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-6", className)} />;
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
    <header className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-[15px] text-muted">{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}
