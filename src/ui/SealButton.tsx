import type { ReactNode } from "react";
import "./ui.css";

// The one action on a screen. It presses like a seal (see DESIGN.md, "Hover and press").
export function SealButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className="seal-button" href={href}>
      <span>{children}</span>
    </a>
  );
}
