# Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                             │
│                                                                     │
│  ┌────────────────────────────────────┐   ┌──────────────────────┐   │
│  │        React PWA (Vite)            │   │   Service Worker     │   │
│  │                                     │   │                      │   │
│  │  ┌─────────┐  ┌───────────────┐   │   │  ● Cache strategies  │   │
│  │  │ Zustand │  │ React Query   │   │   │  ● Push handler      │   │
│  │  │ Stores  │  │ (server cache)│   │   │  ● Background Sync   │   │
│  │  └────┬────┘  └───────┬───────┘   │   └──────────┬───────────┘   │
│  │       │               │           │              │               │
│  │  ┌────▼───────────────▼───────┐   │              │               │
│  │  │       Axios Client         │   │              │               │
│  │  │  (JWT interceptor, 30s)   │   │              │               │
│  │  └────────────┬───────────────┘   │              │               │
│  │               │                   │              │               │
│  │  ┌────────────▼───────────────┐   │              │               │
│  │  │    IndexedDB (offline)     │   │              │               │
│  │  │  ● offlineReports store    │   │              │               │
│  │  │  ● offlineContacts store   │   │              │               │
│  │  └────────────────────────────┘   │              │               │
│  └────────────────────────────────────┘              │               │
└──────────────────────────────────────┬───────────────┼───────────────┘
                                       │               │
                              HTTPS ───┼───────────────┘
                                       │       Push Notification
                                       │       (Web Push Protocol)
                                       ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      BACKEND (Node.js + Express)                     │
│                                                                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────────┐   │
│  │  Auth      │  │  Reports   │  │  Alerts    │  │  Contacts    │   │
│  │  Controller│  │  Controller│  │  Controller│  │  Controller  │   │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └──────┬───────┘   │
│        │               │               │                │           │
│  ┌─────▼───────────────▼───────────────▼────────────────▼───────┐   │
│  │                     Middleware Layer                          │   │
│  │              authenticateToken + requireAdmin                 │   │
│  └────────────────────────────┬──────────────────────────────────┘   │
│                               │                                      │
│  ┌────────────────────────────▼──────────────────────────────────┐   │
│  │                       Mongoose ODM                            │   │
│  │                   (6 Models, 2dsphere indexes)                │   │
│  └────────────────────────────┬──────────────────────────────────┘   │
│                               │                                      │
│  ┌────────────────────────────▼──────────────────────────────────┐   │
│  │                     External Services                         │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐    │   │
│  │  │   MongoDB    │  │  Cloudinary  │  │  Web Push (VAPID)│    │   │
│  │  │   (Atlas)    │  │  (Images)    │  │  (Notifications) │    │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘    │   │
│  └───────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. Incident Reporting Flow

```
User opens ReportForm
       │
       ▼
Get GPS coordinates (browser Geolocation API)
       │
       ▼
Auto-detect GaPa/NaPa via /api/location/detect?lat=&lng=
  OR use cached coordinates from Zustand localGovStore (30 min expiry)
       │
       ▼
User fills type, description, captures photo (getUserMedia or file input)
       │
       ▼
Online? ───Yes──→ POST /api/reports (multipart/form-data)
       │                  │
       No                 ▼
       │          Backend processes:
       ▼           ● Multer parses image to buffer
Save to IndexedDB     ● Cloudinary upload via stream
(offlineReports)      ● resolveGaPa() for localGovName
       │              ● Save to MongoDB (Report document)
       ▼
Register Background Sync     ● Return created report
(via SyncManager API)
       │
       ▼
Service Worker fires sync event on reconnect
       │
       ▼
OfflineSyncBanner receives SYNC_REPORTS message
       │
       ▼
syncPendingReports() replays queued reports
```

### 2. Authentication Flow

```
App mounts → autoLogin() called
       │
       ▼
Token in localStorage? ───No──→ isCheckingAuth = false, show Login
       │
       Yes
       ▼
GET /api/auth/verify (Authorization: Bearer <token>)
       │
       ├── 200 → user object set in Zustand useAuth store → Dashboard
       │
       └── 401/403 → clear token, show Login
```

### 3. Offline Contact Loading Flow

```
DynamicContact mounts
       │
       ▼
Fetch GET /api/contacts/:localGov/:department
       │
       ├── Success → cacheContacts() to IndexedDB → display contacts
       │
       └── Error/Offline → getCachedContacts() from IndexedDB
                            │
                            ▼
                    Contacts found? ───Yes──→ Show with amber banner
                            │
                            No
                            ▼
                    Show "No connection" error state
```

### 4. Push Notification Flow

```
App loads → usePushNotifications hook
       │
       ▼
GET /api/push/vapid-public-key
       │
       ▼
Registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey })
       │
       ▼
POST /api/push/subscribe (endpoint + keys saved to MongoDB)
       │
  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
       │
Admin creates alert via POST /api/alerts
       │
       ▼
alertController calls sendPushToAll()
       │
       ▼
Iterate all PushSubscription documents
       │
       ▼
webpush.sendNotification() for each subscription
       │
       ├── Success → increment sent counter
       │
       └── 410 Gone → delete subscription from DB
       │
       ▼
Service Worker receives push event → showNotification()
       │
       ▼
User clicks notification → focus window + navigate to target URL
```

---

## Offline Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Browser Online?                        │
│                                                          │
│  ┌─────────┐                    ┌─────────┐              │
│  │  Yes    │                    │   No    │              │
│  └────┬────┘                    └────┬────┘              │
│       │                              │                   │
│       ▼                              ▼                   │
│  Normal API calls              IndexedDB Queue           │
│  (Axios)                       ┌──────────────┐          │
│                                │ offlineReports│          │
│                                │ offlineContacts│         │
│                                └──────────────┘          │
│                                       │                   │
│  ┌────────────────────────────────────┼───────────────┐   │
│  │  When back online:                 │               │   │
│  │                                    ▼               │   │
│  │  navigator.online event fires ──→ OfflineSyncBanner │   │
│  │                                    │               │   │
│  │  OR Service Worker fires          ▼               │   │
│  │  "sync-reports" background   syncPendingReports()  │   │
│  │  sync event                                      │   │
│  └────────────────────────────────────────────────────┘   │
│                                                           │
│  Service Worker Cache Strategies:                         │
│  ┌────────────────────────┬───────────────┬──────────┐    │
│  │  Resource              │  Strategy      │ Fallback │    │
│  ├────────────────────────┼───────────────┼──────────┤    │
│  │  CARTO map tiles       │  Cache-first   | Network  │    │
│  │  API calls (/api/*)    │  Network-first | Cache    │    │
│  │  Static assets         │  Cache-first   | Network  │    │
│  │  Navigation (SPA)      │  Network-first | index.html│  │
│  └────────────────────────┴───────────────┴──────────┘    │
└──────────────────────────────────────────────────────────┘
```

---

## Component Interaction (Frontend)

```
App.jsx
  ├── useLocalGovernment hook ──→ calls /api/location/detect
  │                                  │
  │                                  ▼
  │                           Zustand localGovStore
  │                           (w/ 30 min expiry)
  │
  ├── usePushNotifications hook ──→ subscribes to push
  │
  └── AppRoutes
        │
        ├── Public Routes (Welcome, Login, Signup, etc.)
        │
        ├── User Routes (Navigation layout)
        │     ├── Home ──→ SummaryCard, ReportCard[], OfflineSyncBanner
        │     ├── MapPage ──→ React-Leaflet + MarkerCluster + DetailModal
        │     ├── ReportForm ──→ Zustand GPS coords + IndexedDB queue
        │     ├── Profile ──→ PUT /api/auth/profile
        │     ├── DynamicContact ──→ cached via IndexedDB offlineContacts
        │     └── EmergencyTypeSelection
        │
        └── Admin Routes (AdminLayout with sidebar)
              ├── Dashboard ──→ ReportsByStatusChart (Chart.js)
              ├── Manage‑Users ──→ filtered by useAdminLocationStore
              ├── Manage‑Reports ──→ ReportEditModal with useImagePreview
              ├── SendAlerts ──→ triggers push notifications
              ├── ManageContacts ──→ ContactEditModal
              └── ManageSafeZones
```

---

## GeoJSON GaPa/NaPa Resolution

```
                    GPS Coordinates
                          │
                          ▼
              ┌─────────────────────┐
              │  resolveGaPa(lat,lng)│
              └──────────┬──────────┘
                         │
               ┌─────────▼─────────┐
               │  Load GeoJSON     │
               │  boundary files   │
               │  (cached on first │
               │   call)           │
               └─────────┬─────────┘
                         │
               ┌─────────▼─────────┐
               │  For each feature: │
               │  booleanPointIn-  │
               │  Polygon(point,   │
               │  feature)         │
               └─────────┬─────────┘
                         │
              ┌──────────▼──────────┐
              │  Match found?       │
              │  ├── Yes → return   │
              │  │        feature.  │
              │  │        properties.│
              │  │        GaPa_NaPa │
              │  │                  │
              │  └── No → return    │
              │            "Unknown" │
              └─────────────────────┘
```

Used at:
- **User registration** (`authController.registerUser`)
- **Report creation** (`reportController.createReport`)
- **On-demand detection** (`locationController.detectLocation`)

---

## Security Architecture

### Authentication
- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens expire in 1 hour
- Tokens sent via `Authorization: Bearer` header (and httpOnly cookie)
- `autoLogin()` verifies token validity on app mount

### Authorization
- `authenticateToken` middleware extracts `req.user` from JWT
- `requireAdmin` middleware checks `req.user.role === "admin"`
- Admin routes are protected with both middlewares

### CORS
- Whitelist: `CLIENT_URL`, localhost:5173/5174/5175
- All Vercel preview deployments (`*.vercel.app`) are auto-allowed
- Credentials enabled for cookie-based auth

### File Upload
- Multer memory storage (no disk writes — required for Vercel serverless)
- File type restriction: JPEG, PNG, GIF only
- 5MB file size limit
- Images uploaded to Cloudinary (not stored on server)

### Input Validation
- Report type must be one of allowed enum
- Description must be at least 10 characters
- Coordinates parsed and validated before processing
- Phone number uniqueness enforced at DB level (unique index)
