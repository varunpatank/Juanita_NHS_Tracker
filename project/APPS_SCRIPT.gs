var SPREADSHEET_ID = '12xjBJY7Rg1TClIu1qSwEiIANwrXiC3wuD9iyVTKcwFI';
var SHEET_NAME = 'Sheet1';
var COLS = 14; // A..N

function doGet(e) {
  try {
    if (e.parameter.action === 'submit' && e.parameter.data) {
      var result = handleSubmit(JSON.parse(e.parameter.data));
      return json(result);
    }
    return json({status: 'NHS Hours API is running'});
  } catch (error) {
    return json({success: false, error: error.toString()});
  }
}

function doPost(e) {
  try {
    return json(handleSubmit(JSON.parse(e.postData.contents)));
  } catch (error) {
    return json({success: false, error: error.toString()});
  }
}

function handleSubmit(data) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000); // stop two submissions racing for the same row
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('Sheet "' + SHEET_NAME + '" not found');

    var name = (data.name || '').toString().trim();
    if (!name) throw new Error('Missing name');

    // Only look at column A to find the last real member row. getDataRange()
    // can stretch far past the real data if any stray cell was ever touched,
    // which is what made appended rows land hundreds of rows down the sheet.
    var lastRow = getLastNameRow(sheet);
    var names = lastRow >= 2
      ? sheet.getRange(2, 1, lastRow - 1, 1).getValues()
      : [];

    var targetRow = 0;
    for (var i = 0; i < names.length; i++) {
      var existing = (names[i][0] || '').toString().trim().toLowerCase();
      if (existing && existing === name.toLowerCase()) {
        targetRow = i + 2;
        break;
      }
    }

    var summer = num(data.summerHours);
    var chapter = num(data.chapterHours);
    var other = num(data.otherHours);
    var grade = data.grade || '';
    var inducted = data.inducted || '';

    if (targetRow) {
      // Existing member: add the new hours onto what is already there
      var cur = sheet.getRange(targetRow, 1, 1, COLS).getValues()[0];
      summer += num(cur[3]);
      chapter += num(cur[4]);
      other += num(cur[5]);
      if (!grade) grade = cur[1];
      if (!inducted) inducted = cur[2];
    } else {
      targetRow = lastRow + 1; // first empty row under the real data
    }

    var total = Math.min(summer, 8) + chapter + other; // summer capped at 8

    sheet.getRange(targetRow, 1, 1, COLS).setValues([[
      name,
      grade,
      inducted,
      summer,
      chapter,
      other,
      total,
      data.organization || '',
      data.activity || '',
      data.serviceDate || '',
      data.photoShows || '',
      data.supervisor || '',
      data.supervisorContact || '',
      new Date()
    ]]);

    return {success: true, row: targetRow, totalHours: total};
  } finally {
    lock.releaseLock();
  }
}

function getLastNameRow(sheet) {
  var max = sheet.getLastRow();
  if (max < 2) return 1;
  var col = sheet.getRange(2, 1, max - 1, 1).getValues();
  for (var i = col.length - 1; i >= 0; i--) {
    if ((col[i][0] || '').toString().trim() !== '') return i + 2;
  }
  return 1; // header only
}

function num(v) {
  var n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
