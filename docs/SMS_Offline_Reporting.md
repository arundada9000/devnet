# SMS Offline Reporting

## Overview
Internet connectivity is often the first casualty during a natural disaster. To ensure that victims can still request help while offline, Sajilo Sahayata implements an SMS fallback reporting system using Twilio and Google's Gemini AI. Users can text an emergency description to a designated Twilio number, which translates the SMS into a structured database report and dispatches volunteers.

## Implementation Details

### 1. Twilio Webhook Configuration (`backend/src/routes/smsRoutes.ts`)
We expose a public POST endpoint `/api/webhook/sms` to receive incoming webhook payloads from Twilio whenever a text message is sent to our Twilio number.
- **Validation**: In production environments, the endpoint uses `twilio.webhook({ validate: true })` middleware to verify the cryptographic `X-Twilio-Signature`. This prevents malicious actors from spoofing SMS requests.

### 2. Natural Language Extraction (`backend/src/services/aiService.ts`)
Raw SMS messages are unstructured (e.g., *"Help, massive flood swept away the bridge at Pokhara"*). We use the `parseSmsReport` function to pass the raw string to Gemini 2.5 Flash with instructions to act as an Emergency Dispatcher.
- The AI extracts the disaster `type` (mapped to our allowed enums like "flood", "fire", "landslide").
- It parses out the `locationName` (e.g., "Pokhara").
- It generates a clean `description`.

### 3. Geocoding with Nominatim (`backend/src/controllers/smsController.ts`)
After the AI extracts a `locationName`, we convert it to real GPS coordinates so the report pins accurately on the admin map (instead of defaulting to Kathmandu).

- The system queries **OpenStreetMap's Nominatim API**: `https://nominatim.openstreetmap.org/search?q={locationName}, Nepal&format=json&limit=1`
- If a match is found, the returned `lat`/`lon` are used as the report's `location.coordinates`.
- If geocoding fails (network error, unrecognized place name), the system falls back to default Kathmandu coordinates (`27.7172, 85.3240`).
- A custom `User-Agent: SajiloSahayata/1.0` header is sent per Nominatim's usage policy.

### 4. Database, Threading & Push Dispatch (`backend/src/controllers/smsController.ts`)
Once parsed and geocoded:
1. The system checks if there is already an active, unresolved report (`pending`, `verified`, or `working`) from that exact phone number.
2. **Conversation Threading**: If an active report exists, the new SMS text is intelligently appended to the existing report's `smsThread` array instead of creating a duplicate report marker. This prevents dashboard spam if a victim sends multiple follow-up texts.
3. **New Reports**: If no active report exists, a new `Report` document is created in MongoDB with the geocoded coordinates. The `reportedByPhone` field stores the sender's phone number extracted from the Twilio `From` payload.
4. A system-wide Push Notification is instantly dispatched to all registered admins and nearby volunteers via `sendPushToAll`, alerting them to the offline request. The push notification includes deep-link query parameters so clicking it focuses the exact incident on the map.
5. A TwiML (Twilio Markup Language) response is generated and sent back to the user, confirming receipt: *"Emergency reported successfully. Help is on the way."* or *"Update added to your existing report."*

### 5. Admin SMS Reply (`POST /api/webhook/sms/reply`)
Admins can send custom text messages directly back to victims from the dashboard:

- In the Report Details Modal, if a report has a `reportedByPhone` field, a **"Reply via SMS"** button appears next to the phone number.
- Clicking it expands an inline textarea where the admin types a custom message (e.g., *"Stay put, rescue team arriving in 10 minutes"*).
- The message is sent through Twilio's Messaging Service using the `POST /api/webhook/sms/reply` endpoint, which is protected by `authenticateToken` and `requireAdmin` middleware.
- The controller instantiates a Twilio client and calls `client.messages.create()` with the victim's phone and the admin's message.

### 6. Admin UI Integration
In the Admin Dashboard (`Manage-Reports.jsx`):
- SMS-originated reports are fully integrated into the main feed alongside web reports.
- When an admin views the details of an SMS report, a special **"Reported via SMS"** badge appears, displaying the user's phone number as a clickable `tel:` link for immediate dispatch calling.
- The **"Reply via SMS"** button and inline compose form appear directly within the modal.

## Environment Variables Required
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_MESSAGING_SERVICE_SID`
- `GEMINI_API_KEY` (for parsing)

## Local Testing
When running locally (`NODE_ENV=development`), Twilio validation is bypassed. Admins can simulate an SMS webhook using PowerShell or cURL:
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/webhook/sms" -Method POST -Body @{ From="+9779811420975"; Body="Massive landslide blocking the highway near Pokhara." }
```

The expected response is HTTP 200 with TwiML XML:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response><Message>Emergency reported successfully. Help is on the way. - Sajilo Sahayata</Message></Response>
```
