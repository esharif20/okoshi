import { describe, expect, it } from "vitest";
import { BEATS, beatAt, beatProgress, stage, initialStage } from "./index";

describe("beats", () => {
  it("cover 0..1 without gaps", () => {
    expect(BEATS[0].from).toBe(0);
    expect(BEATS.at(-1)!.to).toBe(1);
    for (let i = 1; i < BEATS.length; i++) expect(BEATS[i].from).toBe(BEATS[i - 1].to);
  });
  it("beatAt picks the beat whose range holds the progress, edges going to the later beat", () => {
    expect(beatAt(0)).toBe("sheet");
    expect(beatAt(0.0999)).toBe("sheet");
    expect(beatAt(0.1)).toBe("fold");
    expect(beatAt(0.5)).toBe("ink");
    expect(beatAt(0.65)).toBe("paint");
    expect(beatAt(0.95)).toBe("plate");
    expect(beatAt(1)).toBe("plate");
  });
  it("clamps out-of-range and non-finite input", () => {
    expect(beatAt(-3)).toBe("sheet");
    expect(beatAt(7)).toBe("plate");
    expect(beatAt(NaN)).toBe("sheet");
    expect(beatProgress(NaN, "fold")).toBe(0);
  });
  it("beatProgress is 0 before, 1 after and linear inside a beat", () => {
    expect(beatProgress(0.05, "fold")).toBe(0);
    expect(beatProgress(0.275, "fold")).toBeCloseTo(0.5);
    expect(beatProgress(0.6, "fold")).toBe(1);
  });
});

describe("stage store", () => {
  it("starts at the initial state and accepts partial updates", () => {
    expect(stage.getState()).toEqual(initialStage);
    stage.setState({ progress: 0.3, hoveredRoom: "study" });
    expect(stage.getState().progress).toBe(0.3);
    expect(stage.getState().night).toBe(false);
    stage.setState(initialStage);
  });
});
