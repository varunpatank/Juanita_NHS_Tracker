// Google Sheets API Configuration
const GOOGLE_SHEETS_API_KEY = 'AIzaSyBNHlPxx4aXm2EEe4xovwnCrJJNPHJ-di4';
const SPREADSHEET_ID = '12xjBJY7Rg1TClIu1qSwEiIANwrXiC3wuD9iyVTKcwFI';
const SHEET_NAME = 'Sheet1';

// Google Apps Script Web App URL for writing data
// TO CONFIGURE:
// 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/12xjBJY7Rg1TClIu1qSwEiIANwrXiC3wuD9iyVTKcwFI
// 2. Go to Extensions > Apps Script
// 3. Delete any existing code and paste the code from the bottom of this file
// 4. Click Deploy > New Deployment > Web App
// 5. Set "Execute as: Me" and "Who has access: Anyone"
// 6. Click Deploy and copy the URL
// 7. Paste the URL below (it looks like: https://script.google.com/macros/s/...../exec)
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwYTKwI-HXnyxr4iKte0TKWW7NWxIVZPM9AeCodM3s3NGXYcOMJLzoLJo7JzNiB8JcF/exec';

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
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('YOUR_SCRIPT_ID_HERE')) {
    throw new Error('Google Apps Script not configured. Please set up the Apps Script Web App.');
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
  return !APPS_SCRIPT_URL.includes('YOUR_SCRIPT_ID_HERE');
}

// ============================================
// GOOGLE APPS SCRIPT CODE (v5 - detail fields, single sheet)
// ============================================
// Paste into Extensions > Apps Script, then Deploy > Manage deployments >
// edit the existing deployment > Version: "New version" > Deploy.
// Sheet1 columns:
//   A Name | B Grade | C Inducted | D Summer | E Chapter | F Other | G Total
//   H Organization | I Activity | J Date of Service | K Photo Shows
//   L Supervisor | M Supervisor Contact | N Last Updated
/*

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

*/
