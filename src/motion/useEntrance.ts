import type { RefObject } from "react";
import { gsap, MOVING, SplitText, useGSAP } from "./gsap";

// How each kind of part arrives. The markup names the kind with data-in; the CSS never hides anything,
// so a page whose script fails still shows every part.
const FROM: Record<string, gsap.TweenVars> = {
  rise: { y: 24, opacity: 0, duration: 0.7 },
  spine: { y: 56, opacity: 0, duration: 0.8 },
  tier: { y: -28, opacity: 0, duration: 0.6 },
  slam: { scale: 1.35, opacity: 0, duration: 0.45 },
  sheet: { y: 32, rotation: 1.5, opacity: 0, duration: 0.9 },
  panel: { y: 32, rotation: -1.5, opacity: 0, duration: 0.8 },
  open: { clipPath: "inset(100% 0% 0% 0%)", duration: 1.1, ease: "power3.inOut" },
};
const GAP = 0.075;

function enter(group: HTMLElement) {
  const tl = gsap.timeline({
    defaults: { ease: "expo.out" },
    scrollTrigger: { trigger: group, start: "top 80%", once: true },
  });
  group.querySelectorAll<HTMLElement>("[data-in]").forEach((part, i) => {
    const kind = part.dataset.in ?? "rise";
    if (kind === "head") {
      const split = SplitText.create(part, { type: "lines", mask: "lines", linesClass: "line" });
      // The heading goes back to plain text once it has arrived, so it re-wraps freely on resize.
      tl.from(split.lines, { yPercent: 110, duration: 0.9, stagger: 0.09, onComplete: () => split.revert() }, i * GAP);
      return;
    }
    // Inline styles are cleared at the end so the hover and press states in CSS take over again.
    tl.from(part, { ...(FROM[kind] ?? FROM.rise), clearProps: "transform,opacity,clipPath" }, i * GAP);
  });
}

/**
 * The staggered entrance for the parts of a section. Every element marked `data-entrance` under `root`
 * (or `root` itself) is a group that plays once as it scrolls into view; its `data-in` parts follow in reading order.
 */
export function useEntrance(root: RefObject<HTMLElement | null>) {
  useGSAP(
    (_, contextSafe) => {
      let live = true;
      const build = contextSafe!(() => {
        const el = root.current;
        if (!el) return;
        gsap.matchMedia().add(MOVING, () => {
          const groups = el.matches("[data-entrance]") ? [el] : [...el.querySelectorAll<HTMLElement>("[data-entrance]")];
          groups.forEach(enter);
        });
      });
      // Lines are measured in the real faces, so wait for them.
      void document.fonts.ready.then(() => live && build());
      return () => {
        live = false;
      };
    },
    { scope: root },
  );
}
