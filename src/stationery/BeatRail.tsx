import { scrollToY } from "~/motion";
import { BEATS, beatAt, useStage, type Beat } from "~/stage";
import "./rail.css";

// Where the visitor is in the Opening sequence, and a way to jump: one word for each Beat.
const NAMES: Record<Beat, string> = {
  arrival: "Arrive",
  approach: "Walk in",
  fold: "Build",
  ink: "Ink",
  paint: "Paint",
  plate: "Finished",
  enter: "Go inside",
};

function goTo(beat: Beat) {
  const opening = document.getElementById("opening");
  if (!opening) return;
  const b = BEATS.find((x) => x.beat === beat)!;
  // Land a little way into the Beat, where its picture has settled; the last Beat lands at its end.
  const at = beat === "enter" ? 0.955 : beat === "arrival" ? 0 : b.from + (b.to - b.from) * 0.8;
  scrollToY(opening.offsetTop + (opening.offsetHeight - innerHeight) * at);
}

export function BeatRail() {
  const current = useStage((s) => beatAt(s.progress));
  return (
    <nav className="beat-rail" aria-label="Stages of the introduction">
      <ol>
        {BEATS.map(({ beat }) => (
          <li key={beat}>
            <button type="button" aria-current={beat === current ? "step" : undefined} onClick={() => goTo(beat)}>
              {NAMES[beat]}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
