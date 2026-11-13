// Turns the sources listed in pictures.json into public/work/<slug>/<name>.webp:
// at most 1600px wide, under 300 KB, metadata stripped. Needs ImageMagick.
//   node tools/media/make.mjs --captures <dir> --repos <dir> --treefera <dir>
// captures: PNGs written by capture.cjs. repos: a folder of read-only clones
// named as on GitHub. treefera: the hackathon project folder. None is in this repo.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const here = import.meta.dirname;
const root = resolve(here, "../..");
const args = process.argv.slice(2);
const roots = {};
for (let i = 0; i < args.length; i += 2) roots[args[i].replace(/^--/, "")] = args[i + 1];
const prefix = { capture: "captures", repo: "repos", treefera: "treefera" };

const MAX_BYTES = 300 * 1024;
let failed = false;
for (const p of JSON.parse(readFileSync(join(here, "pictures.json"), "utf8"))) {
  const [kind, path] = [p.source.slice(0, p.source.indexOf(":")), p.source.slice(p.source.indexOf(":") + 1)];
  const base = roots[prefix[kind]];
  const input = base && join(base, path);
  const output = join(root, "public/work", p.slug, `${p.name}.webp`);
  if (!input || !existsSync(input)) {
    console.log(`skip ${p.slug}/${p.name}: no source (${p.source})`);
    continue;
  }
  mkdirSync(dirname(output), { recursive: true });
  // Step the quality down until the file fits; charts and screenshots stay sharp well below 80.
  let size = Infinity;
  for (let quality = 88; quality >= 40 && size > MAX_BYTES; quality -= 8) {
    execFileSync("magick", [input, "-strip", "-resize", "1600x>", "-quality", String(quality), "-define", "webp:method=6", output]);
    size = statSync(output).size;
  }
  if (size > MAX_BYTES) failed = true;
  console.log(`${size > MAX_BYTES ? "TOO BIG" : "ok"} ${p.slug}/${p.name}.webp ${Math.round(size / 1024)} KB`);
}
process.exit(failed ? 1 : 0);
