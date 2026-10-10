# Jetlag: Boston Blitz

A phone-friendly, static territory game for friends, inspired by Jet Lag: The Game. Unaffiliated fan project. All 37 requested territories are included. This first version uses two sample teams, sample ownership, and explicitly marked demonstration challenges. Replace these before playing.

## Preview

Station dots share the MBTA lines toggle, including commuter rail and Silver Line stops. Colors match the routes; transfer stations display each distinct line color. Platforms are grouped into their parent station, and tapping a dot shows the station name and routes. Dots grow as you zoom in. Station locations are bundled from the official MBTA V3 API, downloaded October 10, 2026.

The MBTA lines button toggles subway, Mattapan trolley, Silver Line buses, and commuter rail routes on either map view. It starts off and keeps its current setting when switching views. Tap or hover a route for its name. The local route snapshot comes from the MBTA V3 API, downloaded October 10, 2026; it includes the Green Line Extension. It is a route reference, not live schedules, alerts, or detours. Route geometry is bundled with the site so this overlay does not depend on a live MBTA API request. Detailed territory borders are 3px, with 4.5px locked borders; selecting a territory adds emphasis.

Run `npm start`, then open http://127.0.0.1:4173. Run `npm test` for ownership, CSV, map coverage, and challenge-history checks. No build step or package installation is required. The map library is vendored; street tiles and optional web fonts need internet. System fonts work without the font service.

## Google Sheets setup

Recommended: import `dist/templates/Jetlag-Boston-Blitz-37-Territories.xlsx` into a NEW blank Google spreadsheet using File → Import → Upload → Replace spreadsheet. It includes all 37 territories including Milton and Longwood, four team tabs, automatic History, dropdowns, and warnings. Player fields appear first; IDs and dropdown helpers are hidden on the right. Headers accept capitalization, spaces, hyphens, and underscores; column order is flexible. The example uses four enabled teams and 10 fictional claims or locks. Before playing, clear Ownership!B2:C38 and choose 2–4 teams in Setup!B3. Share with players as Editors and provide the new link to connect Ownership, History, and Teams. After import, check dropdowns, formulas, and hidden columns; Google conversion has not yet been verified. Edit only yellow cells. Keep History automatic and preserve hidden IDs.

The CSV-only alternative below is available if you prefer a minimal sheet:

1. Create a sheet and import `sheets/Ownership.csv` into an Ownership tab. Keep the header names unchanged. Give only players editing access.
2. Use dropdowns for `claimed_by` and `locked_by` with Blue, Red, and blank. Team IDs must match `dist/config.json` exactly. The map owner is locked_by when populated, otherwise claimed_by.
3. Import `sheets/Team-history.csv` into a History tab. Filter by team or duplicate filtered records into separate team tabs. Use statuses Not opened, Active, Succeeded, Failed, Abandoned. Assign a unique increasing reveal_order when opening a challenge. Retrying never changes that order.
4. Add an active-count warning for each team: `=IF(COUNTIFS(History!A2:A,"Blue",History!D2:D,"Active")>1,"WARNING: Multiple active challenges","OK")`. If using individual team tabs with the same columns, use `=IF(COUNTIF(D2:D,"Active")>1,"WARNING: Multiple active challenges","OK")` in a separate cell outside the data table. Use conditional formatting for a red warning. Add a warning for duplicate reveal orders if desired.
5. Publish the Ownership tab to the web as CSV. Set its published CSV URL in `dist/config.json` as ownershipCsvUrl, and the editable sheet link as sheetUrl. Publishing data does not grant editing access. Publish a combined History tab as CSV to enable historyCsvUrl checks on the site. For separate team tabs, build the combined History tab with a formula such as `={Blue!A1:D1;FILTER(Blue!A2:D,Blue!A2:A<>"");FILTER(Red!A2:D,Red!A2:A<>"")}`. Keep published tabs free of unrelated warning cells/columns.
6. The site polls every 30 seconds. Google's published feeds can be cached; this is not guaranteed instant synchronization. Test an edit before playing. Invalid feeds retain the last good board and display an error. On first-load failure with a configured feed, no live game data is loaded and no demo claims are shown.

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
- Clean board: Esri World Terrain Base tiles in grayscale (max native zoom 13; overzoom allowed to 19), without a reference label layer. Minimal coast and land context keeps territory names prominent. Attribution: Esri, USGS, NOAA. Bold interactive territory labels use polygon centers; overlapping labels hide until zooming in. All territory dots remain visible. Map selection, zoom and game data are shared between both views. View preference is session-only; no extra device storage.

## GitHub Pages

Push this repository to your GitHub repository when ready. In Settings → Pages, choose GitHub Actions; `.github/workflows/pages.yml` deploys the `dist` folder. Enable Pages before running the workflow. Deployment is manual only (workflow_dispatch). Local development changes are not automatically published. All paths are relative, so project Pages URLs work. No domain is needed. Google Sheets edits do not require redeploying; challenge/code/config edits do.

Repository: https://github.com/anselgl/jetlagboston. Development updates are on `codex/boston-showdown`. GitHub Pages must be enabled in repository settings before manually running deployment.

## Connected game sheet

`dist/config.json` points to the previously provided Google Sheet. The website expects 37 Ownership rows and is awaiting the replacement spreadsheet that includes Longwood. Until its link is connected, the current feed may report missing territory rows. Keep public viewing enabled and player editing restricted. The website polls every 30 seconds, although Google may cache responses. Keep the Ownership, History, and Teams tab names unchanged.

## Team count

Import the player template into a NEW Google spreadsheet to preserve your current game records. In Setup, B3 chooses 2–4 teams; the first N entries on Teams are enabled. Ownership dropdowns, overview and combined History change automatically. Four prepared challenge tabs retain separate team records. Use only enabled team tabs. Choose the count before starting; lowering it does not erase existing claims or attempts. Keep team IDs and tab names unchanged. Change colors on Teams as #RRGGBB hex values.

The website reads `teamsCsvUrl` on every refresh, then validates Ownership and History against the enabled teams before applying all three together. Invalid entries retain the last valid board. `teamsFeedOptional` supports the current older sheet without a Teams tab (Google sometimes returns the first tab when a requested tab is missing). Once a valid Teams feed loads, errors are surfaced. A newly imported spreadsheet needs its new document ID connected in config.json. The current shared sheet has not been changed. After import, check that the ownership dropdown source converted to Teams!D2:D5 and responds to Setup!B3.

The currently configured sheet is https://docs.google.com/spreadsheets/d/1VxpU2ZcbeVWVpwySdY7uaqdYacF8Ip01crg3k9ZfhYs/edit. Teams is required for this workbook (teamsFeedOptional=false). Setup!B3 controls the enabled team count through the Teams tab; the website rereads it every 30 seconds.

The board opens directly on the map with a compact heading and a miniature ticket logo. The former intro artwork remains in the inert `intro-artwork` HTML template. Scores and sheet/device controls follow the board. Selection emphasizes only the territory outline, with no rectangular label or polygon focus border.
Milton is a whole municipality using the same MassGIS layer. The new template includes Milton and Longwood in Ownership and all four team tabs, with 148 combined History rows when four teams are enabled.
