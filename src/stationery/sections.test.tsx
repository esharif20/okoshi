import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { projects, roles, site } from "~/content";
import { MangaPage } from "~/manga";
import { Sections } from "./Sections";

// The pages are prerendered, so everything they say must already be in the HTML, before any script runs.
const page = (node: React.ReactNode) => renderToString(<MemoryRouter>{node}</MemoryRouter>);

describe("Stationery", () => {
  const html = page(<Sections />);

  it("has the sections the navigation points at", () => {
    for (const id of ["work", "about", "contact"]) expect(html).toContain(`id="${id}"`);
  });

  it("names every Role and Project without a script", () => {
    for (const role of roles) expect(html).toContain(role.points[0].replace(/'/g, "&#x27;"));
    for (const project of projects) expect(html).toContain(`href="/work/${project.slug}"`);
  });

  it("carries the email and the CV", () => {
    expect(html).toContain(`mailto:${site.email}`);
    expect(html).toContain("cv.pdf");
  });
});

describe("Manga page", () => {
  it.each(projects)("tells $slug in its three Panels", (project) => {
    const html = page(<MangaPage project={project} />);
    expect(html).toContain("<h1");
    for (const panel of project.panels) expect(html).toContain(panel.heading.replace(/'/g, "&#x27;"));
    if (project.repo) expect(html).toContain(project.repo);
  });
});
