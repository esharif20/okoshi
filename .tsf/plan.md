# Plan: okoshi (Eshan Sharif's portfolio)

lane front: GH-2 GH-4 GH-6 GH-7 GH-8 GH-9 GH-10 GH-11 GH-12 GH-13 GH-14 GH-15 GH-16 GH-18
lane core: GH-3 GH-5 GH-17 GH-19
skills front: frontend motion landing polish
seat core: lane-builder (GH-5 fold maths is the hard logic; GH-3 is the copy the person reads first)
review: GH-5 GH-17 GH-3

GH-1 landed on main (setup, prerendering, Pages deploy).

The person asked that all frontend and motion work be done in the Lead session itself (lane front, in /Users/eshansharif/dev/projects/portfolio on main). Lane core is one parallel builder in `.tsf/lanes/core` on branch `lane/core`, one PR per lane (see PR-LANES).

## Issues

Acceptance and the check for every issue are in `issues/M<n>/GH-<n>.md` and on GitHub (esharif20/okoshi). Lane core in detail:

- **GH-3 Content model and first copy deck.** Fill `src/content/index.ts` against `src/content/types.ts` (do not change the types without telling the Lead). Sources, read-only and private, never copied into the repo: `/Users/eshansharif/dev/projects/portfolio/docs/Eshan_Sharif_CV.pdf`, `docs/linkedin1.png`, `docs/linkedin2.png`, `.tsf/research/github-profile.md` (all under the main folder, not the worktree). Merge CV and LinkedIn; where they differ, include both roles and note it in `docs/COPY.md`. Rewrite in plain, confident first-person-free language; PA Consulting entries describe the work without naming clients and must sound natural, not like a CV bullet list. Six Rooms and five Layers exactly as in `GLOSSARY.md`; assign each Role and Project a Room (and each Project a Layer). Five Projects with Panels: football-intelligence (dissertation; repo may be shown), deforestation-detection, minic-compiler, software-factory (herdr-software-factory), finance-agent (has the only live demo; find its URL with `gh`). Repos via `gh repo view esharif20/<name>`. `site.email` is the CV's email; links: LinkedIn, GitHub. No phone number anywhere. Check: `npm test -- content`.
- **GH-5 The fold-up mechanism.** `src/scene/fold/index.ts` exports `poseAt(plan, t)` and `validatePlan(plan)` with the types below; pure TypeScript, no three.js import. Tests prove the rules in the issue. Check: `npm test -- fold`.
- **GH-17 Public CV.** `tools/cv/` makes `public/cv.pdf` from the private CV with the phone line removed (PyMuPDF redaction via `uv run --with pymupdf`, or pdf-lib); `npm run cv` runs it. Test extracts text and fails on the number or any run of 10+ digits. Link previews and credits in GH-17 belong to lane front; core does only the CV half and says so in the PR. Check: `npm test -- cv`.
- **GH-19 README.** Run, build, test, regenerate CV, set `BASE_PATH` for a custom domain. The Clips section is a stub that lane front fills. Check: none (doc).

## Files each lane owns

- core: `src/content/**`, `src/scene/fold/**`, `tools/cv/**`, `public/cv.pdf`, `docs/COPY.md`, `README.md`
- front: everything else under `src/**`, `tools/capture/**`, `public/**` except `public/cv.pdf`, `src/styles/**`, `src/routes/**`, `DESIGN.md`
- `package.json`: front owns it. Core may add one script line (`"cv"`) and dev dependencies it needs; say so in the PR.

## Shared contract

Content: `src/content/types.ts` as committed (Role, Project, Panel, Figure, Room, Layer, Site, RoomId, LayerId). `src/content/index.ts` exports `site, roles, projects, rooms, layers, getProject`.

Fold (`src/scene/fold/index.ts`):
```ts
export type Vec3 = [number, number, number]
export type PanelSpec = { id: string; parent?: string
  hinge: { origin: Vec3; axis: Vec3 }   // axis need not be unit length; normalise it
  flat: number; raised: number          // radians
  order: number                         // wave index, 0 first
  room?: RoomId }
export type FoldPlan = { panels: PanelSpec[] }
export function validatePlan(plan: FoldPlan): void            // throws Error naming the panel on a missing parent, a cycle, a duplicate id
export function poseAt(plan: FoldPlan, t: number): Map<string, number>   // angle per panel id; t clamped to 0..1
```
Each wave occupies an equal, overlapping slice of 0..1; a panel's local progress is eased with a smooth (C1) curve; a child's local progress never exceeds its parent's.

Stage (`src/stage`, lane front): Beat ranges Sheet 0-0.10, Fold 0.10-0.45, Ink 0.45-0.65, Paint 0.65-0.90, Plate 0.90-1. The fold uses `beatProgress(p, 'fold')` as its t.

## Code map

| File | Role | Key exports |
|---|---|---|
| `react-router.config.ts` | appDirectory `src`, `ssr:false`, prerenders `/` and `/work/<slug>` for every project; `BASE_PATH` env | default config |
| `vite.config.ts` | Tailwind 4 and React Router plugins; `base` from `BASE_PATH` | default |
| `src/root.tsx` | HTML shell | `Layout`, `App` |
| `src/routes.ts` | `/` and `work/:slug` | default route config |
| `src/routes/home.tsx` | home page placeholder | `meta`, `Home` |
| `src/routes/work.tsx` | project page placeholder | `meta`, `Work` |
| `src/content/types.ts` | content contract | types |
| `src/content/index.ts` | placeholder data (one `sample` project) | `site, roles, projects, rooms, layers, getProject` |
| `src/scene/DioramaSlot.tsx` | lazy client-only canvas | `DioramaSlot` |
| `src/scene/Diorama.tsx` | placeholder R3F scene | default |
| `.github/workflows/deploy.yml` | check, test, build with `BASE_PATH=/okoshi/`, publish to Pages | |

Commands: `npm run check`, `npm test`, `npm run build`, `npm run preview` (port 4173).

structure:
- Follow the module layout in `docs/ARCHITECTURE.md`; each folder exposes one `index.ts` and callers import only from it.
- Pure logic (fold maths, Beat ranges, content validation) lives in plain `.ts` files with no React or three.js imports, so Vitest runs it in node.
- Content is data, not components: no JSX in `src/content`.
- No new shared helpers outside your lane's globs; ask the Lead for a contract change.

prose:
- Copy on the site and in `docs/COPY.md`: short declarative sentences, concrete numbers from the CV, no puffery ("passionate", "cutting-edge", "leveraging", "seamless"), no "not just X but Y", no em-dash chains.
- Commit messages: `GH-<n>: <what changed>` and one line on why; end with the attribution line.
- PR bodies: exactly `## Why`, `## What`, `## Verification` with the real command output status.
- Code comments only where the why is not obvious (the easing choice, the redaction method).
