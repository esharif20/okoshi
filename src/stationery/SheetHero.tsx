import { site } from "~/content";
import { Clock } from "~/ui/Clock";
import { Portrait } from "~/ui/Portrait";
import { SealButton } from "~/ui/SealButton";
import { DioramaSlot } from "~/scene/DioramaSlot";
import { HousePlan } from "./HousePlan";
import "./hero.css";

// The first screen: the Sheet lying on the table, cut off by the bottom of the screen.
export function SheetHero() {
  const [first, ...rest] = site.name.split(" ");
  const contact = site.email ? `mailto:${site.email}` : "#contact";
  return (
    <div className="hero" data-stage>
      <header className="hero-top">
        <div className="hero-left">
          <a className="hero-id" href="#about" aria-label={`About ${site.name}`}>
            <Portrait name={site.name} />
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

      <div className="sheet" data-sheet>
        <i className="sheet-corner tl" />
        <i className="sheet-corner tr" />
        <h1 className="sheet-name">
          <span>{first}</span>
          <span>{rest.join(" ")}</span>
        </h1>
        <p className="sheet-line">{site.line}</p>
        <div className="sheet-plan" data-plan>
          <HousePlan />
        </div>
      </div>
      <DioramaSlot className="hero-canvas" />
    </div>
  );
}
