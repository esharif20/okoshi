import { ToneCut, useScrollRefresh } from "~/motion";
import { Figures } from "./Figures";
import { Layers } from "./Layers";
import { Letter } from "./Letter";
import { Marquee } from "./Marquee";
import { Postcard } from "./Postcard";
import { Shelf } from "./Shelf";
import { VisitCard } from "./VisitCard";
import "./sections.css";

// The Stationery: the home page below the Opening sequence, one sheet of the set after another.
export function Sections() {
  useScrollRefresh();
  return (
    <div className="stationery">
      <div className="sheets">
        <Shelf />
        <Marquee />
        <Layers />
        <Letter />
        <ToneCut className="letter-to-figures" />
        <Figures />
        <VisitCard />
      </div>
      <Postcard />
    </div>
  );
}
