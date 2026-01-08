# Google Sheets Setup Guide

This guide will help you set up Google Sheets integration for the NHS Hours Tracker.

## Quick Start

### Step 1: Create Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it **"NHS Hours Tracker"**
4. In row 1, add these column headers (A through G):
   - **A1**: Student Name
   - **B1**: Grade
   - **C1**: Hours
   - **D1**: Activity
   - **E1**: Date
   - **F1**: Status
   - **G1**: Timestamp

### Step 2: Get Your Spreadsheet ID

1. Look at your Google Sheet URL:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID_HERE/edit
   ```
2. Copy the `YOUR_SPREADSHEET_ID_HERE` part (the long string between `/d/` and `/edit`)
3. Save it for later

### Step 3: Make Your Sheet Publicly Readable

1. Click the **Share** button in the top right
2. Click **"Change to anyone with the link"**
3. Set permission to **"Viewer"**
4. Click **Done**

> ⚠️ **Note**: This allows read-only access. Your data is safe from unauthorized edits.

### Step 4: Get Google Sheets API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select an existing one)
   - Click the project dropdown at the top
   - Click **"New Project"**
   - Name it "NHS Hours Tracker"
   - Click **Create**

3. Enable Google Sheets API:
   - Click **"Enable APIs and Services"**
   - Search for **"Google Sheets API"**
   - Click on it
   - Click **"Enable"**

4. Create an API Key:
   - Go to **"Credentials"** in the left sidebar
   - Click **"Create Credentials"** → **"API Key"**
   - Copy your API key
   - (Optional but recommended) Click **"Restrict Key"**:
     - Under "API restrictions", select "Restrict key"
     - Check only **"Google Sheets API"**
     - Click **Save**

### Step 5: Configure Your App

1. Open `src/lib/googleSheets.ts` in your code editor
2. Replace these values:
   ```typescript
   const GOOGLE_SHEETS_API_KEY = 'YOUR_API_KEY_HERE';  // ← Paste your API key
   const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';   // ← Paste your spreadsheet ID
   const SHEET_NAME = 'Hours'; // ← Change if you named your tab differently
   ```

3. Save the file

### Step 6: Test It!

1. Run your app: `pnpm dev`
2. Go to the "Submit Hours" page
3. Fill out the form and click submit
4. Check your Google Sheet - you should see the new entry!

---

## Features

### ✅ What Works Now (Read & Write)

- **Submit hours** → Data appears in Google Sheets
- **View submissions** → Table shows all entries from the sheet
- **Auto-refresh** → Click the refresh button to see updates
- **Status badges** → Color-coded approval status

### ⚠️ What Needs Advanced Setup (Editing)

The **Edit button** currently updates the local table but doesn't save back to Google Sheets. This requires OAuth 2.0 or a service account.

**Two options for enabling edit functionality:**

#### Option A: Google Apps Script (Easier)

1. Open your Google Sheet
2. Go to **Extensions** → **Apps Script**
3. Paste this code:

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Hours');
    const data = JSON.parse(e.postData.contents);
    
    if (data.action === 'update' && data.row) {
      // Update existing row
      const row = data.row;
      sheet.getRange(row, 1, 1, 6).setValues([[
        data.studentName,
        data.grade,
        data.hours,
        data.activity,
        data.date,
        data.status
      ]]);
    } else if (data.action === 'append') {
      // Append new row
      sheet.appendRow([
        data.studentName,
        data.grade,
        data.hours,
        data.activity,
        data.date,
        data.status || 'Pending',
        new Date()
      ]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({success: true}));
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    }));
  }
}
```

4. Click **Deploy** → **New deployment**
5. Select type: **Web app**
6. Set:
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Click **Deploy**
8. Copy the **Web app URL**
9. Update your `googleSheets.ts` to use this URL for writes

#### Option B: OAuth 2.0 (More Secure)

For production use with individual user authentication. See [Google's OAuth 2.0 documentation](https://developers.google.com/identity/protocols/oauth2).

---

## Polling vs Real-Time Updates

### Current Implementation (Polling)

- Data refreshes when you click the refresh button
- You can also set up auto-refresh every X seconds

### To Add Auto-Refresh

Add this to `SubmitHoursPage.tsx`:

```typescript
useEffect(() => {
  // Refresh every 10 seconds
  const interval = setInterval(() => {
    loadSubmissions();
  }, 10000);
  
  return () => clearInterval(interval);
}, []);
```

> ⚠️ **Note**: Be mindful of Google API quotas (60 requests per minute per user).

---

## Troubleshooting

### Error: "Failed to load submissions"

1. Check that your API key is correct
2. Verify the spreadsheet ID
3. Make sure the sheet is publicly readable
4. Check that Google Sheets API is enabled in your project

### Error: "Failed to submit"

1. Verify your API key has write permissions
2. Check that the sheet name matches (`Hours` by default)
3. Make sure the sheet has the correct columns

### Data not appearing

1. Check the browser console for errors
2. Verify your sheet has the correct column headers
3. Try manually adding a row to test the setup

### API Quota Exceeded

- Free tier: 60 requests per minute per user
- Solution: Reduce auto-refresh frequency or upgrade to a paid plan

---

## Security Best Practices

### For Development
- Current setup is fine for testing

### For Production
- Use environment variables for API keys:
  ```typescript
  const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
  ```
- Add API key restrictions in Google Cloud Console
- Consider using a service account for server-side operations
- Don't commit API keys to public repositories

---

## Sample Data

Want to test? Add this sample data to your sheet:

| Student Name | Grade | Hours | Activity | Date | Status | Timestamp |
|-------------|-------|-------|----------|------|--------|-----------|
| John Doe | freshman | 3 | Food bank volunteering | 2026-01-05 | Approved | 2026-01-05T10:00:00 |
| Jane Smith | sophomore | 2.5 | Community cleanup | 2026-01-06 | Pending | 2026-01-06T14:30:00 |
| Mike Johnson | junior | 5 | Tutoring program | 2026-01-04 | Approved | 2026-01-04T16:00:00 |

---

## Need Help?

Check the detailed comments in `src/lib/googleSheets.ts` for more information about each function.
