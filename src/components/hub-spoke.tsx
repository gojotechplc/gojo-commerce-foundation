import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

type Cap = { slug: string; title: string };

/**
 * Hub-and-spoke diagram: Gojo Shop core engine at center,
 * capability arms as satellites (each circle links to its page).
 */
export function HubSpokeDiagram({
  capabilities,
  hubLabel = "Gojo Shop",
}: {
  capabilities: Cap[];
  hubLabel?: string;
}) {
  const navigate = useNavigate();
  const [hover, setHover] = useState<string | null>(null);
  const cx = 300;
  const cy = 300;
  const rHub = 76;
  const rOrbit = 210;

  const nodes = capabilities.map((cap, i) => {
    const angle = -Math.PI / 2 + (i * (2 * Math.PI)) / Math.max(capabilities.length, 1);
    return {
      ...cap,
      x: cx + Math.cos(angle) * rOrbit,
      y: cy + Math.sin(angle) * rOrbit,
      angle,
    };
  });

  return (
    <div className="relative w-full">
      <style>{`
        .hub-spoke-node {
          transform-box: fill-box;
          transform-origin: center;
          transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
          outline: none;
        }
        .hub-spoke-node:hover,
        .hub-spoke-node:focus-visible,
        .hub-spoke-node.is-hot {
          transform: scale(1.1);
        }
        .hub-spoke-hub {
          transform-box: fill-box;
          transform-origin: center;
          transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          outline: none;
        }
        .hub-spoke-hub:hover,
        .hub-spoke-hub:focus-visible,
        .hub-spoke-hub.is-hot {
          transform: scale(1.06);
        }
        .hub-spoke-fill {
          transition: fill 0.25s ease, stroke 0.25s ease, stroke-width 0.25s ease;
        }
        .hub-spoke-dot {
          transition: r 0.25s ease, fill 0.25s ease;
        }
        .hub-spoke-ring {
          transition: stroke-opacity 0.3s ease, stroke-width 0.3s ease, r 0.3s ease;
        }
        .hub-spoke-spoke {
          transition: stroke 0.25s ease, stroke-opacity 0.25s ease, stroke-width 0.25s ease;
        }
      `}</style>
      <svg
        viewBox="0 0 600 600"
        className="w-full h-auto max-w-2xl mx-auto"
        role="group"
        aria-label="Diagram: Gojo Shop as the core engine, surrounded by supporting capability areas. Circles are links."
      >
        <circle
          cx={cx}
          cy={cy}
          r={rOrbit}
          fill="none"
          stroke="var(--forest-deep)"
          strokeOpacity={hover ? 0.22 : 0.14}
          strokeDasharray="2 6"
          className="hub-spoke-ring"
        />

        {nodes.map((n) => {
          const active = hover === n.slug;
          return (
            <line
              key={`spoke-${n.slug}`}
              className="hub-spoke-spoke"
              x1={cx + Math.cos(n.angle) * rHub}
              y1={cy + Math.sin(n.angle) * rHub}
              x2={n.x}
              y2={n.y}
              stroke={active ? "var(--ochre)" : "var(--forest-deep)"}
              strokeOpacity={active ? 0.9 : hover ? 0.18 : 0.35}
              strokeWidth={active ? 2.25 : 1}
            />
          );
        })}

        {/* Hub → Gojo Shop */}
        <g
          className={`hub-spoke-hub cursor-pointer ${hover === "hub" ? "is-hot" : ""}`}
          role="link"
          tabIndex={0}
          aria-label={`${hubLabel} — open page`}
          onMouseEnter={() => setHover("hub")}
          onMouseLeave={() => setHover(null)}
          onFocus={() => setHover("hub")}
          onBlur={() => setHover(null)}
          onClick={() => void navigate({ to: "/gojo-shop" })}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              void navigate({ to: "/gojo-shop" });
            }
          }}
        >
          <circle
            cx={cx}
            cy={cy}
            r={rHub}
            className="hub-spoke-fill"
            fill={hover === "hub" ? "var(--forest)" : "var(--forest-deep)"}
          />
          <circle
            cx={cx}
            cy={cy}
            r={hover === "hub" ? rHub + 12 : rHub + 8}
            fill="none"
            stroke="var(--ochre)"
            strokeOpacity={hover === "hub" ? 0.95 : 0.55}
            strokeWidth={hover === "hub" ? 2.25 : 1.5}
            className="hub-spoke-ring"
          />
          <title>{hubLabel}</title>
          <text
            x={cx}
            y={cy - 6}
            textAnchor="middle"
            className="fill-[var(--cream)] font-display pointer-events-none"
            fontSize="22"
          >
            {hubLabel}
          </text>
          <text
            x={cx}
            y={cy + 16}
            textAnchor="middle"
            className="fill-[var(--cream)]/70 pointer-events-none"
            fontSize="10"
            letterSpacing="2"
          >
            CORE ENGINE
          </text>
        </g>

        {/* Satellites → /capabilities/$slug */}
        {nodes.map((n) => {
          const labelLines = n.title.split(" & ");
          const active = hover === n.slug;
          return (
            <g
              key={n.slug}
              className={`hub-spoke-node cursor-pointer ${active ? "is-hot" : ""}`}
              role="link"
              tabIndex={0}
              aria-label={`${n.title} — open capability page`}
              onMouseEnter={() => setHover(n.slug)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(n.slug)}
              onBlur={() => setHover(null)}
              onClick={() =>
                void navigate({
                  to: "/capabilities/$slug",
                  params: { slug: n.slug },
                })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  void navigate({
                    to: "/capabilities/$slug",
                    params: { slug: n.slug },
                  });
                }
              }}
            >
              <title>{n.title}</title>
              <circle
                cx={n.x}
                cy={n.y}
                r={54}
                className="hub-spoke-fill"
                fill={active ? "var(--secondary)" : "var(--cream)"}
                stroke={active ? "var(--ochre)" : "var(--forest-deep)"}
                strokeOpacity={active ? 1 : 0.85}
                strokeWidth={active ? 2.5 : 1.25}
              />
              <circle
                cx={n.x}
                cy={n.y - 20}
                r={active ? 5.5 : 4}
                fill={active ? "var(--forest-deep)" : "var(--ochre)"}
                className="hub-spoke-dot pointer-events-none"
              />
              {labelLines.map((line, li) => (
                <text
                  key={li}
                  x={n.x}
                  y={n.y + 2 + li * 12}
                  textAnchor="middle"
                  className="fill-[var(--ink)] pointer-events-none"
                  fontSize="10"
                  fontWeight={active ? 600 : 500}
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
