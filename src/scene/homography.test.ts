import { describe, expect, it } from "vitest";
import { applyHomography, homography, matrix3d } from "./homography";

describe("homography", () => {
  it("is the identity when the quad is the rectangle itself", () => {
    const s = homography(200, 100, [[0, 0], [200, 0], [200, 100], [0, 100]])!;
    expect(applyHomography(s, 50, 25)[0]).toBeCloseTo(50);
    expect(applyHomography(s, 50, 25)[1]).toBeCloseTo(25);
    expect(matrix3d(200, 100, [[0, 0], [200, 0], [200, 100], [0, 100]])).toMatch(/^matrix3d\(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1\)$/);
  });
  it("sends each corner to its target for a perspective quad", () => {
    const quad: [[number, number], [number, number], [number, number], [number, number]] = [
      [30, 10], [170, 20], [220, 140], [-10, 120],
    ];
    const s = homography(200, 100, quad)!;
    const corners = [[0, 0], [200, 0], [200, 100], [0, 100]];
    corners.forEach(([x, y], i) => {
      const [X, Y] = applyHomography(s, x, y);
      expect(X).toBeCloseTo(quad[i][0], 6);
      expect(Y).toBeCloseTo(quad[i][1], 6);
    });
  });
  it("returns null for a collapsed quad", () => {
    expect(homography(200, 100, [[0, 0], [0, 0], [0, 0], [0, 0]])).toBeNull();
  });
});
