import type { Layer, LayerId, Project, Role, Room, RoomId } from "./types";

export const ROOM_IDS: readonly RoomId[] = ["entrance", "workshop", "study", "lookout", "hall", "garden"];
export const LAYER_IDS: readonly LayerId[] = ["firmware", "languages", "services", "vision", "agents"];

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

export type Content = { roles: Role[]; projects: Project[]; rooms: Room[]; layers: Layer[] };

/** Returns every problem found; an empty list means the content is sound. */
export function validateContent(c: Content): string[] {
  const errors: string[] = [];
  const room = (where: string, id: string) => {
    if (!ROOM_IDS.includes(id as RoomId)) errors.push(`${where}: unknown Room "${id}"`);
  };
  const layer = (where: string, id: string) => {
    if (!LAYER_IDS.includes(id as LayerId)) errors.push(`${where}: unknown Layer "${id}"`);
  };
  const unique = (kind: string, ids: string[]) => {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) errors.push(`${kind} "${id}" appears twice`);
      seen.add(id);
    }
  };

  unique("Room", c.rooms.map((r) => r.id));
  unique("Layer", c.layers.map((l) => l.id));
  unique("Role", c.roles.map((r) => r.id));
  unique("Project", c.projects.map((p) => p.slug));
  for (const r of c.rooms) room(`rooms`, r.id);
  for (const l of c.layers) layer(`layers`, l.id);

  for (const r of c.roles) {
    const where = `role ${r.id}`;
    room(where, r.room);
    if (!MONTH.test(r.start)) errors.push(`${where}: malformed start "${r.start}"`);
    if (r.end !== undefined) {
      if (!MONTH.test(r.end)) errors.push(`${where}: malformed end "${r.end}"`);
      else if (r.end < r.start) errors.push(`${where}: ends before it starts`);
    }
  }

  for (const p of c.projects) {
    const where = `project ${p.slug}`;
    room(where, p.room);
    layer(where, p.layer);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug)) errors.push(`${where}: slug is not kebab-case`);
    if (!Number.isInteger(p.year) || p.year < 2000 || p.year > 2100) errors.push(`${where}: malformed year ${p.year}`);
    for (const [i, panel] of p.panels.entries()) {
      if (panel.picture && !panel.picture.alt.trim()) errors.push(`${where}: panel ${i} picture has no alt text`);
    }
  }
  return errors;
}
