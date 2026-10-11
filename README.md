# Jetlag: Boston Blitz

A phone-friendly, static territory game for friends, inspired by Jet Lag: The Game. Unaffiliated fan project with 37 territories, 2–4 teams, and a publicly readable Google Sheet as the shared game record. The configured sheet supplies team names, colors, ownership, and challenge history. The spreadsheet template contains fictional ownership examples, and the challenge files are still demonstrations; replace these before playing.

See the [player guide](docs/PLAYING.md) for the game flow and the [development guide](docs/DEVELOPMENT.md) for files, maintenance, and release checks.

## Preview

Station dots share the MBTA lines toggle, including commuter rail and Silver Line stops. Colors match the routes; transfer stations display each distinct line color. Platforms are grouped into their parent station, and tapping a dot shows the station name and routes. Dots grow as you zoom in. Station locations are bundled from the official MBTA V3 API, downloaded October 10, 2026.

The MBTA lines button toggles subway, Mattapan trolley, Silver Line buses, and commuter rail routes on either map view. It starts off and keeps its current setting when switching views. Tap or hover a route for its name. The local route snapshot comes from the MBTA V3 API, downloaded October 10, 2026; it includes the Green Line Extension. It is a route reference, not live schedules, alerts, or detours. Route geometry is bundled with the site so this overlay does not depend on a live MBTA API request. Detailed territory borders are 3px, with 4.5px locked borders; selecting a territory adds emphasis.

Run `npm start`, then open http://127.0.0.1:4173. Run `npm test` for ownership, CSV, map coverage, and challenge-history checks. No build step or package installation is required. The map library is vendored; street tiles and optional web fonts need internet. System fonts work without the font service.

## Current interface

- The game board is the main view. Clean board has pale land, gray water, and faint grayscale streets, parks, and building detail. Detailed map shows more street and landmark context. Both share territory selection and game state.
- MBTA lines toggles routes and station dots in either view. Hide icons hides territory names, claim dots, and lock icons while keeping territory fills, boundaries, and the MBTA overlay available. These choices last for the page session.
- Locked territories have a lock icon and thicker outlines; selecting any territory makes its outline darker and thicker.
- Territories lists all neighborhoods and municipalities together alphabetically. Unclaimed, Claimed, and Locked filters accept any combination. Claimed means claimed but not locked. All three start selected; filters survive sheet refreshes, but reset when the page reloads.
- The green territory panel collapses using the right-aligned arrow beside its heading. When collapsed it reads “Show territory panel.” Selecting a territory reopens it to show challenge and Google Maps actions.
- Scorecards show team names and locked/claimed counts at the same 18px size, with the colored dot beside the team name. Scores currently count territories, including both claimed and locked territory.
- The challenge confirmation dialog uses large checkboxes and text, a team-colored dropdown with a pale fill, a prominent open-card button, and readable red eligibility warnings. Both confirmations and shared-history eligibility are required to open a new card.
- At widths of 650px or less, the logo and sheet button share a compact header, the map controls move below the map, and the territory panel stacks above the two-column scoreboard. Larger screens use the desktop arrangement. No separate mobile site is required.
- The supplied ticket artwork is in `dist/assets/boston-blitz-logo.svg` and embedded in the header; CSS adds a 2° counterclockwise rotation with uniform sizing.

## Google Sheets setup

Recommended: import [the compact eight-tab template](dist/templates/Jetlag-Boston-Blitz-Compact-Template.xlsx) into a NEW Google spreadsheet. It includes all 37 territories, four challenge tabs, automatic History, dropdowns and warnings. Instructions now also contains team count, names and colors; Setup and Teams are no longer separate tabs. Overview summary rows have continuous borders. See [compact-sheet setup and connection instructions](docs/COMPACT-SHEET.md). This is a demo template with fictional claims, not a copy of the current live sheet. Clear Ownership!B2:C38 before playing. Check dropdowns, formulas and hidden columns after import. The previous ten-tab template remains available in dist/templates/Jetlag-Boston-Blitz-37-Territories.xlsx; the instructions below referring to Setup and Teams describe that earlier layout only. The connected sheet uses the compact layout.

The CSV-only alternative below is available if you prefer a minimal sheet:

1. Create a sheet and import `sheets/Ownership.csv` into an Ownership tab. Preserve the territory IDs. Headers accept capitalization and spaces in place of underscores. Give only players editing access.
2. Use dropdowns for `claimed_by` and `locked_by` with enabled team names and blank. Without a Teams feed, names come from `dist/config.json`; with one, use the Teams tab. Team matching ignores capitalization and supports the aliases described below. The map owner is locked_by when populated, otherwise claimed_by.
3. Import `sheets/Team-history.csv` into a History tab. Filter by team or duplicate filtered records into separate team tabs. Use statuses Not opened, Active, Succeeded, Failed, Abandoned. Assign a unique increasing reveal_order when opening a challenge. Retrying never changes that order.
4. Add an active-count warning for each team: `=IF(COUNTIFS(History!A2:A,"Blue",History!D2:D,"Active")>1,"WARNING: Multiple active challenges","OK")`. If using individual team tabs with the same columns, use `=IF(COUNTIF(D2:D,"Active")>1,"WARNING: Multiple active challenges","OK")` in a separate cell outside the data table. Use conditional formatting for a red warning. Add a warning for duplicate reveal orders if desired.
5. Connect publicly readable CSV feeds in `dist/config.json`: `ownershipCsvUrl`, `historyCsvUrl`, and, when present, `teamsCsvUrl`. Set `sheetUrl` to the editable sheet link. The current configuration uses Google Sheets `gviz` CSV URLs with the tab name; a sheet shared for public viewing supports this method. Published-to-web CSV URLs are an alternative. Reading or publishing data does not grant editing access. For separate team tabs, build the combined History tab with a formula such as `={Blue!A1:D1;FILTER(Blue!A2:D,Blue!A2:A<>"");FILTER(Red!A2:D,Red!A2:A<>"")}`. Keep feed tabs free of unrelated warning rows.
6. The site polls every 30 seconds. Google's published feeds can be cached; this is not guaranteed instant synchronization. Test an edit before playing. Invalid feeds retain the last good board and display a red warning banner on every page. Unknown ownership names identify the exact sheet cell, territory, and invalid value. On first-load failure with a configured feed, no live game data is loaded and no demo claims are shown.

All game writes happen in Google Sheets. Revealing a card on the site does not write to the sheet. Players record reveals and outcomes themselves. Without historyCsvUrl, challenge eligibility remains entirely on the honor system; with it, the reveal gate also checks the last loaded shared history.

## Challenge files

Edit `dist/challenges/<territory-id>.md`. Use one `# Title`, paragraphs, and `## Section headings`. This is a deliberately small Markdown subset; HTML is displayed as text. Set retryable in `dist/data/territories.json` per challenge. Do not publish unfinished challenge content for a real game. Static files and public repository contents are discoverable; the reveal flow provides honor-system concealment, not secret storage.

Each team has one active challenge. Complete or abandon it before opening another. Failed/abandoned challenges can be retried only if their card permits it and no subsequent challenge has been opened. Succeeded cards can be viewed again for reference. Locked territories cannot be stolen. The scoreboard temporarily assumes one point per territory; scoring needs game-design review.

## Optional device memory

Off by default. Enabling the checkbox stores revealed territory IDs in localStorage, not cookies. Disabling it removes that record. No device location is requested. Persistent device records are not shared team history. The map tile and font providers receive ordinary network requests.

## Boundaries

Draft game polygons come from Boston's Boston in Context by Neighborhood 2025 geographic layer and MassGIS municipal polygons, downloaded October 10, 2026. They are NOT exact Google Maps neighborhood boundaries. Compare the map to Google Maps before approving the board. Seaport uses South Boston Waterfront. Chinatown and Leather District are combined. Longwood is a separate territory; Fenway uses its own source boundary. Harbor Islands are not playable. Municipalities are whole areas, including source island components. Chinatown and Leather District are dissolved into one exterior boundary labeled Chinatown.

- Boston: https://services.arcgis.com/sFnw0xNflSi8J0uh/ArcGIS/rest/services/Boston_in_Context_by_Neighborhood_2025/FeatureServer/1
- Municipalities: https://services1.arcgis.com/hGdibHYSPO59RG1h/ArcGIS/rest/services/Massachusetts_Municipalities/FeatureServer/1
- MassGIS documentation: https://www.mass.gov/info-details/massgis-data-municipalities
- Leaflet 1.9.4: https://leafletjs.com (BSD-2-Clause; license in dist/LEAFLET-LICENSE.txt)
- Detailed map: OpenStreetMap raster tiles with saturation reduced to 55%, slightly brighter tones and softer contrast. The CSS filter affects only the basemap; team territory colors retain their saturation.
- Clean board: local MassGIS land polygons beneath Esri World Light Gray Base tiles at 65% opacity (max native zoom 16; overzoom allowed to 19). Terrain shading has been removed. The grayscale background includes faint streets, parks, and building detail as you zoom in. Attribution is shown on the map. Bold interactive territory labels use polygon centers, with an explicit geometric centroid for Everett; overlapping labels hide until zooming in. Territory dots remain visible unless Hide icons is enabled. Map selection, zoom and game data are shared between both views. View preference is session-only; no extra device storage.

## GitHub Pages

Push this repository to your GitHub repository when ready. In Settings → Pages, choose GitHub Actions; `.github/workflows/pages.yml` deploys the `dist` folder. Enable Pages before running the workflow. Deployment is manual only (workflow_dispatch). Local development changes are not automatically published. All paths are relative, so project Pages URLs work. No domain is needed. Google Sheets edits do not require redeploying; challenge/code/config edits do.

Repository: https://github.com/anselgl/jetlagboston. Development updates are on `codex/boston-showdown`. GitHub Pages must be enabled in repository settings before manually running deployment.

## Connected game sheet

`dist/config.json` connects the compact Google Sheet. Public feeds were verified October 11, 2026: 37 territories, four enabled teams ordered Blue, Red, Yellow, Green, 148 challenge-history rows, 25 unclaimed territories at the latest development check, and no active challenges. This is a verification snapshot; ownership follows subsequent sheet edits. Keep public viewing enabled and editing restricted. The website polls every 30 seconds, although Google may cache responses. Keep Ownership, History, and Instructions tab names unchanged. Team settings are read from Instructions!A37:F41.

## Team count

The compact template uses Instructions!B33 for team count and E38:E41 for display names and B38:B41 for colors. Hidden permanent IDs keep team identities intact. The current sheet uses editable color names in Slot; repeated renames of recorded dropdown selections require the optional synchronization script or manual aliases. Current Owner, challenge headings and History names reference Instructions. See [the compact-sheet guide](docs/COMPACT-SHEET.md) for exact ranges, migration and the settings CSV URL. Older sheets are still supported; the following paragraphs describe the legacy Setup/Teams layout.

Import the player template into a NEW Google spreadsheet to preserve your current game records. In Setup, B3 chooses 2–4 teams; the first N entries on Teams are enabled. Ownership dropdowns, overview and combined History change automatically. Four prepared challenge tabs retain separate team records. Use only enabled team tabs. Choose the count before starting; lowering it does not erase existing claims or attempts. Keep the Teams rows in their original order and the existing challenge tab names unchanged. Edit the Team and Color cells on Teams to change the website names and colors. Colors use #RRGGBB hexadecimal values, such as #F3CE3E for yellow. Original Blue, Red, Green and Purple records are recognized by their corresponding row and displayed using the new name; new dropdown selections use the new name. The site does not rewrite existing spreadsheet cells or rename tabs. If renaming a team again after recording claims under a custom name, add an optional Aliases column on Teams listing that previous name (separate multiple names with |), so those records remain recognized after reload. Team matching ignores capitalization. Avoid names that collide with another row or its original name.

The website reads `teamsCsvUrl` on every refresh, then validates Ownership and History against the enabled teams before applying all three together. Invalid entries retain the last valid board. `teamsFeedOptional` supports legacy sheets without a Teams tab (Google sometimes returns the first tab when a requested tab is missing). Once a valid Teams feed loads, errors are surfaced. A newly imported spreadsheet needs its new document ID connected in config.json. The current shared sheet has not been changed. For legacy imports, check that the ownership dropdown source converted to Teams!D2:D5 and responds to Setup!B3. For compact imports, follow docs/COMPACT-SHEET.md.

The currently configured sheet is https://docs.google.com/spreadsheets/d/18C68PbYca263Ttn2C5XerPtxhUy82PFIAbnAcxfqL-E/edit. Team settings are required (teamsFeedOptional=false). Instructions!B33 controls the enabled team count; Instructions!A37:F41 supplies team settings, including permanent IDs. The website rereads these settings every 30 seconds.

The board opens directly on the map with a compact heading and the updated ticket logo. The former intro artwork remains in the inert `intro-artwork` HTML template. Scores and sheet/device controls follow the board. Selection emphasizes only the territory outline, with no rectangular label or polygon focus border.
Milton is a whole municipality using the same MassGIS layer. The new template includes Milton and Longwood in Ownership and all four team tabs, with 148 combined History rows when four teams are enabled.

The clean board uses `data/clean-land.geojson`, a MassGIS municipal polygon snapshot (351 towns, simplified to 0.00003 degrees) from the same municipal service above. It provides pale land over gray water beneath a 65% opacity Esri World Light Gray Base layer, adding faint grayscale streets, parks, and building detail without terrain shading. Refresh this snapshot independently of the game territory boundaries.

Team display names now follow the Slot column. For future renames to update existing spreadsheet selections automatically, see [the one-time team-name sync setup](docs/TEAM-NAME-SYNC.md). Permanent hidden IDs remain unchanged.

## Release status

The current development version is prepared for manual GitHub Pages deployment. Merge the development branch into main, choose GitHub Actions under Settings → Pages, then manually run Publish Jetlag Boston Blitz on main. Pushing this branch does not deploy. The published site and its challenge files will be publicly accessible. Cards remain demonstration content until replaced; a playable game still needs final challenges and a reset of sample claims/history. The optional team-name synchronization script is supplied but has not been installed in the shared sheet.
