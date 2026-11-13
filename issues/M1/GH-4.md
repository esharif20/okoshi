# GH-4: Stage, smooth scroll and choosing the Edition

Milestone: M1 Foundation

The single record of where the visitor is, and the scroll that drives it.

## Done when

- `src/stage` exports `stage`, `useStage`, `beatAt` and `beatProgress` as specified, with tests for the Beat ranges and their edges.
- `<SmoothScroll>` runs Lenis on GSAP's ticker and writes `progress` for the Opening sequence; keyboard, trackpad and wheel scrolling all work and the page is never trapped.
- `src/edition` picks `still`, `phone` or `desktop` and a quality level once at load, and falls back to stills if WebGL is unavailable.

## Check

```
npm test -- stage edition
```

## Files

src/stage/, src/motion/, src/edition/

Terms: `GLOSSARY.md`. Look: `DESIGN.md`. Structure: `docs/ARCHITECTURE.md`.
