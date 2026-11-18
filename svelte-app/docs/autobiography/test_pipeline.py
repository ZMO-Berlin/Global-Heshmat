"""Tests for the pipeline's pure helpers: no network, API key, PDF or third-party package.

Run from this directory (the scripts import each other by module name):

    python -m unittest

Nothing here writes to extraction/, paragraphs.json or the site's memoir data.
"""

import json
import tempfile
import unittest
from contextlib import redirect_stdout
from io import StringIO
from pathlib import Path

import build_review
import build_site_data
import consolidate
import extract_entities
import segment

HERE = Path(__file__).parent


def mention(**fields) -> dict:
    base = {
        "paragraph_id": "p0001",
        "section": "s01",
        "surface": "حسين بيكار",
        "type": "person",
        "name_ar": "حسين بيكار",
        "name_en": "Hussein Bicar",
        "description": "Painter",
        "date": None,
        "place": None,
        "record": None,
        "uncertain": False,
        "note": None,
        "problems": [],
    }
    return {**base, **fields}


PARAGRAPHS = {
    "p0001": {"id": "p0001", "section": "s01", "printedPages": [12], "text": "زار حسين بيكار القاهرة"},
    "p0002": {"id": "p0002", "section": "s01", "printedPages": [12, 13], "text": "ثم بيكار في الاسكندرية"},
}


class SegmentTest(unittest.TestCase):
    def test_blocks_join_lines_and_split_on_blank_lines(self):
        self.assertEqual(segment.blocks_of(["  a ", "b", "", "  ", "c"]), ["a b", "c"])
        self.assertEqual(segment.blocks_of([]), [])

    def test_pages_split_on_markers_and_the_first_page_has_none(self):
        text = "cover\n--- Page 2 ---\none\ntwo\n\nthree\n--- Page 3 ---\n"
        self.assertEqual(segment.read_pages(text), [(1, ["cover"]), (2, ["one two", "three"]), (3, [])])

    def test_page_numbers_in_either_digit_set(self):
        for value in ["12", "١٢", "٣"]:
            self.assertTrue(segment.PAGE_NUMBER.match(value))
        self.assertFalse(segment.PAGE_NUMBER.match("1234"))
        self.assertEqual(int("١٢٠".translate(segment.ARABIC_DIGITS)), 120)

    def test_openers(self):
        self.assertEqual(segment.opener(6, 3, "تقديم"), ("front", "تقديم: د. ثروت عكاشة"))
        self.assertEqual(segment.opener(1, 0, "anything"), ("front", "الغلاف والإهداء"))
        self.assertIsNone(segment.opener(1, 1, "anything"))

    def test_headings_only_in_the_narrative(self):
        self.assertEqual(segment.opener(20, 2, "معرض بالسويد:"), ("narrative", "معرض بالسويد"))
        self.assertIsNone(segment.opener(70, 2, "معرض بالسويد:"))
        self.assertIsNone(segment.opener(20, 2, "x" * 80 + ":"))

    def test_segmenting_the_committed_ocr_reproduces_paragraphs_json(self):
        committed = HERE / "paragraphs.json"
        if not committed.exists():
            self.skipTest("paragraphs.json not present")
        with tempfile.TemporaryDirectory() as directory:
            original, segment.TARGET = segment.TARGET, Path(directory) / "paragraphs.json"
            try:
                with redirect_stdout(StringIO()):
                    segment.main()
                produced = json.loads(segment.TARGET.read_text(encoding="utf-8"))
            finally:
                segment.TARGET = original
        self.assertEqual(produced, json.loads(committed.read_text(encoding="utf-8")))


class ExtractEntitiesTest(unittest.TestCase):
    def test_field_reads_quoted_and_numeric_values(self):
        source = "\tid: 7,\n\tname: 'The Couple',\n\tcity: \"Cairo\",\n\tdesc: 'Heshmat\\'s work'\n"
        self.assertEqual(extract_entities.field(source, "id"), "7")
        self.assertEqual(extract_entities.field(source, "name"), "The Couple")
        self.assertEqual(extract_entities.field(source, "city"), "Cairo")
        self.assertEqual(extract_entities.field(source, "desc"), "Heshmat's work")
        self.assertIsNone(extract_entities.field(source, "country"))

    def test_field_matches_whole_keys_at_line_start(self):
        self.assertIsNone(extract_entities.field("\tnickname: 'x'\n", "name"))

    def test_normalise_collapses_whitespace(self):
        self.assertEqual(extract_entities.normalise("  a\n\tb   c "), "a b c")

    def test_check_flags_each_problem(self):
        section = {"paragraphs": ["p0001"]}
        keys = {"person:hussein-bicar"}
        check = lambda m: extract_entities.check(m, section, PARAGRAPHS, keys)  # noqa: E731
        self.assertEqual(check(mention()), [])
        self.assertEqual(check(mention(surface="حسين\n بيكار")), [])
        self.assertEqual(check(mention(paragraph_id="p0002")), ["paragraph not in section"])
        self.assertEqual(check(mention(surface="جمال")), ["surface not found in paragraph"])
        self.assertEqual(check(mention(record="person:nobody")), ["unknown record"])
        self.assertEqual(check(mention(record="person:hussein-bicar")), [])

    def test_book_text_lists_sections_and_numbered_paragraphs(self):
        book = {
            "sections": [{"id": "s01", "kind": "narrative", "title": "T", "paragraphs": ["p0001", "p0002"]}],
            "paragraphs": list(PARAGRAPHS.values()),
        }
        self.assertEqual(
            extract_entities.book_text(book),
            "## Section s01 (narrative): T\n\n[p0001] زار حسين بيكار القاهرة\n\n[p0002] ثم بيكار في الاسكندرية",
        )


class BuildReviewTest(unittest.TestCase):
    def test_group_key_uses_person_and_residence_links_only(self):
        self.assertEqual(build_review.group_key(mention(record="person:x")), ("person", "person:x"))
        self.assertEqual(build_review.group_key(mention(record="residence:3")), ("person", "residence:3"))
        self.assertEqual(
            build_review.group_key(mention(record="artwork:3", name_en=" Hussein BICAR ")),
            ("person", "hussein bicar"),
        )
        self.assertEqual(
            build_review.group_key(mention(record="person:x", problems=["unknown record"])),
            ("person", "hussein bicar"),
        )

    def test_most_common_ignores_empty_values(self):
        self.assertEqual(build_review.most_common(["a", None, "b", "b", ""]), "b")
        self.assertIsNone(build_review.most_common([None, ""]))

    def test_entity_aggregates_mentions(self):
        items = [
            mention(),
            mention(paragraph_id="p0002", surface="بيكار", date="1955", uncertain=True, note="n"),
            mention(record="person:bad", problems=["unknown record"]),
        ]
        item = build_review.entity("person", items, PARAGRAPHS)
        self.assertEqual(item["surfaces"], ["بيكار", "حسين بيكار"])
        self.assertEqual(item["paragraphs"], ["p0001", "p0002"])
        self.assertEqual(item["printedPages"], [12, 13])
        self.assertEqual(item["dates"], ["1955"])
        self.assertEqual((item["uncertain"], item["problems"]), (1, 1))
        self.assertIsNone(item["record"])
        self.assertEqual(item["descriptions"], ["Painter"])

    def test_first_pass_groups_and_numbers_by_type_then_size(self):
        mentions = [
            mention(type="place", name_en="Cairo", surface="القاهرة"),
            mention(),
            mention(name_en="hussein bicar", paragraph_id="p0002", surface="بيكار"),
            mention(name_en="Gamal", surface="جمال"),
        ]
        entities = build_review.first_pass(PARAGRAPHS, mentions)
        self.assertEqual(
            [(e["id"], e["type"], len(e["mentions"])) for e in entities],
            [("e0001", "person", 2), ("e0002", "person", 1), ("e0003", "place", 1)],
        )
        self.assertEqual(entities[1]["name_en"], "Gamal")

    def test_fingerprint_follows_the_first_pass(self):
        entities = build_review.first_pass(PARAGRAPHS, [mention(), mention(name_en="Gamal")])
        same = build_review.first_pass(PARAGRAPHS, [mention(name_en="Gamal"), mention()])
        self.assertEqual(build_review.fingerprint(entities), build_review.fingerprint(same))
        other = build_review.first_pass(PARAGRAPHS, [mention()])
        self.assertNotEqual(build_review.fingerprint(entities), build_review.fingerprint(other))


class ConsolidateTest(unittest.TestCase):
    ENTITIES = [
        {"id": "e0001", "type": "person", "name_en": "A", "name_ar": "أ", "record": None},
        {"id": "e0002", "type": "person", "name_en": "A.", "name_ar": "أ", "record": None},
        {"id": "e0003", "type": "place", "name_en": "Cairo", "name_ar": "القاهرة", "record": None},
    ]

    def group(self, members, **fields):
        return {
            "members": members,
            "type": "person",
            "name_en": "A",
            "name_ar": "أ",
            "record": None,
            "action": "keep",
            "reason": None,
            **fields,
        }

    def test_valid_groups_pass_unchanged(self):
        groups = [self.group(["e0001", "e0002"]), self.group(["e0003"], type="place")]
        valid, problems = consolidate.checked(groups, self.ENTITIES, set())
        self.assertEqual(valid, groups)
        self.assertEqual(problems, [])

    def test_unknown_and_repeated_ids_are_dropped(self):
        groups = [self.group(["e0001", "e9999"]), self.group(["e0001"]), self.group(["e0002", "e0003"])]
        valid, problems = consolidate.checked(groups, self.ENTITIES, set())
        self.assertEqual([g["members"] for g in valid], [["e0001"], ["e0002", "e0003"]])
        self.assertEqual(len(problems), 2)

    def test_unknown_records_are_cleared(self):
        groups = [self.group(["e0001", "e0002"], record="person:x"), self.group(["e0003"], record="artwork:1")]
        valid, problems = consolidate.checked(groups, self.ENTITIES, {"artwork:1"})
        self.assertEqual([g["record"] for g in valid], [None, "artwork:1"])
        self.assertEqual(problems, ["unknown record person:x in group A"])

    def test_entities_left_out_are_kept_on_their_own(self):
        valid, problems = consolidate.checked([self.group(["e0001", "e0002"])], self.ENTITIES, set())
        self.assertEqual(valid[-1]["members"], ["e0003"])
        self.assertEqual((valid[-1]["action"], valid[-1]["name_en"]), ("keep", "Cairo"))
        self.assertEqual(problems, ["e0003 (Cairo) left out; kept on its own"])


class BuildSiteDataTest(unittest.TestCase):
    def test_fold_keeps_offsets_of_kept_characters(self):
        folded, offsets = build_site_data.fold("مُدرسة")
        self.assertEqual(folded, "مدرسه")
        self.assertEqual(offsets, [0, 2, 3, 4, 5])

    def test_exact_match_after_a_proclitic(self):
        text = "ذهب بالقاهرة امس"
        self.assertEqual(build_site_data.find("القاهرة", text), [(5, 12)])

    def test_no_match_inside_a_longer_word(self):
        self.assertEqual(build_site_data.find("مصر", "الثقافة المصرية"), [])
        self.assertEqual(build_site_data.find("مصر", "زار مصر"), [(4, 7)])

    def test_li_before_the_article_drops_its_alif(self):
        text = "سافر للدانمارك"
        self.assertEqual(build_site_data.find("الدانمارك", text), [(5, 14)])

    def test_folded_match_for_spelling_variants_and_vowels(self):
        text = "في مدرسه الفنون"
        self.assertEqual(build_site_data.find("مدرسة", text), [(3, 8)])
        voweled = "قال مُحَمَّد"
        self.assertEqual(build_site_data.find("محمد", voweled), [(4, len(voweled))])

    def test_whitespace_in_a_form_matches_any_run_of_whitespace(self):
        text = "حسين\n  بيكار"
        self.assertEqual(build_site_data.find("حسين بيكار", text), [(0, len(text))])

    def test_merge_joins_overlapping_and_touching_spans(self):
        self.assertEqual(build_site_data.merge([(5, 8), (0, 3), (2, 4), (8, 9)]), [[0, 4], [5, 9]])
        self.assertEqual(build_site_data.merge([]), [])

    def test_build_passages_copies_only_cited_paragraphs(self):
        book = {
            "sections": [{"id": "s01", "title": "T"}],
            "paragraphs": [*PARAGRAPHS.values(), {"id": "p0003", "section": "s01", "printedPages": [], "text": "x"}],
        }
        entity = {
            "id": "e0001",
            "surfaces": ["بيكار", "حسين بيكار"],
            "mentions": [
                mention(surface="حسين بيكار"),
                mention(paragraph_id="p0002", surface="بيكار"),
                mention(paragraph_id="p0002", surface="بيكارو"),
            ],
        }
        passages = build_site_data.build_passages([{"id": "e0001"}], {"e0001": entity}, book)
        self.assertEqual(passages["sections"], {"s01": "T"})
        self.assertEqual(sorted(passages["paragraphs"]), ["p0001", "p0002"])
        self.assertEqual(passages["paragraphs"]["p0002"], {"section": "s01", "pages": [12, 13], "text": "ثم بيكار في الاسكندرية"})
        first, second = passages["entities"]["e0001"]
        self.assertEqual(first, {"p": "p0001", "marks": [[4, 14]], "missing": []})
        self.assertEqual(second, {"p": "p0002", "marks": [[3, 8]], "missing": ["بيكارو"]})


if __name__ == "__main__":
    unittest.main()
