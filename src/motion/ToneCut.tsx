import { useId, useRef } from "react";
import { gsap, MOVING, useGSAP } from "./gsap";
import "./motion.css";

const CELL = 16;
const ROWS = 9;
// A dot this wide covers its whole cell.
const FULL = CELL * 0.72;

// The Screentone cut between two sections: rows of dots that swell from nothing to solid.
// At rest it is a printed halftone step from one field to the next; with motion, the dots close row by row as it is scrolled in.
export function ToneCut({ className = "" }: { className?: string }) {
  // React ids carry characters that a url(#…) reference cannot.
  const id = `cut${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const ref = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add(MOVING, () => {
        const dots = gsap.utils.toArray<SVGCircleElement>("circle", ref.current).reverse();
        gsap.fromTo(
          dots,
          { attr: { r: 0 } },
          {
            attr: { r: FULL },
            ease: "none",
            stagger: 0.12,
            scrollTrigger: { trigger: ref.current, start: "top 92%", end: "bottom 45%", scrub: true },
          },
        );
      });
    },
    { scope: ref },
  );

  return (
    <svg ref={ref} className={`tone-cut ${className}`} height={ROWS * CELL} aria-hidden="true" focusable="false">
      <defs>
        {Array.from({ length: ROWS }, (_, row) => (
          <pattern key={row} id={`${id}${row}`} width={CELL} height={CELL} x={row % 2 ? CELL / 2 : 0} patternUnits="userSpaceOnUse">
            <circle cx={CELL / 2} cy={CELL / 2} r={((row + 1) / ROWS) * FULL} />
          </pattern>
        ))}
      </defs>
      {Array.from({ length: ROWS }, (_, row) => (
        <rect key={row} y={row * CELL} width="100%" height={CELL} fill={`url(#${id}${row})`} />
      ))}
    </svg>
  );
}
