import type { ReactNode } from "react";
import type { MasteryLevel } from "@/domain/types";

export const LEVEL_LABEL: Record<MasteryLevel, string> = { new: "Neu", learning: "Im Lernen", familiar: "Vertraut", mastered: "Gemeistert" };

export function Mastery({ level }: { level: MasteryLevel }) {
  return (
    <span className="mastery" data-level={level} role="img" aria-label={`Stand: ${LEVEL_LABEL[level]}`}>
      <i /><i /><i />
    </span>
  );
}

/** Arabischer Text: immer RTL + lang=ar, unabhängig vom umgebenden Text. */
export function Ar({ children, size = "teach", className = "", label }: { children: ReactNode; size?: "hero" | "teach" | "body"; className?: string; label?: string }) {
  return <span className={`ar ar-${size} ${className}`} lang="ar" dir="rtl" aria-label={label}>{children}</span>;
}

const P = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" } as const;
export const Icon = {
  today: <svg viewBox="0 0 24 24" {...P}><circle cx="12" cy="12" r="8" /><path d="M12 7v5l3 2" /></svg>,
  path: <svg viewBox="0 0 24 24" {...P}><path d="M5 19c0-5 14-3 14-9" /><circle cx="5" cy="19" r="1.5" /><circle cx="19" cy="6" r="1.5" /></svg>,
  letters: <svg viewBox="0 0 24 24" {...P}><rect x="4" y="4" width="6" height="6" rx="1.5" /><rect x="14" y="4" width="6" height="6" rx="1.5" /><rect x="4" y="14" width="6" height="6" rx="1.5" /><rect x="14" y="14" width="6" height="6" rx="1.5" /></svg>,
  practice: <svg viewBox="0 0 24 24" {...P}><path d="M5 12l4 4 10-10" /></svg>,
  me: <svg viewBox="0 0 24 24" {...P}><circle cx="12" cy="9" r="3.5" /><path d="M5 20c1-4 13-4 14 0" /></svg>,
  speaker: <svg viewBox="0 0 24 24" width="20" height="20" {...P}><path d="M4 10v4h4l5 4V6L8 10H4z" /><path d="M16.5 9a4 4 0 010 6" /></svg>,
  ok: <svg viewBox="0 0 24 24" width="22" height="22" {...P}><circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" /></svg>,
  no: <svg viewBox="0 0 24 24" width="22" height="22" {...P}><circle cx="12" cy="12" r="9" /><path d="M9 9l6 6M15 9l-6 6" /></svg>,
};

/** Text mit eingebetteten arabischen Zeichen: jede arabische Folge wird als eigenes RTL-Element isoliert. */
export function RichText({ text }: { text: string }) {
  return <>{text.split(/([\u0600-\u06FF\u200D]+)/).map((part, i) => (i % 2 ? <Ar key={i} size="body">{part}</Ar> : part))}</>;
}
