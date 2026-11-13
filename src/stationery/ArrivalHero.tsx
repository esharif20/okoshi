import { site } from "~/content";
import { DioramaSlot } from "~/scene/DioramaSlot";
import { Clock } from "~/ui/Clock";
import { Portrait } from "~/ui/Portrait";
import { SealButton } from "~/ui/SealButton";
import { RoomLabels } from "./RoomLabels";
import "./hero.css";

// The first screen: the painted landscape fills it, with the name set in the sky.
// The same element stays pinned through the Opening sequence while the Diorama plays behind the words.
export function ArrivalHero() {
  const contact = site.email ? `mailto:${site.email}` : "#contact";
  return (
    <div className="hero" data-stage>
      <DioramaSlot className="hero-canvas" />

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

      <div className="hero-title">
        <h1>{site.name}</h1>
        <p>{site.line}</p>
      </div>
    </div>
  );
}
