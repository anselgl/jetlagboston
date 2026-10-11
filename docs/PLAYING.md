# Playing Jetlag: Boston Blitz

The website is your map and challenge viewer. Google Sheets is the shared record: players make all game updates there. The website does not record a claim, lock, reveal, or challenge outcome for you.

## Before starting

1. Have the organizer replace every demonstration challenge and review all territory boundaries.
2. Use the [37-territory workbook](../dist/templates/Jetlag-Boston-Blitz-37-Territories.xlsx), choose 2–4 teams in Setup!B3, and set team names and hexadecimal colors on Teams. See the [README](../README.md#team-count) for renaming rules.
3. Clear the fictional Claimed by and Locked by values. Reset each team's challenge rows to Not opened with blank reveal orders. Keep the combined History tab automatic and preserve hidden territory IDs.
4. Confirm that every player can edit the sheet, the website loads the public feeds, and an ownership edit appears after refreshing. Google may delay updates.

## Claiming and locking

Leave transit and reach a public outdoor location inside the territory boundary. The first team to arrive claims it by recording its team in Claimed by.

Completing the challenge locks the territory. Record the completing team in Locked by. This overrides Claimed by, including when stealing another team's unlocked territory. Arriving in an already claimed territory alone does not steal it. Locked territories cannot be stolen.

The map and scores use Locked by when present; otherwise they use Claimed by. Current scores count each owned territory as one point. Confirm final scoring with your organizer.

## Opening a challenge

1. Select the territory on the map or Territories page, then choose Reveal challenge.
2. Select your team. The dropdown uses its sheet color with a pale background.
3. Confirm that you have arrived outdoors and resolved your previous challenge.
4. Press Open challenge card, then immediately record the next unique reveal order and Active status in your team tab.
5. Record Succeeded, Failed, or Abandoned when done. Resolve the current challenge before opening another.

The site checks the most recently loaded history. An unresolved active challenge elsewhere, multiple active challenges, a prohibited retry, or another team's lock blocks the reveal. Refresh the site after correcting the sheet if needed.

Retry a failed or abandoned challenge only when the card permits it and you have not opened any later challenge. Preserve its original reveal order when retrying. Viewing a previously revealed card for reference does not reactivate a challenge.

## Using the board

- Clean board keeps background details faint; Detailed map shows more local context. Zoom in to see smaller territories.
- MBTA lines shows subway, Mattapan, Silver Line, and commuter rail routes and stations. It is a planning reference; check current service and schedules separately.
- Hide icons removes territory labels, dots, and locks while retaining colored polygons and borders.
- Tap the arrow on the green territory panel to collapse it and bring scores closer. Tap Show territory panel to reopen it. Choosing a territory also reopens the panel.
- Territories mixes neighborhoods and municipalities alphabetically. Choose any combination of Unclaimed, Claimed, and Locked filters. Claimed excludes locked territories; selecting all three shows everything.
- Phone layouts place controls below the map. The same site adapts automatically to your screen width.

Remember revealed cards on this device is optional and off by default. It uses localStorage, not cookies, and does not synchronize between teammates. Arrival confirmations and challenge concealment use the honor system; static challenge files are publicly discoverable.
