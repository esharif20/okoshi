import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// The small carpentry that makes a building read as built: balcony railings, a gable, ridge ornaments, furniture.

/** A railing round a square balcony of side `w`: top rail, lower rail, corner posts and balusters. */
export function railing(w: number, height = 0.62, spacing = 0.26): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const h = w / 2;
  for (const turn of [0, 1, 2, 3]) {
    const side: THREE.BufferGeometry[] = [
      new THREE.BoxGeometry(w + 0.1, 0.07, 0.09).translate(0, height, h),
      new THREE.BoxGeometry(w, 0.05, 0.06).translate(0, height * 0.42, h),
      new THREE.BoxGeometry(0.11, height + 0.14, 0.11).translate(-h, (height + 0.14) / 2, h),
    ];
    const n = Math.floor(w / spacing);
    for (let i = 1; i < n; i++) side.push(new THREE.BoxGeometry(0.045, height, 0.045).translate(-h + (w * i) / n, height / 2, h));
    for (const g of side) parts.push(g.rotateY((turn * Math.PI) / 2));
  }
  return mergeGeometries(parts)!;
}

/** Bracket blocks under an eave, on all four sides of a square of side `w`: the stepped timbers that carry a roof. */
export function brackets(w: number, y: number, spacing = 0.5): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const h = w / 2;
  for (const turn of [0, 1, 2, 3]) {
    const n = Math.max(2, Math.floor(w / spacing));
    for (let i = 0; i <= n; i++) {
      const x = -h + (w * i) / n;
      parts.push(new THREE.BoxGeometry(0.16, 0.14, 0.34).translate(x, y, h + 0.12).rotateY((turn * Math.PI) / 2));
      parts.push(new THREE.BoxGeometry(0.24, 0.1, 0.5).translate(x, y + 0.12, h + 0.2).rotateY((turn * Math.PI) / 2));
    }
  }
  return mergeGeometries(parts)!;
}

/** A gable set into a roof slope: the triangular front, and the two small roof planes that cover it. */
export function gable(width: number, height: number, depth: number): { face: THREE.BufferGeometry; roof: THREE.BufferGeometry; frame: THREE.BufferGeometry } {
  const tri = new THREE.Shape();
  tri.moveTo(-width / 2, 0);
  tri.lineTo(width / 2, 0);
  tri.lineTo(0, height);
  tri.closePath();
  const face = new THREE.ShapeGeometry(tri);
  const uv = face.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) + width / 2, uv.getY(i));
  const slope = Math.hypot(width / 2, height) + 0.4;
  const angle = Math.atan2(height, width / 2);
  // Each roof plane lies along one edge of the triangle and runs back into the main roof.
  const plane = (side: 1 | -1) =>
    new THREE.BoxGeometry(slope, 0.1, depth)
      .rotateZ(side * angle)
      .translate((-side * width) / 4, height / 2 + 0.1, -depth / 2 + 0.25);
  const barge = (side: 1 | -1) =>
    new THREE.BoxGeometry(slope, 0.17, 0.12)
      .rotateZ(side * angle)
      .translate((-side * width) / 4, height / 2 + 0.02, 0.08);
  return {
    face,
    roof: mergeGeometries([plane(1), plane(-1)])!,
    frame: mergeGeometries([barge(1), barge(-1), new THREE.BoxGeometry(width * 0.3, height * 0.26, 0.06).translate(0, height * 0.3, 0.04)])!,
  };
}

/** A ridge-end ornament: a finned tail curling up, as on the roofs of castles and temples. */
export function ornament(): THREE.BufferGeometry {
  const s = new THREE.Shape();
  s.moveTo(-0.28, 0);
  s.lineTo(0.3, 0);
  s.bezierCurveTo(0.42, 0.3, 0.34, 0.7, 0.02, 1.0);
  s.lineTo(-0.2, 1.22);
  s.lineTo(-0.1, 0.92);
  s.bezierCurveTo(0.08, 0.66, 0.08, 0.42, -0.06, 0.3);
  s.lineTo(-0.3, 0.42);
  s.closePath();
  return new THREE.ExtrudeGeometry(s, { depth: 0.2, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }).translate(0, 0, -0.1);
}
