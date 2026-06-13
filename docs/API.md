# API Reference

**Base URL:** `/api` (prefix all endpoints below)

**Auth Header:** `Authorization: Bearer <token>`

---

## Authentication

### Register a User
```
POST /api/auth/register
Content-Type: application/json
```

**Request:**
```json
{
  "username": "JohnDoe",
  "password": "secret123",
  "phoneNumber": "+9779812345678",
  "latitude": 27.7172,
  "longitude": 83.4567
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "...",
    "username": "JohnDoe",
    "phoneNumber": "+9779812345678",
    "role": "user",
    "localGovName": "Butwal",
    "location": { "type": "Point", "coordinates": [83.4567, 27.7172] }
  }
}
```

**Notes:** `localGovName` is auto-detected from GPS coordinates using GeoJSON boundary matching. Duplicate `phoneNumber` returns 409.

---

### Login
```
POST /api/auth/login
Content-Type: application/json
```

**Request:**
```json
{
  "phone": "+9779812345678",
  "password": "secret123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Notes:** Returns JWT (1h expiry) in both JSON body and httpOnly cookie. 401 for invalid credentials.

---

### Verify Token
```
GET /api/auth/verify
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "user": {
    "_id": "...",
    "username": "JohnDoe",
    "phoneNumber": "+9779812345678",
    "role": "user",
    "localGovName": "Butwal",
    "email": "",
    "gender": "",
    "citizenshipId": "",
    "address": "",
    "createdAt": "2025-08-01T12:00:00.000Z"
  }
}
```

**Notes:** Used by the frontend on app mount to auto-restore session. Passwords excluded from response.

---

### Update Profile
```
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "username": "JohnUpdated",
  "phoneNumber": "+9779812345678",
  "email": "john@example.com",
  "gender": "Male",
  "citizenshipId": "21-0234-214",
  "address": "Butwal-11, Rupandehi"
}
```

**Response (200):**
```json
{
  "message": "Profile updated",
  "user": { ... }
}
```

**Notes:** Only allowed fields are updatable. `localGovName`, `role`, `location` and `password` are excluded from this endpoint.

---

### List All Users (Admin)
```
GET /api/auth/users
Authorization: Bearer <token> (admin)
```

**Response (200):**
```json
[
  {
    "_id": "...",
    "username": "JohnDoe",
    "phoneNumber": "+9779812345678",
    "role": "user",
    "localGovName": "Butwal",
    "createdAt": "..."
  }
]
```

---

### Get User by ID
```
GET /api/auth/users/:id
```

**Response (200):** Single user object (includes password hash — use for server-side only)

---

### Get Users Around Location
```
GET /api/auth/users/around?latitude=27.7172&longitude=83.4567&radius=5000
```

**Response (200):** Array of users within the given radius (meters) using `$near` geospatial query.

---

### Update User Role (Admin)
```
PUT /api/auth/users/:id/role
Authorization: Bearer <token> (admin)
Content-Type: application/json
```

**Request:**
```json
{ "role": "admin" }
```

**Response (200):**
```json
{ "message": "Role updated", "user": { ... } }
```

---

### Delete User (Admin)
```
DELETE /api/auth/users/:id
Authorization: Bearer <token> (admin)
```

**Response (200):**
```json
{ "message": "User deleted successfully" }
```

---

### Get Nearby Volunteers (Admin)
```
GET /api/auth/volunteers/nearby?latitude=27.7172&longitude=85.3240&radius=10
Authorization: Bearer <token> (admin)
```

**Query Parameters:**
| Param | Type | Default | Description |
|---|---|---|---|
| `latitude` | number | required | Latitude of the disaster location |
| `longitude` | number | required | Longitude of the disaster location |
| `radius` | number | 5 | Search radius in kilometers |

**Response (200):** Array of volunteer users within the given radius, sorted by proximity. Each object includes `username`, `phoneNumber`, `skills`, `location`, and `address`.

---

## Reports

### Create Report
```
POST /api/reports
Content-Type: multipart/form-data
```

**Fields:**
| Field | Type | Required | Description |
|---|---|---|---|
| `type` | string | Yes | One of: `fire`, `police`, `flood`, `accident`, `landslide`, `other` |
| `description` | string | Yes | Min 10 characters |
| `location` | string | Yes | JSON stringified `[lng, lat]` array |
| `image` | file | No | JPEG/PNG/GIF, max 5MB |

**Response (201):**
```json
{
  "message": "Report created successfully",
  "report": {
    "_id": "...",
    "type": "fire",
    "description": "Fire at the market area...",
    "location": { "type": "Point", "coordinates": [83.4567, 27.7172] },
    "localGovName": "Butwal",
    "status": "pending",
    "imageUrl": "https://res.cloudinary.com/...",
    "createdAt": "..."
  }
}
```

**Notes:** `localGovName` is auto-detected from the report's GPS coordinates. If no image is provided, `imageUrl` is empty string.

---

### Get All Reports
```
GET /api/reports
```

**Response (200):** Array of all reports, sorted `{ createdAt: -1 }` (newest first).

---

### Get Report by ID
```
GET /api/reports/:id
```

**Response (200):** Single report object. 404 if not found.

---

### Get Report Locations (For Map)
```
GET /api/reportsLocation
```

**Response (200):**
```json
[
  {
    "id": "...",
    "title": "Fire reported",
    "type": "fire",
    "lat": 27.7172,
    "lng": 83.4567,
    "time": "2 hours ago"
  }
]
```

**Notes:** Returns lightweight objects optimized for map markers. Coordinates are normalized (detects `[lng, lat]` vs `[lat, lng]` format).

---

### Change Report Status
```
PUT /api/reports/:id/status
Content-Type: application/json
```

**Request:**
```json
{ "status": "verified" }
```

**Valid statuses:** `pending`, `verified`, `working`, `solved`

**Response (200):**
```json
{ "message": "Report status updated", "report": { ... } }
```

---

### Verify Report (Admin)
```
PUT /api/reports/verify/:id
Authorization: Bearer <token> (admin)
```

**Response (200):**
```json
{ "message": "Report verified", "report": { ... } }
```

**Notes:** Sets `status` to `verified` and records `verifiedBy` as the admin's user ID.

---

### Update Report
```
PUT /api/reports/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Fields:** `type`, `description`, `status`, `location` (JSON array), `image` (file)

**Notes:** If a new image is provided, the old Cloudinary image is deleted.

---

### Delete Report
```
DELETE /api/reports/:id
Authorization: Bearer <token>
```

**Response (200):**
```json
{ "message": "Report deleted successfully" }
```

---

## Alerts

### List All Alerts
```
GET /api/alerts
```

**Response (200):** Array of alerts sorted by `{ timestamp: -1 }`.

---

### Create Alert (Admin)
```
POST /api/alerts
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "title": "⚠️ Flood Warning",
  "description": "Heavy rainfall expected in Butwal area...",
  "type": "flood",
  "location": "Butwal"
}
```

**Valid types:** `fire`, `flood`, `earthquake`, `landslide`, `storm`, `police`, `accident`, `other`

**Response (201):**
```json
{
  "_id": "...",
  "title": "⚠️ Flood Warning",
  "description": "...",
  "type": "flood",
  "location": "Butwal",
  "timestamp": "...",
  "createdBy": "..."
}
```

**Notes:** On creation, automatically broadcasts a push notification to all subscribed users via `sendPushToAll()`.

---

### Update Alert
```
PUT /api/alerts/:id
Authorization: Bearer <token>
```

---

### Delete Alert
```
DELETE /api/alerts/:id
Authorization: Bearer <token>
```

---

## Contacts

### Get All Contact Records
```
GET /api/contacts
```

**Response (200):** Array of all contact records sorted by `{ localGovName: 1, department: 1 }`.

**Structure:**
```json
[
  {
    "_id": "...",
    "localGovName": "Butwal",
    "department": "fire",
    "contacts": [
      { "name": "Fire Station Butwal", "phone": "071-123456", "role": "Chief" }
    ]
  }
]
```

---

### Get Contacts by Location & Department
```
GET /api/contacts/:localGov/:department
```

**Example:** `GET /api/contacts/Butwal/fire`

**Response (200):** Single contact record or 404. Case-insensitive match.

---

### Create Contact Record
```
POST /api/contacts
Content-Type: application/json
```

**Request:**
```json
{
  "localGovName": "Butwal",
  "department": "fire",
  "contacts": [
    { "name": "Fire Station", "phone": "071-123456", "role": "Chief" }
  ]
}
```

**Notes:** Returns 409 if a record for the same `(localGovName, department)` already exists.

---

### Update Contact Record
```
PUT /api/contacts/:id
Content-Type: application/json
```

---

### Delete Contact Record
```
DELETE /api/contacts/:id
```

---

## Location

### Detect GaPa/NaPa from GPS
```
GET /api/location/detect?lat=27.7172&lng=83.4567
```

**Response (200):**
```json
{ "localGovName": "Butwal" }
```

**Notes:** Uses Turf.js `booleanPointInPolygon` against GeoJSON boundary files. Returns `"Unknown"` if no match found.

---

### List Available Locations
```
GET /api/location/available
```

**Response (200):**
```json
["Butwal", "Omsatiya", "Siddharthanagar", "Tillotama"]
```

---

## Safe Zones

### List Active Safe Zones
```
GET /api/safe-zones
```

**Response (200):** Array of safe zones where `isActive: true`, sorted by newest.

**Structure:**
```json
[
  {
    "_id": "...",
    "name": "Butwal Hospital",
    "type": "hospital",
    "location": { "type": "Point", "coordinates": [83.4567, 27.7172] },
    "address": "Butwal-8",
    "phone": "071-123456",
    "isActive": true
  }
]
```

**Types:** `hospital`, `shelter`, `police`, `fire_station`, `distribution`

---

### Create Safe Zone (JWT)
```
POST /api/safe-zones
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Butwal Hospital",
  "type": "hospital",
  "coordinates": [83.4567, 27.7172],
  "address": "Butwal-8",
  "phone": "071-123456"
}
```

---

### Update Safe Zone (JWT)
```
PUT /api/safe-zones/:id
Authorization: Bearer <token>
```

---

### Delete Safe Zone (JWT)
```
DELETE /api/safe-zones/:id
Authorization: Bearer <token>
```

---

## Push Notifications

### Get VAPID Public Key
```
GET /api/push/vapid-public-key
```

**Response (200):**
```json
{ "publicKey": "BCvZ..." }
```

---

### Subscribe
```
POST /api/push/subscribe
Content-Type: application/json
```

**Request:**
```json
{
  "endpoint": "https://fcm.googleapis.com/...",
  "keys": {
    "p256dh": "BIO...",
    "auth": "qR0..."
  }
}
```

**Notes:** Upserts by endpoint. Optional `userId` field for tracking.

---

### Unsubscribe
```
POST /api/push/unsubscribe
Content-Type: application/json
```

**Request:**
```json
{ "endpoint": "https://fcm.googleapis.com/..." }
```

---

## SMS Webhook

### Receive Inbound SMS (Twilio Webhook)
```
POST /api/webhook/sms
Content-Type: application/x-www-form-urlencoded
```

**Payload (from Twilio):**
| Field | Description |
|---|---|
| `Body` | The text content of the SMS |
| `From` | The sender's phone number (e.g., `+9779812345678`) |

**Response (200):** TwiML XML confirming receipt.

**Notes:** In production, Twilio signature validation is enforced. In development (`NODE_ENV !== production`), validation is bypassed for local testing. The SMS body is parsed by Gemini AI to extract disaster type, description, and location name. The location name is geocoded via Nominatim (OpenStreetMap) to obtain GPS coordinates.

---

### Reply to SMS Report (Admin)
```
POST /api/webhook/sms/reply
Authorization: Bearer <token> (admin)
Content-Type: application/json
```

**Request:**
```json
{
  "phone": "+9779812345678",
  "message": "Stay safe, a rescue team is on the way."
}
```

**Response (200):**
```json
{
  "message": "Reply sent successfully",
  "sid": "SM1234567890abcdef..."
}
```

**Notes:** Sends an outbound SMS via Twilio's Messaging Service. Requires valid `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_MESSAGING_SERVICE_SID` environment variables.

---

### Broadcast Push to Selected Users (Admin)
```
POST /api/push/broadcast
Authorization: Bearer <token> (admin)
Content-Type: application/json
```

**Request:**
```json
{
  "userIds": ["userId1", "userId2"],
  "message": "Flood rescue needed at Pokhara."
}
```

**Response (200):**
```json
{ "message": "Broadcast sent to 2 volunteers successfully." }
```

**Notes:** Sends web push notifications to all push subscriptions linked to the given user IDs. Expired subscriptions (410/404) are automatically cleaned up.

---

## Error Handling

All endpoints return errors in a consistent format:

```json
{
  "message": "Error description",
  "error": "Detailed error (dev only)"
}
```

### HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 400 | Bad request (validation error) |
| 401 | Unauthorized (no token) |
| 403 | Forbidden (invalid token or admin only) |
| 404 | Resource not found |
| 409 | Conflict (duplicate) |
| 500 | Server error |
