# GH-6: First screen, still

Milestone: M1 Foundation

The Sheet as a designed page before any 3D or motion exists.

## Done when

- The first screen follows `DESIGN.md` and the dealt hero: a portrait paper sheet on the slate ground, cut off by the bottom of the screen; the name on two lines in one `h1`; one sentence on what Eshan does; the round portrait at top left; three links; one "Get in touch" Seal button.
- It has its own composition at 390 pixels wide.
- The taste skill's inspector reports no failures at 1440, 768 and 390.

## Check

```
npm run build && npm run preview & node ~/.claude/skills/design-taste-frontend/scripts/inspect.mjs http://localhost:4173
```

## Files

src/stationery/Sheet*, src/ui/

Terms: `GLOSSARY.md`. Look: `DESIGN.md`. Structure: `docs/ARCHITECTURE.md`.
