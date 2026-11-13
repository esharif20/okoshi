import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { projects } from "../../src/content";

const root = resolve(import.meta.dirname, "../..");
type Entry = { slug: string; name: string; source: string; origin: string };
const manifest: Entry[] = JSON.parse(readFileSync(join(import.meta.dirname, "pictures.json"), "utf8"));
const pictures = projects.flatMap((p) => p.panels.flatMap((panel) => (panel.picture ? [{ slug: p.slug, ...panel.picture }] : [])));

// Width and height from a WebP header: lossy (VP8), lossless (VP8L) or extended (VP8X).
function webpSize(file: Buffer): { width: number; height: number } {
  if (file.toString("latin1", 0, 4) !== "RIFF" || file.toString("latin1", 8, 12) !== "WEBP") throw new Error("not a WebP file");
  const kind = file.toString("latin1", 12, 16);
  if (kind === "VP8 ") return { width: file.readUInt16LE(26) & 0x3fff, height: file.readUInt16LE(28) & 0x3fff };
  if (kind === "VP8L") {
    const bits = file.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (kind === "VP8X") return { width: file.readUIntLE(24, 3) + 1, height: file.readUIntLE(27, 3) + 1 };
  throw new Error(`unknown WebP chunk ${kind}`);
}

describe("project pictures", () => {
  it("gives every Project two to four", () => {
    for (const p of projects) {
      const count = pictures.filter((x) => x.slug === p.slug).length;
      expect(count, p.slug).toBeGreaterThanOrEqual(2);
      expect(count, p.slug).toBeLessThanOrEqual(4);
    }
  });

  it.each(pictures)("$src is a WebP at most 1600px wide and under 300 KB", ({ slug, src }) => {
    expect(src).toMatch(new RegExp(`^work/${slug}/[a-z0-9-]+\\.webp$`));
    const path = join(root, "public", src);
    expect(existsSync(path), `${src} is missing from public/`).toBe(true);
    expect(statSync(path).size).toBeLessThan(300 * 1024);
    const { width, height } = webpSize(readFileSync(path));
    expect(width).toBeLessThanOrEqual(1600);
    expect(width).toBeGreaterThanOrEqual(600);
    expect(height).toBeGreaterThan(0);
  });

  it("describes every picture in a sentence of alt text", () => {
    for (const p of pictures) expect(p.alt.trim().length, p.src).toBeGreaterThanOrEqual(40);
    expect(new Set(pictures.map((p) => p.alt)).size).toBe(pictures.length);
  });

  it("records a source for every picture, and has no picture without a Panel", () => {
    const listed = manifest.map((m) => `work/${m.slug}/${m.name}.webp`).sort();
    expect(listed).toEqual(pictures.map((p) => p.src).sort());
    for (const m of manifest) expect(m.origin.length, m.name).toBeGreaterThan(20);
    const onDisk = readdirSync(join(root, "public/work"), { recursive: true })
      .map(String)
      .filter((f) => f.endsWith(".webp"))
      .map((f) => `work/${f}`)
      .sort();
    expect(onDisk).toEqual(listed);
  });

  it("lists every picture's source in docs/COPY.md", () => {
    const copy = readFileSync(join(root, "docs/COPY.md"), "utf8");
    for (const p of pictures) expect(copy, p.src).toContain(p.src);
  });
});
