import { useEffect } from "react";
import { site } from "~/content";
import { detectEdition } from "~/edition";
import { SmoothScroll } from "~/motion";
import { ArrivalHero } from "~/stationery/ArrivalHero";
import { StillStory } from "~/strip/StillStory";
import { Loader } from "~/ui/Loader";
import { useStage } from "~/stage";

export function meta() {
  return [{ title: `${site.name}, software engineer` }, { name: "description", content: site.line }];
}

export default function Home() {
  useEffect(() => {
    void detectEdition();
  }, []);
  const edition = useStage((s) => s.edition);
  return (
    <SmoothScroll>
      <Loader />
      <main>
        <section id="opening" aria-label="Introduction" data-edition={edition}>
          <ArrivalHero />
          {edition !== "desktop" && <StillStory />}
        </section>
      </main>
    </SmoothScroll>
  );
}
