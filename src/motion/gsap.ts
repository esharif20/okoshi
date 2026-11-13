import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

// GSAP and its plugins are registered here, once, for every page. Nothing runs while the pages are prerendered.
if (typeof window !== "undefined") gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

export { gsap, ScrollTrigger, SplitText, useGSAP };

/** The one place that asks whether the visitor wants movement. */
export const MOVING = "(prefers-reduced-motion: no-preference)";
