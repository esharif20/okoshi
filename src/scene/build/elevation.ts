import * as THREE from "three";

// A wall drawn as a builder's elevation: plaster, the timber frame, paper screens and windows.
// One of these is painted for each wall and laid on the flap that folds up.

const PX = 96; // pixels per metre

export type ElevationOptions = {
  width: number;
  height: number;
  bays: number;
  /** Bays that hold a sliding paper screen (0 is the leftmost). */
  screens?: number[];
  /** Bays that hold a small barred window. */
  windows?: number[];
  seed?: number;
};

const TIMBER = "#5a4338";
const TIMBER_LIGHT = "#765a4a";
const PLASTER = "#f7efe4";
const PAPER = "#fdf5e4";

export function elevation(o: ElevationOptions): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = Math.round(o.width * PX);
  c.height = Math.round(o.height * PX);
  const g = c.getContext("2d")!;
  let s = o.seed ?? 3;
  const r = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  const u = (m: number) => m * PX;
  const y = (m: number) => c.height - u(m); // metres up from the foot of the wall

  // Plaster, never quite flat.
  g.fillStyle = PLASTER;
  g.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < 40; i++) {
    g.fillStyle = `rgba(${r() < 0.5 ? "255,255,255" : "120,90,70"},${0.02 + r() * 0.03})`;
    g.beginPath();
    g.ellipse(r() * c.width, r() * c.height, u(0.3 + r() * 0.9), u(0.2 + r() * 0.5), r() * 3, 0, 7);
    g.fill();
  }

  const timber = (x: number, top: number, w: number, h: number) => {
    g.fillStyle = TIMBER;
    g.fillRect(x, top, w, h);
    g.fillStyle = TIMBER_LIGHT;
    const along = w > h;
    for (let i = 0; i < 5; i++) {
      g.globalAlpha = 0.25 + r() * 0.3;
      if (along) g.fillRect(x, top + r() * h, w, 1.5);
      else g.fillRect(x + r() * w, top, 1.5, h);
    }
    g.globalAlpha = 1;
  };

  const bay = o.width / o.bays;
  const rail = Math.min(2.15, o.height * 0.72); // the long rail the screens slide under
  for (let i = 0; i < o.bays; i++) {
    const x0 = i * bay;
    if (o.screens?.includes(i)) {
      // A sliding screen: paper behind a lattice of thin bars, from the sill to the rail.
      g.fillStyle = PAPER;
      g.fillRect(u(x0), y(rail), u(bay), u(rail - 0.14));
      g.fillStyle = TIMBER;
      const cols = Math.max(3, Math.round(bay / 0.3)), rows = 5;
      for (let k = 1; k < cols; k++) g.fillRect(u(x0 + (bay * k) / cols) - 1.5, y(rail), 3, u(rail - 0.14));
      for (let k = 1; k < rows; k++) g.fillRect(u(x0), y(0.14 + ((rail - 0.14) * k) / rows) - 1.5, u(bay), 3);
      g.fillRect(u(x0 + bay / 2) - 4, y(rail), 8, u(rail - 0.14));
    } else if (o.windows?.includes(i)) {
      // A small window with upright bars, dark behind.
      const ww = bay * 0.52, wh = Math.min(0.78, o.height * 0.3), wx = x0 + (bay - ww) / 2, wy = rail * 0.62;
      g.fillStyle = "#2a2422";
      g.fillRect(u(wx), y(wy + wh), u(ww), u(wh));
      g.fillStyle = TIMBER;
      for (let k = 0; k <= 5; k++) g.fillRect(u(wx + (ww * k) / 5) - 3, y(wy + wh), 6, u(wh));
      timber(u(wx) - 5, y(wy + wh) - 5, u(ww) + 10, 8);
      timber(u(wx) - 5, y(wy) - 3, u(ww) + 10, 8);
    }
  }
  // The frame: a post at every bay, the sill, the long rail, the head beam.
  for (let i = 0; i <= o.bays; i++) timber(u(i * bay) - u(0.09), 0, u(0.18), c.height);
  timber(0, y(0.14), c.width, u(0.14));
  timber(0, y(rail + 0.1), c.width, u(0.1));
  timber(0, 0, c.width, u(0.24));

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
