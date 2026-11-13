import type { Layer, Project, Role, Room, Site } from "./types";

export type * from "./types";

// Placeholder content so the skeleton builds. GH-3 replaces every value here.
export const site: Site = {
  name: "Eshan Sharif",
  line: "Software engineer.",
  city: "London",
  email: "",
  links: [],
};

export const roles: Role[] = [];
export const rooms: Room[] = [];
export const layers: Layer[] = [];

export const projects: Project[] = [
  {
    slug: "sample",
    title: "Sample project",
    year: 2026,
    summary: "Placeholder until GH-3.",
    stack: [],
    figures: [],
    panels: [],
    room: "study",
    layer: "languages",
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
