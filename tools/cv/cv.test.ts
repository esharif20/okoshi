import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { deflateSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { digitRuns, scanPdf } from "./scan";

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

// A one-page PDF built by hand, so each place a number could hide is tested
// without a real CV. Offsets in the xref table are computed, so it parses cleanly.
function fixture(o: { text?: string; uri?: string; xmp?: string; subjectHex?: string; hidden?: string } = {}): Uint8Array {
  const stream = (dict: string, body: Buffer) => Buffer.concat([Buffer.from(`<<${dict}/Length ${body.length}>>\nstream\n`), body, Buffer.from("\nendstream")]);
  const content = deflateSync(Buffer.from(`BT /F1 12 Tf 72 720 Td [(${o.text ?? "Eshan Sharif, 2023 to 2026"})] TJ ET`));
  const objs: Buffer[] = [
    Buffer.from(`<</Type/Catalog/Pages 2 0 R${o.xmp ? "/Metadata 7 0 R" : ""}>>`),
    Buffer.from("<</Type/Pages/Kids[3 0 R]/Count 1>>"),
    Buffer.from(`<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>${o.uri ? "/Annots[6 0 R]" : ""}>>`),
    stream("/Filter/FlateDecode", content),
    Buffer.from("<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>"),
    Buffer.from(`<</Type/Annot/Subtype/Link/Rect[72 700 200 730]/Border[0 0 0]/A<</S/URI/URI(${o.uri ?? "https://example.org"})>>>>`),
    stream("/Type/Metadata/Subtype/XML", Buffer.from(o.xmp ?? "<x:xmpmeta xmlns:x='adobe:ns:meta/'/>")),
    Buffer.from(`<</Title(CV)${o.subjectHex ? `/Subject<${o.subjectHex}>` : ""}>>`),
    // Never painted: no page refers to it, so page text extraction cannot see it.
    stream("/Filter/FlateDecode", deflateSync(Buffer.from(`BT /F1 12 Tf [(${o.hidden ?? "spare"})] TJ ET`))),
  ];
  const parts: Buffer[] = [Buffer.from("%PDF-1.5\n")];
  const offsets: number[] = [];
  let at = parts[0].length;
  objs.forEach((body, i) => {
    offsets.push(at);
    const obj = Buffer.concat([Buffer.from(`${i + 1} 0 obj\n`), body, Buffer.from("\nendobj\n")]);
    parts.push(obj);
    at += obj.length;
  });
  const xref = [`xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`, ...offsets.map((n) => `${String(n).padStart(10, "0")} 00000 n \n`)].join("");
  parts.push(Buffer.from(`${xref}trailer\n<</Size ${objs.length + 1}/Root 1 0 R/Info 8 0 R/ID[<0123456789012345ABCDEF0123456789><0123456789012345ABCDEF0123456789>]>>\nstartxref\n${at}\n%%EOF\n`));
  return new Uint8Array(Buffer.concat(parts));
}
const utf16Hex = (text: string) => "FEFF" + [...text].map((c) => c.charCodeAt(0).toString(16).padStart(4, "0")).join("");
const found = async (pdf: Uint8Array) => (await scanPdf(pdf)).map((f) => `${f.where}: ${f.what}`).join("\n");

describe("scanPdf", () => {
  it("passes a clean PDF, xref offsets and file id included", async () => {
    expect(await scanPdf(fixture())).toEqual([]);
  });

  it("finds a number in the page text, however it is spaced", async () => {
    expect(await found(fixture({ text: "+99 (0123) 456 7890" }))).toMatch(/page 1 text: 10\+ digits/);
  });

  it("finds a tel: link", async () => {
    const out = await found(fixture({ uri: "tel:01234" }));
    expect(out).toMatch(/link: tel:/);
    expect(out).toMatch(/file bytes: tel:/);
  });

  it("finds a number in a link of any scheme", async () => {
    expect(await found(fixture({ uri: "https://wa.me/0123-456-7890" }))).toMatch(/link: 10\+ digits/);
  });

  it("finds +44 in XMP metadata", async () => {
    expect(await found(fixture({ xmp: "<x:xmpmeta><dc:phone>+44 12 34</dc:phone></x:xmpmeta>" }))).toMatch(/\+44/);
  });

  it("finds a number in a UTF-16 hex string", async () => {
    expect(await found(fixture({ subjectHex: utf16Hex("call 01234567890") }))).toMatch(/10\+ digits/);
  });

  it("finds a number in a compressed stream no page paints", async () => {
    expect(await found(fixture({ hidden: "01234567890" }))).toMatch(/stream \d+: 10\+ digits/);
    expect(await found(fixture({ hidden: "\\(0123\\) 456 7890" }))).toMatch(/stream \d+: 10\+ digits/);
    expect(await found(fixture({ hidden: "+44 12" }))).toMatch(/stream \d+: \+44/);
  });
});

describe("public cv, every byte", () => {
  it("has no tel:, +44 or 10-digit run in its text, links, metadata or streams", async () => {
    expect(await scanPdf(new Uint8Array(readFileSync(publicCv)))).toEqual([]);
  });

  const source = privateCv();
  it.skipIf(!source)("would have caught the private CV", async () => {
    expect((await scanPdf(new Uint8Array(readFileSync(source!)))).length).toBeGreaterThan(0);
  });
});
