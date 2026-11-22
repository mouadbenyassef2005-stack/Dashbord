import type { AnchorHTMLAttributes } from "react";

/** Ersatz für next/link im Einzeldatei-Build: Hash-Routing, funktioniert per Doppelklick (file://). */
export default function Link({ href, ...p }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return <a href={`#${href}`} {...p} />;
}
