# Editable team slot names

The website displays the Slot values in Instructions!E38:E41. Color comes from B38:B41. Identity remains the hidden Team ID in F38:F41. Current names, the Team column, original color names, numbered slots, and recorded Aliases are accepted when resolving ownership. History uses its permanent Team ID even if the displayed name changes.

Changing a dropdown source alone does not rewrite earlier Google Sheets selections. For repeated renames to update the spreadsheet and preserve prior names automatically, install the bound script [sheets/team-names.gs](../sheets/team-names.gs) as the spreadsheet owner:

1. In the Google Sheet, open Extensions → Apps Script.
2. Paste the script into the editor and save it.
3. Select `installTeamNameSync` and click Run. Approve the requested spreadsheet/trigger permissions.
4. Afterwards, edit only the Slot cells in Instructions!E38:E41 to rename teams.

The script synchronizes the Team column, retains prior labels in Aliases, and replaces matching Claimed By and Locked By entries. Existing spreadsheet formulas then update Current Owner, overview and challenge headings. It does not change permanent IDs, team order, challenge statuses or reveal numbers. An owner-run edit trigger is used so protected formula/settings areas can be updated. Names must be unique and cannot reuse another team's historical alias or contain `|`.

The current color slot labels already work without installing the script. Without it, old custom names must be retained manually in Aliases when renaming a slot. Installing the script requires the owner's Google authorization; it has not been installed by the assistant.
