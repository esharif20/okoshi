import { useEffect, useState } from "react";
import { site } from "~/content";
import { useStage } from "~/stage";
import "./ui.css";

// Shown while the Diorama is being prepared, so the visitor never watches a half-drawn scene.
// Editions without a Diorama dismiss it at once; with scripting off it is never shown.
export function Loader() {
  const done = useStage((s) => s.detected && (s.edition !== "desktop" || s.ready));
  const [gone, setGone] = useState(false);
  useEffect(() => {
    if (!done) return;
    const id = setTimeout(() => setGone(true), 900);
    return () => clearTimeout(id);
  }, [done]);
  if (gone) return null;
  return (
    <div className="loader" data-done={done} role="status" aria-live="polite">
      <noscript>
        <style>{".loader{display:none}"}</style>
      </noscript>
      <p className="loader-name">{site.name}</p>
      <p className="loader-note">
        Laying out the paper
        <span className="loader-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </p>
    </div>
  );
}
