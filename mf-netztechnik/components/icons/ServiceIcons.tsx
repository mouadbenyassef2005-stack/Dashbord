type IconProps = {
  className?: string;
};

export function GlasfaserIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <path
        d="M6 32C6 32 16 20 32 20C48 20 58 32 58 32"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.35"
      />
      <path
        d="M6 32C6 32 16 44 32 44C48 44 58 32 58 32"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.35"
      />
      <path
        d="M4 32H60"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="32" cy="32" r="4.5" fill="currentColor" />
      <circle cx="14" cy="32" r="2" fill="currentColor" opacity="0.6" />
      <circle cx="50" cy="32" r="2" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

export function NetzwerkIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <rect x="14" y="8" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="42" y="8" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="28" y="30" width="8" height="8" rx="1.5" fill="currentColor" />
      <rect x="14" y="48" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="42" y="48" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M18 16V26M46 16V26M32 38V44M18 48V38H46V48" stroke="currentColor" strokeWidth="1.5" />
      <path d="M18 26L32 34M46 26L32 34" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function SchrankIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <rect x="16" y="6" width="32" height="52" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <line x1="16" y1="18" x2="48" y2="18" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
      <line x1="16" y1="30" x2="48" y2="30" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
      <line x1="16" y1="42" x2="48" y2="42" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
      <circle cx="22" cy="12" r="1.4" fill="currentColor" />
      <circle cx="27" cy="12" r="1.4" fill="currentColor" opacity="0.5" />
      <circle cx="22" cy="24" r="1.4" fill="currentColor" />
      <circle cx="27" cy="24" r="1.4" fill="currentColor" opacity="0.5" />
      <circle cx="22" cy="36" r="1.4" fill="currentColor" />
      <circle cx="27" cy="36" r="1.4" fill="currentColor" opacity="0.5" />
      <rect x="40" y="9" width="4" height="4" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

export function MontageIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <path
        d="M14 50L38 26"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M32 20L44 32L50 26C52.5 23.5 52.5 20 50 17.5C47.5 15 44 15 41.5 17.5L32 20Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <rect
        x="8"
        y="46"
        width="12"
        height="12"
        rx="2"
        transform="rotate(-45 8 46)"
        fill="currentColor"
      />
      <circle cx="46" cy="21" r="2" fill="currentColor" opacity="0.6" />
    </svg>
  );
}
