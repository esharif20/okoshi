import { site } from "~/content";
import { DioramaSlot } from "~/scene/DioramaSlot";

export function meta() {
  return [{ title: site.name }, { name: "description", content: site.line }];
}

export default function Home() {
  return (
    <main>
      <h1>{site.name}</h1>
      <p>{site.line}</p>
      <DioramaSlot className="h-[60svh]" />
    </main>
  );
}
