import { site } from "~/content";
import { Anchor } from "~/ui/Anchor";
import { BrushLink } from "~/ui/BrushLink";
import { Clock } from "~/ui/Clock";
import { SealButton } from "~/ui/SealButton";

// The top of every Manga page: the name leads home, and the one action is the Seal.
export function MangaHeader() {
  return (
    <header className="manga-top">
      <Anchor className="manga-name" href="/">
        {site.name}
      </Anchor>
      <nav className="manga-nav" aria-label="Site">
        <BrushLink href="/#work">All work</BrushLink>
        <Clock className="manga-clock" />
      </nav>
      <SealButton href={`mailto:${site.email}`}>Get in touch</SealButton>
    </header>
  );
}
