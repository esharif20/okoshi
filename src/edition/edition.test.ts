import { describe, expect, it } from "vitest";
import { chooseEdition } from "./choose";

const desk = { reducedMotion: false, coarsePointer: false, width: 1440, webgl: true };

describe("chooseEdition", () => {
  it("gives the still edition to anyone asking for reduced motion, on any device", () => {
    expect(chooseEdition({ ...desk, reducedMotion: true }).edition).toBe("still");
    expect(chooseEdition({ ...desk, reducedMotion: true, coarsePointer: true, width: 390 }).edition).toBe("still");
  });
  it("gives phones the phone edition", () => {
    expect(chooseEdition({ ...desk, coarsePointer: true, width: 390 }).edition).toBe("phone");
  });
  it("keeps a large touch screen on desktop", () => {
    expect(chooseEdition({ ...desk, coarsePointer: true, width: 1366 }).edition).toBe("desktop");
  });
  it("falls back to stills without WebGL", () => {
    expect(chooseEdition({ ...desk, webgl: false }).edition).toBe("still");
  });
  it("lowers quality on weak GPUs only", () => {
    expect(chooseEdition({ ...desk, gpuTier: 1 }).quality).toBe("low");
    expect(chooseEdition({ ...desk, gpuTier: 3 }).quality).toBe("high");
    expect(chooseEdition(desk).quality).toBe("high");
  });
});
