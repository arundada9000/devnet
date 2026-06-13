# Push Notifications

## Overview
Sajilo Sahayata uses the **Web Push API** with **VAPID (Voluntary Application Server Identification)** keys to deliver real-time browser notifications to users and administrators. This works even when the app tab is closed, as long as the browser is running and the user has granted notification permission.

## Architecture

### Service Worker (`frontend/public/sw.js`)
A service worker is registered on app load. It listens for `push` events and displays native OS notifications using `self.registration.showNotification()`. Clicking a notification navigates the user to the relevant page (e.g., a specific report).

### Push Subscription Model (`backend/src/models/pushSubscriptionModel.ts`)
Each browser subscription is stored in MongoDB with the following fields:
- `endpoint`: The unique push service URL provided by the browser.
- `keys.p256dh` / `keys.auth`: Encryption keys for the push payload.
- `userId` (optional): Links the subscription to a specific user for targeted push.

### Backend Push Controller (`backend/src/controllers/pushController.ts`)
Three internal dispatch functions:

| Function | Purpose |
|---|---|
| `sendPushToAll()` | Sends a notification to every stored subscription. Used for system-wide alerts and SMS report notifications. |
| `sendPushToUsers(userIds, ...)` | Sends a notification only to subscriptions linked to specific user IDs. Used for targeted volunteer dispatch. |
| `broadcastPush(req, res)` | HTTP handler for `POST /api/push/broadcast`. Accepts `userIds[]` and `message` from the admin UI and calls `sendPushToUsers()` internally. |

## API Endpoints

### Get VAPID Public Key
```
GET /api/push/vapid-public-key
```
Returns the VAPID public key needed by the frontend to create a push subscription.

### Subscribe
```
POST /api/push/subscribe
Content-Type: application/json
```
**Request:**
```json
{
  "endpoint": "https://fcm.googleapis.com/...",
  "keys": { "p256dh": "BIO...", "auth": "qR0..." },
  "userId": "optional-user-id"
}
```
Upserts by endpoint. If a subscription with the same endpoint already exists, it is updated.

### Unsubscribe
```
POST /api/push/unsubscribe
Content-Type: application/json
```
**Request:**
```json
{ "endpoint": "https://fcm.googleapis.com/..." }
```

### Broadcast Alert (Admin)
```
POST /api/push/broadcast
Authorization: Bearer <token> (admin)
Content-Type: application/json
```
**Request:**
```json
{
  "userIds": ["userId1", "userId2", "userId3"],
  "message": "Flood rescue needed at Pokhara. Report to staging area."
}
```
**Response (200):**
```json
{ "message": "Broadcast sent to 3 volunteers successfully." }
```
Sends a web push notification to all subscriptions linked to the given user IDs. Protected by `authenticateToken` and `requireAdmin` middleware.

## Automatic Cleanup
When a push delivery returns HTTP 410 (Gone) or 404 (Not Found), the subscription is automatically deleted from MongoDB. This keeps the database clean of expired browser subscriptions.

## Environment Variables Required
- `VAPID_PUBLIC_KEY`: Base64-encoded public key for VAPID.
- `VAPID_PRIVATE_KEY`: Base64-encoded private key for VAPID.
- `VAPID_EMAIL`: Contact email for the VAPID identity (e.g., `mailto:admin@sajilo-sahayata.com`).

## Where Push is Triggered
| Event | Function Called | Scope |
|---|---|---|
| New alert created by admin | `sendPushToAll()` | All subscribers |
| New SMS report received | `sendPushToAll()` | All subscribers |
| Admin pings volunteers for a report | `sendPushToUsers()` | Nearby volunteers only |
| Admin broadcasts from Volunteer page | `broadcastPush()` | Selected volunteers only |
