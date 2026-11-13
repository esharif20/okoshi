# GH-3: Content model and first copy deck

Milestone: M1 Foundation

Everything the site says, in typed data files, drafted for Eshan's approval.

## Done when

- `src/content` exports `site`, `roles`, `projects`, `rooms`, `layers` and `getProject` with the types in `docs/ARCHITECTURE.md`.
- Roles and Projects are merged from the CV and LinkedIn and rewritten in plain, confident language; client work is described without naming clients.
- Five Projects have full Panels (problem, approach, result) with real Figures: Football Intelligence, Deforestation Detection, Mini C Compiler, the software factory, the finance agent.
- A schema test fails on an unknown Room or Layer, a malformed date, or a picture without alt text.
- `docs/COPY.md` lists every sentence for approval and marks anything that is a sample.

## Check

```
npm test -- content
```

## Files

src/content/, docs/COPY.md

Terms: `GLOSSARY.md`. Look: `DESIGN.md`. Structure: `docs/ARCHITECTURE.md`.
