import { useEffect } from "react";
import { site } from "~/content";
import { detectEdition } from "~/edition";
import { SmoothScroll } from "~/motion";
import { SheetHero } from "~/stationery/SheetHero";
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
      <main>
        <section id="opening" aria-label="Introduction" data-edition={edition}>
          <SheetHero />
        </section>
      </main>
    </SmoothScroll>
  );
}
