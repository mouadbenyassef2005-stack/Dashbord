import { cx } from "./ui";

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
    <span dir="rtl" lang="ar" className={cx("arabic inline-block", !px && sizes[size], className)} style={px ? { fontSize: px, lineHeight: 1.75 } : undefined}>
      {text}
    </span>
  );
}
