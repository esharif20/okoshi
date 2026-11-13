import type { Panel as PanelContent } from "~/content";
import { TonedImage } from "~/ui/TonedImage";
import { SpeedLines } from "./SpeedLines";
import { Sfx } from "~/ui/Sfx";

// One frame of a Manga page. The picture is the art when there is one; until then the frame is drawn
// in Screentone and speed lines, and the words sit in a caption box either way.
export function Panel({ panel }: { panel: PanelContent }) {
  const { kind, heading, text, figure, picture } = panel;
  return (
    <section className={`panel panel-${kind}`} aria-label={heading} data-in="panel">
      <div className="panel-art">
        {picture ? (
          <TonedImage src={`${import.meta.env.BASE_URL}${picture.src}`} alt={picture.alt} loading="lazy" />
        ) : (
          <>
            <span className="tone panel-tone" data-weight={kind === "problem" ? "heavy" : undefined} aria-hidden="true" />
            <span className="tone panel-tone panel-tone-far" aria-hidden="true" />
            {kind === "result" && <SpeedLines x={36} y={40} count={64} reach={34} />}
          </>
        )}
      </div>
      {figure && (
        <p className="panel-figure sfx-box">
          <Sfx value={figure.value} />
          <span>{figure.measures}</span>
        </p>
      )}
      <div className="caption">
        <h2>{heading}</h2>
        <p>{text}</p>
      </div>
    </section>
  );
}
