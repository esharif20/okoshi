import { useRef } from "react";
import { site } from "~/content";
import { gsap, MOVING, useEntrance, useGSAP } from "~/motion";
import { BrushLink } from "~/ui/BrushLink";
import { SealButton } from "~/ui/SealButton";
import "./visitcard.css";

const img = (name: string) => `${import.meta.env.BASE_URL}img/${name}`;

// The Visit card: the contact details on one solid card, set on a print of travellers on the road.
export function VisitCard() {
  const ref = useRef<HTMLElement>(null);
  useEntrance(ref);

  // The print drifts a little against the scroll: the one moving picture below the Opening sequence.
  useGSAP(
    () => {
      gsap.matchMedia().add(MOVING, () => {
        gsap.fromTo(
          ".visit-print img",
          { yPercent: -7 },
          { yPercent: 7, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true } },
        );
      });
    },
    { scope: ref },
  );

  return (
    <section id="contact" className="visit" aria-labelledby="contact-heading" ref={ref} data-entrance>
      <figure className="visit-print">
        <img
          src={img("shono-2400.webp")}
          srcSet={`${img("shono-1400.webp")} 1400w, ${img("shono-2400.webp")} 2400w`}
          sizes="(max-width: 699px) 250vw, 100vw"
          width={2400}
          height={1499}
          loading="lazy"
          alt="Woodblock print: travellers in straw hats and capes hurry up and down a steep road in driving rain, past bamboo bent by the wind."
        />
        <figcaption>Utagawa Hiroshige, Driving Rain at Shōno, about 1833.</figcaption>
      </figure>

      <div className="visit-card" data-in="sheet">
        <h2 id="contact-heading">Get in touch</h2>
        <p>
          {site.name}, software engineer, based in {site.city}.
        </p>
        <dl>
          <div>
            <dt>Email</dt>
            <dd>
              <BrushLink href={`mailto:${site.email}`}>{site.email}</BrushLink>
            </dd>
          </div>
          {site.links.map((link) => (
            <div key={link.href}>
              <dt>{link.label}</dt>
              <dd>
                <BrushLink href={link.href}>{link.href.replace(/^https:\/\/(www\.)?/, "")}</BrushLink>
              </dd>
            </div>
          ))}
          <div>
            <dt>CV</dt>
            <dd>
              <BrushLink href={`${import.meta.env.BASE_URL}cv.pdf`} download>
                Download CV
              </BrushLink>
            </dd>
          </div>
        </dl>
        <SealButton href={`mailto:${site.email}`}>Email {site.name.split(" ")[0]}</SealButton>
      </div>
    </section>
  );
}
