import { rooms } from "~/content";
import "./labels.css";

// The name of each Room, set as real text where the Diorama says that Room is on screen.
// They appear once the plan is in view and leave when the House is closed for the Plate.
export function RoomLabels() {
  return (
    <ul className="room-labels" aria-label="Rooms of the house">
      {rooms.map((r) => (
        <li key={r.id} style={{ "--x": `var(--pin-${r.id}-x, -999px)`, "--y": `var(--pin-${r.id}-y, -999px)` } as React.CSSProperties}>
          <strong>{r.name}</strong>
        </li>
      ))}
    </ul>
  );
}
