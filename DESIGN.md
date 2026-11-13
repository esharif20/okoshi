# Design

The art direction for this site. Every build issue follows it. Where a reference site and this file disagree, this file wins.

## The idea

A traveller walks into a painted landscape and watches a hall and a pagoda fold up out of a sheet of paper, be inked, then painted, until they stand in the grass as if they had always been there. The buildings are Eshan's work: the hall holds the roles and projects, and each storey of the Pagoda is a Layer he works at, from firmware to agents.

The folding comes from okoshi-ezu, the fold-up paper models Japanese builders made in the Edo period: a flat printed sheet whose walls lift on paper hinges.

## The Opening sequence

One scene, pinned to the screen and driven by scroll, in six Beats.

| Beat | What the visitor sees |
|---|---|
| Arrival | The whole landscape at dawn: mountains, a red gate on a path, pines, and the Traveller seen from behind with a straw hat on his back. The name stands in the sky |
| Approach | The camera travels up the path, through the gate, and rises over a sheet of paper lying in a court |
| Fold | Stone footings, wall flaps (each drawn as a builder's elevation), posts and roofs fold up from the sheet; the Pagoda rises storey by storey |
| Ink | Line work and screentone climb the bare paper |
| Paint | Colour soaks up from the ground behind a wet edge; the sheet fades and the buildings stand in the court |
| Plate | The camera settles on the finished picture |

The visitor can look around at any point: the view leans towards the pointer, and a drag turns it.

## The picture

- Solid, lit and textured, in the manner of a detailed print: stone walling, timber frames, plaster, paper screens, curved tiled roofs, dense grass, field stones, soft long shadows.
- Pastel: a rose and peach dawn sky, mauve-pink mountain ranges that thin into mist, sage and olive ground, warm white plaster, slate-blue tiles.
- Everything arrives as Ink and is then Painted. The ink drawing is taken from the painting's own dark parts, so the two always agree.
- Day and Night: at Night the light sinks and cools and the paper screens glow from inside. By default the scene follows the time in London.
- The anime side is kept quiet, because the site must read as professional: the ink line and Screentone, the Manga pages, and the Traveller's straw hat with a red band. No characters, logos or lettering from any series are used.
- The red gate and the Seal button are the only red in the picture.

## Colour

| Token | Value | Use |
|---|---|---|
| `--bg` | `#fbf6f4` | The paper: a blush white. The ground of every page |
| `--surface` | `#f3e6e5` | One step from the paper |
| `--ink` | `#1f3038` | All text and line work. At Night it is the ground |
| `--muted` | `#5d6b72` | Secondary notes only |
| `--accent` | `#c8202f` | Seal red. The one action on each screen, Seals, the gate, the hat band |
| `--accent-ink` | `#ffffff` | Text on the accent |

Scene colours live with the scene code (`src/scene/world/Land.tsx`, `src/scene/build/textures.ts`).

## Type

Two faces, self-hosted.

- **Shippori Mincho B1** (800), display: the name and every heading. Sentence case, tracking -0.03em, leading about 1. It is the Latin of a Japanese print face.
- **Zen Kaku Gothic New** (400, 700), text: everything read. Tabular figures where numbers align.
- Japanese characters, where used, are set in the display face and checked by a reader of Japanese before launch.

Steps: small 13 to 14px, body 17 to 19px, lead 20 to 26px, head 40 to 88px, and one display size per screen set to fill its measure. Left-aligned. Headlines run to two lines at most at every width.

## Layout

- The picture leads; what is read sits over or beside it as plain text, and gets out of its way.
- One pair of equal outer margins on every page.
- Below the Opening sequence, each section is a piece of printed paper from the same set. Neighbouring sections never share a composition.

## Motion

- Scroll is the only thing a visitor must do. It never traps the wheel or the keyboard.
- One signature move: the Fold, then Ink and Paint. One reused effect: Screentone.
- All 3D motion is driven by one scroll position; the canvas draws only when something changes.
- With reduced motion requested, nothing travels: the Still edition shows each state as a picture.

## Hover and press

| On | Response |
|---|---|
| The Diorama | Leans towards the pointer; a drag turns the view |
| A building or storey | Its paint lifts back to ink and its Facts appear |
| A button | Presses down like a Seal |
| A text link | A brushed underline draws from left to right |
| A photograph | Rests in Screentone; the dots close into the full picture |

Every one has a keyboard focus state that shows the same information.

## Not used

Eyebrow labels above headings; monospace outside real code; gradients in the interface (the painted sky is a picture); glass and blur; rows of identical cards; violet; emoji.

## Pictures

In order of preference: Eshan's own photographs and captures of his projects running; drawings made in code from the real subject; public-domain Japanese woodblock prints from museum collections, credited in the footer. Nothing is mocked up to look like a product that does not exist. Every texture in the Diorama is painted in code when the page loads.
