import { stage } from "~/stage";
import { chooseEdition, type DeviceFacts } from "./choose";

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function readDevice(): DeviceFacts {
  return {
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
    coarsePointer: matchMedia("(pointer: coarse)").matches,
    width: innerWidth,
    webgl: hasWebGL(),
  };
}

// Sets the Edition straight away, then refines desktop quality once the GPU is known.
export async function detectEdition(): Promise<void> {
  const facts = readDevice();
  stage.setState({ ...chooseEdition(facts), detected: true });
  if (stage.getState().edition !== "desktop") return;
  try {
    const { getGPUTier } = await import("detect-gpu");
    const { tier } = await getGPUTier();
    stage.setState(chooseEdition({ ...facts, gpuTier: tier }));
  } catch {
    // Unknown GPU keeps high quality; the Diorama lowers itself if frames drop.
  }
}

export function onWebGLLost(): void {
  stage.setState({ edition: "still", quality: "low" });
}
