// Maps a flat DOM rectangle onto the four screen points where the 3D camera sees its corners,
// so the printed Sheet (real DOM text) stays locked to the Diorama while the camera tilts.

export type Pt = [number, number];

/** Solves the 8 unknowns of the projective map taking (0,0),(w,0),(w,h),(0,h) to quad[0..3]. */
export function homography(w: number, h: number, quad: readonly [Pt, Pt, Pt, Pt]): number[] | null {
  const src: Pt[] = [
    [0, 0],
    [w, 0],
    [w, h],
    [0, h],
  ];
  // Rows of A·x = b for x = [a, b, c, d, e, f, g, h] with X = (a x + b y + c) / (g x + h y + 1).
  const m: number[][] = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i];
    const [X, Y] = quad[i];
    m.push([x, y, 1, 0, 0, 0, -x * X, -y * X, X]);
    m.push([0, 0, 0, x, y, 1, -x * Y, -y * Y, Y]);
  }
  for (let col = 0; col < 8; col++) {
    let pivot = col;
    for (let r = col + 1; r < 8; r++) if (Math.abs(m[r][col]) > Math.abs(m[pivot][col])) pivot = r;
    if (Math.abs(m[pivot][col]) < 1e-12) return null;
    [m[col], m[pivot]] = [m[pivot], m[col]];
    for (let r = 0; r < 8; r++) {
      if (r === col) continue;
      const f = m[r][col] / m[col][col];
      for (let c = col; c < 9; c++) m[r][c] -= f * m[col][c];
    }
  }
  return m.map((row, i) => row[8] / row[i]);
}

/** The CSS `matrix3d(...)` for that map. Use with `transform-origin: 0 0`. */
export function matrix3d(w: number, h: number, quad: readonly [Pt, Pt, Pt, Pt]): string | null {
  const s = homography(w, h, quad);
  if (!s) return null;
  const [a, b, c, d, e, f, g, hh] = s;
  return `matrix3d(${a},${d},0,${g},${b},${e},0,${hh},0,0,1,0,${c},${f},0,1)`;
}

export function applyHomography(s: number[], x: number, y: number): Pt {
  const k = s[6] * x + s[7] * y + 1;
  return [(s[0] * x + s[1] * y + s[2]) / k, (s[3] * x + s[4] * y + s[5]) / k];
}
