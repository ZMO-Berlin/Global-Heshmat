# Autobiography source text

Hassan Heshmat, _Tajārubī fī al-fann wa-al-ḥayāh_ (تجاربي في الفن والحياة, "My experiences in art and life"), al-Hayʾa al-Miṣriyya al-ʿĀmma lil-Kitāb. Open-access scan: <https://doi.org/10.58144/20240607-000>. Planning for the view that will use it is in issue #80.

The scan used is `Hassan_Heshmat_Autobiogriofie.pdf` (66 PDF pages, SHA-256 `f0756fdd4ff8da7695bb1c9018e70f0e94d65f2681c6d565995e1da99f915a9e`). It is not committed. The copy carries a handwritten dedication to Dr Ahmed Hegazy dated 25 February 1997 (OCR page 2).

## Files

| File               | Content                                                                                                  |
| ------------------ | -------------------------------------------------------------------------------------------------------- |
| `tajaribi-ocr.txt` | Uncorrected OCR, one block per single page, separated by `--- Page N ---` (the first page has no marker) |
| `page-map.csv`     | OCR page → source PDF page and half (`right`, `left` or `whole`)                                         |
| `split_spreads.py` | The script that split the two-page spreads                                                               |

## How the text was made

1. **Splitting.** 55 of the 66 PDF pages are two-page spreads. `split_spreads.py` (PyMuPDF) crops each spread into two pages, right half first because the book reads right to left. On text spreads the cut follows the gutter line found in the middle eighth of the page; photo plates are cut at the middle. PDF page 65, a small landscape photograph of the Hassan Heshmat Museum sign, is kept whole. Result: 121 single pages.
2. **OCR.** `AI_ocr_extraction/02_gemini_ocr_processor.py --model claude-sonnet-5-5` from [iwac-ai-pipelines](https://github.com/fmadore/iwac-ai-pipelines), run on 23 October 2026: Claude Sonnet 5.5, effort `low`, one page per request, the pipeline's standard OCR system prompt. 121/121 pages succeeded; 40 photo pages returned no text.
3. **One manual edit.** On OCR page 107 the model added an English sentence describing the photograph instead of transcribing it. That sentence was removed; nothing else has been changed.

## Known limits

- The text is **not proofread**. A sample page (OCR page 20) matched the scan word for word, but names, dates and numbers must be checked against the scan before they are published.
- `[?]` marks a reading the model could not make, mostly handwriting and photo captions. Square brackets around whole passages (for example on OCR page 32) reproduce the book's own brackets.
- Captions photographed inside plates are transcribed as they appear, including likely misreadings: OCR page 109 reads the RTM plaque as "HASSAN EL SHAAT" and page 112 has "حسين حشمت".
- The rights status of the text should be confirmed before any passage is published on the site.
