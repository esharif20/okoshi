import { useRef, type CSSProperties } from "react";
import { layers, projects } from "~/content";
import { useEntrance } from "~/motion";
import { BrushLink } from "~/ui/BrushLink";
import "./layers.css";

// The Pagoda's five Layers, drawn as the tower itself: firmware is the footing and agents sit under the roof.
export function Layers() {
  const ref = useRef<HTMLElement>(null);
  useEntrance(ref);
  return (
    <section className="sheet layers-sheet" aria-labelledby="layers-heading" ref={ref} data-entrance>
      <h2 id="layers-heading" data-in="head">
        From firmware to agents
      </h2>
      <div className="layers-text">
        <p data-in="rise">
          The Pagoda has {layers.length} storeys, and each one is a layer I work at. {layers[0].name} is the footing.{" "}
          {layers[layers.length - 1].name} sit under the roof, and every project stands on the storey it belongs to.
        </p>
        <figure className="layers-plate" data-in="open">
          <img
            src={`${import.meta.env.BASE_URL}img/zojoji-pagoda.webp`}
            width={1000}
            height={1500}
            loading="lazy"
            alt="Woodblock print: the red upper storeys of a pagoda in the foreground, above a river, a bridge and a line of trees."
          />
          <figcaption>Utagawa Hiroshige, Pagoda of Zōjōji Temple, Akabane, 1857.</figcaption>
        </figure>
      </div>

      {/* Listed from the ground up, as the tower is built; the CSS stacks it with the last storey on top. */}
      <ol className="pagoda">
        {layers.map((layer, i) => (
          <li key={layer.id} className="storey" style={{ "--step": i } as CSSProperties} data-in="tier">
            <span className="storey-roof" aria-hidden="true" />
            <div className="storey-body">
              <h3>{layer.name}</h3>
              <p>{layer.skills.join(", ")}</p>
              <p className="storey-projects">
                {projects
                  .filter((project) => project.layer === layer.id)
                  .map((project) => (
                    <BrushLink key={project.slug} href={`/work/${project.slug}`}>
                      {project.title}
                    </BrushLink>
                  ))}
              </p>
            </div>
          </li>
        ))}
        <li className="pagoda-spire" aria-hidden="true" />
      </ol>
    </section>
  );
}
