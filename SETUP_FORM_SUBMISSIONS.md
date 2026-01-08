# 📋 How to Enable Form Submissions

Your NHS Hours Tracker is currently in **read-only mode**. To enable students to submit hours through the form, you need to set up a Google Apps Script web app.

## ✅ Step-by-Step Setup (5 minutes)

### 1. Open Google Apps Script
1. Go to your Google Sheet: https://docs.google.com/spreadsheets/d/12xjBJY7Rg1TClIu1qSwEiIANwrXiC3wuD9iyVTKcwFI
2. Click **Extensions** → **Apps Script**

### 2. Add the Script
Delete any existing code and paste this:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
    var data = JSON.parse(e.postData.contents);
    
    // Check if name already exists and update, or add new row
    var values = sheet.getDataRange().getValues();
    var found = false;
    
    for (var i = 1; i < values.length; i++) {
      if (values[i][0].toLowerCase() === data.name.toLowerCase()) {
        // Update existing row
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
      // Add new row
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

function doGet(e) {
  return ContentService.createTextOutput('NHS Hours API is running');
}
```

### 3. Deploy the Web App
1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ next to "Select type" → Choose **Web app**
3. Configure:
   - **Description**: NHS Hours Submission API
   - **Execute as**: Me
   - **Who has access**: Anyone
4. Click **Deploy**
5. Click **Authorize access** and sign in with your Google account
6. Review permissions and click **Allow**

### 4. Copy the URL
After deployment, you'll see a **Web app URL** that looks like:
```
https://script.google.com/macros/s/AKfycbz.../exec
```
**Copy this entire URL!**

### 5. Update the Code
1. Open: `project/src/lib/googleSheets.ts`
2. Find line 12 where it says:
   ```typescript
   const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec';
   ```
3. Replace the entire URL with your copied URL:
   ```typescript
   const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz.../exec';
   ```
4. Save the file

### 6. Test It!
1. Refresh your website
2. Go to "Submit Hours"
3. The warning message should be gone
4. Fill out the form and submit
5. Check your Google Sheet - the data should appear!

## 🎉 Done!
Students can now submit their hours through the form, and the data will automatically sync with your Google Sheet and appear on the leaderboard!

---

## 🔧 Troubleshooting

**"Form submission not yet configured" still showing?**
- Make sure you replaced the ENTIRE URL including `https://` and `/exec`
- Check that there are no extra spaces or quotes
- Save the file and refresh the website

**Form submits but data doesn't appear?**
- Check the Apps Script execution log: Extensions → Apps Script → Executions
- Make sure your sheet is named "Sheet1" (case-sensitive)
- Verify the sheet has the headers: Name, Grade, Inducted, Summer Hours, Chapter Hours, Total Hours

**Authorization errors?**
- When deploying, make sure you clicked "Authorize access" and signed in
- The account you use should have edit access to the spreadsheet

Need help? Contact a GitHub Copilot or check the Apps Script logs for errors!
