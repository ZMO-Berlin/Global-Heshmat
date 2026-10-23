"""Segment the OCR text of the autobiography into sections and paragraphs.

Reads tajaribi-ocr.txt and writes paragraphs.json:

- Lines holding only a number are the book's printed page numbers. They are
  removed from the text and kept as the paragraph's `printedPages`.
- The front and back matter (prefaces, plates, caption index, the typed CV
  inserted at the end) open at the blocks listed in OPENERS.
- In the author's narrative, a short line ending in a colon
  ("معرض بالسويد:") opens a section, and a paragraph cut by a page break
  (no closing punctuation before the break) is joined to the first paragraph
  of the next page.

Paragraph ids (`p0001`…) follow reading order, so they stay stable as long as
the OCR text and these rules do not change. Run from any directory:

    python segment.py
"""

import json
import re
from pathlib import Path

HERE = Path(__file__).parent
SOURCE = HERE / "tajaribi-ocr.txt"
TARGET = HERE / "paragraphs.json"

PAGE_MARKER = re.compile(r"^--- Page (\d+) ---$")
PAGE_NUMBER = re.compile(r"^[0-9٠-٩]{1,3}$")
HEADING = re.compile(r"^(.{2,60}?)\s*:$")
# A paragraph ending in one of these is complete; anything else runs on.
CLOSED = tuple(".!?؟:»)]…")
ARABIC_DIGITS = str.maketrans("٠١٢٣٤٥٦٧٨٩", "0123456789")

# OCR pages of the author's own account, where headings and page-break joins are detected.
NARRATIVE = range(10, 64)

# (OCR page, block that opens the section) -> (kind, title). None stands for the page's first block.
OPENERS = {
    (1, None): ("front", "الغلاف والإهداء"),  # cover, handwritten dedication, title page, colophon
    (6, "تقديم"): ("front", "تقديم: د. ثروت عكاشة"),
    (8, "حسن حشمت حسن"): ("front", "حسن حشمت حسن: بقلم أ.د/ أحمد نوار"),
    (10, "تجاربى .. فى الفن والحياة"): ("narrative", "تجاربى .. فى الفن والحياة"),
    (64, "حسن حشمت"): ("back", "نبذة عن الفنان"),
    (65, "بانوراما"): ("plates", "بانوراما من أعمال الفنان حسن حشمت"),
    (113, "فهرس كلام الصور"): ("captions", "فهرس كلام الصور"),
    (116, "إحصائية"): ("back", "إحصائية"),
    (118, None): ("back", "الغلاف الأخير"),
    (119, None): ("back", "السيرة الذاتية (يناير ١٩٩٩)"),
    (120, None): ("back", "تذكرة متحف حسن حشمت"),
    (121, None): ("back", "السيرة الذاتية (تتمة)"),
}


def read_pages(text: str) -> list[tuple[int, list[str]]]:
    """Split the OCR file into (OCR page, blocks) pairs; the first page has no marker."""
    pages: list[tuple[int, list[str]]] = []
    number, lines = 1, []
    for line in text.splitlines():
        marker = PAGE_MARKER.match(line.strip())
        if marker:
            pages.append((number, lines))
            number, lines = int(marker.group(1)), []
        else:
            lines.append(line)
    pages.append((number, lines))
    return [(n, blocks_of(lines)) for n, lines in pages]


def blocks_of(lines: list[str]) -> list[str]:
    blocks, current = [], []
    for line in lines + [""]:
        if line.strip():
            current.append(line.strip())
        elif current:
            blocks.append(" ".join(current))
            current = []
    return blocks


def opener(ocr_page: int, index: int, block: str) -> tuple[str, str] | None:
    if (ocr_page, block) in OPENERS:
        return OPENERS[ocr_page, block]
    if index == 0 and (ocr_page, None) in OPENERS:
        return OPENERS[ocr_page, None]
    heading = HEADING.match(block) if ocr_page in NARRATIVE else None
    return ("narrative", heading.group(1)) if heading else None


def main() -> None:
    sections: list[dict] = []
    paragraphs: list[dict] = []
    open_paragraph = None  # the last paragraph, while it may continue on the next page

    for ocr_page, blocks in read_pages(SOURCE.read_text(encoding="utf-8")):
        printed = [int(b.translate(ARABIC_DIGITS)) for b in blocks if PAGE_NUMBER.match(b)]
        blocks = [b for b in blocks if not PAGE_NUMBER.match(b) and b != "[BLANK PAGE]"]
        if open_paragraph is not None and open_paragraph["ocrPages"][-1] != ocr_page - 1:
            open_paragraph = None
        for index, block in enumerate(blocks):
            section = opener(ocr_page, index, block)
            if section:
                kind, title = section
                sections.append(
                    {"id": f"s{len(sections):02d}", "kind": kind, "title": title, "ocrPage": ocr_page}
                )
                open_paragraph = None
                # A heading line is the title; a block that only marks the start is also text.
                if HEADING.match(block) and ocr_page in NARRATIVE:
                    continue
            if open_paragraph is not None:
                open_paragraph["text"] += " " + block
                open_paragraph["ocrPages"].append(ocr_page)
                open_paragraph["printedPages"].extend(printed)
            else:
                paragraphs.append(
                    {
                        "id": f"p{len(paragraphs) + 1:04d}",
                        "section": sections[-1]["id"],
                        "ocrPages": [ocr_page],
                        "printedPages": list(printed),
                        "text": block,
                    }
                )
            # Only the last block of a page can run on to the next one.
            open_paragraph = None
        last = paragraphs[-1] if paragraphs else None
        if (
            ocr_page in NARRATIVE
            and last is not None
            and last["ocrPages"][-1] == ocr_page
            and not last["text"].endswith(CLOSED)
        ):
            open_paragraph = last

    for paragraph in paragraphs:
        paragraph["ocrPages"] = sorted(set(paragraph["ocrPages"]))
        paragraph["printedPages"] = sorted(set(paragraph["printedPages"]))
    for section in sections:
        section["paragraphs"] = [p["id"] for p in paragraphs if p["section"] == section["id"]]

    TARGET.write_text(
        json.dumps({"sections": sections, "paragraphs": paragraphs}, ensure_ascii=False, indent=1)
        + "\n",
        encoding="utf-8",
        newline="\n",
    )
    print(f"{len(sections)} sections, {len(paragraphs)} paragraphs -> {TARGET.name}")


if __name__ == "__main__":
    main()
