import { lazy, Suspense, useRef } from "react";
import { useStage } from "~/stage";

const Diorama = lazy(() => import("./Diorama"));

// Loads the Diorama in the browser only, and only for the Desktop edition.
export function DioramaSlot({ className }: { className?: string }) {
  const desktop = useStage((s) => s.edition === "desktop");
  const ref = useRef<HTMLDivElement>(null);
  const stageEl = ref.current?.closest<HTMLElement>("[data-stage]") ?? null;
  return (
    <div ref={ref} className={className} aria-hidden="true">
      {desktop && stageEl ? (
        <Suspense fallback={null}>
          <Diorama stageEl={stageEl} />
        </Suspense>
      ) : null}
    </div>
  );
}
