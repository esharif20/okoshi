// Looks for a phone number everywhere a PDF can hold one: the page text, link
// targets, both kinds of metadata, and the raw bytes with every stream inflated.
import { inflateSync } from "node:zlib";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

// A finding names the place and the kind of match, never the digits, so a
// failing test cannot print the number into a CI log.
export type Finding = { where: string; what: "tel:" | "+44" | "10+ digits" };

/** Digit runs, joined across the spaces, brackets, dots, dashes and plus signs a phone number is written with. */
export const digitRuns = (text: string): string[] =>
  text.replace(/(?<=\d)[\s().\-+]+(?=\d)/g, "").match(/\d+/g) ?? [];

const hasLongRun = (text: string) => digitRuns(text).some((r) => r.length >= 10);

function check(where: string, text: string, spaced: boolean, out: Finding[]): void {
  if (/tel:/i.test(text)) out.push({ where, what: "tel:" });
  if (text.includes("+44")) out.push({ where, what: "+44" });
  if (spaced ? hasLongRun(text) : /\d{10,}/.test(text)) out.push({ where, what: "10+ digits" });
}

// PDF literal strings, "(like this)", with their escapes undone.
function literals(text: string): string[] {
  const found = text.match(/\((?:\\[\s\S]|[^\\()])*\)/g) ?? [];
  return found.map((s) =>
    s
      .slice(1, -1)
      .replace(/\\([0-7]{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
      .replace(/\\([\s\S])/g, "$1"),
  );
}

// Text that a stream or dictionary would show, whether or not a page paints
// it. The strings of one TJ array are one piece of text split by kerning, so
// they are read together; every other string is read alone.
function shownText(text: string): string[] {
  const arrays = text.match(/\[(?:\\[\s\S]|[^\\\]])*\]\s*TJ/g) ?? [];
  return [...arrays.map((a) => literals(a).join("")), ...literals(text)];
}

const latin1 = (bytes: Uint8Array) => Buffer.from(bytes).toString("latin1");
// Hex strings hold the same text as literal ones, and UTF-16 puts a zero byte
// between characters. Decode the first and drop the second before matching.
const plain = (text: string) =>
  text
    .replace(/(?<!<)<([0-9A-Fa-f\s]+)>(?!>)/g, (_, hex: string) => Buffer.from(hex.replace(/\s/g, ""), "hex").toString("latin1"))
    .replace(/\0/g, "");

/** Scans the file's own bytes: everything outside streams, then each stream inflated. */
export function scanBytes(pdf: Uint8Array): Finding[] {
  const out: Finding[] = [];
  const file = latin1(pdf);
  let outside = "";
  let at = 0;
  let n = 0;
  for (const m of file.matchAll(/(?<!end)stream\r?\n/g)) {
    const start = m.index + m[0].length;
    if (start < at) continue;
    const end = file.indexOf("endstream", start);
    if (end < 0) break;
    outside += file.slice(at, m.index);
    at = end;
    n++;
    const raw = pdf.subarray(start, end);
    let body: string;
    try {
      body = latin1(inflateSync(raw));
    } catch {
      body = latin1(raw); // not Flate: read as stored
    }
    const text = plain(body);
    check(`stream ${n}`, text, false, out);
    for (const shown of shownText(body)) check(`stream ${n}`, plain(shown), true, out);
  }
  outside += file.slice(at);
  // The cross-reference table is ten-digit byte offsets by design.
  const text = plain(outside.replace(/\d{10} \d{5} [nf]/g, ""));
  check("file bytes", text, false, out);
  for (const shown of shownText(outside)) check("file bytes", plain(shown), true, out);
  return dedupe(out);
}

/** Everything scanBytes finds, plus what a reader sees: page text, link targets, Info and XMP. */
export async function scanPdf(pdf: Uint8Array): Promise<Finding[]> {
  const out = scanBytes(pdf);
  // pdf.js takes ownership of the buffer it is given, so hand it a copy.
  const doc = await getDocument({ data: pdf.slice(), verbosity: 0 }).promise;
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    check(`page ${i} text`, content.items.map((it) => ("str" in it ? it.str : "")).join(" "), true, out);
    for (const a of await page.getAnnotations()) {
      const target = (a as { unsafeUrl?: string; url?: string }).unsafeUrl ?? (a as { url?: string }).url;
      if (target) check("link", target, true, out);
    }
  }
  const meta = await doc.getMetadata();
  const info = Object.values(meta.info as Record<string, unknown>).filter((v) => typeof v === "string");
  check("document info", info.join(" | "), true, out);
  const xmp = (meta.metadata as { getRaw?: () => string } | null)?.getRaw?.();
  if (xmp) check("XMP metadata", xmp, true, out);
  return dedupe(out);
}

function dedupe(findings: Finding[]): Finding[] {
  const seen = new Set<string>();
  return findings.filter((f) => {
    const key = `${f.where}|${f.what}`;
    return seen.has(key) ? false : (seen.add(key), true);
  });
}
