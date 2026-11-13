import { useRef } from "react";
import { projects, site, type Project } from "~/content";
import { useEntrance, useScrollRefresh } from "~/motion";
import { Postcard } from "~/stationery/Postcard";
import { Anchor } from "~/ui/Anchor";
import { BrushLink } from "~/ui/BrushLink";
import { SealMark } from "~/ui/SealMark";
import { MangaHeader } from "./MangaHeader";
import { Panel } from "./Panel";
import { SpeedLines } from "./SpeedLines";
import "~/stationery/sections.css";
import "./manga.css";
import { Sfx } from "~/ui/Sfx";

const ORDER = ["problem", "approach", "result"] as const;

// The Projects on either side of this one, going round at the ends.
function neighbours(project: Project) {
  const at = projects.findIndex((p) => p.slug === project.slug);
  return { previous: projects[(at - 1 + projects.length) % projects.length], next: projects[(at + 1) % projects.length] };
}

// The Manga page: one Project told in Panels, from the title page to the Seal that closes it.
export function MangaPage({ project }: { project: Project }) {
  const ref = useRef<HTMLDivElement>(null);
  useEntrance(ref);
  useScrollRefresh();
  const figure = project.figures[0];
  const panels = ORDER.flatMap((kind) => project.panels.filter((panel) => panel.kind === kind));
  const { previous, next } = neighbours(project);

  return (
    <div className="stationery" ref={ref}>
      <div className="sheets manga">
        <MangaHeader />
        <main>
          <article className="manga-page">
            <header className="panel panel-title" data-entrance>
              <SpeedLines className="title-lines" x={76} y={66} count={84} reach={24} />
              <h1 data-in="head">{project.title}</h1>
              <p className="title-line" data-in="rise">
                {project.summary}
              </p>
              {figure && (
                <p className="title-figure sfx-box" data-in="slam">
                  <Sfx value={figure.value} />
                  <span>{figure.measures}</span>
                </p>
              )}
              <p className="title-year" data-in="rise">
                {project.year}
              </p>
            </header>

            <div className="manga-row" data-entrance>
              {panels.map((panel) => (
                <Panel key={panel.kind} panel={panel} />
              ))}

              <aside className="panel panel-credits" aria-label="Made with" data-in="panel">
                <h2>Made with</h2>
                <ul>
                  {project.stack.map((tool) => (
                    <li key={tool}>{tool}</li>
                  ))}
                </ul>
                <p className="credits-links">
                  {project.repo && <BrushLink href={project.repo}>Read the code</BrushLink>}
                  {project.demo && <BrushLink href={project.demo}>Open the demo</BrushLink>}
                </p>
                <p className="credits-end">
                  <SealMark name={site.name} />
                  <span>End of this volume.</span>
                </p>
              </aside>
            </div>

            <nav className="manga-next" aria-label="Other projects" data-entrance>
              <Anchor className="panel panel-turn" href={`/work/${previous.slug}`} rel="prev" data-in="panel">
                <strong>{previous.title}</strong>
                <span>Previous volume</span>
              </Anchor>
              <Anchor className="panel panel-turn" href={`/work/${next.slug}`} rel="next" data-in="panel">
                <strong>{next.title}</strong>
                <span>Next volume</span>
              </Anchor>
            </nav>
          </article>
        </main>
      </div>
      <Postcard />
    </div>
  );
}
