import { capabilities } from "@/lib/content";

/**
 * Hub-and-spoke diagram: Gojo Shop core engine at center,
 * 5 capability arms as satellites. Deliberately not a numbered list.
 */
export function HubSpokeDiagram() {
  const cx = 300;
  const cy = 300;
  const rHub = 76;
  const rOrbit = 210;

  const nodes = capabilities.map((cap, i) => {
    const angle = (-Math.PI / 2) + (i * (2 * Math.PI)) / capabilities.length;
    return {
      ...cap,
      x: cx + Math.cos(angle) * rOrbit,
      y: cy + Math.sin(angle) * rOrbit,
      angle,
    };
  });

  return (
    <div className="relative w-full">
      <svg
        viewBox="0 0 600 600"
        className="w-full h-auto max-w-2xl mx-auto"
        role="img"
        aria-label="Diagram: Gojo Shop as the core engine, surrounded by five supporting capability areas."
      >
        {/* subtle orbit ring */}
        <circle
          cx={cx}
          cy={cy}
          r={rOrbit}
          fill="none"
          stroke="var(--forest-deep)"
          strokeOpacity={0.14}
          strokeDasharray="2 6"
        />

        {/* spokes */}
        {nodes.map((n) => (
          <line
            key={`spoke-${n.slug}`}
            x1={cx + Math.cos(n.angle) * rHub}
            y1={cy + Math.sin(n.angle) * rHub}
            x2={n.x}
            y2={n.y}
            stroke="var(--forest-deep)"
            strokeOpacity={0.35}
            strokeWidth={1}
          />
        ))}

        {/* hub */}
        <circle cx={cx} cy={cy} r={rHub} fill="var(--forest-deep)" />
        <circle
          cx={cx}
          cy={cy}
          r={rHub + 8}
          fill="none"
          stroke="var(--ochre)"
          strokeOpacity={0.55}
          strokeWidth={1.5}
        />
        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          className="fill-[var(--cream)] font-display"
          fontSize="22"
        >
          Gojo Shop
        </text>
        <text
          x={cx}
          y={cy + 16}
          textAnchor="middle"
          className="fill-[var(--cream)]/70"
          fontSize="10"
          letterSpacing="2"
        >
          CORE ENGINE
        </text>

        {/* satellite nodes */}
        {nodes.map((n) => {
          const labelLines = n.title.split(" & ");
          return (
            <g key={n.slug}>
              <circle
                cx={n.x}
                cy={n.y}
                r={54}
                fill="var(--cream)"
                stroke="var(--forest-deep)"
                strokeOpacity={0.85}
                strokeWidth={1.25}
              />
              <circle cx={n.x} cy={n.y - 20} r={4} fill="var(--ochre)" />
              {labelLines.map((line, li) => (
                <text
                  key={li}
                  x={n.x}
                  y={n.y + 2 + li * 12}
                  textAnchor="middle"
                  className="fill-[var(--ink)]"
                  fontSize="10"
                  fontWeight={500}
                >
                  {line}
                  {li < labelLines.length - 1 ? " &" : ""}
                </text>
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
