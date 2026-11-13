import { useRef } from "react";
import { roles } from "~/content";
import { gsap, MOVING, ScrollTrigger, useGSAP } from "~/motion/gsap";
import { monthYear, yearOf } from "./when";
import "./experience.css";

// The Roles as a hand scroll: the section pins and the cards travel sideways as the visitor scrolls, each one a
// tilted plate that straightens as it reaches the middle. Where there is no movement it is a plain list.
const TILTS = [-3.2, 2.4, -1.6, 3, -2.6, 1.8, -2.2];

export function Experience() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`(min-width: 901px) and ${MOVING}`, () => {
        const track = root.current!.querySelector<HTMLElement>(".roles-track")!;
        const cards = gsap.utils.toArray<HTMLElement>(".role-card", track);
        const travel = () => track.scrollWidth - root.current!.clientWidth;
        const run = gsap.to(track, {
          x: () => -travel(),
          ease: "none",
          scrollTrigger: { trigger: root.current, pin: true, scrub: 0.6, start: "top top", end: () => `+=${travel() * 1.15}`, invalidateOnRefresh: true },
        });
        // Each plate straightens and comes forward as it crosses the middle of the screen.
        cards.forEach((card) => {
          gsap.fromTo(
            card,
            { rotate: Number(card.dataset.tilt), y: 46, scale: 0.94 },
            { rotate: 0, y: 0, scale: 1, ease: "power2.out", scrollTrigger: { trigger: card, containerAnimation: run, start: "left 92%", end: "left 42%", scrub: true } },
          );
          gsap.from(card.querySelector(".role-year"), { xPercent: 28, ease: "none", scrollTrigger: { trigger: card, containerAnimation: run, start: "left right", end: "right left", scrub: true } });
        });
        // The run's own progress, as a line of ink along the bottom.
        gsap.fromTo(".roles-ink", { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${travel() * 1.15}`, scrub: true } });
        return () => ScrollTrigger.getAll().forEach((t) => t.trigger && root.current?.contains(t.trigger as Node) && t.kill());
      });
    },
    { scope: root },
  );

  return (
    <div className="roles" ref={root}>
      <div className="roles-head">
        <h3>Seven roles since 2024</h3>
        <p>Scroll, and they pass like a hand scroll.</p>
      </div>
      <ol className="roles-track">
        {roles.map((role, i) => (
          <li key={role.id} className="role-card" data-tilt={TILTS[i % TILTS.length]} data-now={!role.end || undefined} data-cursor="Read">
            <p className="role-year" aria-hidden="true">
              {yearOf(role.start)}
            </p>
            <p className="role-when">
              {monthYear(role.start)} to {role.end ? monthYear(role.end) : "now"} · {role.place}
            </p>
            <h4>{role.title}</h4>
            <p className="role-org">{role.org}</p>
            <p className="role-summary">{role.summary}</p>
            <ul>
              {role.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            {!role.end && <span className="role-seal">Now</span>}
          </li>
        ))}
      </ol>
      <div className="roles-ink" aria-hidden="true" />
    </div>
  );
}
