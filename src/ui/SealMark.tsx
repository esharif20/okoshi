import "./ui.css";

// A red stamped mark carrying the owner's initials. Decorative: the words beside it say what it closes.
export function SealMark({ name, className = "" }: { name: string; className?: string }) {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("");
  return (
    <span className={`seal-mark ${className}`} aria-hidden="true">
      {initials}
    </span>
  );
}
