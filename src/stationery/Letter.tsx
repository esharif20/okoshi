import { useRef } from "react";
import { rooms, site } from "~/content";
import { useEntrance } from "~/motion";
import { BrushLink } from "~/ui/BrushLink";
import { SealButton } from "~/ui/SealButton";
import { TonedImage } from "~/ui/TonedImage";
import "./letter.css";

// The Letter: the About section, in the first person, on a sheet with a tear-off strip that carries the email address.
export function Letter() {
  const ref = useRef<HTMLElement>(null);
  useEntrance(ref);
  const firstName = site.name.split(" ")[0];
  const facts = rooms.find((room) => room.id === "entrance")?.facts ?? [];

  return (
    <section id="about" className="letter-field" aria-labelledby="about-heading" ref={ref} data-entrance>
      <div className="sheet letter-grid">
        <article className="letter" data-in="sheet">
          <div className="letter-body">
            <h2 id="about-heading">Hello, I'm {firstName}.</h2>
            <p>
              I'm a software engineer at PA Consulting in Cambridge, based in {site.city}. The work is firmware and AI tooling for
              regulated clients: embedded C++ on Zephyr RTOS for medical devices, and agent workflows where every step can be audited.
            </p>
            <p>
              I studied Computer Science at the University of Warwick from 2023 to 2026 and left with{" "}
              <mark>First Class Honours</mark>. My dissertation read the tactics of a football match from a single broadcast camera.
            </p>
            <p>
              I like building at every layer: a C compiler, radar that finds forest loss under cloud, a team of AI coding agents. At
              Warwick I also taught a six-week course that took more than 60 students with no programming background to training their
              first models.
            </p>
            <p>
              Away from the desk it is historic Japanese architecture, anime and manga, football, badminton and travel. The first two
              are why this site folds up out of paper, and why every project is told as a manga page.
            </p>
            <p className="letter-sign">
              <strong>{site.name}</strong>
              <span>Software Engineer, PA Consulting</span>
            </p>
          </div>
          <div className="letter-strip">
            <BrushLink href={`mailto:${site.email}`}>{site.email}</BrushLink>
            <SealButton href={`mailto:${site.email}`}>Write back</SealButton>
          </div>
          <span className="letter-edge" aria-hidden="true" />
        </article>

        <aside className="letter-side" aria-label={`${firstName} in brief`}>
          <div className="letter-photo" data-in="rise">
            <TonedImage
              src={`${import.meta.env.BASE_URL}img/portrait.jpg`}
              width={288}
              height={288}
              loading="lazy"
              alt={`Portrait of ${site.name}`}
            />
          </div>
          <ul className="letter-facts">
            {facts.map((fact) => (
              <li key={fact} data-in="rise">
                {fact}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
