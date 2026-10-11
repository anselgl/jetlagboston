// Bound to the compact workbook. Install once as the spreadsheet owner.
function installTeamNameSync() {
  syncTeamNames();
  const book = SpreadsheetApp.getActiveSpreadsheet();
  if (!ScriptApp.getProjectTriggers().some(t => t.getHandlerFunction() === 'syncTeamNames')) {
    ScriptApp.newTrigger('syncTeamNames').forSpreadsheet(book).onEdit().create();
  }
  book.toast('Slot names now update team names and existing ownership automatically.');
}

function syncTeamNames(event) {
  if (event) {
    const r = event.range;
    if (r.getSheet().getName() !== 'Instructions' || r.getColumn() > 5 || r.getLastColumn() < 5 || r.getRow() > 41 || r.getLastRow() < 38) return;
  }
  const lock = LockService.getDocumentLock();
  lock.waitLock(10000);
  try {
    const book = event ? event.source : SpreadsheetApp.getActiveSpreadsheet();
    const sheet = book.getSheetByName('Instructions');
    const rows = sheet.getRange('A38:F41').getValues();
    const properties = PropertiesService.getDocumentProperties();
    const previous = JSON.parse(properties.getProperty('bostonBlitzTeamNames') || '{}');
    if (event && event.range.getNumRows() === 1 && event.range.getNumColumns() === 1 && event.oldValue !== undefined) {
      previous[rows[event.range.getRow() - 38][5]] = String(event.oldValue).trim();
    }
    const names = rows.map(r => String(r[4]).trim());
    const used = new Set();
    const aliases = new Map();
    const nextAliases = [];
    const original = {'team-1':'Blue','team-2':'Red','team-3':'Green','team-4':'Purple'};
    try {
      rows.forEach((r, i) => {
        const id = String(r[5]), name = names[i];
        if (!original[id] || !name || name.includes('|') || used.has(name.toLowerCase())) throw Error('Use unique, nonempty slot names without |, and preserve hidden Team IDs.');
        used.add(name.toLowerCase());
        const labels = [name, String(r[0]), previous[id], original[id], 'Team ' + (i + 1), ...String(r[3] || '').split('|')].filter(Boolean).map(s => s.trim()).filter(Boolean);
        labels.forEach(label => {
          const key = label.toLowerCase();
          if (aliases.has(key) && aliases.get(key) !== i) throw Error('This name has belonged to another team: ' + label);
          aliases.set(key, i);
        });
        nextAliases.push([...new Set(labels.filter(label => label !== name))].join('|'));
      });
    } catch (error) {
      // Restore edited labels before leaving an invalid configuration behind.
      sheet.getRange('E38:E41').setValues(rows.map(r => [previous[r[5]] || r[0]]));
      book.toast(error.message, 'Team name unchanged', 10);
      throw error;
    }
    const ownership = book.getSheetByName('Ownership');
    const headers = ownership.getRange(1, 1, 1, ownership.getLastColumn()).getValues()[0].map(h => String(h).trim().toLowerCase().replace(/[\s-]+/g, '_'));
    const columns = ['claimed_by','locked_by'].map(h => headers.indexOf(h) + 1);
    if (columns.some(c => c === 0)) throw Error('Ownership must retain Claimed By and Locked By headings.');
    const count = ownership.getLastRow() - 1;
    // Match all prior names before writing, so simultaneous edits cannot cascade between teams.
    const updates = columns.map(c => ({range: ownership.getRange(2, c, count, 1), values: ownership.getRange(2, c, count, 1).getValues().map(([v]) => {
      const i = aliases.get(String(v).trim().toLowerCase());
      return [i === undefined ? v : names[i]];
    })}));
    sheet.getRange('A38:A41').setValues(names.map(name => [name]));
    sheet.getRange('D38:D41').setValues(nextAliases.map(value => [value]));
    sheet.getRange('E38:E41').setValues(names.map(name => [name]));
    updates.forEach(update => update.range.setValues(update.values));
    properties.setProperty('bostonBlitzTeamNames', JSON.stringify(Object.fromEntries(rows.map((r, i) => [r[5], names[i]]))));
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
}
