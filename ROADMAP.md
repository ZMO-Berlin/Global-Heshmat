# Roadmap

What comes next for Global Heshmat, from the repository review of 25 November 2026 (commit `c7efefc`). Each item is tracked as a GitHub issue; this file gives the order and the reasons. The issues hold the detail.

The rule for ordering new views: **those whose data is already published come first**, then those whose data is in the repository but not yet exported, then those that need editors to record something new.

Progress is tracked in the [milestones](https://github.com/ZMO-Berlin/Global-Heshmat/milestones). Update this file when the order changes, not when an issue closes.

## 1. Fixes and reliability

Small, verified defects. Each is one commit. The first six affect what visitors or editors see today.

| Issue | What | Size |
| --- | --- | --- |
| [#99](https://github.com/ZMO-Berlin/Global-Heshmat/issues/99) | CSV export writes negative coordinates as text | S |
| [#100](https://github.com/ZMO-Berlin/Global-Heshmat/issues/100) | Map shows "could not be loaded" after one failed tile | S |
| [#101](https://github.com/ZMO-Berlin/Global-Heshmat/issues/101) | Missing record URLs show the offline page; `/memoir/` is not available offline | S |
| [#102](https://github.com/ZMO-Berlin/Global-Heshmat/issues/102) | Memoir: 36 names have passages that cannot be opened | S |
| [#103](https://github.com/ZMO-Berlin/Global-Heshmat/issues/103) | Browse panel state survives leaving the map | S |
| [#104](https://github.com/ZMO-Berlin/Global-Heshmat/issues/104) | Routine data and image pushes fail CI and block the deploy | M |
| [#105](https://github.com/ZMO-Berlin/Global-Heshmat/issues/105) | Focus ring contrast and the page heading's name | S |
| [#106](https://github.com/ZMO-Berlin/Global-Heshmat/issues/106) | Hide evidence headings and date lines that have no data | S |
| [#107](https://github.com/ZMO-Berlin/Global-Heshmat/issues/107) | Editorial report: group image-metadata warnings per record | S |
| [#108](https://github.com/ZMO-Berlin/Global-Heshmat/issues/108) | Saved albums: persistent storage, no double storage | S |
| [#109](https://github.com/ZMO-Berlin/Global-Heshmat/issues/109) | CI: tie the Playwright container tag to the lockfile | S |
| [#110](https://github.com/ZMO-Berlin/Global-Heshmat/issues/110) | Privacy-enhanced YouTube embed | S |
| [#111](https://github.com/ZMO-Berlin/Global-Heshmat/issues/111) | Housekeeping: stale docs, dead code, template fixes | S, many parts |
| [#112](https://github.com/ZMO-Berlin/Global-Heshmat/issues/112) | Content corrections for the editors to check | editorial |

#104 is the one to do before the next round of image edits: one push in five by editors currently fails for a reason outside the edit.

## 2. New views from data already published

Nothing new has to be recorded or extracted for these. In order:

| Order | Issue | View | Data it uses |
| --- | --- | --- | --- |
| 1 | [#113](https://github.com/ZMO-Berlin/Global-Heshmat/issues/113) | "In the memoir" on artwork, residence and People pages | 52 memoir names linked to 38 records |
| 2 | [#114](https://github.com/ZMO-Berlin/Global-Heshmat/issues/114) | Works the memoir names that are not yet in the collection | 24 memoir artworks without a record |
| 3 | [#115](https://github.com/ZMO-Berlin/Global-Heshmat/issues/115) | A record's trails, and a small map per trail | `trails` on 39 of 42 works |
| 4 | [#116](https://github.com/ZMO-Berlin/Global-Heshmat/issues/116) | The collection at a glance | status and country of all 42 works |
| 5 | [#117](https://github.com/ZMO-Berlin/Global-Heshmat/issues/117) | People by group, with the works each is linked to | 8 groups, 12 profile-to-record links |
| 6 | [#118](https://github.com/ZMO-Berlin/Global-Heshmat/issues/118) | Memoir map cross-filter | 713 name-to-passage links |

The first two come first because they connect the Memoir to the collection in both directions and feed the search for missing works, which is the site's purpose. #115 and #116 are the smallest.

## 3. Memoir foundations, then views that export existing data

The data for these views is in `svelte-app/docs/autobiography/extraction/` but not yet in what the site loads. Exporting it means running the pipeline's offline step, so the pipeline has to be safe to re-run first.

| Order | Issue | What |
| --- | --- | --- |
| 1 | [#122](https://github.com/ZMO-Berlin/Global-Heshmat/issues/122) | Keep hand corrections when the Memoir data is rebuilt |
| 2 | [#123](https://github.com/ZMO-Berlin/Global-Heshmat/issues/123) | Record the rights and review decisions (follows [#80](https://github.com/ZMO-Berlin/Global-Heshmat/issues/80)) |
| 3 | [#120](https://github.com/ZMO-Berlin/Global-Heshmat/issues/120) | Exhibition itinerary: 37 dated exhibitions on a map, by decade |
| 4 | [#119](https://github.com/ZMO-Berlin/Global-Heshmat/issues/119) | The memoir in reading order (chapter strip) |
| 5 | [#121](https://github.com/ZMO-Berlin/Global-Heshmat/issues/121) | Chronology of residences, exhibitions and works |

#122 is a prerequisite: corrections are currently made in generated files, and rebuilding would undo them. #123 is a decision, not code, and #119 depends on its answer about ranking people.

## 4. Views that need new editorial data

Each starts with an optional field that editors fill from documented evidence. Nothing is inferred.

| Issue | Field to add | What it makes possible |
| --- | --- | --- |
| [#124](https://github.com/ZMO-Berlin/Global-Heshmat/issues/124) | Year and material of a work | Works on the chronology, a material filter |
| [#125](https://github.com/ZMO-Berlin/Global-Heshmat/issues/125) | Coordinates for People places | A map of Heshmat's circle |
| [#126](https://github.com/ZMO-Berlin/Global-Heshmat/issues/126) | Dates and credits of photographs | A photo chronology, per-image rights |

## Not planned

Considered and set aside, with the reason, so they are not proposed again without new data:

- **People network graph.** 12 record links and 5 see-also links are too few; #117 shows the same relations more clearly.
- **Memoir co-mention network of people.** Only 16 passages name two people.
- **Heatmap.** It would show the concentration in Cairo and hide the records.
- **Flow map or Sankey of relocations.** One relocation is recorded.
- **Word cloud of the memoir.** It tells readers little; the reading-order view (#119) is the lexical view worth having.

## Background

- The September 2026 review and what followed from it: [`docs/archive/`](docs/archive/) and [`docs/implementation-notes.md`](docs/implementation-notes.md).
- The Memoir pipeline: [`svelte-app/docs/autobiography/README.md`](svelte-app/docs/autobiography/README.md).
