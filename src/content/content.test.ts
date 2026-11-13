import { describe, expect, it } from "vitest";
import { getProject, layers, LAYER_IDS, projects, roles, ROOM_IDS, rooms, site, validateContent } from "./index";
import type { Content } from "./index";

const content: Content = { roles, projects, rooms, layers };
const clone = (): Content => structuredClone(content);

describe("content", () => {
  it("passes its own schema", () => {
    expect(validateContent(content)).toEqual([]);
  });

  it("has the six Rooms and five Layers of the glossary, in order", () => {
    expect(rooms.map((r) => r.id)).toEqual([...ROOM_IDS]);
    expect(rooms.map((r) => r.name)).toEqual(["Entrance", "Workshop", "Study", "Lookout", "Great Hall", "Garden"]);
    expect(layers.map((l) => l.id)).toEqual([...LAYER_IDS]);
    expect(layers.map((l) => l.name)).toEqual(["Firmware", "Languages", "Services", "Vision", "Agents"]);
  });

  it("has the five Projects, each with problem, approach and result Panels", () => {
    expect(projects.map((p) => p.slug)).toEqual([
      "football-intelligence",
      "deforestation-detection",
      "minic-compiler",
      "software-factory",
      "finance-agent",
    ]);
    for (const p of projects) {
      expect(p.panels.map((x) => x.kind)).toEqual(["problem", "approach", "result"]);
      expect(p.figures.length).toBeGreaterThan(0);
    }
    expect(projects.filter((p) => p.demo).map((p) => p.slug)).toEqual(["finance-agent"]);
  });

  it("finds a Project by slug", () => {
    expect(getProject("minic-compiler")?.title).toBe("Mini C Compiler");
    expect(getProject("nope")).toBeUndefined();
  });

  it("has contact details and links but no phone number", () => {
    expect(site.email).toMatch(/^[^@\s]+@[^@\s]+\.[a-z]+$/);
    expect(site.links.map((l) => l.label)).toEqual(["LinkedIn", "GitHub"]);
    const all = JSON.stringify({ site, ...content });
    expect(all.replace(/[\s()+\-.]/g, "")).not.toMatch(/\d{10,}/);
  });

  it("avoids the banned words", () => {
    const all = JSON.stringify({ site, ...content });
    expect(all).not.toMatch(/passionate|cutting-edge|leverag|seamless|not just/i);
  });
});

describe("validateContent", () => {
  it("rejects an unknown Room", () => {
    const c = clone();
    (c.roles[0] as { room: string }).room = "attic";
    expect(validateContent(c).join()).toMatch(/unknown Room "attic"/);
  });

  it("rejects an unknown Layer", () => {
    const c = clone();
    (c.projects[0] as { layer: string }).layer = "cloud";
    expect(validateContent(c).join()).toMatch(/unknown Layer "cloud"/);
  });

  it("rejects malformed dates", () => {
    const c = clone();
    c.roles[0].start = "2026-13";
    c.roles[1].end = "Aug 2025";
    const errors = validateContent(c).join();
    expect(errors).toMatch(/malformed start "2026-13"/);
    expect(errors).toMatch(/malformed end "Aug 2025"/);
  });

  it("rejects a Role that ends before it starts", () => {
    const c = clone();
    c.roles[1].end = "2020-01";
    expect(validateContent(c).join()).toMatch(/ends before it starts/);
  });

  it("rejects a picture without alt text", () => {
    const c = clone();
    c.projects[0].panels[0].picture = { src: "/a.png", alt: "  " };
    expect(validateContent(c).join()).toMatch(/no alt text/);
  });

  it("rejects duplicate slugs", () => {
    const c = clone();
    c.projects.push(structuredClone(c.projects[0]));
    expect(validateContent(c).join()).toMatch(/appears twice/);
  });
});
