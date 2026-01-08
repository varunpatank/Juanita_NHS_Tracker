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
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzFY4v--dmcDAap_8QdDX6u1dKBXXqK5oHLj6zwTK9w-t586lV7u5chjuE8ugpbeS08lA/exec'; // Replace with your actual URL

// Member hours tracking interface (for leaderboard)
// Columns: Name | Grade | Inducted | Summer Hours | Chapter Hours | Total Hours
export interface MemberHours {
  id: string;
  name: string;
  grade: string;
  inducted: boolean;
  summerHours: number;
  chapterHours: number;
  totalHours: number;
}

export interface HoursSubmission {
  name: string;
  grade: string;
  summerHours: number;
  chapterHours: number;
  inducted: string;
}

/**
 * Fetches all members from Google Sheets (for leaderboard)
 * Sheet format: Name | Grade | Inducted | Summer Hours | Chapter Hours | Total Hours
 */
export async function fetchMembers(): Promise<MemberHours[]> {
  try {
    const range = `${SHEET_NAME}!A:F`;
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
    // Columns: Name | Grade | Inducted | Summer Hours | Chapter Hours | Total Hours
    return rows.slice(1).map((row: string[], index: number) => ({
      id: `member-${index + 2}`,
      name: row[0] || '',
      grade: row[1] || '',
      inducted: (row[2] || '').toLowerCase() === 'yes',
      summerHours: parseFloat(row[3]) || 0,
      chapterHours: parseFloat(row[4]) || 0,
      totalHours: parseFloat(row[5]) || 0
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
    const totalHours = submission.summerHours + submission.chapterHours;
    
    const payload = {
      name: submission.name,
      grade: submission.grade,
      inducted: submission.inducted,
      summerHours: submission.summerHours,
      chapterHours: submission.chapterHours,
      totalHours: totalHours
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
// GOOGLE APPS SCRIPT CODE (UPDATED v2)
// ============================================
// Copy this code to your Google Sheet's Apps Script editor:
// (Extensions > Apps Script)
// IMPORTANT: After pasting, click Deploy > New Deployment again!
/*

function doGet(e) {
  try {
    // Handle submission via GET (for CORS compatibility)
    if (e.parameter.action === 'submit' && e.parameter.data) {
      var data = JSON.parse(e.parameter.data);
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
      
      // Check if name already exists
      var values = sheet.getDataRange().getValues();
      var found = false;
      
      for (var i = 1; i < values.length; i++) {
        if (values[i][0] && values[i][0].toString().toLowerCase() === data.name.toLowerCase()) {
          // Update existing row - ADD new hours to existing hours
          var existingSummer = parseFloat(values[i][3]) || 0;
          var existingChapter = parseFloat(values[i][4]) || 0;
          var newSummer = existingSummer + parseFloat(data.summerHours);
          var newChapter = existingChapter + parseFloat(data.chapterHours);
          var newTotal = newSummer + newChapter;
          
          sheet.getRange(i + 1, 1, 1, 6).setValues([[
            data.name,
            data.grade,
            data.inducted,
            newSummer,
            newChapter,
            newTotal
          ]]);
          found = true;
          break;
        }
      }
      
      if (!found) {
        // Add new row
        sheet.appendRow([
          data.name,
          data.grade,
          data.inducted,
          parseFloat(data.summerHours) || 0,
          parseFloat(data.chapterHours) || 0,
          parseFloat(data.totalHours) || 0
        ]);
      }
      
      return ContentService.createTextOutput(JSON.stringify({success: true}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({status: 'NHS Hours API is running'}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
    var data = JSON.parse(e.postData.contents);
    
    var values = sheet.getDataRange().getValues();
    var found = false;
    
    for (var i = 1; i < values.length; i++) {
      if (values[i][0] && values[i][0].toString().toLowerCase() === data.name.toLowerCase()) {
        sheet.getRange(i + 1, 1, 1, 6).setValues([[
          data.name,
          data.grade,
          data.inducted,
          data.summerHours,
          data.chapterHours,
          data.totalHours
        ]]);
        found = true;
        break;
      }
    }
    
    if (!found) {
      sheet.appendRow([
        data.name,
        data.grade,
        data.inducted,
        data.summerHours,
        data.chapterHours,
        data.totalHours
      ]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

*/
