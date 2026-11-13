import * as THREE from "three";

// The three states every built surface passes through: bare folded paper, an ink drawing, then paint.
// The paint is the surface's own texture under the scene's light; the ink drawing is taken from that same
// texture (its dark parts become line work), so the drawing and the painting always agree.

const linear = (hex: string) => new THREE.Color(hex);

/** Shared by every painted material; the Compound sets these once per frame. */
export const paintState = {
  uInk: { value: 0 }, // 0..1: how far up the ink has run
  uPaint: { value: 0 }, // 0..1: how far up the paint has soaked
  uTop: { value: 15 }, // world height the tallest building reaches
  uDotScale: { value: 5 },
  uLiftAt: { value: new THREE.Vector3() }, // where the visitor is pointing, in the world
  uLift: { value: 0 }, // 0..1: how far the paint there has drawn back to ink
  uLiftRadius: { value: 3.4 },
  uPaper: { value: linear("#fdf8f3") },
  uInkColour: { value: linear("#2b2a33") },
};

const DECLARE = /* glsl */ `
uniform float uInk, uPaint, uTop, uDotScale, uShown, uPrinted, uLift, uLiftRadius;
uniform vec3 uLiftAt;
uniform vec3 uPaper, uInkColour;
varying vec3 vPaintWorld;
float pHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float pNoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(pHash(i), pHash(i + vec2(1, 0)), f.x), mix(pHash(i + vec2(0, 1)), pHash(i + vec2(1, 1)), f.x), f.y);
}
`;

const COMPOSE = /* glsl */ `
{
  // A flap prints onto the sheet grain by grain just before it lifts.
  if (uShown < 1.0 && pNoise(vPaintWorld.xz * 9.0) * 0.55 + pHash(floor(vPaintWorld.xz * 40.0)) * 0.45 > uShown) discard;
  float tone = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
  // The light falling here, with the surface's own colour divided out: paper takes the same light as paint.
  float light = dot(outgoingLight, vec3(0.3333)) / max(tone, 0.05);
  float lit = smoothstep(0.3, 0.62, light);
  vec3 paper = uPaper * clamp(light * 1.3, 0.62, 1.04);
  float bloom = pNoise(vPaintWorld.xz * 0.5 + vPaintWorld.y * 0.55);      // where a brush-load lands
  float fray = pNoise(vPaintWorld.xz * 2.6 + vPaintWorld.y * 2.3 + 7.0);  // the ragged edge of a wash
  float climb = vPaintWorld.y / (uTop + 1.0);

  // Ink climbs the building. Dark parts of the painting (timber, joints, lattice) are its lines; shade is screentone.
  float inked = max(uPrinted, smoothstep(0.0, 0.08, uInk * 1.4 - 0.2 - climb + (bloom - 0.5) * 0.3));
  // A line is wherever the painting changes tone sharply, or is nearly black: the edges of things, not their fills.
  float edge = clamp(length(vec2(dFdx(tone), dFdy(tone))) * 7.0, 0.0, 1.0);
  float drawn = max(smoothstep(0.22, 0.95, edge) * 0.8, 1.0 - smoothstep(0.1, 0.24, tone));
  vec2 cell = mat2(0.7071, -0.7071, 0.7071, 0.7071) * gl_FragCoord.xy / uDotScale;
  float dots = (1.0 - smoothstep(0.0, 0.1, length(fract(cell) - 0.5) - 0.4 * sqrt(1.0 - lit))) * inked * (1.0 - uPrinted);
  // Before the ink, the drawing is there in faint pencil.
  vec3 drawing = mix(paper, uInkColour, max(drawn * mix(0.14, 0.9, inked), dots * 0.5));

  // Paint arrives the way a watercolour is laid: brush-loads land in patches and spread until they meet,
  // a first thin wash, then the full colour, with a darker line where a wet edge dried.
  float reach = uPaint * 1.95 - 0.26 - climb * 0.5 - bloom * 0.8 + (fray - 0.5) * 0.14;
  // Pointing at a room draws its paint back to the ink underneath, with the same ragged edge.
  float lifted = uLift * (1.0 - smoothstep(uLiftRadius * 0.72, uLiftRadius, distance(vPaintWorld, uLiftAt) + (fray - 0.5) * 0.9));
  reach = mix(reach, -0.2, lifted);
  float wash = smoothstep(0.0, 0.2, reach);
  float full = smoothstep(0.12, 0.8, reach);
  float wet = wash * (1.0 - smoothstep(0.0, 0.3, reach));
  vec3 colour = mix(mix(paper, outgoingLight, 0.45), outgoingLight, full);
  colour = mix(colour, colour * 0.8, wet * 0.6);
  // The pen line stays under the paint, as in a pen-and-wash sketch, and settles to a faint drawn edge.
  colour = mix(colour, uInkColour, drawn * mix(0.6, 0.12, full));
  outgoingLight = mix(drawing, colour, wash);
}
`;

/** Materials that hold lamplight at Night: paper screens and the walls around them. */
export const glowing = new Set<THREE.MeshStandardMaterial>();

export type PaintedOptions = { roughness?: number; bump?: number; side?: THREE.Side; emissive?: string; printed?: boolean };

/** A lit, textured material that starts as paper, is inked, then painted. */
export function painted(map: THREE.Texture, o: PaintedOptions = {}): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    map,
    bumpMap: o.bump === 0 ? null : map,
    bumpScale: o.bump ?? 0.6,
    roughness: o.roughness ?? 0.92,
    metalness: 0,
    side: o.side ?? THREE.FrontSide,
    emissive: o.emissive ?? "#000000",
    emissiveMap: o.emissive ? map : null,
    emissiveIntensity: 0,
  });
  // `uShown` lets a flap print in before it lifts; `uPrinted` marks a surface that is a drawing from the start (the plan).
  const own = { uShown: { value: 1 }, uPrinted: { value: o.printed ? 1 : 0 } };
  material.userData.own = own;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, paintState, own);
    shader.vertexShader = shader.vertexShader
      .replace("void main() {", "varying vec3 vPaintWorld;\nvoid main() {")
      .replace("#include <project_vertex>", "#include <project_vertex>\nvPaintWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;");
    shader.fragmentShader = shader.fragmentShader
      .replace("void main() {", `${DECLARE}\nvoid main() {`)
      .replace("#include <opaque_fragment>", `${COMPOSE}\n#include <opaque_fragment>`);
  };
  if (o.emissive) glowing.add(material);
  material.customProgramCacheKey = () => `painted-${o.emissive ? "glow" : "plain"}`;
  return material;
}

/** A box whose texture coordinates are in world units, so a texture keeps one scale on every face. */
export function slab(w: number, h: number, d: number): THREE.BoxGeometry {
  const g = new THREE.BoxGeometry(w, h, d);
  const uv = g.attributes.uv as THREE.BufferAttribute;
  const faces: [number, number][] = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) uv.setXY(f * 4 + i, uv.getX(f * 4 + i) * faces[f][0], uv.getY(f * 4 + i) * faces[f][1]);
  return g;
}

/** How far a material has printed onto the sheet: 0 not there, 1 whole. */
export function setShown(material: THREE.Material, shown: number) {
  (material.userData.own as { uShown: { value: number } }).uShown.value = shown;
}
