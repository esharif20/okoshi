import { useRef } from "react";
import { site } from "~/content";
import { gsap, MOVING, SplitText, useGSAP } from "~/motion/gsap";
import { useStage } from "~/stage";
import { DioramaSlot } from "~/scene/DioramaSlot";
import { Clock } from "~/ui/Clock";
import { Portrait } from "~/ui/Portrait";
import { SealButton } from "~/ui/SealButton";
import { Still } from "~/strip/Still";
import { RoomLabels } from "./RoomLabels";
import { BeatRail } from "./BeatRail";
import { Story } from "./Story";
import "./hero.css";

// The first screen: the painted landscape fills it, with the name set in the sky.
// The same element stays pinned through the Opening sequence while the Diorama plays behind the words.
export function ArrivalHero() {
  const contact = site.email ? `mailto:${site.email}` : "#contact";
  const stageRef = useRef<HTMLDivElement>(null);
  const [first, ...others] = site.name.split(" ");
  const rest = others.join(" ");
  // The picture is ready when the Diorama has drawn, or at once where there is no Diorama.
  const ready = useStage((s) => s.detected && (s.edition !== "desktop" || s.ready));

  // The name is set letter by letter as the loader clears, each rising from behind its own line.
  useGSAP(
    () => {
      if (!ready) return;
      const mm = gsap.matchMedia();
      mm.add(MOVING, () => {
        const split = SplitText.create("h1", { type: "chars", mask: "chars" });
        gsap.from(split.chars, { yPercent: 115, rotate: 6, duration: 1.1, ease: "expo.out", stagger: 0.045, delay: 0.35, onComplete: () => split.revert() });
        gsap.from(".hero-claim", { y: 24, opacity: 0, duration: 0.9, ease: "expo.out", delay: 0.95, clearProps: "opacity,transform" });
      });
    },
    { scope: stageRef, dependencies: [ready] },
  );

  // Depth: the name shifts against the landscape as the pointer moves.
  // The links in the top row scramble into place when pointed at.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`(pointer: fine) and ${MOVING}`, () => {
        const tx = gsap.quickTo(".hero-title", "x", { duration: 1.2, ease: "power3" });
        const move = (e: PointerEvent) => {
          const u = e.clientX / innerWidth - 0.5;
          tx(u * 22);
        };
        addEventListener("pointermove", move);
        const links = gsap.utils.toArray<HTMLElement>(".hero-nav a");
        const over = links.map((a) => {
          const word = a.textContent ?? "";
          const fn = () => gsap.to(a, { duration: 0.55, scrambleText: { text: word, chars: "lowerCase", speed: 0.7 } });
          a.addEventListener("pointerenter", fn);
          return () => a.removeEventListener("pointerenter", fn);
        });
        return () => {
          removeEventListener("pointermove", move);
          over.forEach((off) => off());
        };
      });
    },
    { scope: stageRef },
  );
  return (
    <div className="hero" data-stage ref={stageRef}>
      {/* The recorded first frame: what phones and reduced-motion visitors see, and what desktop shows until the Diorama draws. */}
      <Still name="arrival" className="hero-poster" eager alt="A painted landscape at dawn: a traveller with a straw hat on his back stands on a path that leads through a red gate towards mountains." />
      <div className="hero-canvas" data-cursor="Drag">
        <DioramaSlot className="hero-canvas" />
      </div>

      <header className="hero-top">
        <div className="hero-left">
          <a className="hero-id" href="#about" aria-label={`About ${site.name}`}>
            <Portrait name={site.name} size={56} />
          </a>
          <Clock className="hero-clock" />
        </div>
        <nav className="hero-nav" aria-label="Sections">
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
        <SealButton href={contact}>Get in touch</SealButton>
      </header>

      <RoomLabels />
      <Story />

      {/* Print: paper grain over the whole picture, a darker edge, speed lines when travelling fast, and the manga panel frame of the Ink beat. */}
      <div className="hero-vignette" aria-hidden="true" />
      <div className="hero-speed" aria-hidden="true" />
      <div className="hero-grain" aria-hidden="true" />
      <div className="hero-panel" aria-hidden="true" />
      <BeatRail />

      <div className="hero-title">
        <h1>
          {first} <em>{rest}</em>
        </h1>
      </div>
      <p className="hero-claim">
        <small>Software engineer</small>
        Firmware, <small>computer</small> vision <small>and</small> <em>AI agents.</em>
      </p>
    </div>
  );
}
