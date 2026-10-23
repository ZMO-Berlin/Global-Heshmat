"""Give the places named in the autobiography coordinates, for the website's map.

Two steps, both cached in extraction/geocoding.json:

1. Claude writes, for every kept place entity, an unambiguous search query
   ("Ain Shams, Cairo, Egypt") and its level (country, region, city,
   district, street, site), from the names and descriptions the extraction
   recorded. Names alone are ambiguous: "Haram" is a district of Giza.
2. OpenStreetMap's Nominatim geocodes each query (one request per second, as
   its usage policy asks). The first result's coordinates, OSM id and display
   name are kept so a reviewer can check them.

Queries that found nothing or the wrong place are corrected in MANUAL_QUERIES
and marked `queryByHand` in the cache. Countries keep coordinates too, but the
page lists them rather than mapping them. A re-run only asks for places that
are new or whose query changed.

Requires the `anthropic` package and ANTHROPIC_API_KEY.

    python geocode.py
"""

import json
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone

import anthropic

from build_review import OUT
from extract_entities import MODEL

NOMINATIM = "https://nominatim.openstreetmap.org/search"
USER_AGENT = "GlobalHeshmat/1.0 (https://heshmat.zmo.de; autobiography places)"
LEVELS = ["country", "region", "city", "district", "street", "site"]

# Queries corrected by hand after the run of 23 October 2026: the model's query found
# nothing, or found the wrong place (Gaza in Mozambique, Haram as a hamlet near Saqqara).
MANUAL_QUERIES = {
    "Haram (Giza)": "Al Haram, Giza, Egypt",
    "Gaza": "Gaza City, Palestine",
    "Ain Shams West Metro Station": "محطة مترو عين شمس",
    "El Qanater El Khayreya": "القناطر الخيرية",
    "International Garden": "الحديقة الدولية",
    "Kobri el-Limoun": "كوبري الليمون",
    "Menouf": "Menouf",
    "Midan Galaa": "ميدان الجلاء، مصر الجديدة",
    "Misr Station Square": "Ramses Railway Station",
    "Ramses Square": "Ramses Railway Station",
    "Wikalat al-Balah": "وكالة البلح",
}

INSTRUCTIONS = """\
These places are named in the Arabic autobiography of the Egyptian sculptor Hassan Heshmat \
(1920–2006). For each, write the search query that finds it in OpenStreetMap's Nominatim, \
in English or the local language, from the most specific name to the country \
("Ain Shams, Cairo, Egypt"; "Malmö, Sweden"; "Qasr El Nil Street, Cairo, Egypt"), and its \
level: country, region, city, district, street or site. Use the descriptions to decide which \
place is meant. When a place cannot be located from what is given, set query to null."""

SCHEMA = {
    "type": "object",
    "properties": {
        "places": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "id": {"type": "string"},
                    "query": {"type": ["string", "null"]},
                    "level": {"type": "string", "enum": LEVELS},
                },
                "required": ["id", "query", "level"],
                "additionalProperties": False,
            },
        }
    },
    "required": ["places"],
    "additionalProperties": False,
}


def queries(places: list[dict]) -> dict[str, dict]:
    listing = [
        {"id": p["id"], "name_en": p["name_en"], "name_ar": p["name_ar"], "descriptions": p["descriptions"][:3]}
        for p in places
    ]
    client = anthropic.Anthropic()
    with client.messages.stream(
        model=MODEL,
        max_tokens=32000,
        system=INSTRUCTIONS,
        output_config={"effort": "medium", "format": {"type": "json_schema", "schema": SCHEMA}},
        messages=[{"role": "user", "content": json.dumps(listing, ensure_ascii=False, indent=1)}],
    ) as stream:
        response = stream.get_final_message()
    if response.stop_reason != "end_turn":
        sys.exit(f"stop_reason {response.stop_reason}")
    text = next(b.text for b in response.content if b.type == "text")
    return {p["id"]: p for p in json.loads(text)["places"]}


def nominatim(query: str) -> dict | None:
    url = f"{NOMINATIM}?{urllib.parse.urlencode({'q': query, 'format': 'jsonv2', 'limit': 1})}"
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=30) as response:
        results = json.load(response)
    time.sleep(1.1)
    if not results:
        return None
    hit = results[0]
    return {
        "lat": round(float(hit["lat"]), 5),
        "lng": round(float(hit["lon"]), 5),
        "osm": f"{hit['osm_type']}/{hit['osm_id']}",
        "displayName": hit["display_name"],
    }


def main() -> None:
    entities = json.loads((OUT / "entities.json").read_text(encoding="utf-8"))
    places = [
        e
        for e in entities
        if e["type"] == "place" and (e.get("consolidation") or {}).get("action") != "drop"
    ]
    path = OUT / "geocoding.json"
    cache = json.loads(path.read_text(encoding="utf-8")) if path.exists() else {"places": {}}
    known = cache["places"]

    # Entity ids are renumbered when the extraction changes, so the cache is keyed by name.
    missing = [p for p in places if p["name_en"] not in known]
    if missing:
        print(f"Asking {MODEL} for search queries for {len(missing)} places")
        proposed = queries(missing)
        for place in missing:
            answer = proposed.get(place["id"])
            known[place["name_en"]] = {
                "query": answer["query"] if answer else None,
                "level": answer["level"] if answer else None,
                "result": None,
                "geocodedAt": None,
            }

    for name, query in MANUAL_QUERIES.items():
        entry = known.get(name)
        if entry is not None and entry["query"] != query:
            entry.update(query=query, queryByHand=True, result=None, geocodedAt=None)

    for name, entry in known.items():
        if entry["query"] and entry["geocodedAt"] is None:
            entry["result"] = nominatim(entry["query"])
            entry["geocodedAt"] = datetime.now(timezone.utc).isoformat(timespec="seconds")
            status = "found" if entry["result"] else "NOT FOUND"
            print(f"  {name}: {entry['query']} -> {status}")

    cache.update(model=MODEL, service=NOMINATIM)
    path.write_text(json.dumps(cache, ensure_ascii=False, indent=1) + "\n", encoding="utf-8", newline="\n")
    found = sum(1 for p in places if (known.get(p["name_en"]) or {}).get("result"))
    print(f"{found} of {len(places)} places have coordinates -> {path.name}")


if __name__ == "__main__":
    main()
