import { data } from "react-router";
import { getProject } from "~/content";
import type { Route } from "./+types/work";

export function clientLoader({ params }: Route.ClientLoaderArgs) {
  return { slug: params.slug };
}

export function meta({ params }: Route.MetaArgs) {
  const project = getProject(params.slug);
  return [{ title: project ? project.title : "Not found" }];
}

export default function Work({ params }: Route.ComponentProps) {
  const project = getProject(params.slug);
  if (!project) throw data("Not found", { status: 404 });
  return (
    <main>
      <h1>{project.title}</h1>
      <p>{project.summary}</p>
    </main>
  );
}
