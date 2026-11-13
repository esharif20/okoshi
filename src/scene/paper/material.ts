import * as THREE from "three";

// The paper every panel is made of. One shader, three states laid over each other:
// bare folded paper, then Ink (line work and screentone), then Paint (colour soaking up from the ground).

export type PaperLook = "plaster" | "screen" | "eave";
const LOOK_INDEX: Record<PaperLook, number> = { plaster: 0, screen: 1, eave: 2 };

const linear = (hex: string) => new THREE.Color(hex);

/** Shared by every paper material; the Diorama sets these once per frame. */
export const paperState = {
  uInk: { value: 0 },
  uPaint: { value: 0 },
  uShown: { value: 1 },
  uDotScale: { value: 5 },
  uPaper: { value: linear("#f7f9fa") },
  uInkColour: { value: linear("#1f3038") },
  uWash: { value: linear("#dfe6ea") }, // the cool shadow of a painted white wall
  uPaintColours: { value: [linear("#f7f9fa"), linear("#eef2f3"), linear("#3a5462")] }, // plaster, screen, eave
};

const DECLARATIONS = /* glsl */ `
uniform float uInk, uPaint, uLift, uLook, uDotScale;
uniform vec2 uSize;
uniform vec3 uPaper, uInkColour, uWash;
uniform vec3 uPaintColours[3];
varying vec2 vPaperUv;
varying vec3 vPaperWorld;

float pHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float pNoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(pHash(i), pHash(i + vec2(1, 0)), f.x), mix(pHash(i + vec2(0, 1)), pHash(i + vec2(1, 1)), f.x), f.y);
}
// 1 on a line of width w centred on each integer of x, antialiased.
float pLine(float x, float w) {
  float d = abs(fract(x - 0.5) - 0.5);
  float aa = fwidth(x) * 0.75;
  return 1.0 - smoothstep(w * 0.5 - aa, w * 0.5 + aa, d);
}
// 1 inside a band of width w centred on y0.
float pBand(float y, float y0, float w) {
  float aa = fwidth(y) * 0.75;
  return 1.0 - smoothstep(w * 0.5 - aa, w * 0.5 + aa, abs(y - y0));
}

// The drawing on a panel, in plan units: timber frame, sliding screens or roof tiles.
float pDrawing(vec2 p, vec2 size, float look) {
  vec2 e = min(p, size - p);
  float aa = fwidth(p.x) + fwidth(p.y);
  float border = 1.0 - smoothstep(0.03, 0.03 + aa, min(e.x, e.y));
  float ink = 0.0;
  if (look < 0.5) {
    float bays = max(1.0, floor(size.x / 0.95 + 0.5));
    ink = pLine(p.x / (size.x / bays), 0.075 * bays / size.x);
    ink = max(ink, pBand(p.y, size.y * 0.8, 0.07));
  } else if (look < 1.5) {
    float bays = max(1.0, floor(size.x / 0.9 + 0.5));
    float bay = size.x / bays;
    ink = pLine(p.x / bay, 0.06 / bay);
    ink = max(ink, pLine(p.x / (bay / 3.0), 0.02 / (bay / 3.0)));
    ink = max(ink, pLine(p.y / 0.22, 0.02 / 0.22) * step(0.12, p.y));
  } else {
    ink = pLine(p.x / 0.17, 0.035 / 0.17);
    ink = max(ink, pLine(p.y / 0.3, 0.03 / 0.3));
  }
  return max(ink, border);
}
`;

const COMPOSE = /* glsl */ `
{
  vec2 p = vPaperUv * uSize;
  float light = dot(outgoingLight, vec3(0.3333));
  float lit = smoothstep(0.58, 0.9, light);

  // Ink draws across each panel behind a ragged front.
  float front = (p.x / max(uSize.x, 0.001)) * 0.75 + pNoise(p * 2.3) * 0.25;
  float inked = smoothstep(front, front + 0.06, uInk * 1.12);
  float drawing = pDrawing(p, uSize, uLook) * inked;

  // Shade is plain grey on bare paper and turns to screentone dots as the Ink arrives.
  float inkAll = smoothstep(0.0, 0.25, uInk);
  vec2 cell = mat2(0.7071, -0.7071, 0.7071, 0.7071) * gl_FragCoord.xy / uDotScale;
  float dot_ = 1.0 - smoothstep(0.0, 0.08, length(fract(cell) - 0.5) - 0.42 * sqrt(1.0 - lit));
  vec3 bare = uPaper * mix(0.8, 1.0, lit);
  vec3 toned = mix(uPaper, uInkColour, dot_ * 0.85);
  vec3 inkStage = mix(mix(bare, toned, inkAll), uInkColour, drawing);

  // Paint soaks up from the ground with an uneven wet edge. A Lifted room gives its paint back.
  float reach = uPaint * 6.4 - vPaperWorld.y + (pNoise(vPaperWorld.xz * 1.3 + vPaperWorld.y * 0.7) - 0.5) * 1.1;
  float painted = smoothstep(0.0, 0.3, reach) * (1.0 - uLift);
  float wetEdge = painted * (1.0 - smoothstep(0.0, 0.55, reach));
  vec3 colour = uPaintColours[int(uLook + 0.5)];
  vec3 wash = mix(mix(colour * uWash / uPaper, colour, lit), colour * 0.82, wetEdge * 0.6);
  vec3 paintStage = mix(wash, uInkColour, drawing * 0.9);

  outgoingLight = mix(inkStage, paintStage, painted);
}
`;

export function makePaper(look: PaperLook, size: [number, number]): THREE.MeshLambertMaterial {
  const material = new THREE.MeshLambertMaterial({ color: "#ffffff", side: THREE.DoubleSide });
  const own = { uSize: { value: new THREE.Vector2(...size) }, uLook: { value: LOOK_INDEX[look] }, uLift: { value: 0 } };
  material.userData.paper = own;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, paperState, own);
    shader.vertexShader = shader.vertexShader
      .replace("void main() {", "varying vec2 vPaperUv;\nvarying vec3 vPaperWorld;\nvoid main() {")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvPaperUv = uv;\nvPaperWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;");
    shader.fragmentShader = shader.fragmentShader
      .replace("void main() {", `${DECLARATIONS}\nvoid main() {`)
      .replace("#include <opaque_fragment>", `${COMPOSE}\n#include <opaque_fragment>`);
  };
  // One program for every panel: only the uniform values differ.
  material.customProgramCacheKey = () => "paper";
  return material;
}

export function setLift(material: THREE.Material, lift: number) {
  const own = material.userData.paper as { uLift: { value: number } } | undefined;
  if (own) own.uLift.value = lift;
}
