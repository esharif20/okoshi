# GH-5: The fold-up mechanism

Milestone: M1 Foundation

The maths that lifts panels from the Sheet, tested without a browser.

## Done when

- `poseAt(plan, t)` returns an angle for every panel for t from 0 to 1.
- Tests prove: all flat at 0; all standing at 1; no panel moves before its parent; later waves start later; angles change smoothly with no jumps.
- A plan with a missing parent or a cycle is rejected with a clear error.

## Check

```
npm test -- fold
```

## Files

src/scene/fold/

Terms: `GLOSSARY.md`. Look: `DESIGN.md`. Structure: `docs/ARCHITECTURE.md`.
