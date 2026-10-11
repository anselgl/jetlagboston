# Compact Google Sheets template

Import [the compact template](../dist/templates/Jetlag-Boston-Blitz-Compact-Template.xlsx) into a **new** Google spreadsheet using File → Import → Upload → Replace spreadsheet. The existing connected spreadsheet is unaffected.

This template has eight tabs: Game overview, Ownership, Blue, Red, Yellow, Green, History, and Instructions. Each overview summary row has a continuous outside border. Setup and Teams have been combined into Instructions, below the usage guide.

## Editable settings

- Instructions!B33: choose 2–4 teams.
- Instructions!E38:E41: editable slot/team names; these are what the website displays.
- Instructions!B38:B41: six-digit hexadecimal colors, such as `#F3CE3E` for yellow.
- Instructions!D38:D41: optional previous custom names, separated by `|`.

Keep the four team rows in their original order and preserve the challenge tab names. Enabled is calculated in C38:C41. Column E shows the fixed gameplay slots, Team 1 through Team 4. Permanent IDs (`team-1` through `team-4`) are hidden in F38:F41; dropdown helpers are hidden in column G. Ownership dropdowns reference Instructions!G38:G41.

The current shared sheet uses editable color names in Slot. See [team-name synchronization](TEAM-NAME-SYNC.md) to propagate future renames through existing dropdown selections automatically. The original downloadable template used fixed slots rather than editable team names. Current Owner, overview names, challenge-tab headings and History display names all reference Instructions. Renaming a team repeatedly therefore leaves its ownership, locks and challenge history intact. Aliases are only needed when importing older records that contain custom names. Hidden Team ID fields in the challenge tabs and History preserve identity for the website. Do not change those IDs.

The workbook retains the earlier template's fictional claims and locks, with Purple renamed Yellow. It does not copy the current live Google Sheet. Clear Ownership!B2:C38 before playing. To carry over existing ownership, select the matching fixed slot for each old team name (Blue is Team 1, Red Team 2, Yellow Team 3, and Green Team 4); do not paste old names into the new claim dropdowns. Challenge statuses and reveal numbers can be copied into the corresponding team tab's B:C player fields. Check dropdowns and formulas after Google Sheets import.

## Connecting the website

Send the new spreadsheet link after import. Update `sheetUrl`, `ownershipCsvUrl`, `historyCsvUrl`, and `teamsCsvUrl` together in `dist/config.json`. Ownership and History keep their existing names. The team feed must read just the settings table, including its header:

```text
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/gviz/tq?tqx=out%3Acsv&sheet=Instructions&range=A37%3AF41&headers=1
```

The team settings feed includes Team, Color, Enabled, Aliases, Slot, and Team ID. The website uses Team ID for identity and Slot for display when that column is present; Team remains a legacy alias. Slot resolves gameplay dropdown selections. Yellow keeps permanent ID team-4 while listed third, and Green keeps team-3 while listed fourth. Choosing three teams enables Blue, Red, and Yellow. History also includes a hidden Team ID column, which takes precedence over its display name. The parser remains compatible with the older sheet without Team ID columns. Keep `teamsFeedOptional` false. Do not publish the entire Instructions tab as the team feed, because it includes the usage guide above the table. The current live connection uses the compact spreadsheet’s Instructions!A37:F41 settings range.

## Recovering from invalid edits

The website validates all three feeds before replacing the board. If any feed is invalid, the last successfully loaded board remains visible with its update time and an error. Fix the indicated field and refresh; no server restart is needed. On a fresh page load, there is no previous board to restore.

A red warning banner above the page content displays sheet errors on every tab. An unrecognized ownership team identifies the cell (for example, `Ownership!B2`), territory, and invalid value, with a link to the game sheet. Choose a valid dropdown value or clear the cell. The banner explains whether an older board is being shown or live data has not loaded yet, and disappears after the next successful refresh. The app does not silently discard a bad ownership row because that would make scores and ownership misleading.

Validation messages identify the feed, data row, and field. Data rows count from the CSV header, including that header as row 1. For the settings table, data row 2 corresponds to Instructions row 38. Ownership and History headers are on row 1, so their data-row numbers correspond to sheet rows when there are no blank rows. Missing ownership records are listed by territory name.

Local formula behavior, exported references, borders, dropdowns, hidden columns, and preserved game records have been checked. The imported Google Sheet’s three public CSV feeds were validated on October 11, 2026; manual player dropdown and protection checks remain separate.
