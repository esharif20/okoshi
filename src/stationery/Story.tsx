import { layers, rooms } from "~/content";
import { beatAt, useStage, type Beat } from "~/stage";
import "./story.css";

// What the page says while the Diorama plays: one line for each Beat, and the Facts of whatever is pointed at.
const LINES: Partial<Record<Beat, string>> = {
  approach: "Every piece of work starts as a plan on paper.",
  fold: "Then it gets built, a room for each kind of work.",
  ink: "Drawn in detail.",
  paint: "And finished properly.",
  plate: "The house holds the work. The pagoda is the stack.",
};

export function Story() {
  const beat = useStage((s) => beatAt(s.progress));
  const room = useStage((s) => rooms.find((r) => r.id === s.hoveredRoom));
  const layer = useStage((s) => layers.find((l) => l.id === s.hoveredLayer));
  const facts = room ? { title: room.name, note: room.standsFor, items: room.facts } : layer ? { title: layer.name, note: "", items: layer.skills } : null;
  return (
    <>
      <p className="story-line" key={beat} aria-live="polite">
        {LINES[beat]}
      </p>
      <p className="story-hint" data-show={beat === "arrival"}>Scroll to walk in</p>
      <p className="story-hint" data-show={beat === "paint" || beat === "ink"}>Point at a room</p>
      <aside className="facts" data-show={!!facts} aria-live="polite">
        {facts && (
          <>
            <h2>{facts.title}</h2>
            {facts.note && <p>{facts.note}</p>}
            <ul>
              {facts.items.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </>
        )}
      </aside>
    </>
  );
}
