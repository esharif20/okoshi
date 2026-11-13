"""Write public/cv.pdf from the private CV with the phone number removed.

Run with `npm run cv`. The source path comes from CV_SOURCE, or defaults to
docs/Eshan_Sharif_CV.pdf in the main checkout (that folder is gitignored).
"""

import os
import re
import subprocess
import sys
from pathlib import Path

import pymupdf as fitz

# A phone number: optional +, then 10 or more digits with spaces, brackets,
# dots or dashes between them.
PHONE = re.compile(r"\+?\d[\d\s().\-]{8,}\d")


def digits(s: str) -> int:
    return sum(c.isdigit() for c in s)


def default_source() -> Path:
    common = subprocess.run(
        ["git", "rev-parse", "--path-format=absolute", "--git-common-dir"],
        capture_output=True, text=True, check=True,
    ).stdout.strip()
    return Path(common).parent / "docs" / "Eshan_Sharif_CV.pdf"


def phone_rects(page: "fitz.Page") -> list["fitz.Rect"]:
    """Rectangles covering each phone number and the separator after it."""
    rects = []
    words = page.get_text("words")  # x0, y0, x1, y1, word, block, line, n
    lines: dict[tuple[int, int], list] = {}
    for w in words:
        lines.setdefault((w[5], w[6]), []).append(w)
    for line in lines.values():
        text = " ".join(w[4] for w in line)
        for m in PHONE.finditer(text):
            if digits(m.group()) < 10:
                continue
            # Map the match back to the words it spans.
            pos, hit = 0, []
            for i, w in enumerate(line):
                end = pos + len(w[4])
                if end > m.start() and pos < m.end():
                    hit.append(i)
                pos = end + 1
            if hit and hit[-1] + 1 < len(line) and line[hit[-1] + 1][4] == "|":
                hit.append(hit[-1] + 1)
            r = fitz.Rect(line[hit[0]][:4])
            for i in hit[1:]:
                r |= fitz.Rect(line[i][:4])
            rects.append(r)
    return rects


def main() -> int:
    src = Path(os.environ.get("CV_SOURCE") or default_source())
    out = Path(__file__).resolve().parents[2] / "public" / "cv.pdf"
    if not src.exists():
        print(f"cv: private CV not found at {src}; set CV_SOURCE", file=sys.stderr)
        return 1
    doc = fitz.open(src)
    found = 0
    for page in doc:
        for r in phone_rects(page):
            # True redaction: apply_redactions deletes the glyphs under the box,
            # so the number is gone from the file, not just painted over.
            page.add_redact_annot(r, fill=(1, 1, 1))
            found += 1
        page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE)
    if found == 0:
        print("cv: no phone number found; refusing to publish an unchecked CV", file=sys.stderr)
        return 1
    # Dates and producer strings are dropped too: they would read as long digit runs.
    doc.set_metadata({"title": "Eshan Sharif, CV", "author": "Eshan Sharif", "creator": "", "producer": "", "creationDate": "", "modDate": ""})
    doc.del_xml_metadata()
    out.parent.mkdir(parents=True, exist_ok=True)
    doc.save(out, garbage=4, deflate=True, clean=True)
    print(f"cv: wrote {out} ({found} number(s) removed)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
