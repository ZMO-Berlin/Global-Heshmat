"""Split two-page spreads of an Arabic book scan into single pages.

Arabic books read right to left, so the right half of a spread comes first.
The gutter is found as the darkest pixel column in the middle fifth of the page.
"""

import sys

import pymupdf

SRC, DST = sys.argv[1], sys.argv[2]
KEEP_WHOLE = {65}  # 1-based: a small landscape photo, not a spread


def gutter_x(page: pymupdf.Page) -> float:
    pix = page.get_pixmap(dpi=72, colorspace=pymupdf.csGRAY)
    w, h, s = pix.width, pix.height, pix.samples
    lo, hi = int(w * 0.44), int(w * 0.56)
    y0, y1 = int(h * 0.05), int(h * 0.95)
    col = [sum(s[y * w + x] for y in range(y0, y1)) for x in range(w)]
    # The gutter is a thin dark line: darker than the columns a few pixels either side.
    best, best_x = None, w // 2
    for x in range(lo, hi):
        score = col[x] - (col[x - 6] + col[x + 6]) / 2
        if best is None or score < best:
            best, best_x = score, x
    return page.rect.width * best_x / w


src = pymupdf.open(SRC)
out = pymupdf.open()
for i, page in enumerate(src, start=1):
    r = page.rect
    if r.width <= r.height or i in KEEP_WHOLE:
        out.new_page(width=r.width, height=r.height).show_pdf_page(out[-1].rect, src, i - 1)
        print(f"{i}: single")
        continue
    # Photo plates have no gutter line to find; their halves meet at the middle.
    gx = gutter_x(page) if page.get_text().strip() else r.width / 2
    for clip in (pymupdf.Rect(gx, 0, r.width, r.height), pymupdf.Rect(0, 0, gx, r.height)):
        new = out.new_page(width=clip.width, height=clip.height)
        new.show_pdf_page(new.rect, src, i - 1, clip=clip)
    print(f"{i}: split at {gx:.0f}/{r.width:.0f}")
out.save(DST, garbage=3, deflate=True)
print(f"{src.page_count} source pages -> {out.page_count} pages")
