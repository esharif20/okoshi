import { useEffect, type ReactNode } from "react";
import { stage } from "~/stage";

type Props = { children: ReactNode; openingId?: string };

// One scroll source for the page and the Diorama: Lenis, driven by GSAP's ticker, feeding ScrollTrigger.
// The Opening sequence's progress comes from a ScrollTrigger on the element with id `openingId`.
export function SmoothScroll({ children, openingId = "opening" }: Props) {
  useEffect(() => {
    let cleanup = () => {};
    let cancelled = false;
    (async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const lenis = reduced ? null : new Lenis({ autoRaf: false, lerp: 0.1 });
      const tick = (time: number) => lenis?.raf(time * 1000);
      if (lenis) {
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);
      }
      const el = document.getElementById(openingId);
      const st = el
        ? ScrollTrigger.create({
            trigger: el,
            start: "top top",
            end: "bottom bottom",
            onUpdate: (self) => stage.setState({ progress: self.progress }),
          })
        : null;
      cleanup = () => {
        st?.kill();
        gsap.ticker.remove(tick);
        lenis?.destroy();
      };
    })();
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [openingId]);
  return <>{children}</>;
}
