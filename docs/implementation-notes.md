# Collection reliability and research tools

This implementation follows the September 2026 repository review at `c1052cb1ac256fd4705d285830e7abb906650c8e`.

| Review item                                           | Implementation                                                                                                                                                                |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1: ordinary clicks did not save documents            | Route navigation saves canonical HTML after worker readiness, including first visits before activation.                                                                       |
| F2: query variants broke offline access               | Canonical cache keys ignore presentation state. Build-specific documents and saved albums are retired on worker activation; selected IDs survive.                             |
| F3: About reset the map                               | Stable derived filters, guarded source updates, retained camera state, and deferred hidden-map updates. A local map fixture exercises the actual worker and marker selection. |
| F4: 404 collection action did nothing                 | The recovery action is a real collection link.                                                                                                                                |
| F5: duplicate modal history                           | Session-tagged shallow history entries close with Back; directly loaded shared links close in place.                                                                          |
| F6: invalid photo trapped Escape                      | A shared media resolver validates active photos and preserves legacy filename-based links.                                                                                    |
| F7: creation-place validation contradicted the schema | Generated JSON-LD is parsed and compared with exported source metadata. Unit fixtures cover absent and documented creation places.                                            |
| F8: cover resolution differed between views           | One resolver serves cards, dossiers and SEO; captions, credit, dates and rights use shared rendering.                                                                         |
| F9: development RTL asset returned 404                | One plugin serves development and emits production shaping code; a development-server fixture checks the response.                                                            |

## Added research functions

- Entry citations with publisher attribution, permanent URL, record ID, revision/build and access date; BibTeX and RIS downloads.
- JSON/CSV selection exports and a prerendered `/collection.json` endpoint with separate editorial and media-rights statements.
- A device-local fieldbook with estimated download sizes, bounded concurrent downloads, resumable partial caches, actual availability checks and removal controls.
- Side-by-side album comparison with captions and documented dates/credits.
- Evidence and precision panels, broader map framing where exactness is undocumented, and a sourced-event schema/list.
- Place-based reading sequences in Selb and 10th of Ramadan City, based on the existing records.
- An editorial validation/report command and CI artifact; an expanded contribution form with observation dates, record references, evidence and rights information.
- Search over aliases, descriptions, captions and source labels, with normalized Latin accents and Arabic marks/tatweel.

## Maintenance and verification

The obsolete map-store wrapper and unused legacy search/facet implementations are removed, while old URLs still decode. Image variant definitions are shared. Generation reuses master bytes, writes cache/manifest files atomically, and has isolated corruption, collision, EXIF, pointer, invalidation and failed-write fixtures. The encoder stays sequential to bound memory.

The unused Vitest UI dependency is removed. Actions are pinned to verified commit SHAs with Dependabot retained. A scheduled smoke workflow checks live canonical pages, assets, sitemap, worker, export and basemap. Performance checks resolve renderer assets from Vite's manifest. Clean builds prevent stale hashed chunks entering the next worker precache.

The validation gate covers lint, types, unit/image tests, build assertions, browser/accessibility tests, a real two-build offline upgrade, and Lighthouse budgets.

## Applying the supplied patch — 5 October 2026

Applied to repository revision `2bbb26e`. The only patch-context mismatch was the removed `images:watch` package script; it remains absent. New npm dependency versions and GitHub Action commit pins were checked against their upstream releases.

Local validation identified and corrected these issues:

- Image manifest reads and fallback rendering now use buffers, so libvips does not retain Windows file handles that prevent replacing derivatives. Pipeline fixtures also avoid holding those handles.
- The isolated upgrade test uses Windows junctions where needed, invokes npm through Node, and checks paths with platform-aware containment. Its cache assertion retries across the expected service-worker reload.
- The invalid-photo keyboard test waits for hydration before pressing Escape, and the map test waits for worker startup. Image comparison checks verify that both images decode.
- The gallery explicitly focuses the lightbox opener before opening, so WebKit restores focus correctly after pointer activation as well as keyboard activation.
- ESLint excludes generated Playwright reports and traces.

Local verification on Windows with Node 24.19.0:

- Lint and formatting passed; Svelte reported zero errors and zero warnings.
- All 169 unit tests and seven tooling tests passed.
- The production build passed, with 500 artifact assertions and 149 image-manifest entries verified.
- The 24 Chromium and 20 WebKit browser scenarios passed after the corrections above. Four Chromium-specific scenarios are skipped in WebKit. The corrected map-worker test also passed three consecutive runs.
- The two-build offline-upgrade test passed against the final application build. Desktop and mobile screenshots covered comparison, fieldbook, and trails.
- Editorial validation found zero errors across 43 records. Its 878 warnings describe missing structured sources, precision, entity kinds and image metadata; the existing records remain readable through their fallback labels.
- The three-run Lighthouse medians were 75 for desktop collection, 78 for mobile collection, 87 for mobile album, and 90 for mobile missing works. All four scored 100 for accessibility, best practices, and SEO. The collection performance scores failed the existing 90/85 budgets; those budgets have not been lowered during application of the patch. Reports are in `svelte-app/.lighthouse/`.

A control build of unmodified `2bbb26e`, using the same installed runtime dependencies and Lighthouse settings, scored 98 for desktop collection and 79 for mobile collection. The mobile performance budget therefore also fails before the patch. Baseline reports are in `svelte-app/.lighthouse/baseline/`.

A focused desktop confirmation against the patched build scored 89, 99 and 98 (median 98), matching the baseline median and passing the desktop budget. Its reports are in `svelte-app/.lighthouse/desktop-confirmation/`. The original desktop measurements were variable; at this stage the remaining local gate was mobile collection performance (78 versus the 85 budget, with the unmodified baseline at 79). No performance thresholds were changed to obtain a pass.

The deployed-site smoke check is intended to run after release; these local changes have not been deployed.

## Mobile collection performance follow-up — 5 October 2026

The collection now meets its existing mobile performance budget without changing the thresholds, image quality, or number of available records:

- Off-screen cards use `content-visibility: auto` and remembered intrinsic heights. All 43 records remain in the HTML, including for keyboard access and browsing without JavaScript.
- Repeated photo-count and map-pin icons share SVG definitions rendered from the existing Lucide components. This preserves the icon artwork while reducing initial component work and the measured DOM from 1,215 to 1,066 elements.
- The browse store derives URL parameters once per history entry and shares filter parameters between link builders.
- Artwork and residence routes own their album component. The initial collection no longer loads the lightbox, comparison, and entry-tool component code; measured script transfer decreased from 102,159 to 93,678 bytes. Album content remains prerendered.

Three cold Lighthouse mobile runs scored **79, 86, and 85**, giving a passing median of **85**. The first run remains below the budget, so there is limited performance headroom; 90 remains the optimization target. These are local laboratory measurements, not field data.

| Mobile collection                    |          Before |           After |
| ------------------------------------ | --------------: | --------------: |
| Performance, median                  |              78 |              85 |
| Largest contentful paint, median     |        3,619 ms |        3,473 ms |
| Total blocking time, median          |          360 ms |          247 ms |
| Cumulative layout shift, median      |           0.001 |           0.000 |
| Accessibility / best practices / SEO | 100 / 100 / 100 | 100 / 100 / 100 |

Reports are retained in `svelte-app/.lighthouse/mobile-optimization/`; the earlier collection reports are preserved in `svelte-app/.lighthouse/before-mobile-optimization/`. The browser regression now verifies that album code stays outside the initial collection load. Scroll restoration checks the card's visible position, allowing browser scroll anchoring to account for deferred card heights.

Final validation passed lint, formatting, type checks (zero errors/warnings), all 169 unit tests and seven tooling tests, the production build, 502 build assertions, and all 44 Chromium/WebKit browser scenarios with retries disabled. Four Chromium-specific scenarios are intentionally skipped in WebKit. Earlier concurrent validation hit timeouts; the final serial runs passed without increasing timeouts or weakening performance thresholds.

Desktop/mobile screenshots and keyboard navigation were checked in both Chromium and WebKit. The shared icons render correctly, the last card remains reachable and restores focus on return, and all 43 albums remain navigable without JavaScript.

## Integration with current main — 5 October 2026

Before committing, incorporated upstream `793288e`, preserving the newer collection text, images, dependency updates and development image watcher. Restored upstream's `images:watch` command alongside the implementation's tooling tests. The watcher now excludes middleware validation and test servers so those checks cannot rewrite committed derivatives.

The updated dependencies include Lighthouse 13.5.0. The initial merged build measured 98/80/84/90 for desktop collection, mobile collection, mobile album and mobile missing works. Preloading the header's italic font and inlining stylesheets below 16 KiB improved the album. The final three-run medians were **99/82/87/91**. Accessibility, best practices and SEO remained 100 throughout. The mobile collection still fails locally: LCP was 4,154 ms and total blocking time was 201 ms. The performance and LCP budgets remain unchanged. The earlier passing result of 85 above used the earlier dependency set and should not be treated as the current merged build's result.

GitHub's preceding successful CI run for unmodified `793288e` measured 99/90/88/90, including 32 ms of mobile collection blocking time. These measurements use a different machine and do not establish that the new commit passes CI. The final local Lighthouse reports are in `svelte-app/.lighthouse/`; the merged build verifies 154 image-manifest entries and 503 build assertions. Editorial validation reports zero errors and 903 research warnings across 43 records.

## Editorial and institutional follow-up

No sources, verification dates, photo dates/credits, uncertainty radii or historical coordinates were invented. The museum's existing description supports marking that record as an institution; other unreviewed metadata remains optional and appears in the editorial backlog. Existing permanent slugs and image order are preserved.

A reviewed Arabic UI translation, fuller sourced chronology and rights-cleared IIIF manifests require additional editorial material. The geographic trails are reading sequences, not institutionally reviewed walking routes. Original-asset storage changes, LFS history migration and branch-protection policy remain institutional decisions. No master bytes or repository history were changed.
