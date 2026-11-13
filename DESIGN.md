# Design

The art direction for this site. Every build issue follows it. Where a reference site and this file disagree, this file wins.

## The idea

On this page, the stages of Eshan's work become the sheets of a fold-up paper house that stands up, is inked and then painted as the visitor scrolls.

Fold-up paper models of buildings (okoshi-ezu) were made by Japanese builders in the Edo period: a flat printed sheet whose walls lift on paper hinges. The page is one of these sheets. Everything on the site is either that model or a piece of printed paper from the same set.

## The picture

- The House is a samurai-era residence with the roof off, in the manner of old scroll paintings that leave roofs out to show the rooms. A five-storey Pagoda stands behind it.
- The house is old; the machines in it are modern: a screen glowing on the tatami, a bench of circuit boards, clockwork figures at work.
- Everything arrives as Ink and is then Painted. Painting is for the world: sky, mist, mountains, plain, light. Ink and Screentone are for people, objects and stories.
- White plaster, slate roofs, pale timber. Mist and mountains in blue-grey.
- The anime side is kept quiet, because the site must read as professional. It appears in four places only: the ink line and Screentone; the Manga pages; the Shelf of volumes; and the Traveller's straw hat with a red band. No characters, logos or lettering from any series are used.

## Colour

One ground, one step, one ink, one accent.

| Token | Value | Use |
|---|---|---|
| `--bg` | `#f7f9fa` | The paper. The ground of every page |
| `--surface` | `#ecf0f2` | One step from the paper: a second sheet, the table edge, mist |
| `--ink` | `#1f3038` | All text, all line work, the table, roofs. At Night it is the ground |
| `--muted` | `#5d6b72` | Secondary notes only |
| `--accent` | `#c8202f` | Seal vermilion. The one action on each screen, Seals, the hat band |
| `--accent-ink` | `#ffffff` | Text on the accent |

Running text is always `--ink`. Surfaces are separated by a step in tone, never by a line or a shadow. The accent appears at most once per screen besides the Diorama.

## Type

Two faces, self-hosted.

- **Anton**, display: capitals, tracking -0.01em, leading 0.86. The name, section headings, and Figures lettered large on Manga pages.
- **Work Sans**, text: 400 for reading, 600 for links and short emphasis, leading 1.5. Tabular figures where numbers align.
- Japanese characters appear only as drawn artwork (on Seals and on the builder's plan), never as a third face.

Steps: small 13 to 14px, body 17 to 19px, lead 20 to 26px, head 40 to 88px, and one display size set per screen to fill its measure. Left-aligned. Headlines run to two lines at most at every width.

## Layout

- One grid of 12 columns and one pair of equal outer margins on every page.
- Each section is a filled paper shape with a real edge (straight, scalloped, notched, torn), never an outlined box.
- Neighbouring sections never share a composition. Sections sit 120 to 240px apart on desktop.
- The Diorama sits in the centre; what is read sits beside it as plain text.

## Motion

- Scroll is the only thing a visitor must do. It never traps the wheel or the keyboard.
- One signature move: the Fold. One reused effect: Screentone.
- Entrances: heading, then text, then picture, 60 to 90ms apart, rising 16 to 32px, once.
- Transform and opacity only in the page; all 3D motion is driven by one scroll position.
- With reduced motion requested, nothing travels: the Still edition shows each state as a picture.

## Hover and press

| On | Response |
|---|---|
| A Room | Lift: Paint draws back to Ink, the screen slides open, the lamp comes on, the Room's Facts appear |
| A Volume | Slides out, turns to full ink; its cover follows the pointer |
| A button | Presses down like a Seal; the accent spreads from the pointer |
| A text link | A brushed underline draws from left to right |
| A Slip | Straightens from its tilt and comes forward |
| A photograph | Rests in Screentone; the dots close into the full picture |
| The portrait | Turns between photograph and Screentone |
| The pointer | A small ink dot; a round loupe over the Diorama |

Every one has a keyboard focus state that shows the same information.

## Not used

Index numbers and counters; small capital labels with wide spacing; eyebrow labels above headings; hairline rules, rings and outlined boxes; monospace outside real code; gradients in the interface; glass and blur; shadows on things at rest; rows of identical cards; cream with rust; violet and indigo; emoji.

## Pictures

In order of preference: Eshan's own photographs and captures of his projects running; drawings made in code from the real subject; public-domain Japanese woodblock prints from museum collections, credited in the footer. Nothing is mocked up to look like a product that does not exist.

## Checks

The taste skill's inspector must report no failures at 1440, 768 and 390 pixels on the production build, and its scene check must pass for the Opening sequence on desktop, phone and reduced motion.
