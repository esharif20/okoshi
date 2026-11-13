# GH-7: The House stands up

Milestone: M2 The Diorama and the Stationery

Beats Sheet and Fold of the Opening sequence.

## Done when

- The House exists as a `FoldPlan` with six Rooms, drawn as flat and bent paper panels on the Sheet.
- Scrolling lifts base, walls, screens and roof pieces in order, and the camera moves from overhead to eye level; scrolling back reverses it exactly.
- The canvas redraws only when something changes; nothing in the render loop uses React state.
- Under 300,000 triangles and 60 draw calls, read from the renderer's own counters in a test page.

## Check

```
npm test -- house && npm run build
```

## Files

src/scene/house/, src/scene/Diorama.tsx

Terms: `GLOSSARY.md`. Look: `DESIGN.md`. Structure: `docs/ARCHITECTURE.md`.
