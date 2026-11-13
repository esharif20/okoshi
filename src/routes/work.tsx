import { data } from "react-router";
import { getProject, site } from "~/content";
import { MangaPage } from "~/manga";
import { SmoothScroll } from "~/motion";
import type { Route } from "./+types/work";

export function clientLoader({ params }: Route.ClientLoaderArgs) {
  return { slug: params.slug };
}

export function meta({ params }: Route.MetaArgs) {
  const project = getProject(params.slug);
  if (!project) return [{ title: "Not found" }];
  return [{ title: `${project.title}, by ${site.name}` }, { name: "description", content: project.summary }];
}

export default function Work({ params }: Route.ComponentProps) {
  const project = getProject(params.slug);
  if (!project) throw data("Not found", { status: 404 });
  return (
    <SmoothScroll>
      {/* Keyed, so turning to another volume plays its entrance afresh. */}
      <MangaPage key={project.slug} project={project} />
    </SmoothScroll>
  );
}
