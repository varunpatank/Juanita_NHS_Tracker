var SPREADSHEET_ID = 'PASTE_YOUR_SPREADSHEET_ID_HERE';
var SHEET_NAME = 'Sheet1';
var COLS = 13; // A..M
var SEP = ' | ';

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
    // can stretch far past the real data if any stray cell was ever touched.
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

    // Detail history, newest first
    var org = (data.organization || '').toString().trim();
    var act = (data.activity || '').toString().trim();
    var when = (data.serviceDate || '').toString().trim();
    var shows = (data.photoShows || '').toString().trim();
    var sup = (data.supervisor || '').toString().trim();
    var supc = (data.supervisorContact || '').toString().trim();

    if (targetRow) {
      // Existing member: add hours on, and push details onto the front
      var cur = sheet.getRange(targetRow, 1, 1, COLS).getValues()[0];
      summer += num(cur[3]);
      chapter += num(cur[4]);
      other += num(cur[5]);
      if (!grade) grade = cur[1];
      if (!inducted) inducted = cur[2];

      org = prepend(org, cur[7]);
      act = prepend(act, cur[8]);
      when = prepend(when, cur[9]);
      shows = prepend(shows, cur[10]);
      sup = prepend(sup, cur[11]);
      supc = prepend(supc, cur[12]);
    } else {
      targetRow = lastRow + 1; // first empty row under the real data
    }

    var total = Math.min(summer, 8) + chapter + other; // summer capped at 8

    sheet.getRange(targetRow, 1, 1, COLS).setValues([[
      name, grade, inducted, summer, chapter, other, total,
      org, act, when, shows, sup, supc
    ]]);

    return {success: true, row: targetRow, totalHours: total};
  } finally {
    lock.releaseLock();
  }
}

// Newest entry first, previous history kept behind it.
function prepend(fresh, existing) {
  var old = (existing === null || existing === undefined)
    ? ''
    : existing.toString().trim();
  if (!fresh) return old;
  if (!old) return fresh;
  return fresh + SEP + old;
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
