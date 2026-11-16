"use client";
import { cx } from "./ui";

/** Amiri Quran enthält U+065E nicht – solche Wörter nutzen Scheherazade New. */
export const needsAlt = (t: string) => t.includes("\u065E");

const sizes = {
  xl: "text-[88px] sm:text-[112px] leading-[1.5]",
  lg: "text-5xl sm:text-6xl leading-[1.8]",
  md: "text-4xl sm:text-5xl leading-[1.9]",
  sm: "text-3xl",
  xs: "text-2xl",
};

/** Arabischer Text: RTL, Quran-geeignete Schrift, große Zeichen. */
export function ArabicText({ text, size = "lg", className, px }: { text: string; size?: keyof typeof sizes; className?: string; px?: number }) {
  return (
    <span dir="rtl" lang="ar" className={cx("arabic inline-block", needsAlt(text) && "arabic-alt", !px && sizes[size], className)} style={px ? { fontSize: px, lineHeight: 2.1, paddingBottom: px * 0.12 } : undefined}>
      {text}
    </span>
  );
}

const A = "\u0600-\u06FF\u0750-\u077F";
const RUN = new RegExp(`([${A}][${A}\u200C\u200D ]*[${A}]|[${A}])`, "g");

/** Fließtext, in dem arabische Abschnitte automatisch in der Quran-Schrift gesetzt werden (sonst fehlen Zeichen/Harakat). */
export function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split(RUN).map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} dir="rtl" lang="ar" className={cx("arabic inline-block align-middle text-[1.35em] leading-[1.6]", needsAlt(part) && "arabic-alt")}>{part}</span>
        ) : (
          part
        ),
      )}
    </>
  );
}
