import type { ReactNode } from "react";
import { Anchor, type AnchorProps } from "./Anchor";
import "./ui.css";

type Props = Omit<AnchorProps, "className"> & { children: ReactNode };

// The one action on a screen. It presses like a seal (see DESIGN.md, "Hover and press").
export function SealButton({ children, ...rest }: Props) {
  return (
    <Anchor className="seal-button" {...rest}>
      <span>{children}</span>
    </Anchor>
  );
}
