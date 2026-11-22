"use client";
import type { ReactNode } from "react";

/** Arabischer Text: immer RTL + lang=ar, unabhängig vom umgebenden Text. */
export function Ar({ children, size = "teach", className = "", label }: { children: ReactNode; size?: "hero" | "teach" | "body"; className?: string; label?: string }) {
  return <span className={`ar ar-${size} ${className}`} lang="ar" dir="rtl" aria-label={label}>{children}</span>;
}

const P = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" } as const;
export const Icon = {
  speaker: <svg viewBox="0 0 24 24" width="20" height="20" {...P}><path d="M4 10v4h4l5 4V6L8 10H4z" /><path d="M16.5 9a4 4 0 010 6" /></svg>,
  ok: <svg viewBox="0 0 24 24" width="22" height="22" {...P}><circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" /></svg>,
  no: <svg viewBox="0 0 24 24" width="22" height="22" {...P}><circle cx="12" cy="12" r="9" /><path d="M9 9l6 6M15 9l-6 6" /></svg>,
};

/** Text mit eingebetteten arabischen Zeichen: jede arabische Folge wird als eigenes RTL-Element isoliert. */
export function RichText({ text }: { text: string }) {
  return <>{text.split(/([\u0600-\u06FF\u200D]+)/).map((part, i) => (i % 2 ? <Ar key={i} size="body">{part}</Ar> : part))}</>;
}
