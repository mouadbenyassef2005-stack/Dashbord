const cities = [
  { name: "Münster", x: 255, y: 70, hq: false },
  { name: "Bielefeld", x: 360, y: 95, hq: false },
  { name: "Duisburg", x: 95, y: 250, hq: false },
  { name: "Essen", x: 140, y: 235, hq: false },
  { name: "Bochum", x: 175, y: 245, hq: false },
  { name: "Dortmund", x: 220, y: 225, hq: true },
  { name: "Düsseldorf", x: 130, y: 310, hq: false },
  { name: "Köln", x: 165, y: 415, hq: false },
];

const outline =
  "M180 20 L280 35 L330 55 L380 90 L390 140 L360 170 L340 210 L300 230 L310 280 L280 340 L250 400 L220 470 L180 460 L150 420 L120 380 L90 340 L60 300 L50 250 L70 210 L60 170 L90 130 L80 90 L120 55 L150 35 Z";

export default function NRWMap() {
  const hq = cities.find((c) => c.hq)!;

  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-md">
      <svg
        viewBox="0 0 440 500"
        className="h-full w-full"
        fill="none"
        aria-hidden="true"
      >
        <path
          d={outline}
          stroke="var(--line)"
          strokeWidth="1.5"
          fill="var(--bg-elevated)"
          fillOpacity="0.4"
        />
        <path d={outline} stroke="var(--line)" strokeWidth="1" fill="none" opacity="0.5" />

        {cities
          .filter((c) => !c.hq)
          .map((c) => (
            <line
              key={c.name}
              x1={hq.x}
              y1={hq.y}
              x2={c.x}
              y2={c.y}
              stroke="var(--accent)"
              strokeWidth="1"
              strokeDasharray="3 6"
              opacity="0.4"
            />
          ))}

        {cities.map((c) => (
          <g key={c.name}>
            {c.hq && (
              <circle cx={c.x} cy={c.y} r="14" fill="var(--accent)" opacity="0.15" />
            )}
            <circle
              cx={c.x}
              cy={c.y}
              r={c.hq ? 6 : 3.5}
              fill={c.hq ? "var(--accent)" : "var(--fg-muted)"}
            />
            <text
              x={c.x}
              y={c.y - 12}
              textAnchor="middle"
              className={c.hq ? "font-semibold" : ""}
              fontSize={c.hq ? 15 : 12}
              fill={c.hq ? "var(--accent)" : "var(--fg-muted)"}
              fontFamily="var(--font-body)"
            >
              {c.name}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
