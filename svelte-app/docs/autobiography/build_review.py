"""Group the extracted mentions into entities and write the review sheet.

Reads paragraphs.json and extraction/mentions.json (see extract_entities.py)
and writes:

- extraction/entities.json: one entry per entity with all its mentions.
- extraction/review.csv: one row per entity for a reviewer who reads Arabic,
  with empty decision columns. UTF-8 with a byte-order mark, so Excel shows
  the Arabic.

The first pass groups mentions by linked person or residence record when
there is one, otherwise by type and English name; artwork links are kept for
the reviewer but do not merge entities. When extraction/consolidation.json
(see consolidate.py) was made from this same first pass, its groups are
applied on top: duplicates merged, names and types corrected, proposed drops
marked for the reviewer. Mentions whose surface form was not found in the text
are kept but counted in `problems`, so the reviewer sees them.

    python build_review.py
"""

import csv
import hashlib
import json
from collections import Counter, defaultdict
from pathlib import Path

HERE = Path(__file__).parent
OUT = HERE / "extraction"
TYPE_ORDER = ["person", "place", "organisation", "artwork", "exhibition"]
REVIEW_COLUMNS = ["decision (keep / drop / merge)", "merge into id", "corrected name_en", "reviewer note"]


def group_key(mention: dict) -> tuple[str, str]:
    # An artwork record is a site that can hold several works, and the model also links
    # the place or company of a site to it, so only person and residence links identify.
    record = mention["record"]
    if record and not mention["problems"] and record.startswith(("person:", "residence:")):
        return mention["type"], record
    return mention["type"], mention["name_en"].casefold().strip()


def most_common(values) -> str | None:
    values = [v for v in values if v]
    return Counter(values).most_common(1)[0][0] if values else None


def entity(kind: str, items: list[dict], paragraphs: dict) -> dict:
    return {
        "type": kind,
        "name_en": most_common(m["name_en"] for m in items),
        "name_ar": most_common(m["name_ar"] for m in items),
        "record": most_common(m["record"] for m in items if not m["problems"]),
        "surfaces": sorted({m["surface"] for m in items}),
        "descriptions": list(dict.fromkeys(m["description"] for m in items)),
        "dates": sorted({m["date"] for m in items if m["date"]}),
        "places": sorted({m["place"] for m in items if m["place"]}),
        "sections": sorted({m["section"] for m in items}),
        "paragraphs": sorted({m["paragraph_id"] for m in items}),
        "printedPages": sorted(
            {n for m in items for n in paragraphs[m["paragraph_id"]]["printedPages"]}
        ),
        "uncertain": sum(m["uncertain"] for m in items),
        "problems": sum(bool(m["problems"]) for m in items),
        "notes": sorted({m["note"] for m in items if m["note"]}),
        "mentions": items,
    }


def numbered(entities: list[dict]) -> list[dict]:
    entities.sort(key=lambda e: (TYPE_ORDER.index(e["type"]), -len(e["mentions"]), e["name_en"]))
    for number, item in enumerate(entities, start=1):
        item["id"] = f"e{number:04d}"
    return entities


def load() -> tuple[dict, list[dict]]:
    book = json.loads((HERE / "paragraphs.json").read_text(encoding="utf-8"))
    paragraphs = {p["id"]: p for p in book["paragraphs"]}
    mentions = json.loads((OUT / "mentions.json").read_text(encoding="utf-8"))
    return paragraphs, mentions


def first_pass(paragraphs: dict, mentions: list[dict]) -> list[dict]:
    groups: dict[tuple[str, str], list[dict]] = defaultdict(list)
    for mention in mentions:
        groups[group_key(mention)].append(mention)
    return numbered([entity(kind, items, paragraphs) for (kind, _), items in groups.items()])


def fingerprint(entities: list[dict]) -> str:
    """Identifies a first pass, so a consolidation is only applied to the entities it was made from."""
    rows = [[e["id"], e["type"], e["name_en"], len(e["mentions"])] for e in entities]
    return hashlib.sha256(json.dumps(rows, ensure_ascii=False).encode()).hexdigest()


def consolidated(entities: list[dict], paragraphs: dict) -> list[dict] | None:
    path = OUT / "consolidation.json"
    if not path.exists():
        return None
    consolidation = json.loads(path.read_text(encoding="utf-8"))
    if consolidation["firstPass"] != fingerprint(entities):
        print("consolidation.json was made from another first pass; not applied")
        return None
    by_id = {e["id"]: e for e in entities}
    merged = []
    for group in consolidation["groups"]:
        members = [by_id[i] for i in group["members"]]
        item = entity(group["type"], [m for e in members for m in e["mentions"]], paragraphs)
        item.update(
            name_en=group["name_en"],
            name_ar=group["name_ar"],
            record=group["record"],
            consolidation={
                "action": group["action"],
                "reason": group["reason"],
                "mergedFrom": [f"{e['type']}: {e['name_en']}" for e in members]
                if len(members) > 1 or members[0]["type"] != group["type"]
                else [],
            },
        )
        merged.append(item)
    return numbered(merged)


def main() -> None:
    paragraphs, mentions = load()
    entities = first_pass(paragraphs, mentions)
    first_count = len(entities)
    entities = consolidated(entities, paragraphs) or entities

    (OUT / "entities.json").write_text(
        json.dumps(entities, ensure_ascii=False, indent=1) + "\n", encoding="utf-8", newline="\n"
    )

    with (OUT / "review.csv").open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(
            [
                "id",
                "type",
                "name_en",
                "name_ar",
                "forms in the text",
                "mentions",
                "record",
                "book pages",
                "dates",
                "places",
                "description",
                "uncertain",
                "surface not found",
                "model notes",
                "consolidation",
                "merged from",
                "first passage",
                *REVIEW_COLUMNS,
            ]
        )
        for item in entities:
            first = paragraphs[item["mentions"][0]["paragraph_id"]]
            consolidation = item.get("consolidation") or {}
            proposal = ""
            if consolidation.get("action") == "drop":
                proposal = f"proposed drop: {consolidation['reason']}"
            elif consolidation.get("reason"):
                proposal = consolidation["reason"]
            writer.writerow(
                [
                    item["id"],
                    item["type"],
                    item["name_en"],
                    item["name_ar"],
                    " | ".join(item["surfaces"]),
                    len(item["mentions"]),
                    item["record"] or "",
                    ", ".join(map(str, item["printedPages"])),
                    ", ".join(item["dates"]),
                    ", ".join(item["places"]),
                    item["descriptions"][0],
                    item["uncertain"] or "",
                    item["problems"] or "",
                    " | ".join(item["notes"]),
                    proposal,
                    " | ".join(consolidation.get("mergedFrom", [])),
                    f"{first['id']}: {first['text'][:300]}",
                    *[""] * len(REVIEW_COLUMNS),
                ]
            )

    counts = Counter(e["type"] for e in entities)
    drops = sum(1 for e in entities if (e.get("consolidation") or {}).get("action") == "drop")
    print(
        f"{len(mentions)} mentions -> {first_count} first-pass entities -> {len(entities)} entities "
        f"({', '.join(f'{counts[t]} {t}' for t in TYPE_ORDER)}); "
        f"{sum(1 for e in entities if e['record'])} linked to a record, {drops} proposed drops"
    )


if __name__ == "__main__":
    main()
