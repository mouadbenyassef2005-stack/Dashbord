type P = { className?: string };
const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", viewBox: "0 0 24 24", "aria-hidden": true } as const;
export const IconArrow = ({ className = "size-5" }: P) => (<svg {...base} className={className}><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
export const IconHome = ({ className = "size-6" }: P) => (<svg {...base} className={className}><path d="m4 11 8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-8Z" /></svg>);
export const IconBook = ({ className = "size-6" }: P) => (<svg {...base} className={className}><path d="M5 4h10a4 4 0 0 1 4 4v12H9a4 4 0 0 1-4-4V4Z" /><path d="M5 16a4 4 0 0 1 4-4h10" /></svg>);
export const IconTrain = ({ className = "size-6" }: P) => (<svg {...base} className={className}><path d="M5 12.5 9.5 17 19 7.5" /></svg>);
export const IconUser = ({ className = "size-6" }: P) => (<svg {...base} className={className}><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>);
