# GH-2: Design tokens, fonts and base styles

Milestone: M1 Foundation

The colours, type and spacing of `DESIGN.md` as code.

## Done when

- Colour and type tokens exist as CSS variables with the names in `DESIGN.md`; components use tokens only.
- Anton and Work Sans are self-hosted and subset; no font is fetched from another site.
- Focus and selection styles exist; the taste skill's `lint.mjs` passes on `src`.

## Check

```
npm run build && node ~/.claude/skills/design-taste-frontend/scripts/lint.mjs src
```

## Files

src/styles/, public/fonts/

Terms: `GLOSSARY.md`. Look: `DESIGN.md`. Structure: `docs/ARCHITECTURE.md`.
