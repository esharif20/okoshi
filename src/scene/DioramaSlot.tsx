import { lazy, Suspense } from "react";
import { useStage } from "~/stage";

const Diorama = lazy(() => import("./Diorama"));

// Loads the Diorama in the browser only, and only for the Desktop edition.
export function DioramaSlot({ className }: { className?: string }) {
  const desktop = useStage((s) => s.edition === "desktop");
  return (
    <div className={className} aria-hidden="true">
      {desktop ? (
        <Suspense fallback={null}>
          <Diorama />
        </Suspense>
      ) : null}
    </div>
  );
}
