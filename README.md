# okoshi

Eshan Sharif's portfolio. A paper Diorama of a samurai-era house folds up from a flat Sheet as the page scrolls, then paints itself in. Each Room of the House stands for one part of the work.

Live at https://esharif20.github.io/okoshi/.

The words the project uses are defined in `GLOSSARY.md`, the look in `DESIGN.md` and the code layout in `docs/ARCHITECTURE.md`.

## Run

Needs Node 22 or newer.

```sh
npm install
npm run dev        # http://localhost:5173
```

## Build

```sh
npm run build      # prerendered pages in build/client
npm run preview    # serves the build on http://localhost:4173
```

The build prerenders `/` and one `/work/<slug>` page for every Project in `src/content`.

## Test

```sh
npm run check      # route types and TypeScript
npm test           # every Vitest suite
npm test -- content   # one suite: content, fold or cv
```

## Edit the words

Everything the site says is in `src/content/index.ts`. `docs/COPY.md` lists each sentence for approval. `npm test -- content` checks that every Role and Project names a real Room and Layer, that dates are `YYYY-MM`, and that every picture has alt text.

## Regenerate the CV

The site offers `public/cv.pdf`, a copy of the private CV with the phone number removed. The private CV is never committed: `docs/*.pdf` is gitignored.

```sh
npm run cv
```

This needs [uv](https://docs.astral.sh/uv/). It reads `docs/Eshan_Sharif_CV.pdf` from the main checkout, or the file named by `CV_SOURCE`:

```sh
CV_SOURCE=~/Documents/new-cv.pdf npm run cv
```

The script redacts any number of 10 or more digits from the page, clears the PDF's dates and the pdfTeX banner, and refuses to write a CV in which it found no phone number. Run `npm test -- cv` afterwards. It reads the page text, the link targets, the metadata and every stream after inflating it, and fails on `tel:`, `+44` or any run of 10 or more digits.

## Capture Clips

The Phone edition shows Clips recorded in advance from the Desktop edition.

<!-- Lane front fills this section with the tools/capture commands. -->

To do.

## Deploy

Every push to `main` runs `.github/workflows/deploy.yml`: check, test, build, then publish to GitHub Pages.

## Use a custom domain

The site is built for the Pages address under `/okoshi/`. On its own domain it lives at `/`.

1. In `.github/workflows/deploy.yml`, change `BASE_PATH: /okoshi/` to `BASE_PATH: /`.
2. In the same file, replace the step that lifts `build/client/okoshi/` to the root. At `/` there is no such folder and the fallback page has another name:

   ```yaml
   - run: cp build/client/__spa-fallback.html build/client/404.html && touch build/client/.nojekyll
   ```
3. Add `public/CNAME` containing the domain, for example `eshansharif.com`.
4. At the DNS provider, point the domain at GitHub Pages: a `CNAME` record to `esharif20.github.io` for a subdomain, or the four GitHub Pages `A` records for an apex domain.
5. In the repo's Settings, under Pages, enter the domain and turn on Enforce HTTPS once the certificate is issued.
