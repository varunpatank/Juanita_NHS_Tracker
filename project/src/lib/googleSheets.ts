// Google Sheets API Configuration
// All of these live in project/.env (which is gitignored) so they stay out of
// the repo. See .env.example for the variable names.
const GOOGLE_SHEETS_API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
const SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID;
const SHEET_NAME = 'Sheet1';

// Google Apps Script Web App URL for writing data.
// Deploy: Apps Script editor > Deploy > Manage deployments > New version,
// then put the /exec URL in .env as VITE_APPS_SCRIPT_URL.
const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL;

// Member hours tracking interface (for leaderboard)
// Columns: Name | Grade | Inducted | Summer Hours | Chapter Hours | Other Hours | Total Hours
export interface MemberHours {
  id: string;
  name: string;
  grade: string;
  inducted: boolean;
  summerHours: number;
  chapterHours: number;
  otherHours: number;
  totalHours: number;
}

export interface HoursSubmission {
  name: string;
  grade: string;
  summerHours: number;
  chapterHours: number;
  otherHours: number;
  inducted: string;
  // New detail fields (written to columns H-M)
  organization: string;
  activity: string;
  serviceDate: string;
  photoShows: string;
  supervisor: string;
  supervisorContact: string;
}

/**
 * Fetches all members from Google Sheets (for leaderboard)
 * Sheet format: Name | Grade | Inducted | Summer Hours | Chapter Hours | Other Hours | Total Hours
 */
export async function fetchMembers(): Promise<MemberHours[]> {
  if (!GOOGLE_SHEETS_API_KEY || !SPREADSHEET_ID) {
    console.error('Missing VITE_GOOGLE_SHEETS_API_KEY or VITE_SPREADSHEET_ID in project/.env');
    return [];
  }

  try {
    const range = `${SHEET_NAME}!A:G`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${GOOGLE_SHEETS_API_KEY}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`Failed to fetch members: ${response.statusText}`);
    }
    
    const data = await response.json();
    const rows = data.values || [];
    
    // Skip header row and convert to objects
    // Columns: Name | Grade | Inducted | Summer Hours | Chapter Hours | Other Hours | Total Hours
    return rows.slice(1).map((row: string[], index: number) => ({
      id: `member-${index + 2}`,
      name: row[0] || '',
      grade: row[1] || '',
      inducted: (row[2] || '').toLowerCase() === 'yes',
      summerHours: parseFloat(row[3]) || 0,
      chapterHours: parseFloat(row[4]) || 0,
      otherHours: parseFloat(row[5]) || 0,
      totalHours: parseFloat(row[6]) || 0
    })).filter((member: MemberHours) => member.name.trim() !== '');
  } catch (error) {
    console.error('Error fetching members:', error);
    return [];
  }
}

/**
 * Submits hours to Google Sheets via Apps Script
 * Returns true if successful, throws error otherwise
 */
export async function submitHours(submission: HoursSubmission): Promise<boolean> {
  // If Apps Script URL is not configured, throw helpful error
  if (!APPS_SCRIPT_URL) {
    throw new Error('Submissions are not configured. Set VITE_APPS_SCRIPT_URL in project/.env and rebuild.');
  }

  try {
    // Cap summer hours at 8 for total calculation
    const effectiveSummerHours = Math.min(submission.summerHours, 8);
    const totalHours = effectiveSummerHours + submission.chapterHours + submission.otherHours;
    
    const payload = {
      name: submission.name,
      grade: submission.grade,
      inducted: submission.inducted,
      summerHours: submission.summerHours,
      chapterHours: submission.chapterHours,
      otherHours: submission.otherHours,
      totalHours: totalHours,
      organization: submission.organization,
      activity: submission.activity,
      serviceDate: submission.serviceDate,
      photoShows: submission.photoShows,
      supervisor: submission.supervisor,
      supervisorContact: submission.supervisorContact
    };

    // Use GET with query params for Apps Script (more reliable for CORS)
    const queryString = new URLSearchParams({
      action: 'submit',
      data: JSON.stringify(payload)
    }).toString();
    
    const response = await fetch(`${APPS_SCRIPT_URL}?${queryString}`, {
      method: 'GET',
      mode: 'no-cors' // Apps Script redirects cause CORS issues, use no-cors
    });

    // With no-cors, we can't read the response, but if we got here without error, assume success
    return true;
  } catch (error) {
    console.error('Error submitting hours:', error);
    throw new Error('Failed to submit. Check your internet connection and try again.');
  }
}

/**
 * Check if the Apps Script is configured
 */
export function isWriteEnabled(): boolean {
  return Boolean(APPS_SCRIPT_URL);
}

// ============================================
// GOOGLE APPS SCRIPT CODE (v6 - detail history, no Last Updated column)
// ============================================
// Paste into Extensions > Apps Script, then Deploy > Manage deployments >
// edit the existing deployment > Version: "New version" > Deploy.
// Sheet1 columns:
//   A Name | B Grade | C Inducted | D Summer | E Chapter | F Other | G Total
//   H Organization | I Activity | J Date of Service | K Photo Shows
//   L Supervisor | M Supervisor Contact
// Each detail column keeps a history: the newest entry is first, older
// entries follow after " | ", so nothing a member submitted is ever lost.
/*

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

*/
