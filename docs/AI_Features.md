# AI Damage Assessment & Triage

## Overview
The AI Damage Assessment feature uses Google's **Gemini 2.5 Flash** vision-language model to automatically analyze user-submitted disaster photos. It helps administrators quickly triage incoming reports, detect fake/prank images, and assign severity scores to prioritize resources effectively.

## Implementation Details

### 1. The AI Service (`backend/src/services/aiService.ts`)
The `aiService` acts as the core intelligence layer using `gemini-2.5-flash` for two main purposes:

**Image Analysis (`analyzeDisasterImage`)**:
- It downloads the image buffer from Cloudinary and passes it to Gemini.
- Outputs a structured JSON response containing:
  - `severityScore` (1-10): The estimated intensity of the disaster.
  - `isFake` (boolean): Flag indicating if the image is a prank, selfie, or unrelated.
  - `tags` (string array): Identified entities (e.g., "smoke", "residential building").
  - `summary` (string): A brief human-readable observation.

**Multilingual Translation (`translateWebReport` & `parseSmsReport`)**:
- Translates incoming emergency descriptions (from the web form or Twilio SMS) from any native local language (e.g., Nepali, Bhojpuri, Hindi, Maithili) directly into English.
- Saves the clean English translation to `description` for universal admin readability, while preserving the exact `rawDescription` text as originally typed by the user.

### 2. Integration into the Reporting Flow (`backend/src/controllers/reportController.ts`)
When a user submits a new disaster report via the `POST /api/reports` endpoint:
1. The image is uploaded to Cloudinary via Multer memory storage (vital for serverless deployments like Vercel).
2. The `aiService` runs asynchronously to analyze the uploaded image URL.
3. The resulting AI metadata (`aiSeverity`, `aiFakeFlag`, `aiTags`, `aiSummary`) is saved directly onto the `Report` Mongoose schema.
4. If the report is classified as real, local push notifications are dispatched to nearby volunteers.

### 3. Admin UI Integration
The frontend admin dashboard (`Manage-Reports.jsx`) visualizes this AI data:
- **AI Triage Badge**: Displays the severity score on a color-coded scale (Green/Yellow/Red).
- **Fake Detection**: A prominent red warning label ("Likely Fake") appears on reports flagged by Gemini as pranks, preventing admins from dispatching resources to false alarms.
- **Detailed Modal**: Admins can click "View" to read Gemini's structural summary and identified tags.

### 4. Automated Spam Queue
Reports flagged by Gemini as fake (`isFake === true`) are automatically separated from the main admin dashboard. The Manage Reports page has two tabbed views:

- **Verified Reports** (default): Shows only legitimate reports. Fake reports are excluded from the main feed and from the stat cards (Total, Pending, Verified, etc.), ensuring that crisis counts are accurate and not inflated by spam.
- **Spam Queue**: A dedicated tab that shows only flagged reports. A red badge on the tab indicates how many spam items are waiting for review. Admins can still open and inspect spam reports if needed.

This ensures that during a real crisis, the admin dashboard is clean and focused entirely on actionable emergencies.

## Environment Variables Required
- `GEMINI_API_KEY`: API key obtained from Google AI Studio.

## Fallbacks & Error Handling
If the Gemini API fails, times out, or the API key is missing, the backend degrades gracefully. The report is still saved to MongoDB, but the AI fields are left null. Reports without AI data are treated as legitimate and always appear in the "Verified Reports" tab. Admins can still manually process these reports without AI insights.
