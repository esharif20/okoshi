import { useRef } from "react";
import { roles } from "~/content";
import { useEntrance } from "~/motion";
import { span } from "./when";
import "./experience.css";

// The Roles in full, as plain text: dates, place, what the job was and what was done in it.
export function Experience() {
  const ref = useRef<HTMLDivElement>(null);
  useEntrance(ref);
  return (
    <div className="experience" ref={ref}>
      <h3 className="experience-head" data-entrance>
        <span data-in="head">The roles, in full</span>
      </h3>
      <ol className="experience-list">
        {roles.map((role) => (
          <li key={role.id} className="experience-role" data-entrance>
            <p className="experience-when" data-in="rise">
              <strong>{span(role)}</strong>
              <span>{role.place}</span>
            </p>
            <div className="experience-what" data-in="rise">
              <h4>{role.title}</h4>
              <p className="experience-org">{role.org}</p>
              <p>{role.summary}</p>
            </div>
            <ul className="experience-points" data-in="rise">
              {role.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
