"""Merge duplicate entities of the first pass before the human review.

The extraction names each entity per section, so one person can appear under
two spellings and one exhibition under several descriptions. This script
sends the first-pass entities (see build_review.py) and the site's catalogue
to Claude in one request and gets back groups: which entities are the same,
their canonical names, type and catalogue record, and whether an entry is not
an entity to keep (the narrator himself, an event that is not an exhibition).

The answer is checked before it is written: every first-pass entity must be in
exactly one group, types must be known and records must exist. Entities the
model left out stay on their own. The result, extraction/consolidation.json,
is applied by build_review.py, which shows every merge and proposed drop in
the review sheet; nothing is dropped without the reviewer.

Requires the `anthropic` package and ANTHROPIC_API_KEY.

    python consolidate.py
    python build_review.py
"""

import argparse
import hashlib
import json
import sys
from datetime import datetime, timezone

import anthropic

from build_review import OUT, first_pass, fingerprint, load
from extract_entities import MODEL, TYPES, catalogue

INSTRUCTIONS = """\
You consolidate the entities extracted from the Arabic autobiography of the Egyptian sculptor \
and ceramicist Hassan Heshmat (1920–2006), "تجاربى فى الفن والحياة" (1997). Each book section was \
extracted separately, so the same entity can appear under several English spellings or names, \
and a few entries break the extraction rules. A person who reads Arabic will review your \
proposal; make it easy to check, not final.

Put every entity id below in exactly one group:

- Merge entities that are the same real entity: one person under two spellings \
(Ezz El-Din Hammouda / Ezzeddin Hamouda), one institution under two names (Hassan Heshmat \
Museum / The Hassan Heshmat Museum / متحفى بعين شمس), one exhibition described several ways \
(same venue or city and the same year or occasion). Use the Arabic names, forms in the text, \
descriptions, dates and places to decide. Do not merge different people who share a family name, \
different exhibitions in the same city in different years, or a city with an institution in it.
- Keep every other entity in a group of its own.
- type: one of person, place, organisation, artwork, exhibition. Correct an obvious mistake \
(a gallery typed as a place is an organisation).
- name_en: the entity's own canonical name in English or established Latin spelling. For a \
person with a person record, use the catalogue name. Artwork records are named after the site \
where works stand, so never give an artwork, organisation or place the name of the record it \
links to: the Belgian church memorial stays "Memorial for a church in Belgium", not the church's \
name. For an exhibition: "<venue or city>, <year>" (e.g. "Aladdin Hall, Cairo, 1953"), with the \
year left out when the book gives none.
- name_ar: the canonical Arabic name.
- record: the catalogue key when the group IS that record: a person record for the person, an \
artwork record for the work or site it describes, a residence for that residence, the Hassan \
Heshmat Museum record for the museum itself. Never link a city, country or company to an \
artwork record only because a work stands there. Otherwise null.
- action: "drop" for entries that should not be entities: Hassan Heshmat himself (the narrator), \
events that are not exhibitions (a war, a revolution), generic words that are not names. \
Otherwise "keep".
- reason: one short English sentence when you merge, change the type, set a different record or \
propose a drop; otherwise null."""

SCHEMA = {
    "type": "object",
    "properties": {
        "groups": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "members": {"type": "array", "items": {"type": "string"}},
                    "type": {"type": "string", "enum": TYPES},
                    "name_en": {"type": "string"},
                    "name_ar": {"type": "string"},
                    "record": {"type": ["string", "null"]},
                    "action": {"type": "string", "enum": ["keep", "drop"]},
                    "reason": {"type": ["string", "null"]},
                },
                "required": ["members", "type", "name_en", "name_ar", "record", "action", "reason"],
                "additionalProperties": False,
            },
        }
    },
    "required": ["groups"],
    "additionalProperties": False,
}


def summary(entity: dict) -> dict:
    """What the model needs to judge an entity, without the mentions themselves."""
    return {
        "id": entity["id"],
        "type": entity["type"],
        "name_en": entity["name_en"],
        "name_ar": entity["name_ar"],
        "forms": entity["surfaces"][:6],
        "mentions": len(entity["mentions"]),
        "descriptions": entity["descriptions"][:3],
        "dates": entity["dates"],
        "places": entity["places"],
        "record": entity["record"],
        "sections": entity["sections"],
    }


def checked(groups: list[dict], entities: list[dict], keys: set[str]) -> tuple[list[dict], list[str]]:
    """Drop invalid parts of the answer and give every entity exactly one group."""
    ids = {e["id"] for e in entities}
    seen: set[str] = set()
    problems = []
    valid = []
    for group in groups:
        members = [m for m in group["members"] if m in ids and m not in seen]
        if len(members) < len(group["members"]):
            problems.append(f"unknown or repeated ids in group {group['name_en']}: {group['members']}")
        if not members:
            continue
        if group["record"] is not None and group["record"] not in keys:
            problems.append(f"unknown record {group['record']} in group {group['name_en']}")
            group["record"] = None
        seen.update(members)
        valid.append({**group, "members": members})
    by_id = {e["id"]: e for e in entities}
    for missing in sorted(ids - seen):
        entity = by_id[missing]
        problems.append(f"{missing} ({entity['name_en']}) left out; kept on its own")
        valid.append(
            {
                "members": [missing],
                "type": entity["type"],
                "name_en": entity["name_en"],
                "name_ar": entity["name_ar"],
                "record": entity["record"],
                "action": "keep",
                "reason": None,
            }
        )
    return valid, problems


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("--effort", default="high", choices=["low", "medium", "high", "xhigh"])
    args = parser.parse_args()

    paragraphs, mentions = load()
    entities = first_pass(paragraphs, mentions)
    records = catalogue()
    keys = {r["key"] for r in records}
    prompt = (
        f"# Catalogue of the website's records\n\n{json.dumps(records, ensure_ascii=False, indent=1)}"
        f"\n\n# First-pass entities ({len(entities)})\n\n"
        + "\n".join(json.dumps(summary(e), ensure_ascii=False) for e in entities)
    )
    print(f"Consolidating {len(entities)} entities with {MODEL} (effort {args.effort})")

    client = anthropic.Anthropic()
    with client.messages.stream(
        model=MODEL,
        max_tokens=128000,
        system=INSTRUCTIONS,
        output_config={"effort": args.effort, "format": {"type": "json_schema", "schema": SCHEMA}},
        messages=[{"role": "user", "content": prompt}],
    ) as stream:
        response = stream.get_final_message()
    if response.stop_reason != "end_turn":
        sys.exit(f"stop_reason {response.stop_reason}; nothing written")
    text = next(b.text for b in response.content if b.type == "text")
    groups, problems = checked(json.loads(text)["groups"], entities, keys)

    payload = {
        "model": MODEL,
        "effort": args.effort,
        "instructions_sha256": hashlib.sha256(INSTRUCTIONS.encode()).hexdigest(),
        "firstPass": fingerprint(entities),
        "consolidatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "usage": response.usage.model_dump(),
        "problems": problems,
        "groups": groups,
    }
    (OUT / "consolidation.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=1) + "\n", encoding="utf-8", newline="\n"
    )
    merges = sum(1 for g in groups if len(g["members"]) > 1)
    drops = sum(1 for g in groups if g["action"] == "drop")
    usage = response.usage
    print(
        f"{len(entities)} entities -> {len(groups)} groups ({merges} merges, {drops} proposed drops), "
        f"{len(problems)} problems; in {usage.input_tokens}, out {usage.output_tokens}"
    )
    for problem in problems:
        print(f"  {problem}")


if __name__ == "__main__":
    main()
