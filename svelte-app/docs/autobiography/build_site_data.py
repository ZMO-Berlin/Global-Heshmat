"""Write the data of the website's Memoir page (/memoir/).

Reads extraction/entities.json (see build_review.py), extraction/geocoding.json
(see geocode.py) and the run records, and writes src/lib/data/memoir.json:
the kept entities (proposed drops, and organisations without a catalogue link,
left out), their book pages and catalogue
links, coordinates for places and the counts the page's methodology cites.
No passage of the book is copied into it.

    python build_site_data.py
"""

import json
import re
from collections import Counter
from pathlib import Path

from build_review import OUT, TYPE_ORDER

HERE = Path(__file__).parent
TARGET = HERE.parent.parent / "src" / "lib" / "data" / "memoir.json"
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


if __name__ == "__main__":
    main()
