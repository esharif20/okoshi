import { useRef } from "react";
import { gsap, MOVING, useGSAP } from "~/motion/gsap";
import "./cursor.css";

// A second cursor that follows the pointer with a little weight, and says what the thing under it does:
// "Drag" over the Diorama, "Open" over a volume, and it swells over any link or button.
// It also lets Seal buttons lean towards the pointer. Fine pointers only, and only for visitors who want movement.
const LABEL = "[data-cursor]";
const PRESSABLE = "a, button, [role='button']";
const MAGNETIC = ".seal-button";

export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(`(pointer: fine) and ${MOVING}`, () => {
      const el = ring.current!;
      gsap.set(el, { xPercent: -50, yPercent: -50, autoAlpha: 0 });
      const x = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3" });
      const y = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3" });
      let pulled: HTMLElement | null = null;

      const move = (e: PointerEvent) => {
        x(e.clientX);
        y(e.clientY);
        gsap.to(el, { autoAlpha: 1, duration: 0.2, overwrite: "auto" });
        const target = e.target as Element | null;
        const named = target?.closest<HTMLElement>(LABEL);
        const text = named?.dataset.cursor ?? "";
        if (label.current && label.current.textContent !== text) label.current.textContent = text;
        el.dataset.state = text ? "label" : target?.closest(PRESSABLE) ? "press" : "rest";

        // A Seal button leans a third of the way towards the pointer, and springs back when it leaves.
        const button = target?.closest<HTMLElement>(MAGNETIC) ?? null;
        if (pulled && pulled !== button) gsap.to(pulled, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.45)" });
        pulled = button;
        if (button) {
          const r = button.getBoundingClientRect();
          gsap.to(button, { x: (e.clientX - (r.left + r.width / 2)) * 0.3, y: (e.clientY - (r.top + r.height / 2)) * 0.3, duration: 0.3, ease: "power3.out" });
        }
      };
      const leave = () => gsap.to(el, { autoAlpha: 0, duration: 0.2 });
      const down = () => gsap.to(el, { scale: 0.82, duration: 0.15 });
      const up = () => gsap.to(el, { scale: 1, duration: 0.4, ease: "back.out(3)" });
      addEventListener("pointermove", move);
      addEventListener("pointerdown", down);
      addEventListener("pointerup", up);
      document.documentElement.addEventListener("pointerleave", leave);
      return () => {
        removeEventListener("pointermove", move);
        removeEventListener("pointerdown", down);
        removeEventListener("pointerup", up);
        document.documentElement.removeEventListener("pointerleave", leave);
      };
    });
  });

  return (
    <div ref={ring} className="cursor" data-state="rest" aria-hidden="true">
      <span ref={label} />
    </div>
  );
}
