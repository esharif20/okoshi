import * as THREE from "three";

// Every surface texture is painted here, on a canvas, when the Diorama loads. No image files.
// Each is tileable and doubles as its own bump map: dark lines read as grooves.

const SIZE = 512;

function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

function canvas(): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement("canvas");
  c.width = c.height = SIZE;
  return [c, c.getContext("2d")!];
}

function finish(c: HTMLCanvasElement, unitsAcross: number): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.repeat.set(1 / unitsAcross, 1 / unitsAcross);
  return t;
}

/** Fine speckle and soft blotches over a flat colour: the grain every painted surface shares. */
function grain(g: CanvasRenderingContext2D, r: () => number, speck: number, blotch: number) {
  for (let i = 0; i < 26; i++) {
    g.fillStyle = `rgba(${r() < 0.5 ? "255,255,255" : "60,40,30"},${blotch * (0.4 + r() * 0.6)})`;
    g.beginPath();
    g.ellipse(r() * SIZE, r() * SIZE, 30 + r() * 90, 20 + r() * 60, r() * 3, 0, Math.PI * 2);
    g.fill();
  }
  for (let i = 0; i < 9000; i++) {
    g.fillStyle = `rgba(${r() < 0.5 ? "255,255,255" : "50,35,25"},${speck * r()})`;
    g.fillRect(r() * SIZE, r() * SIZE, 1 + r() * 1.5, 1 + r() * 1.5);
  }
}

export function plaster(colour: string, seed = 3): THREE.CanvasTexture {
  const [c, g] = canvas();
  g.fillStyle = colour;
  g.fillRect(0, 0, SIZE, SIZE);
  grain(g, rng(seed), 0.09, 0.035);
  return finish(c, 3);
}

export function wood(colour: string, seed = 5): THREE.CanvasTexture {
  const [c, g] = canvas();
  const r = rng(seed);
  g.fillStyle = colour;
  g.fillRect(0, 0, SIZE, SIZE);
  for (let i = 0; i < 260; i++) {
    g.strokeStyle = `rgba(${r() < 0.35 ? "255,240,220" : "40,24,14"},${0.05 + r() * 0.16})`;
    g.lineWidth = 0.6 + r() * 2.2;
    const y = r() * SIZE;
    g.beginPath();
    g.moveTo(0, y);
    g.bezierCurveTo(SIZE * 0.3, y + (r() - 0.5) * 9, SIZE * 0.7, y + (r() - 0.5) * 9, SIZE, y);
    g.stroke();
  }
  // Board joints and a few knots.
  g.fillStyle = "rgba(30,18,12,0.5)";
  for (let k = 1; k < 4; k++) g.fillRect(0, (k * SIZE) / 4 - 1.5, SIZE, 3);
  for (let i = 0; i < 6; i++) {
    const x = r() * SIZE, y = r() * SIZE, rad = 5 + r() * 9;
    for (let k = 3; k > 0; k--) {
      g.strokeStyle = `rgba(35,20,12,${0.12 * k})`;
      g.lineWidth = 1.5;
      g.beginPath();
      g.ellipse(x, y, rad * (k / 3) * 1.6, rad * (k / 3), 0, 0, 7);
      g.stroke();
    }
  }
  grain(g, r, 0.06, 0.02);
  return finish(c, 1.6);
}

/** Dry-stone walling: uneven courses of fitted stones, each a slightly different tone, dark joints between. */
export function stone(seed = 9): THREE.CanvasTexture {
  const [c, g] = canvas();
  const r = rng(seed);
  g.fillStyle = "#4a443f";
  g.fillRect(0, 0, SIZE, SIZE);
  const tones = ["#b8aa9c", "#a89b8e", "#c4b7a8", "#9c9085", "#b0a092", "#cabdad"];
  let y = 0;
  while (y < SIZE) {
    const h = Math.min(SIZE - y, 44 + r() * 46);
    let x = -r() * 60;
    while (x < SIZE) {
      const w = 60 + r() * 90;
      for (const ox of [0, SIZE]) {
        g.fillStyle = tones[Math.floor(r() * tones.length)];
        g.beginPath();
        g.roundRect(x - ox + 3, y + 3, w - 6, h - 6, 9 + r() * 8);
        g.fill();
        g.fillStyle = "rgba(255,255,255,0.10)";
        g.beginPath();
        g.roundRect(x - ox + 6, y + 5, w - 16, h * 0.3, 6);
        g.fill();
      }
      x += w;
    }
    y += h;
  }
  grain(g, r, 0.12, 0.03);
  return finish(c, 2.6);
}

/** Roof tiles: rows of round-ended tiles, each row lapped over the next, with a rib between tiles. */
export function tiles(colour: string, seed = 13): THREE.CanvasTexture {
  const [c, g] = canvas();
  const r = rng(seed);
  g.fillStyle = "#1d2a33";
  g.fillRect(0, 0, SIZE, SIZE);
  const rows = 8, cols = 8;
  const rh = SIZE / rows, cw = SIZE / cols;
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      const base = new THREE.Color(colour).offsetHSL(0, 0, (r() - 0.5) * 0.05);
      g.fillStyle = `#${base.getHexString()}`;
      g.beginPath();
      g.roundRect(i * cw + 3, j * rh + 2, cw - 6, rh - 3, [4, 4, cw * 0.38, cw * 0.38]);
      g.fill();
      g.fillStyle = "rgba(255,255,255,0.13)";
      g.fillRect(i * cw + cw * 0.3, j * rh + 4, cw * 0.14, rh - 16);
    }
  grain(g, r, 0.07, 0.02);
  return finish(c, 2.4);
}

/** A paper screen: warm paper behind a lattice of thin wooden bars. */
export function screen(seed = 17): THREE.CanvasTexture {
  const [c, g] = canvas();
  g.fillStyle = "#fbf3e6";
  g.fillRect(0, 0, SIZE, SIZE);
  grain(g, rng(seed), 0.05, 0.02);
  g.fillStyle = "#4a3a30";
  const cols = 4, rows = 6;
  for (let i = 0; i <= cols; i++) g.fillRect((i * SIZE) / cols - (i === 0 || i === cols ? 9 : 4), 0, i === 0 || i === cols ? 18 : 8, SIZE);
  for (let j = 0; j <= rows; j++) g.fillRect(0, (j * SIZE) / rows - (j === 0 || j === rows ? 9 : 4), SIZE, j === 0 || j === rows ? 18 : 8);
  return finish(c, 1.5);
}

/** The folded plan the buildings rise from: paper with the footings drawn in ink. */
export function planSheet(): THREE.CanvasTexture {
  const [c, g] = canvas();
  g.fillStyle = "#fdf8f3";
  g.fillRect(0, 0, SIZE, SIZE);
  grain(g, rng(23), 0.05, 0.02);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ------------------------------------------------------------------------------------ the printed plan

export type PlanRoom = { name: string; x: number; z: number; w: number; d: number; mats?: boolean };

const PLAN_PX = 96;
const DISPLAY = '800 44px "Shippori Mincho B1", "Hiragino Mincho ProN", Georgia, serif';

/**
 * A floor drawn as a plan: every room outlined, floored with mats and named.
 * `x` and `z` are a room's near-left corner measured from the plan's back-left corner.
 */
export function floorPlan(width: number, depth: number, rooms: PlanRoom[]): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = Math.round(width * PLAN_PX);
  c.height = Math.round(depth * PLAN_PX);
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  const u = (m: number) => m * PLAN_PX;

  const draw = () => {
    const g = c.getContext("2d")!;
    g.fillStyle = "#fdf8f3";
    g.fillRect(0, 0, c.width, c.height);
    for (const r of rooms) {
      if (r.mats !== false) {
        // Mats 0.9 by 1.8, each bound with a darker edge, alternate columns stepped by half a mat.
        const cols = Math.round(r.w / 0.9), mw = r.w / cols;
        for (let i = 0; i < cols; i++) {
          const rowsStart = i % 2 ? -0.9 : 0;
          for (let z = rowsStart; z < r.d; z += 1.8) {
            const z0 = Math.max(0, z), z1 = Math.min(r.d, z + 1.8);
            g.fillStyle = (i + Math.round(z / 0.9)) % 2 ? "#e3e3c6" : "#dcdebd";
            g.fillRect(u(r.x + i * mw), u(r.z + z0), u(mw), u(z1 - z0));
            g.strokeStyle = "#7d8266";
            g.lineWidth = 5;
            g.strokeRect(u(r.x + i * mw) + 3, u(r.z + z0) + 3, u(mw) - 6, u(z1 - z0) - 6);
          }
        }
      } else {
        // Boards.
        g.fillStyle = "#d9c3ad";
        g.fillRect(u(r.x), u(r.z), u(r.w), u(r.d));
        g.strokeStyle = "#8b6f5a";
        g.lineWidth = 3;
        for (let z = 0.3; z < r.d; z += 0.3) {
          g.beginPath();
          g.moveTo(u(r.x), u(r.z + z));
          g.lineTo(u(r.x + r.w), u(r.z + z));
          g.stroke();
        }
      }
      g.strokeStyle = "#2b2a33";
      g.lineWidth = 12;
      g.strokeRect(u(r.x), u(r.z), u(r.w), u(r.d));
    }
    // Names last, each on a slip of clear paper so it reads over the mats.
    g.font = DISPLAY;
    g.textBaseline = "middle";
    for (const r of rooms) {
      if (!r.name) continue;
      const tw = g.measureText(r.name).width;
      const tx = u(r.x) + 34, ty = u(r.z) + 58;
      g.fillStyle = "#fdf8f3";
      g.fillRect(tx - 14, ty - 34, tw + 28, 66);
      g.fillStyle = "#2b2a33";
      g.fillText(r.name, tx, ty);
    }
    texture.needsUpdate = true;
  };
  draw();
  // The display face may still be loading when the Diorama starts; redraw once it is in.
  document.fonts?.load(DISPLAY).then(draw).catch(() => {});
  return texture;
}
