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
  const title = useRef<HTMLDivElement>(null);
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
        gsap.from("p", { y: 24, opacity: 0, duration: 0.9, ease: "expo.out", delay: 0.95 });
      });
    },
    { scope: title, dependencies: [ready] },
  );
  return (
    <div className="hero" data-stage>
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

      <BeatRail />

      <div className="hero-title" ref={title}>
        <h1>{site.name}</h1>
        <p>{site.line}</p>
      </div>
    </div>
  );
}
