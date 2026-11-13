import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { projects, roles, type Project, type Role } from "~/content";
import { useEntrance } from "~/motion";
import { Anchor } from "~/ui/Anchor";
import { Experience } from "./Experience";
import { span, yearOf } from "./when";
import "./shelf.css";
import { Sfx } from "~/ui/Sfx";

// How far each Volume stands below the tallest, in hundredths of the shelf: a real shelf is never level.
const DROPS = [0, 5, 1, 8, 3, 13, 17, 11, 16, 12, 19, 14];

type Picking = { active: boolean; onPick: () => void };

const drop = (index: number) => ({ "--drop": DROPS[index % DROPS.length] }) as CSSProperties;

function Cover({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <div className="cover" id={id}>
      <span className="tone cover-tone" aria-hidden="true" />
      {children}
    </div>
  );
}

function ProjectVolume({ project, index, active, onPick }: Picking & { project: Project; index: number }) {
  const figure = project.figures[0];
  return (
    <li className="volume" data-kind="project" data-active={active} data-cursor="Open" style={drop(index)}>
      <Anchor className="spine" href={`/work/${project.slug}`} onPointerEnter={onPick} onFocus={onPick} data-in="spine">
        <span className="spine-title">{project.title}</span>
        <span className="spine-foot">{project.year}</span>
      </Anchor>
      <Cover>
        <h3>{project.title}</h3>
        <p className="cover-line">{project.summary}</p>
        <p className="cover-figure sfx-box">
          <Sfx value={figure.value} />
          <span>{figure.measures}</span>
        </p>
        <p className="cover-foot">
          <span>{project.year}</span>
          <span>A manga page</span>
        </p>
      </Cover>
    </li>
  );
}

type RoleProps = Picking & { role: Role; index: number; open: boolean; onToggle: () => void };

function RoleVolume({ role, index, active, open, onPick, onToggle }: RoleProps) {
  const coverId = `cover-${role.id}`;
  return (
    <li className="volume" data-kind="role" data-active={active} data-open={open} style={drop(index)}>
      <button
        type="button"
        className="spine"
        aria-expanded={open}
        aria-controls={coverId}
        onClick={onToggle}
        onPointerEnter={onPick}
        onFocus={onPick}
        data-in="spine"
      >
        <span className="spine-title">{role.title}</span>
        <span className="spine-foot">
          {yearOf(role.start)}
          <svg className="spine-sign" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M0 5h12v2H0z" />
            <path className="spine-sign-bar" d="M5 0h2v12H5z" />
          </svg>
        </span>
      </button>
      <Cover id={coverId}>
        <h3>{role.title}</h3>
        <p className="cover-org">
          {role.org}, {role.place}
        </p>
        {open ? (
          <ul className="cover-points">
            {role.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        ) : (
          <p className="cover-line">{role.summary}</p>
        )}
        <p className="cover-foot">
          <span>{span(role)}</span>
        </p>
      </Cover>
    </li>
  );
}

function Group({ label, count, children }: { label: string; count: number; children: ReactNode }) {
  return (
    <div className="shelf-group" style={{ "--count": count } as CSSProperties}>
      <ul aria-label={label}>{children}</ul>
      <p>{label}</p>
    </div>
  );
}

// The Shelf: every Project and Role as a Volume. Pointing at a spine pulls it out and turns its cover to face the reader.
export function Shelf() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(projects[0].slug);
  const [open, setOpen] = useState<string | null>(null);
  useEntrance(ref);

  const since = Math.min(...roles.map((role) => Number(yearOf(role.start))));

  return (
    <section id="work" className="sheet shelf-sheet" aria-labelledby="work-heading" ref={ref}>
      <div data-entrance>
        <header className="shelf-head">
          <h2 id="work-heading" data-in="head">
            The work, in {projects.length + roles.length} volumes
          </h2>
          <p data-in="rise">
            {projects.length} projects, each told as a manga page, and {roles.length} roles since {since}.
          </p>
        </header>

        <div className="shelf">
          <Group label="Projects" count={projects.length}>
            {projects.map((project, i) => (
              <ProjectVolume
                key={project.slug}
                project={project}
                index={i}
                active={active === project.slug}
                onPick={() => setActive(project.slug)}
              />
            ))}
          </Group>
          <Group label="Roles" count={roles.length}>
            {roles.map((role, i) => (
              <RoleVolume
                key={role.id}
                role={role}
                index={projects.length + i}
                active={active === role.id}
                open={open === role.id}
                onPick={() => setActive(role.id)}
                onToggle={() => {
                  setActive(role.id);
                  setOpen(open === role.id ? null : role.id);
                }}
              />
            ))}
          </Group>
        </div>
      </div>

      <Experience />
    </section>
  );
}
