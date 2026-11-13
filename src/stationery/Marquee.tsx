import { useRef } from "react";
import { gsap, MOVING, ScrollTrigger, useGSAP } from "~/motion/gsap";
import "./marquee.css";

// A running band between two sheets: what he is into, away from the desk.
// It drifts on its own and is pushed along by the scroll, faster the faster the page moves.
const WORDS = ["Historic Japanese architecture", "Anime and manga", "Football", "Badminton", "Travel", "Computer science", "Artificial intelligence"];

export function Marquee() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOVING, () => {
        const track = root.current!.querySelector<HTMLElement>(".marquee-track")!;
        const drift = gsap.to(track, { xPercent: -50, ease: "none", duration: 36, repeat: -1 });
        const speed = gsap.quickTo(drift, "timeScale", { duration: 0.5, ease: "power2.out" });
        const st = ScrollTrigger.create({
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => speed(1 + Math.min(7, Math.abs(self.getVelocity()) / 260)),
          onToggle: (self) => (self.isActive ? drift.play() : drift.pause()),
        });
        return () => st.kill();
      });
    },
    { scope: root },
  );
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined}>
      {WORDS.map((w) => (
        <li key={w}>{w}</li>
      ))}
    </ul>
  );
  return (
    <div ref={root} className="marquee" role="group" aria-label="Interests">
      <div className="marquee-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
