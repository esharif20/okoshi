import { lazy, Suspense, useEffect, useState } from "react";

const Diorama = lazy(() => import("./Diorama"));

// Loads the Diorama in the browser only, so prerendered pages never touch WebGL.
export function DioramaSlot({ className }: { className?: string }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return (
    <div className={className} aria-hidden="true">
      {ready ? (
        <Suspense fallback={null}>
          <Diorama />
        </Suspense>
      ) : null}
    </div>
  );
}
