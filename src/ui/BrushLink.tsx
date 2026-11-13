import type { ReactNode } from "react";
import { Anchor, type AnchorProps } from "./Anchor";
import "./ui.css";

type Props = Omit<AnchorProps, "className"> & { children: ReactNode };

// A text link. Its underline is brushed in from the left on hover and focus.
export function BrushLink({ children, ...rest }: Props) {
  return (
    <Anchor className="brush-link" {...rest}>
      {children}
    </Anchor>
  );
}
