// The shared content contract. See docs/ARCHITECTURE.md, "content".

export type RoomId = "entrance" | "workshop" | "study" | "lookout" | "hall" | "garden";
export type LayerId = "firmware" | "languages" | "services" | "vision" | "agents";

export type Figure = { value: string; measures: string };

export type Role = {
  id: string;
  title: string;
  org: string;
  place: string;
  start: string; // "YYYY-MM"
  end?: string; // "YYYY-MM"; absent means present
  summary: string;
  points: string[];
  room: RoomId;
};

export type Panel = {
  kind: "problem" | "approach" | "result";
  heading: string;
  text: string;
  figure?: Figure;
  picture?: { src: string; alt: string };
};

export type Project = {
  slug: string;
  title: string;
  year: number;
  summary: string;
  stack: string[];
  figures: Figure[];
  panels: Panel[];
  repo?: string;
  demo?: string;
  room: RoomId;
  layer: LayerId;
};

export type Room = { id: RoomId; name: string; standsFor: string; facts: string[] };
export type Layer = { id: LayerId; name: string; skills: string[] };

export type Site = {
  name: string;
  line: string;
  city: string;
  email: string;
  links: { label: string; href: string }[];
};
