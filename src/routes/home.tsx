import { useEffect } from "react";
import { site } from "~/content";
import { detectEdition } from "~/edition";
import { SmoothScroll } from "~/motion";
import { SheetHero } from "~/stationery/SheetHero";

export function meta() {
  return [{ title: `${site.name}, software engineer` }, { name: "description", content: site.line }];
}

export default function Home() {
  useEffect(() => {
    void detectEdition();
  }, []);
  return (
    <SmoothScroll>
      <main>
        <section id="opening" aria-label="Introduction">
          <SheetHero />
        </section>
      </main>
    </SmoothScroll>
  );
}
