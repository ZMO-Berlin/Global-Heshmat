# Autobiography source text

Hassan Heshmat, _Tajārubī fī al-fann wa-al-ḥayāh_ (تجاربي في الفن والحياة, "My experiences in art and life"), al-Hayʾa al-Miṣriyya al-ʿĀmma lil-Kitāb. Open-access scan: <https://doi.org/10.58144/20240607-000>. Planning for the view that will use it is in issue #80.

The scan used is `Hassan_Heshmat_Autobiogriofie.pdf` (66 PDF pages, SHA-256 `f0756fdd4ff8da7695bb1c9018e70f0e94d65f2681c6d565995e1da99f915a9e`). It is not committed. The copy carries a handwritten dedication to Dr Ahmed Hegazy dated 25 February 1997 (OCR page 2).

## Files

| File                  | Content                                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------------------------- |
| `tajaribi-ocr.txt`    | Uncorrected OCR, one block per single page, separated by `--- Page N ---` (the first page has no marker) |
| `page-map.csv`        | OCR page → source PDF page and half (`right`, `left` or `whole`)                                         |
| `split_spreads.py`    | The script that split the two-page spreads                                                               |
| `segment.py`          | Builds `paragraphs.json`: sections, paragraphs with stable ids, OCR and printed pages                    |
| `extract_entities.py` | Entity extraction with the Claude API, one request per section, into `extraction/`                       |
| `consolidate.py`      | One Claude request that merges duplicate entities and proposes drops: `extraction/consolidation.json`    |
| `build_review.py`     | Groups mentions into entities: `extraction/entities.json` and the review sheet `extraction/review.csv`   |

## How the text was made

1. **Splitting.** 55 of the 66 PDF pages are two-page spreads. `split_spreads.py` (PyMuPDF) crops each spread into two pages, right half first because the book reads right to left. On text spreads the cut follows the gutter line found in the middle eighth of the page; photo plates are cut at the middle. PDF page 65, a small landscape photograph of the Hassan Heshmat Museum sign, is kept whole. Result: 121 single pages.
2. **OCR.** `AI_ocr_extraction/02_gemini_ocr_processor.py --model claude-sonnet-5-5` from [iwac-ai-pipelines](https://github.com/fmadore/iwac-ai-pipelines), run on 23 October 2026: Claude Sonnet 5.5, effort `low`, one page per request, the pipeline's standard OCR system prompt. 121/121 pages succeeded; 40 photo pages returned no text.
3. **Two manual edits.** On OCR pages 91 and 107 the model added an English sentence describing the photograph instead of transcribing it. Those sentences were removed; nothing else has been changed.

## Entity extraction

Run in order with Python 3.11+ and the `anthropic` package (`extract_entities.py` needs `ANTHROPIC_API_KEY`):

```bash
python segment.py
python extract_entities.py
python consolidate.py
python build_review.py
```

1. **Segmentation.** Lines holding only a number are the book's printed pages and become paragraph metadata. The front and back matter open at fixed blocks (`OPENERS` in `segment.py`): cover and dedication, Tharwat Okasha's preface, Ahmed Nawar's essay, the plates, the caption index, the press statistics, the back cover and the typed CV of January 1999 inserted in this copy, which continues after the museum ticket. In the author's own account (OCR pages 10–63), a short line ending in a colon opens a section and a paragraph cut by a page break is joined to the next page. Result: 53 sections, 451 paragraphs.
2. **Extraction.** `claude-sonnet-5-5`, effort `medium`, structured JSON output. Each request carries the whole segmented book and the site's catalogue (artworks, residences, People) in a cached system prompt and asks for one section, so names stay consistent and references across sections resolve. Every mention gives its paragraph, its exact form in the text, Arabic and English names, a short description from the book, date, place, a catalogue link and an uncertainty flag. No refusal fallback is configured: a section another model would have answered is recorded as failed instead. Each mention is checked: the paragraph must belong to the section, the quoted form must occur in it, a link must name an existing record. Run of 23 October 2026: 53 sections, 989 mentions, 7 forms not found in the text, about US$2.30.
3. **First-pass grouping** (`build_review.py`). Mentions are grouped by linked person or residence record, otherwise by type and English name: 522 entities. Because each section was extracted on its own, one entity can carry two English spellings (Ezz El-Din Hammouda / Ezzeddin Hamouda), exhibitions are named freely, and the model sometimes linked a city or company to the artwork record at that site (Paris → the EgyptAir work).
4. **Consolidation** (`consolidate.py`). One request to `claude-sonnet-5-5`, effort `high`, with a summary of every first-pass entity (names, forms in the text, descriptions, dates, places, sections) and the catalogue. It returns groups: which entities are the same, their canonical names, type and record, and whether to keep them or propose a drop (the narrator himself, an event that is not an exhibition, an unnamed official). The answer is checked: every first-pass entity must be in exactly one group and every record must exist. `build_review.py` applies it only to the first pass it was made from. Run of 23 October 2026: 44 merges, 10 proposed drops, no check failures, about US$0.70. Result: 468 entities (104 people, 119 places, 152 organisations, 48 artworks, 45 exhibitions), 52 linked to a site record.

For the review, `review.csv` shows one row per entity, with its forms in the text, book pages, the first passage, the consolidation's reason and the first-pass entities it merged. Proposed drops are rows like the others, marked "proposed drop" with the reason; nothing is removed without the reviewer. The file is UTF-8 with a byte-order mark so that Excel shows the Arabic; its last four columns are for the reviewer's decisions. Artwork records on the site describe sites, so several works can share one record (the obelisk and the lion at Oriental Weavers).

## Known limits

- The text is **not proofread**. A sample page (OCR page 20) matched the scan word for word, but names, dates and numbers must be checked against the scan before they are published.
- `[?]` marks a reading the model could not make, mostly handwriting and photo captions. Square brackets around whole passages (for example on OCR page 32) reproduce the book's own brackets.
- Captions photographed inside plates are transcribed as they appear, including likely misreadings: OCR page 109 reads the RTM plaque as "HASSAN EL SHAAT" and page 112 has "حسين حشمت".
- The rights status of the text should be confirmed before any passage is published on the site.
