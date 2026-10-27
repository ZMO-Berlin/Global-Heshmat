"""Write the data of the website's Memoir page (/memoir/).

Reads extraction/entities.json (see build_review.py), extraction/geocoding.json
(see geocode.py) and the run records, and writes src/lib/data/memoir.json:
the kept entities (proposed drops, and organisations without a catalogue link,
left out), their book pages and catalogue
links, coordinates for places and the counts the page's methodology cites.
No passage of the book is copied into it: the paragraphs that name each entity,
with the spans of its forms, go to src/lib/data/memoir-passages.json, which the
page fetches only when a reader opens a passage.

    python build_site_data.py
"""

import json
import re
from collections import Counter
from pathlib import Path

from build_review import OUT, TYPE_ORDER

HERE = Path(__file__).parent
TARGET = HERE.parent.parent / "src" / "lib" / "data" / "memoir.json"
PASSAGES = TARGET.with_name("memoir-passages.json")
YEAR = re.compile(r"^(\d{4})")


def main() -> None:
    entities = json.loads((OUT / "entities.json").read_text(encoding="utf-8"))
    geocoding = json.loads((OUT / "geocoding.json").read_text(encoding="utf-8"))["places"]
    book = json.loads((HERE / "paragraphs.json").read_text(encoding="utf-8"))
    mentions = json.loads((OUT / "mentions.json").read_text(encoding="utf-8"))
    consolidation = json.loads((OUT / "consolidation.json").read_text(encoding="utf-8"))

    kept = [e for e in entities if (e.get("consolidation") or {}).get("action") != "drop"]
    items = []
    for entity in kept:
        # Organisations appear on the page only through the collection record they are linked to.
        if entity["type"] == "organisation" and not entity["record"]:
            continue
        item = {
            "id": entity["id"],
            "type": entity["type"],
            "name": entity["name_en"],
            "nameAr": entity["name_ar"],
            "mentions": len(entity["mentions"]),
            "pages": entity["printedPages"],
        }
        # The page describes people only; other descriptions stay in entities.json.
        if entity["type"] == "person":
            item["description"] = entity["descriptions"][0]
        if entity["record"]:
            item["record"] = entity["record"]
        years = sorted({int(m.group(1)) for d in entity["dates"] if (m := YEAR.match(d))})
        if years:
            item["years"] = years
        if entity["type"] == "place":
            geo = geocoding.get(entity["name_en"]) or {}
            if geo.get("result"):
                item.update(
                    level=geo["level"],
                    lat=geo["result"]["lat"],
                    lng=geo["result"]["lng"],
                    osm=geo["result"]["osm"],
                )
        items.append(item)

    counts = Counter(e["type"] for e in kept)
    data = {
        "book": {
            "title": "Tajārubī fī al-fann wa-al-ḥayāh",
            "titleAr": "تجاربى فى الفن والحياة",
            "translation": "My experiences in art and life",
            "publisher": "al-Hayʾa al-Miṣriyya al-ʿĀmma lil-Kitāb",
            "publisherEn": "Egyptian General Book Organization",
            "year": 1997,
            "doi": "https://doi.org/10.58144/20240607-000",
        },
        "method": {
            "model": consolidation["model"],
            "date": consolidation["consolidatedAt"][:10],
            "pdfPages": 66,
            "pages": 121,
            "sections": len(book["sections"]),
            "paragraphs": len(book["paragraphs"]),
            "mentions": len(mentions),
            "notFound": sum(1 for m in mentions if m["problems"]),
            "firstPass": sum(len(g["members"]) for g in consolidation["groups"]),
            "merges": sum(1 for g in consolidation["groups"] if len(g["members"]) > 1),
            "drops": len(entities) - len(kept),
            "entities": len(kept),
            "placesLocated": sum(1 for i in items if "lat" in i),
            "placesByHand": sum(1 for g in geocoding.values() if g.get("queryByHand")),
        },
        "counts": {t: counts[t] for t in TYPE_ORDER},
        "entities": items,
    }
    TARGET.write_text(json.dumps(data, ensure_ascii=False, indent="\t") + "\n", encoding="utf-8", newline="\n")
    print(f"{len(items)} entities ({dict(data['counts'])}) -> {TARGET.relative_to(HERE.parent.parent)}")

    passages = build_passages(items, {e["id"]: e for e in kept}, book)
    PASSAGES.write_text(json.dumps(passages, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8", newline="\n")
    missing = sum(len(p["missing"]) for ps in passages["entities"].values() for p in ps)
    print(
        f"{sum(len(ps) for ps in passages['entities'].values())} passages in {len(passages['paragraphs'])} paragraphs,"
        f" {missing} forms not found -> {PASSAGES.relative_to(HERE.parent.parent)}"
    )


# Arabic letters that OCR and spelling write either way: the normalised match
# folds each into one letter (one character for one, so offsets carry over).
FOLD = str.maketrans({"ة": "ه", "ى": "ي", "أ": "ا", "إ": "ا", "آ": "ا", "ٱ": "ا", "ؤ": "و", "ئ": "ي"})
MARKS = re.compile(r"[ً-ْٰـ]")  # short vowels, shadda, sukun, tatweel
LETTER = re.compile(r"\w")
# Proclitics a name can carry in the text: wa-, fa-, bi-, li-, ka- and the article (بالقاهرة).
PROCLITICS = set("وفبلكال")


def fold(text: str) -> tuple[str, list[int]]:
    """The text with variants folded and marks dropped, and each kept character's offset."""
    chars, offsets = [], []
    for i, char in enumerate(text):
        if MARKS.match(char):
            continue
        chars.append(char.translate(FOLD))
        offsets.append(i)
    return "".join(chars), offsets


def at_word(text: str, start: int, end: int) -> bool:
    """Whether text[start:end] ends a word and begins one, after at most three proclitic letters."""
    if end < len(text) and LETTER.match(text[end]):
        return False
    lead = start
    while lead > 0 and LETTER.match(text[lead - 1]):
        lead -= 1
    return start - lead <= 3 and all(c in PROCLITICS for c in text[lead:start])


def find(form: str, text: str) -> list[tuple[int, int]]:
    """Where a form occurs in a paragraph: exactly if it can, otherwise with spelling variants folded."""
    form = re.sub(r"\s+", " ", form).strip()
    exact = [(m.start(), m.end()) for m in re.finditer(re.escape(form), text) if at_word(text, m.start(), m.end())]
    # li- before the article drops its alif: الدانمارك → للدانمارك.
    if form.startswith("ال"):
        exact += [(m.start(), m.end()) for m in re.finditer(re.escape("ل" + form[1:]), text) if at_word(text, m.start(), m.end())]
    if exact:
        return exact
    folded, offsets = fold(text)
    needle = fold(form)[0]
    # Whitespace in the OCR can be a line break or a doubled space.
    pattern = r"\s+".join(re.escape(part) for part in needle.split(" "))
    spans = []
    for m in re.finditer(pattern, folded):
        start, end = offsets[m.start()], offsets[m.end() - 1] + 1
        if at_word(text, start, end):
            spans.append((start, end))
    return spans


def merge(spans: list[tuple[int, int]]) -> list[list[int]]:
    merged: list[list[int]] = []
    for start, end in sorted(spans):
        if merged and start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])
    return merged


def build_passages(items: list[dict], entities: dict[str, dict], book: dict) -> dict:
    """The book's text for the Memoir page's passage dialog, loaded only when a reader opens one.

    For each entity on the page, one passage per paragraph that names it, in the book's
    order: the spans of every form of the name the extraction recorded, and the forms it
    quoted from that paragraph but that cannot be found there. Only paragraphs that some
    passage points to are copied.
    """
    paragraphs = {p["id"]: p for p in book["paragraphs"]}
    used: set[str] = set()
    out: dict[str, list[dict]] = {}
    for item in items:
        entity = entities[item["id"]]
        quoted: dict[str, list[str]] = {}
        for mention in entity["mentions"]:
            forms = quoted.setdefault(mention["paragraph_id"], [])
            if mention["surface"] not in forms:
                forms.append(mention["surface"])
        passages = []
        for pid in sorted(quoted):
            text = paragraphs[pid]["text"]
            spans = {form: find(form, text) for form in dict.fromkeys(entity["surfaces"] + quoted[pid])}
            passages.append(
                {
                    "p": pid,
                    "marks": merge([span for found in spans.values() for span in found]),
                    "missing": [form for form in quoted[pid] if not spans[form]],
                }
            )
            used.add(pid)
        out[item["id"]] = passages
    return {
        "sections": {s["id"]: s["title"] for s in book["sections"]},
        "paragraphs": {
            pid: {
                "section": paragraphs[pid]["section"],
                "pages": paragraphs[pid]["printedPages"],
                "text": paragraphs[pid]["text"],
            }
            for pid in sorted(used)
        },
        "entities": out,
    }


if __name__ == "__main__":
    main()
