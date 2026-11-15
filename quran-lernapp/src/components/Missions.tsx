import Link from "next/link";
import type { Mission } from "@/lib/missions";
import { IconCheck } from "./icons";
import { cx } from "./ui";

export function MissionList({ missions }: { missions: Mission[] }) {
  return (
    <ul className="space-y-2.5" data-testid="missions">
      {missions.map((m) => {
        const body = (
          <>
            <span className={cx("grid size-6 shrink-0 place-items-center rounded-full", m.done ? "bg-ok text-white" : "border border-line")}>{m.done && <IconCheck className="size-4" />}</span>
            <div className="min-w-0 flex-1">
              <p className={cx("text-[15px] font-medium", m.done && "text-muted line-through")}>{m.title}</p>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink/8"><div className={cx("h-full rounded-full", m.done ? "bg-ok" : "bg-primary")} style={{ width: `${(m.progress / m.target) * 100}%` }} /></div>
            </div>
            <span className="text-sm tabular-nums text-muted">{m.progress}/{m.target}</span>
          </>
        );
        return (
          <li key={m.id}>
            {m.done || !m.href ? <div className="flex items-center gap-3">{body}</div> : <Link href={m.href} className="flex items-center gap-3 rounded-xl transition hover:opacity-80">{body}</Link>}
          </li>
        );
      })}
    </ul>
  );
}
