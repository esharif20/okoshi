import { Still, type StillName } from "./Still";
import "./strip.css";

// The Opening sequence for the Phone and Still editions: the same picture in five recorded stills,
// each with its line, read by scrolling down. Nothing here moves on its own.
const PANELS: { name: StillName; line: string; alt: string }[] = [
  { name: "plan", line: "Every piece of work starts as a plan on paper.", alt: "A sheet of paper lying in a court, printed with the floor plan of a house." },
  { name: "fold", line: "Then it gets built, a room for each kind of work.", alt: "Paper walls folded up from the plan into a house with four rooms, beside a pagoda." },
  { name: "ink", line: "Drawn in detail.", alt: "The house and pagoda drawn in ink line and dotted shading." },
  { name: "paint", line: "And finished properly.", alt: "Colour spreading over the inked house and pagoda." },
  { name: "plate", line: "The house holds the work. The pagoda is the stack.", alt: "The finished house and five-storey pagoda in a painted landscape with mountains behind." },
];

export function StillStory() {
  return (
    <ol className="still-story">
      {PANELS.map((p) => (
        <li key={p.name}>
          <Still name={p.name} alt={p.alt} />
          <p>{p.line}</p>
        </li>
      ))}
    </ol>
  );
}
