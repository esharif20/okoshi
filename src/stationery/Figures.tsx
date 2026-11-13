import { useRef } from "react";
import { projects, type Figure, type Project } from "~/content";
import { SpeedLines } from "~/manga/SpeedLines";
import { useEntrance } from "~/motion";
import { BrushLink } from "~/ui/BrushLink";
import "./figures.css";
import { Sfx } from "~/ui/Sfx";

// One Figure per Project: the one its result Panel closes on, with the fuller wording from the Project's own list where it has one.
function headline(project: Project): Figure | undefined {
  const closing = project.panels.find((panel) => panel.kind === "result")?.figure ?? project.figures[0];
  return project.figures.find((figure) => figure.value === closing?.value) ?? closing;
}

// The Figures, lettered large in the manner of manga sound effects.
export function Figures() {
  const ref = useRef<HTMLElement>(null);
  useEntrance(ref);
  return (
    <section className="figures-field" aria-labelledby="figures-heading" ref={ref} data-entrance>
      <SpeedLines className="figures-lines" x={34} y={58} count={72} reach={38} />
      <div className="sheet">
        <header className="figures-head">
          <h2 id="figures-heading" data-in="head">
            What the work measured
          </h2>
          <p data-in="rise">One result from each project, as its manga page reports it.</p>
        </header>
        <ul className="figures">
          {projects.map((project) => {
            const figure = headline(project);
            if (!figure) return null;
            return (
              <li key={project.slug} className="figure sfx-box" data-in="slam">
                <Sfx value={figure.value} />
                <p>
                  <span>{figure.measures}</span>
                  <BrushLink href={`/work/${project.slug}`}>{project.title}</BrushLink>
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
