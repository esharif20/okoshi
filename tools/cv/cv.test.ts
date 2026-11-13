import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../..");
const publicCv = join(root, "public/cv.pdf");

async function pdfText(path: string, withInfo = true): Promise<string> {
  const doc = await getDocument({ data: new Uint8Array(readFileSync(path)), verbosity: 0 }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const content = await (await doc.getPage(i)).getTextContent();
    pages.push(content.items.map((it) => ("str" in it ? it.str : "")).join(" "));
  }
  if (!withInfo) return pages.join("\n");
  const info = (await doc.getMetadata()).info as Record<string, unknown>;
  pages.push(Object.values(info).filter((v) => typeof v === "string").join(" "));
  return pages.join("\n");
}

// Digits joined across the spaces, brackets, dots, dashes and plus signs a
// phone number is written with, so "+44 (0123) 456 7890" reads as one run.
const digitRuns = (text: string) => text.replace(/(?<=\d)[\s().\-+]+(?=\d)/g, "").match(/\d+/g) ?? [];

// The private CV lives in the main checkout's gitignored docs folder.
function privateCv(): string | undefined {
  if (process.env.CV_SOURCE) return process.env.CV_SOURCE;
  try {
    const common = execFileSync("git", ["rev-parse", "--path-format=absolute", "--git-common-dir"], {
      cwd: root,
      encoding: "utf8",
    }).trim();
    const path = join(dirname(common), "docs/Eshan_Sharif_CV.pdf");
    return existsSync(path) ? path : undefined;
  } catch {
    return undefined;
  }
}

describe("public cv", () => {
  it("exists", () => {
    expect(existsSync(publicCv)).toBe(true);
  });

  it("has no run of 10 or more digits", async () => {
    const long = digitRuns(await pdfText(publicCv)).filter((r) => r.length >= 10);
    expect(long).toEqual([]);
  });

  it("still carries the email and links", async () => {
    const text = await pdfText(publicCv);
    expect(text).toMatch(/@gmail\.com/);
    expect(text).toMatch(/linkedin\.com\/in\/eshan-sharif/);
    expect(text).toMatch(/github\.com\/esharif20/);
  });

  const source = privateCv();
  it.skipIf(!source)("does not contain the phone number from the private CV", async () => {
    const numbers = digitRuns(await pdfText(source!, false)).filter((r) => r.length >= 10);
    expect(numbers.length).toBeGreaterThan(0);
    const published = digitRuns(await pdfText(publicCv)).join(" ");
    const tail = (n: string) => n.slice(-9); // national part, whatever the prefix
    for (const n of numbers) expect(published).not.toContain(tail(n));
  });

  it("detects a phone number when one is present", () => {
    expect(digitRuns("call +44 (0123) 456 7890 today").some((r) => r.length >= 10)).toBe(true);
    expect(digitRuns("Sept 2023 – Jul 2026, 0.916 IDF1").some((r) => r.length >= 10)).toBe(false);
  });
});
