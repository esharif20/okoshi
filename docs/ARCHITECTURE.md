# Architecture

How the site is put together. Terms in capitals are defined in `GLOSSARY.md`; the look is defined in `DESIGN.md`.

## What it is

A static website: a home page and one Manga page per Project. There is no server, no database and no login. It is built to files and served by GitHub Pages, later from a custom domain.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Build and routing | Vite with React Router 7, pages prerendered to HTML at build time | Text is in the HTML for search and link previews; no server needed |
| Language and UI | TypeScript, React 19 | Required by React Three Fiber 9 |
| 3D | three.js, React Three Fiber 9, drei, our own shaders | The Diorama |
| Scroll | Lenis | One smooth scroll position for page and Diorama |
| Animation | GSAP with ScrollTrigger, SplitText and Flip | Entrances, the Opening sequence timeline, hover moves |
| State | zustand | The Stage (below) |
| Device check | detect-gpu, media queries | Choosing the Edition |
| Styling | Tailwind 4, tokens from `DESIGN.md` as CSS variables | One source for colour and type |
| Small UI pieces | React Bits, copied in, DOM-only components | No second WebGL canvas |
| Tests | Vitest, TypeScript checks, the taste skill's inspector | See "Checks" |
| Media tools | Playwright, cwebp, pdf tooling | Stills for the Phone edition; the CV with the phone number removed |

Not used: Next.js, Theatre.js, Rive, Spline, drei ScrollControls, GSAP ScrollSmoother, any AI 3D generator.

## Modules

Each module hides its workings behind a small interface. Only the listed exports are used from outside.

```
src/
  content/      what the site says                  (data + schema)
  stage/        where the visitor is                (one store)
  scene/        the Diorama                         (all three.js lives here)
    fold/       the fold-up mechanism               (pure maths, no WebGL)
    camera.ts   the camera's path                   (pure maths)
    world/      sky, mountain ranges, ground, grass, stones, Day and Night
    build/      House, Pagoda, garden, Traveller; the painted material; textures drawn in code
  stationery/   the first screen and the home page sections   (DOM)
  manga/        the Manga page                      (DOM)
  strip/        Stills and the strip shown by the Phone and Still editions
  ui/           Seal button, portrait, clock, loader
  motion/       smooth scroll, entrances, reduced motion
  edition/      which Edition this visitor gets
  routes/       home, work/:slug
tools/
  capture/      records Stills from the Desktop edition
  cv/           makes the public CV
```

### content

The single source of everything the site says. Every Edition and every page reads from it, so they cannot disagree.

```ts
type RoomId  = 'entrance' | 'workshop' | 'study' | 'lookout' | 'hall' | 'garden'
type LayerId = 'firmware' | 'languages' | 'services' | 'vision' | 'agents'

type Figure  = { value: string; measures: string }
type Role    = { id: string; title: string; org: string; place: string
                 start: string; end?: string            // 'YYYY-MM'
                 summary: string; points: string[]; room: RoomId }
type Panel   = { kind: 'problem' | 'approach' | 'result'
                 heading: string; text: string; figure?: Figure
                 picture?: { src: string; alt: string } }
type Project = { slug: string; title: string; year: number; summary: string
                 stack: string[]; figures: Figure[]; panels: Panel[]
                 repo?: string; demo?: string; room: RoomId; layer: LayerId }
type Room    = { id: RoomId; name: string; standsFor: string; facts: string[] }
type Layer   = { id: LayerId; name: string; skills: string[] }

export const site: { name: string; line: string; city: string
                     email: string; links: { label: string; href: string }[] }
export const roles: Role[]; export const projects: Project[]
export const rooms: Room[];  export const layers: Layer[]
export function getProject(slug: string): Project | undefined
```

A schema test fails the build if a Role or Project names a Room or Layer that does not exist, a date is malformed, or a picture has no alt text.

### stage

The one record of where the visitor is. The page writes to it; the Diorama reads from it. Nothing else connects the two.

```ts
type Beat    = 'arrival' | 'approach' | 'fold' | 'ink' | 'paint' | 'plate'
type Edition = 'desktop' | 'phone' | 'still'

type StageState = {
  progress: number            // 0..1 through the Opening sequence
  hoveredRoom: RoomId | null
  hoveredLayer: LayerId | null
  openRoom: RoomId | null
  night: boolean
  edition: Edition
  quality: 'high' | 'low'     // within the Desktop edition
  ready: boolean              // the Diorama has drawn its first frame
  detected: boolean           // the Edition has been chosen in the browser
}

export const stage                       // zustand store; stage.getState() in the render loop
export function useStage<T>(pick: (s: StageState) => T): T
export function beatAt(progress: number): Beat
export function beatProgress(progress: number, beat: Beat): number   // 0..1 within that Beat
```

Beat ranges: Arrival 0 to 0.08, Approach 0.08 to 0.36, Fold 0.36 to 0.60, Ink 0.60 to 0.72, Paint 0.72 to 0.88, Plate 0.88 to 1.

### scene

Exports one component, `<Diorama />`. It reads the Stage and reports pointer events on Rooms back to it. It is loaded only in the browser and only in the Desktop edition.

**scene/fold** is the hard logic and is tested without a browser:

```ts
type PanelSpec = { id: string; parent?: string
                   hinge: { origin: Vec3; axis: Vec3 }
                   flat: number; raised: number     // angle in radians when flat and when standing
                   order: number                    // which wave of the Fold it rises in
                   room?: RoomId }
type FoldPlan  = { panels: PanelSpec[] }

export function poseAt(plan: FoldPlan, t: number): Map<string, number>   // angle per panel at t in 0..1
```

Rules it guarantees: at 0 every panel lies flat; at 1 every panel stands; a panel never starts before its parent; angles change smoothly.

**scene/world** draws the landscape. The ground and the three mountain ranges are real geometry shaped by noise and lit by one sun; the grass is one instanced blade shaped in the vertex shader; the sky is one shader. Day and Night cross-fade.

**scene/build** holds what is built. `painted()` returns the one material every built surface uses: bare paper, then Ink (taken from the edges and dark parts of the surface's own texture), then Paint, with a Lift around whatever the pointer is over. Every texture (stone, timber, plaster, tiles, wall elevations, the Plan) is drawn on a canvas when the Diorama loads, so no image files are shipped for it. `Hall.tsx` and `Pagoda.tsx` each hold a `FoldPlan` and turn its angles into hinge rotations.

The Diorama tells the page where each Room is on screen through CSS variables on the stage element (`--pin-<room>-x`, `--pin-<room>-y`, and `--progress`), so labels and story text are real DOM text set over the canvas.

Rendering rules: the canvas redraws only when the Stage changes or something is moving; nothing in the render loop goes through React state; one canvas for the whole site; the camera is kept above the ground.

### stationery, manga, ui

Ordinary React components that read `content` and use `motion`. `stationery` exports one component per home page section. `manga` exports `<MangaPage project={...} />`. `ui` holds the shared controls and their hover, press and focus states.

### motion

Owns Lenis and GSAP. Exports `<SmoothScroll>`, which keeps the Stage's `progress` in step with the page, a `useEntrance(ref)` hook, and the Screentone cut between sections. It is the only place that checks the reduced-motion setting.

### edition

Decides the Edition once, at load: `still` if reduced motion is requested; `phone` for a narrow touch screen; otherwise `desktop`, with `quality` set from the graphics hardware. If WebGL fails or is lost, the Desktop edition falls back to stills.

### strip

The Phone and Still editions' Opening sequence: `<Still>` picks the wide or tall recording for the screen, and `<StillStory>` sets the five Stills after the first screen, each with its line.

## Data flow

```
scroll -> motion (Lenis) -> stage.progress -> scene (Fold, Ink, Paint)
pointer on a Room -> scene -> stage.hoveredRoom -> stationery (Facts beside the Diorama)
content -> stationery, manga, scene (Room names), strip
```

## Editions and Stills

`tools/capture` (`npm run capture`, with the preview server running) opens the built Desktop edition in a real browser, steps the Stage through the Opening sequence at a wide and a tall size, and saves one Still per Beat to `public/poster/` as WebP. The Phone and Still editions show those Stills as a vertical strip with the same lines of text, and never load three.js. The first Still is also the poster under the canvas until the Diorama has drawn. The capture is run by hand after the Diorama changes and its output is committed.

## Budgets

| | Target |
|---|---|
| First text on screen (any Edition) | under 1.5 s on a mid-range laptop; text does not wait for the Diorama |
| JavaScript, Desktop edition | about 500 KB compressed |
| JavaScript, Phone and Still editions | under 150 KB compressed; no three.js loaded |
| Diorama | under 300,000 triangles and 60 draw calls at high quality |
| Stills, Phone edition | about 1.1 MB for all twelve; each loaded only near the screen |

These are targets to measure against, not yet measured.

## Checks

| Check | Command |
|---|---|
| Types | `npm run check` |
| Unit tests (content schema, Stage, fold maths) | `npm test` |
| Production build with prerendered pages | `npm run build` |
| Design rules in source | `node ~/.claude/skills/design-taste-frontend/scripts/lint.mjs src` |
| Design rules in a browser at three widths | `node ~/.claude/skills/design-taste-frontend/scripts/inspect.mjs <preview url>` |

## Privacy

The public CV is generated by `tools/cv` from the private original, with the phone number removed, and a test confirms the number is absent from the output. The private CV, LinkedIn screenshots, original photographs and research captures are listed in `.gitignore` and are never committed.

## Decisions

1. **A static site, prerendered.** A portfolio has no need of a server, and static files are free to host and hard to break.
2. **The page and the Diorama meet only at the Stage.** Either side can be rebuilt or tested without the other, and the Phone edition can leave the Diorama out altogether.
3. **The fold-up mechanism is plain maths, separate from drawing.** It is the part most likely to be wrong and the easiest to test once separated.
4. **The Phone edition shows recordings of the Desktop edition.** A phone gets the same picture without the cost of drawing it, and the two cannot drift apart.
5. **Every Diorama texture is drawn in code.** No image generator or licensed asset is needed, and the Ink drawing is derived from the same texture as the Paint, so the two always agree.
