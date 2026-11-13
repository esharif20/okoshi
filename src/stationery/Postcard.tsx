import { site } from "~/content";
import { BrushLink } from "~/ui/BrushLink";
import { SealMark } from "~/ui/SealMark";
import "./postcard.css";

// The Postcard: the footer, laid out as the back of a postcard. It waits under the page, which slides up to uncover it.
export function Postcard() {
  return (
    <footer className="postcard-ground">
      <div className="postcard">
        <span className="postcard-edge" aria-hidden="true" />

        <div className="postcard-message">
          <h2>Safe travels.</h2>
          <p>Thank you for walking this far. If something here is close to what you are building, write to me.</p>
          <p className="postcard-sign">
            <strong>{site.name.split(" ")[0]}</strong>
            <SealMark name={site.name} />
          </p>
        </div>

        <div className="postcard-address">
          <img
            className="postcard-stamp"
            src={`${import.meta.env.BASE_URL}img/zojoji-stamp.webp`}
            width={264}
            height={352}
            loading="lazy"
            alt="A postage stamp cut from a woodblock print of a red pagoda."
          />
          <ul>
            <li>
              <BrushLink href={`mailto:${site.email}`}>{site.email}</BrushLink>
            </li>
            {site.links.map((link) => (
              <li key={link.href}>
                <BrushLink href={link.href}>{link.label}</BrushLink>
              </li>
            ))}
            <li>
              <BrushLink href={`${import.meta.env.BASE_URL}cv.pdf`} download>
                Download CV
              </BrushLink>
            </li>
            <li>{site.city}</li>
          </ul>
        </div>

        <p className="postcard-imprint">
          {site.name}. The prints are by Utagawa Hiroshige and in the public domain: Driving Rain at Shōno, Cleveland Museum of Art, and
          Pagoda of Zōjōji Temple, Akabane, Cooper Hewitt, Smithsonian Design Museum.
        </p>
      </div>
    </footer>
  );
}
