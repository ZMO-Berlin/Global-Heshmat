"""Extract people, places, organisations, artworks and exhibitions from the autobiography.

One Claude request per section of paragraphs.json (see segment.py). Every
request carries the whole book and the site's catalogue in a cached system
prompt, so the model resolves references across sections and names an entity
the same way everywhere; only the section to extract changes.

Each section's answer is checked before it is kept: the paragraph must belong
to the section, the quoted surface form must occur in that paragraph, and a
linked record must exist in the catalogue. Results are written per section to
extraction/sections/ (a re-run skips sections already done with the same
model, effort and prompt), then merged into extraction/mentions.json.

Requires the `anthropic` package and ANTHROPIC_API_KEY.

    python extract_entities.py --sections s09 s25   # pilot
    python extract_entities.py                      # every section
"""

import argparse
import hashlib
import json
import re
import sys
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

import anthropic

HERE = Path(__file__).parent
DATA = HERE.parent.parent / "src" / "lib" / "data"
OUT = HERE / "extraction"
SECTIONS_OUT = OUT / "sections"

MODEL = "claude-sonnet-5-5"
TYPES = ["person", "place", "organisation", "artwork", "exhibition"]

INSTRUCTIONS = """\
You extract named entities from the autobiography of the Egyptian sculptor and ceramicist \
Hassan Heshmat (1920–2006), "تجاربى فى الفن والحياة" (al-Hayʾa al-Miṣriyya al-ʿĀmma lil-Kitāb, 1997), \
for a research website that maps his life and works. The book is in Arabic; its text below is \
uncorrected OCR, divided into sections and numbered paragraphs. The last sections are back matter: \
a caption index of the plates, press statistics and a typed CV from 1999 inserted in this copy.

Each request names one section. Return every mention, in that section only, of:

- person: a named individual (with or without a title such as د. or السيد). Skip Hassan Heshmat \
himself (the narrator, "the artist") and people who are not named ("a citizen", "an officer").
- place: a geographic place: country, region, city, district, village, street, square.
- organisation: an institution or company: ministry, school, museum, gallery or exhibition hall, \
hotel, factory, embassy, church, newspaper, airline.
- artwork: a specific work by Heshmat that the text identifies, by title (تمثال الترحيب) or by an \
unambiguous description.
- exhibition: a specific exhibition he held or took part in, identified by venue, city or date.

One mention per occurrence: a name repeated in the section is returned each time it appears. \
A venue that is both a building and a place (a hotel, a museum) is an organisation; its city is a \
separate place mention if the city is named.

Fields:
- paragraph_id: the id of the paragraph the mention is in.
- surface: the mention exactly as it is written in that paragraph, character for character, \
including OCR errors and the book's spelling; the shortest span that names the entity, without \
a title or a preposition attached in front (write قاعة إخناتون, not بقاعة إخناتون, unless the \
letters cannot be separated in the text, in which case copy them as written).
- name_ar: the entity's name in standard Arabic spelling, the fullest form the book gives.
- name_en: the name in its usual English or established Latin spelling ("Gamal El-Sigini", \
"Hussein Bicar", "Goethe-Institut Cairo", "Malmö"). Use the same name_en for the same entity in \
every section. For artworks give an English title in quotation marks if the book gives none.
- description: at most 15 English words on who or what this is according to the book \
(e.g. "Egyptian ambassador to Sweden who commissioned the Stockholm exhibition"). You may use \
established knowledge to identify and spell an entity, never to add facts the book does not state.
- date: a date the passage gives for this mention (an exhibition, a visit, a commission), as \
YYYY, YYYY-MM or YYYY-MM-DD; otherwise null.
- place: for organisations, artworks and exhibitions, the name_en of the city or country where \
the book locates it; otherwise null.
- record: the key of the catalogue record below that this mention is, only when the book clearly \
refers to that same person, artwork or residence; otherwise null. Do not guess.
- uncertain: true when the OCR looks garbled or the identification is doubtful; explain in note.
- note: a short English note for the reviewer, or null.

Return an empty list when the section mentions no entity."""

MENTION_SCHEMA = {
    "type": "object",
    "properties": {
        "paragraph_id": {"type": "string"},
        "surface": {"type": "string"},
        "type": {"type": "string", "enum": TYPES},
        "name_ar": {"type": "string"},
        "name_en": {"type": "string"},
        "description": {"type": "string"},
        "date": {"type": ["string", "null"]},
        "place": {"type": ["string", "null"]},
        "record": {"type": ["string", "null"]},
        "uncertain": {"type": "boolean"},
        "note": {"type": ["string", "null"]},
    },
    "required": [
        "paragraph_id",
        "surface",
        "type",
        "name_ar",
        "name_en",
        "description",
        "date",
        "place",
        "record",
        "uncertain",
        "note",
    ],
    "additionalProperties": False,
}
SCHEMA = {
    "type": "object",
    "properties": {"mentions": {"type": "array", "items": MENTION_SCHEMA}},
    "required": ["mentions"],
    "additionalProperties": False,
}

FIELD = r"""^\s*{name}\s*:\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|(\d+))"""


def field(source: str, name: str) -> str | None:
    match = re.search(FIELD.format(name=name), source, re.MULTILINE)
    if not match:
        return None
    value = next(g for g in match.groups() if g is not None)
    return value.replace("\\'", "'").replace('\\"', '"')


def catalogue() -> list[dict]:
    """The site's records, in the key format of `relatedEntries` ("artwork:3", "person:<slug>")."""
    records = []
    for kind, folder in (("artwork", "artworks"), ("residence", "residences")):
        for path in sorted((DATA / folder).glob("*.ts")):
            if path.name.startswith(("_", "index")):
                continue
            source = path.read_text(encoding="utf-8")
            desc = field(source, "desc") or ""
            records.append(
                {
                    "key": f"{kind}:{field(source, 'id')}",
                    "name": field(source, "name"),
                    "city": field(source, "city"),
                    "country": field(source, "country"),
                    "description": desc[:300],
                }
            )
    for path in sorted((DATA / "people").glob("*.ts")):
        if path.name.startswith(("_", "index")):
            continue
        source = path.read_text(encoding="utf-8")
        places = re.search(r"places:\s*\[([^\]]*)\]", source)
        records.append(
            {
                "key": f"person:{field(source, 'slug')}",
                "name": field(source, "name"),
                "places": re.findall(r"'([^']*)'", places.group(1)) if places else [],
            }
        )
    return records


def book_text(book: dict) -> str:
    paragraphs = {p["id"]: p for p in book["paragraphs"]}
    parts = []
    for section in book["sections"]:
        parts.append(f"## Section {section['id']} ({section['kind']}): {section['title']}")
        for pid in section["paragraphs"]:
            parts.append(f"[{pid}] {paragraphs[pid]['text']}")
    return "\n\n".join(parts)


def normalise(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def check(mention: dict, section: dict, paragraphs: dict, keys: set[str]) -> list[str]:
    problems = []
    pid = mention["paragraph_id"]
    if pid not in section["paragraphs"]:
        problems.append("paragraph not in section")
    elif normalise(mention["surface"]) not in normalise(paragraphs[pid]["text"]):
        problems.append("surface not found in paragraph")
    if mention["record"] is not None and mention["record"] not in keys:
        problems.append("unknown record")
    return problems


def extract(client, system, section, effort) -> dict:
    with client.messages.stream(
        model=MODEL,
        max_tokens=64000,
        system=system,
        output_config={"effort": effort, "format": {"type": "json_schema", "schema": SCHEMA}},
        messages=[
            {
                "role": "user",
                "content": f"Extract the entities of section {section['id']} "
                f"({section['title']}), paragraphs {', '.join(section['paragraphs'])}.",
            }
        ],
    ) as stream:
        response = stream.get_final_message()
    if response.stop_reason != "end_turn":
        raise RuntimeError(f"stop_reason {response.stop_reason}")
    text = next(b.text for b in response.content if b.type == "text")
    return {"mentions": json.loads(text)["mentions"], "usage": response.usage.model_dump()}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("--sections", nargs="*", help="section ids (default: all)")
    parser.add_argument("--effort", default="medium", choices=["low", "medium", "high", "xhigh"])
    parser.add_argument("--workers", type=int, default=4)
    args = parser.parse_args()

    book = json.loads((HERE / "paragraphs.json").read_text(encoding="utf-8"))
    paragraphs = {p["id"]: p for p in book["paragraphs"]}
    records = catalogue()
    keys = {r["key"] for r in records}
    context = (
        f"{INSTRUCTIONS}\n\n# Catalogue of the website's records\n\n"
        f"{json.dumps(records, ensure_ascii=False, indent=1)}\n\n# The book\n\n{book_text(book)}"
    )
    system = [{"type": "text", "text": context, "cache_control": {"type": "ephemeral"}}]
    fingerprint = {
        "model": MODEL,
        "effort": args.effort,
        "context_sha256": hashlib.sha256(context.encode()).hexdigest(),
        "schema_sha256": hashlib.sha256(json.dumps(SCHEMA, sort_keys=True).encode()).hexdigest(),
    }

    wanted = [s for s in book["sections"] if not args.sections or s["id"] in args.sections]
    SECTIONS_OUT.mkdir(parents=True, exist_ok=True)
    todo = []
    for section in wanted:
        path = SECTIONS_OUT / f"{section['id']}.json"
        if path.exists() and json.loads(path.read_text(encoding="utf-8"))["fingerprint"] == fingerprint:
            continue
        todo.append(section)
    print(f"{len(todo)} of {len(wanted)} sections to extract with {MODEL} (effort {args.effort})")

    client = anthropic.Anthropic()
    failures = []

    def run(section: dict) -> None:
        try:
            result = extract(client, system, section, args.effort)
        except (anthropic.APIError, RuntimeError, json.JSONDecodeError) as error:
            failures.append(section["id"])
            print(f"  {section['id']}: FAILED {error}", file=sys.stderr)
            return
        for mention in result["mentions"]:
            mention["section"] = section["id"]
            mention["problems"] = check(mention, section, paragraphs, keys)
        payload = {
            "fingerprint": fingerprint,
            "section": section["id"],
            "extractedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "usage": result["usage"],
            "mentions": result["mentions"],
        }
        (SECTIONS_OUT / f"{section['id']}.json").write_text(
            json.dumps(payload, ensure_ascii=False, indent=1) + "\n", encoding="utf-8", newline="\n"
        )
        flagged = sum(1 for m in result["mentions"] if m["problems"])
        usage = result["usage"]
        print(
            f"  {section['id']}: {len(result['mentions'])} mentions, {flagged} flagged "
            f"(in {usage['input_tokens']}, cache read {usage['cache_read_input_tokens']}, "
            f"cache write {usage['cache_creation_input_tokens']}, out {usage['output_tokens']})"
        )

    # The first request writes the cache; the others then read it.
    if todo:
        run(todo[0])
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        list(pool.map(run, todo[1:]))

    merge(book)
    if failures:
        sys.exit(f"failed sections: {' '.join(sorted(failures))}")


def merge(book: dict) -> None:
    """Collect every section's mentions, in reading order, into mentions.json."""
    mentions = []
    for section in book["sections"]:
        path = SECTIONS_OUT / f"{section['id']}.json"
        if path.exists():
            mentions.extend(json.loads(path.read_text(encoding="utf-8"))["mentions"])
    (OUT / "mentions.json").write_text(
        json.dumps(mentions, ensure_ascii=False, indent=1) + "\n", encoding="utf-8", newline="\n"
    )
    print(f"{len(mentions)} mentions -> {OUT.name}/mentions.json")


if __name__ == "__main__":
    main()
