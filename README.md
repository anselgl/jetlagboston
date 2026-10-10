# Boston Showdown

A phone-friendly, static territory game for friends, inspired by Jet Lag: The Game. Unaffiliated fan project. All 35 requested territories are included. This first version uses two sample teams, sample ownership, and explicitly marked demonstration challenges. Replace these before playing.

## Preview

Run `npm start`, then open http://127.0.0.1:4173. Run `npm test` for ownership, CSV, map coverage, and challenge-history checks. No build step or package installation is required. The map library is vendored; street tiles and optional web fonts need internet. System fonts work without the font service.

## Google Sheets setup

Recommended: download `dist/templates/Boston-Showdown-Game-Template.xlsx` and import it into Google Sheets using File → Import → Upload → Replace spreadsheet. It contains all 35 territories, ownership dropdowns, Blue and Red challenge tabs, a calculated combined History tab, and warnings. Share it with players as Editors, then publish Ownership and History individually as CSV. Send the editable sheet link and the two CSV links to connect the website. After import, check the dropdowns and warnings in Google Sheets; native conversion has not yet been verified. Only yellow cells are intended for player edits. Keep the published History tab automatic.

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

Draft game polygons come from Boston's Boston in Context by Neighborhood 2025 geographic layer and MassGIS municipal polygons, downloaded October 10, 2026. They are NOT exact Google Maps neighborhood boundaries. Compare the map to Google Maps before approving the board. Seaport uses South Boston Waterfront. Chinatown and Leather District are combined. Fenway and Longwood are combined provisionally to avoid a gap; review Longwood/Kenmore treatment. Harbor Islands are not playable. Municipalities are whole areas, including source island components. Internal seams may remain within combined polygons.

- Boston: https://services.arcgis.com/sFnw0xNflSi8J0uh/ArcGIS/rest/services/Boston_in_Context_by_Neighborhood_2025/FeatureServer/1
- Municipalities: https://services1.arcgis.com/hGdibHYSPO59RG1h/ArcGIS/rest/services/Massachusetts_Municipalities/FeatureServer/1
- MassGIS documentation: https://www.mass.gov/info-details/massgis-data-municipalities
- Leaflet 1.9.4: https://leafletjs.com (BSD-2-Clause; license in dist/LEAFLET-LICENSE.txt)
- Street map: © OpenStreetMap contributors, attribution displayed in map.

## GitHub Pages

Push this repository to your GitHub repository when ready. In Settings → Pages, choose GitHub Actions; `.github/workflows/pages.yml` deploys the `dist` folder. Enable Pages before running the workflow. The workflow runs manually or on pushes to main. All paths are relative, so project Pages URLs work. No domain is needed. Google Sheets edits do not require redeploying; challenge/code/config edits do.

Repository: https://github.com/anselgl/jetlagboston. Initial development is ready to push. GitHub Pages must be enabled in repository settings before deployment.

## Connected game sheet

`dist/config.json` now points to the provided Google Sheet. The Ownership and History tabs were verified readable through Google's CSV query endpoint, so separate published URLs are not currently required. Keep public viewing enabled and player editing restricted. The website polls every 30 seconds, although Google may cache responses. Renaming either tab will break its data URL. This connection was checked against all 35 ownership rows and 70 team-history rows.
