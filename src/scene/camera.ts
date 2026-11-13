// The camera's path through the Opening sequence. Pure maths; the Diorama applies it each frame.
// World: x right and z towards the viewer on the Sheet (plan units), y up.

export type V3 = [number, number, number];
export type Pose = { position: V3; target: V3; up: V3 };

/** Orbit pose: `polar` is the angle from straight overhead, `azimuth` swings the camera to the right. */
export type Orbit = { target: V3; polar: number; azimuth: number; distance: number; /** Lens angle in degrees; FOV when absent. */ fov?: number };

export const FOV = 15; // degrees; a long lens, so the buildings read like a print and the ranges stand tall

export function orbitPose(o: Orbit): Pose {
  const sp = Math.sin(o.polar), cp = Math.cos(o.polar);
  const sa = Math.sin(o.azimuth), ca = Math.cos(o.azimuth);
  return {
    target: o.target,
    position: [o.target[0] + o.distance * sp * sa, o.target[1] + o.distance * cp, o.target[2] + o.distance * sp * ca],
    // The tangent of the orbit pointing towards overhead: well defined even looking straight down.
    up: [-cp * sa, sp, -cp * ca],
  };
}

const smooth = (u: number) => u * u * (3 - 2 * u);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const mix = (a: number, b: number, u: number) => a + (b - a) * u;

function mixOrbit(a: Orbit, b: Orbit, u: number): Orbit {
  return {
    target: [mix(a.target[0], b.target[0], u), mix(a.target[1], b.target[1], u), mix(a.target[2], b.target[2], u)],
    fov: mix(a.fov ?? FOV, b.fov ?? FOV, u),
    polar: mix(a.polar, b.polar, u),
    azimuth: mix(a.azimuth, b.azimuth, u),
    distance: mix(a.distance, b.distance, u),
  };
}

export type Key = { at: number; orbit: Orbit };

/** Holds before the first key and after the last; eases between neighbours. */
export function orbitAt(keys: readonly Key[], progress: number): Orbit {
  if (progress <= keys[0].at) return keys[0].orbit;
  for (let i = 1; i < keys.length; i++) {
    if (progress <= keys[i].at) {
      const u = clamp01((progress - keys[i - 1].at) / (keys[i].at - keys[i - 1].at));
      return mixOrbit(keys[i - 1].orbit, keys[i].orbit, smooth(u));
    }
  }
  return keys[keys.length - 1].orbit;
}
