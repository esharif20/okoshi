# GH-1: Project setup, prerendered pages and deploy

Milestone: M1 Foundation

A working skeleton that builds to static files and deploys.

## Done when

- Vite, React 19, TypeScript, React Router 7, Tailwind 4 and Vitest are set up with `npm run check`, `npm test` and `npm run build`.
- The home page and one sample `work/:slug` page are prerendered: their text is present in the built HTML with JavaScript off.
- A placeholder canvas loads only in the browser and does not break prerendering.
- A GitHub Actions workflow builds and publishes to GitHub Pages, with the base path taken from one setting so a custom domain needs one change.
- If React Router's prerendering cannot do this, a small prerender script is used instead and the choice is noted in `docs/ARCHITECTURE.md`.

## Check

```
npm run check && npm run build && grep -q 'Eshan' build/client/index.html
```

## Files

package.json, vite and router config, src/routes/, .github/workflows/

Terms: `GLOSSARY.md`. Look: `DESIGN.md`. Structure: `docs/ARCHITECTURE.md`.
