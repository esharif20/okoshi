import { PLAN, ROOM_LABELS, ROOM_RECTS } from "~/scene/house/layout";

// The builder's plan printed on the Sheet: the House drawn flat, in ink.
export function HousePlan({ className }: { className?: string }) {
  const pad = 0.4;
  return (
    <svg
      className={className}
      viewBox={`${-pad} ${-pad} ${PLAN.w + pad * 2} ${PLAN.h + pad * 2}`}
      role="img"
      aria-label="Floor plan of a house with six rooms: entrance, workshop, study, lookout, great hall and garden"
    >
      {ROOM_RECTS.map((r) => (
        <g key={r.id}>
          <rect
            x={r.x}
            y={r.y}
            width={r.w}
            height={r.h}
            fill={r.open ? "none" : "var(--surface)"}
            stroke="var(--ink)"
            strokeWidth={r.open ? 0.05 : 0.12}
            strokeDasharray={r.open ? "0.28 0.2" : undefined}
            strokeLinejoin="miter"
          />
          {!r.open && <Tatami x={r.x} y={r.y} w={r.w} h={r.h} />}
          <text
            x={r.x + 0.28}
            y={r.id === "garden" ? r.y + 3.1 : r.y + 0.62}
            fontSize={0.34}
            fontFamily="var(--font-text)"
            fontWeight={600}
            fill="var(--ink)"
          >
            {ROOM_LABELS[r.id]}
          </text>
        </g>
      ))}
      {/* Garden: the Pagoda's footing, two pines with the net between them, a ball. */}
      <rect x={7.6} y={0.65} width={1.8} height={1.8} fill="var(--surface)" stroke="var(--ink)" strokeWidth={0.1} />
      <rect x={8.05} y={1.1} width={0.9} height={0.9} fill="none" stroke="var(--ink)" strokeWidth={0.06} />
      <circle cx={8.5} cy={3.9} r={0.42} fill="var(--ink)" />
      <circle cx={8.5} cy={6.5} r={0.42} fill="var(--ink)" />
      <line x1={8.5} y1={4.32} x2={8.5} y2={6.08} stroke="var(--ink)" strokeWidth={0.06} strokeDasharray="0.1 0.1" />
      <circle cx={9.3} cy={7.3} r={0.2} fill="none" stroke="var(--ink)" strokeWidth={0.07} />
    </svg>
  );
}

// Mat joints, drawn as short ink strokes so a room reads as floored.
function Tatami({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const lines = [];
  for (let i = 1; i < Math.floor(w); i++) {
    const even = i % 2 === 0;
    lines.push(
      <line
        key={i}
        x1={x + i}
        y1={y + (even ? 1 : h / 2)}
        x2={x + i}
        y2={y + h - 0.12}
        stroke="var(--ink)"
        strokeWidth={0.035}
        opacity={0.45}
      />,
    );
  }
  return <>{lines}</>;
}
