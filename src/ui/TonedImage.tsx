import type { ImgHTMLAttributes } from "react";
import "./ui.css";

type Props = ImgHTMLAttributes<HTMLImageElement> & { alt: string; className?: string };

// A photograph that rests in Screentone; the dots close into the full picture on hover or focus.
export function TonedImage({ className = "", alt, ...img }: Props) {
  return (
    <span className={`toned ${className}`}>
      <img alt={alt} {...img} />
    </span>
  );
}
