# Development and maintenance

## Local workflow

Run these commands from the repository root with Node.js installed:

```sh
npm start
npm test
node --check dist/app.js
git diff --check
```

The server runs at http://127.0.0.1:4173 and serves `dist` directly. There is no build step or npm dependency installation. Keep the server running while previewing, and reload the browser after source edits. If it cannot start, check whether another process already uses port 4173.

## File guide

| File | Purpose |
| --- | --- |
| `dist/index.html` | Page structure, embedded logo, map controls, territory panel, and dialogs |
| `dist/app.js` | Leaflet rendering, sheet refreshes, filters, scorecards, and challenge flow |
| `dist/game.js` | CSV parsing, header normalization, team aliases, ownership, and eligibility |
| `dist/style.css` | Shared styles and responsive rules |
| `dist/mobile.css` | Final mobile overrides; loaded after shared styles |
| `dist/transit.js` | Station-dot SVG rendering |
| `dist/config.json` | Sheet links, CSV feeds, refresh interval, and fallback teams |
| `dist/data/territories.json` | Stable territory IDs, displayed names, challenge paths, and retry settings |
| `dist/data/territories.geojson` | Playable territory polygons and Everett's label center |
| `dist/data/clean-land.geojson` | Separate MassGIS land/coast background snapshot |
| `dist/data/mbta-routes.geojson`, `mbta-stations.geojson` | Bundled transit reference snapshots |
| `dist/challenges/*.md` | Challenge content |
| `dist/assets/boston-blitz-logo.svg` | Organizer-supplied logo artwork |
| `tests.mjs` | Automated game-data and validation checks |

The supplied SVG is also embedded in `index.html` so it renders with the current local server. When replacing the artwork, update both copies. Preserve its viewBox and internal transforms; the `.brand-logo` CSS rule applies only uniform display sizing and a 2° counterclockwise rotation.

## Sheet integration

The configured Google Sheet is publicly readable, with editing restricted to players. `sheetUrl` opens its editing interface. Ownership, History, and team settings are fetched as CSV using the URLs in `config.json`. The current compact spreadsheet uses Google’s `gviz` endpoint: Ownership and History are named tabs, and team settings come from Instructions!A37:F41. All feeds use headers=1. Published CSV feeds also work. When changing spreadsheets, update all four URLs together.

The team settings feed is required in the current configuration (`teamsFeedOptional: false`). Its required columns are Team, Color, and Enabled; Aliases is optional. Colors must be six-digit hexadecimal values such as `#F3CE3E`. Enabled must be Yes or No, with 2–4 enabled teams. The compact template lists Blue, Red, Yellow, Green. Preserve permanent IDs and its challenge tab names. Older sheets without IDs retain the original Blue, Red, Green, Purple row-based aliases.

Ownership requires Territory ID, Claimed By, and Locked By. History requires Team, Territory ID, Reveal Order, and Status. Header capitalization and spaces/hyphens in place of underscores are normalized; column order is flexible. Stable territory IDs must not change. See the [README](../README.md#google-sheets-setup) for workbook setup and custom-name aliases.

Refreshes apply Teams, Ownership, and History together after validation. Bad feeds retain the last valid board and show an error. Initial feed failure does not substitute fictional ownership. Polling defaults to 30 seconds, with a minimum of 15 seconds; Google caching may delay visible changes. The site never writes game records back to the sheet.

The [compact template](COMPACT-SHEET.md) uses permanent Team ID values (`team-1` through `team-4`) in Instructions!F38:F41 and History's hidden F column. Internal ownership, history, challenge eligibility and remembered card keys use IDs; display text uses each team's `name`. The original template stores Team 1–4 slot labels; the current shared sheet stores color names. Both resolve to permanent IDs through aliases. Repeated custom-name changes need the optional synchronization script or preserved aliases to retain old dropdown selections. Legacy feeds without Team ID continue using name/alias matching. Read compact settings from Instructions!A37:F41, including the header. A History Team ID column takes precedence over its Team display column. Invalid IDs, duplicate identities, unknown teams, bad colors and broken histories are rejected before replacing game state. Errors name the feed, data row and field; missing ownership rows name the territories.

## Map and responsive layout

Clean board combines pale local land polygons, gray water, and Esri World Light Gray Base tiles at 65% opacity. Detailed map uses OpenStreetMap tiles at reduced saturation. Do not reintroduce World Terrain Base: its shaded terrain was removed at the organizer's request. Keep provider attribution visible. The land snapshot is separate from playable boundaries and should not change ownership shapes.

The mobile breakpoint is 650px. Mobile uses a compact logo/header, places map controls below the map, and stacks the collapsible territory panel above two-column scores. Native `details`/`summary` controls panel expansion. Selecting a territory opens it; sheet refreshes preserve its current expansion state. Score names and status counts are both 18px, with dots inside the name row.

Before releasing a layout change, check a phone-sized viewport and desktop: map switching, MBTA and icon toggles, panel collapse/reopen, alphabetical filters, score readability, and the challenge confirmation dialog. Confirm the dropdown changes colors with the team selection and that both confirmations are needed. Do not open a card or write live sheet records merely to test presentation.

## Updating data and challenges

Challenge files support a small Markdown subset: a `# Title`, paragraphs, and `## Section headings`. Set retryability in `territories.json`. Replace demonstration cards before a real game. Public static hosting cannot keep their contents secret.

`prepare-data.mjs` rebuilds territory data from bundled geographic sources. It also rewrites the CSV templates and creates missing demonstration cards, so review its outputs before running or committing it. It is not a routine preview/build command. Review source-specific adjustments, especially Longwood, Chinatown's dissolved boundary, Seaport, and Everett's centroid.

MassGIS background land contains 351 municipal polygons, simplified to 0.00003 degrees and downloaded October 10, 2026. Boston and municipality boundary sources are linked in the [README](../README.md#boundaries). MBTA route/station snapshots are also dated October 10, 2026. Refresh transit geometry and station route memberships together; these snapshots do not provide live alerts or schedules.

## Git and publishing

Development is on `codex/boston-showdown` in [anselgl/jetlagboston](https://github.com/anselgl/jetlagboston). Commit relevant source, data, tests, and documentation together. Preview screenshots in `outputs` are local artifacts and should not be committed.

Pushing a commit does not publish the website. `.github/workflows/pages.yml` is manual only (`workflow_dispatch`), runs `npm test`, and deploys `dist`. Enable GitHub Pages with GitHub Actions in repository settings when ready to publish. The current preference is local development. Sheet edits do not require deployment; code, configuration, and challenge edits do.

## Editable slot names

When the team feed includes Slot, it supplies the display name. Team, original color names and saved Aliases remain accepted as prior labels, while permanent IDs continue to drive game state. See [the owner-installed synchronization script](TEAM-NAME-SYNC.md) for updating old Google Sheets dropdown selections on repeated renames. The script is optional for current color labels; automatic propagation requires owner installation and Google authorization.

Sheet failures appear in a red alert banner above every view. Ownership team validation includes the exact column and row, territory, and invalid name. Last-good data is retained as one snapshot; the banner labels it stale until all feeds validate again.
