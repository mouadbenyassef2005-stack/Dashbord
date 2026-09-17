export default function HeroVisual() {
  const nodes = [
    { x: 60, y: 90 },
    { x: 160, y: 40 },
    { x: 260, y: 110 },
    { x: 340, y: 60 },
    { x: 120, y: 200 },
    { x: 230, y: 230 },
    { x: 340, y: 190 },
    { x: 60, y: 300 },
    { x: 200, y: 340 },
    { x: 330, y: 320 },
  ];

  const links: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 3],
    [1, 4],
    [4, 5],
    [5, 6],
    [2, 6],
    [4, 7],
    [5, 8],
    [6, 9],
    [8, 9],
    [7, 8],
  ];

  return (
    <div className="relative aspect-[4/3] w-full max-w-xl">
      <div
        className="absolute inset-0 rounded-[2rem] border border-line bg-bg-elevated/40"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-10 -top-10 h-56 w-56 rounded-full bg-accent/10 blur-3xl float-slow"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-14 -right-10 h-64 w-64 rounded-full bg-accent/10 blur-3xl float-slow"
        style={{ animationDelay: "1.5s" }}
        aria-hidden="true"
      />
      <svg
        viewBox="0 0 400 380"
        className="relative h-full w-full p-8"
        fill="none"
        aria-hidden="true"
      >
        {links.map(([a, b], i) => (
          <line
            key={i}
            x1={nodes[a].x}
            y1={nodes[a].y}
            x2={nodes[b].x}
            y2={nodes[b].y}
            stroke="currentColor"
            strokeWidth="1"
            className="text-fg-faint"
            opacity="0.5"
          />
        ))}
        {links.slice(0, 5).map(([a, b], i) => (
          <line
            key={`glow-${i}`}
            x1={nodes[a].x}
            y1={nodes[a].y}
            x2={nodes[b].x}
            y2={nodes[b].y}
            stroke="var(--accent)"
            strokeWidth="1.4"
            strokeDasharray="6 10"
            opacity="0.8"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="160"
              to="0"
              dur={`${3 + i}s`}
              repeatCount="indefinite"
            />
          </line>
        ))}
        {nodes.map((n, i) => (
          <circle
            key={i}
            cx={n.x}
            cy={n.y}
            r={i === 5 ? 6 : 3.5}
            fill={i === 5 ? "var(--accent)" : "currentColor"}
            className={i === 5 ? "" : "text-fg-muted"}
          />
        ))}
      </svg>
      <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between rounded-xl border border-line-soft bg-bg/80 px-4 py-3 backdrop-blur-sm">
        <span className="text-xs font-medium text-fg-muted">
          OTDR-Messung
        </span>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-accent pulse-dot" />
          aktiv
        </span>
      </div>
    </div>
  );
}
