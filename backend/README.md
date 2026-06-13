# Sajilo Sahayata — Backend

**Disaster Reporting & Coordination API**

[![Node.js](https://img.shields.io/badge/Node.js-18-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-lightgrey)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-green)](https://www.mongodb.com/)

---

## Tech Stack

| Category | Choice |
|---|---|
| **Runtime** | Node.js 18 |
| **Framework** | Express 5 |
| **Language** | TypeScript |
| **Database** | MongoDB (Mongoose ODM) |
| **Auth** | JWT (jsonwebtoken) |
| **Passwords** | bcrypt (10 salt rounds) |
| **File Uploads** | Multer (memory storage) → Cloudinary |
| **Image Hosting** | Cloudinary SDK |
| **SMS Gateway** | Twilio SDK (Outbound) + Webhooks (Inbound) |
| **AI Analysis** | Google Gemini (Image Severity & Multilingual Translation) |
| **Push Notifications** | web-push (VAPID) |
| **Geospatial** | Turf.js (point-in-polygon) |
| **Date** | Day.js |

---

## Folder Structure

```
backend/
├── data/
│   └── geojson/                   # GeoJSON boundary files for GaPa/NaPa detection (26 files)
│       ├── butwal.json / omsatiya.json / siddharthanagar.json / tilottama.json  # Rupandehi
│       ├── shuklagandaki.json                                                  # Tanahu
│       ├── kathmandu.json / budhanilakantha.json / chandragiri.json /
│       │   dakshinkali.json / gokarneshwor.json / kageshwori-manahora.json /
│       │   kirtipur.json / nagarjun.json / shankharapur.json /
│       │   tarakeshwor.json / tokha.json                                       # Kathmandu
│       ├── bhaktapur.json / changunarayan.json / madhyapur-thimi.json /
│       │   suryabinayak.json                                                   # Bhaktapur
│       └── lalitpur.json / godawari.json / mahalaxmi.json /
│           bagmati.json / konjyosom.json / mahankal.json                       # Lalitpur
├── src/
│   ├── config/
│   │   ├── db.ts                  # MongoDB connection via Mongoose
│   │   └── cloudinary.ts          # Cloudinary SDK config
│   ├── controllers/
│   │   ├── authController.ts      # Register, Login, Verify, Profile CRUD, Role mgmt
│   │   ├── alertController.ts     # Alert CRUD + push notification broadcast
│   │   ├── contactController.ts   # Emergency contact CRUD by department/location
│   │   ├── locationController.ts  # GPS → GaPa detection, available locations list
│   │   ├── pushController.ts      # Subscribe, unsubscribe, send push to all
│   │   ├── reportController.ts    # Report CRUD, verify, status change, Cloudinary upload
│   │   └── safeZoneController.ts  # Safe zone CRUD (hospitals, shelters, etc.)
│   ├── middlewares/
│   │   ├── authenticateToken.ts   # JWT verification → req.user
│   │   └── requireAdmin.ts        # Role check (admin-only)
│   ├── models/
│   │   ├── userModel.ts           # User (username, password, phone, role, location, etc.)
│   │   ├── reportModel.ts         # Report (type, description, image, location, status)
│   │   ├── alertModel.ts          # Alert (title, description, type, location, timestamp)
│   │   ├── contactModel.ts        # ContactInfo (localGovName, department, contacts[])
│   │   ├── safeZoneModel.ts       # SafeZone (name, type, location, address, phone, isActive)
│   │   └── pushSubscriptionModel.ts  # Push subscription (endpoint, keys, userId)
│   ├── routes/
│   │   ├── authRoutes.ts          # Auth endpoints
│   │   ├── reportRoutes.ts        # Report endpoints
│   │   ├── alertRoutes.ts         # Alert endpoints
│   │   ├── contactRoutes.ts       # Contact endpoints
│   │   ├── locationRoutes.ts      # Location endpoints
│   │   ├── pushRoutes.ts          # Push notification endpoints
│   │   └── safeZoneRoutes.ts      # Safe zone endpoints
│   ├── utils/
│   │   └── resolveGaPa.ts         # GPS → GaPa/NaPa name resolver using Turf.js
│   ├── env.ts                     # Typed environment config
│   ├── express.d.ts               # Express Request augmentation (req.user)
│   ├── main.ts                    # App entry point + route mounting + Vercel export
│   ├── seed.ts                    # Emergency contact seed script (150 records, 25 GaPa/NaPa)
│   ├── seedApi.js                 # Alternative seed script (JS version)
│   └── seedSafeZones.ts           # Safe zone seed data
├── uploads/                       # Local uploads (dev, gitignored)
├── .env / .env.deploy             # Environment configs
├── package.json
├── tsconfig.json
└── vercel.json                    # Vercel serverless deployment config
```

---

## API Endpoints

All routes are prefixed with `/api`.

### Auth (`/api/auth`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Register a new user (auto-detects GaPa from GPS) |
| POST | `/login` | — | Login with phone + password → JWT |
| GET | `/verify` | JWT | Verify token, return full user |
| GET | `/users` | Admin | List all users (without passwords) |
| GET | `/users/:id` | — | Get user by ID |
| GET | `/users/around` | — | Get users near coordinates (query: lat, lng, radius) |
| PUT | `/profile` | JWT | Update own profile (limited fields) |
| PUT | `/users/:id/role` | Admin | Change user role (user/admin) |
| DELETE | `/users/:id` | Admin | Delete a user |

### Reports (`/api/reports`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/reports` | — | Create report (multipart: image + JSON fields) |
| GET | `/reports` | — | List all reports (sorted by newest) |
| GET | `/reports/:id` | — | Get single report |
| GET | `/reportsLocation` | — | Get report locations for map markers |
| PUT | `/reports/:id/status` | — | Change report status |
| PUT | `/reports/verify/:id` | Admin | Verify a report |
| PUT | `/reports/:id` | JWT | Update report (type, description, status, image) |
| DELETE | `/reports/:id` | JWT | Delete a report |

### Alerts (`/api/alerts`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | — | List all alerts (sorted by newest) |
| POST | `/` | JWT | Create alert + broadcast push notification |
| PUT | `/:id` | JWT | Update alert |
| DELETE | `/:id` | JWT | Delete alert |

### Contacts (`/api/contacts`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | — | List all contact records |
| GET | `/:localGov/:department` | — | Get contacts for specific location + department |
| POST | `/` | — | Create a new contact record |
| PUT | `/:id` | — | Update a contact record |
| DELETE | `/:id` | — | Delete a contact record |

### Location (`/api/location`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/detect?lat=&lng=` | — | Detect GaPa/NaPa name from GPS coordinates |
| GET | `/available` | — | List all available location names |

### Safe Zones (`/api/safe-zones`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | — | List all active safe zones |
| POST | `/` | JWT | Create a safe zone |
| PUT | `/:id` | JWT | Update a safe zone |
| DELETE | `/:id` | JWT | Delete a safe zone |

### Push Notifications (`/api/push`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/vapid-public-key` | — | Get VAPID public key for client subscription |
| POST | `/subscribe` | — | Save a push subscription |
| POST | `/unsubscribe` | — | Remove a push subscription |

### SMS (`/api/webhook/sms`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | Twilio | Handle inbound SMS reports via Twilio Webhook |
| POST | `/reply` | Admin | Send outbound SMS reply to a user |

---

## Data Models

### User
| Field | Type | Notes |
|---|---|---|
| `username` | String | Required |
| `password` | String | bcrypt hashed |
| `phoneNumber` | String | Unique, required |
| `role` | `"user" \| "admin"` | Default: `"user"` |
| `localGovName` | String | Auto-detected from GPS |
| `location` | GeoJSON Point | `[lng, lat]` |
| `email` | String | Optional, editable |
| `gender` | String | Optional, editable |
| `citizenshipId` | String | Optional, editable |
| `address` | String | Optional, editable |
| `image_url` | String | Profile photo |
| `createdAt` / `updatedAt` | Date | Auto (timestamps: true) |

Index: `2dsphere` on `location`

### Report
| Field | Type | Notes |
|---|---|---|
| `type` | String | `fire, police, flood, accident, landslide, other` |
| `description` | String | Min 10 characters |
| `imageUrl` | String | Cloudinary URL |
| `imageId` | String | Cloudinary public ID |
| `location` | GeoJSON Point | `[lng, lat]` |
| `localGovName` | String | Auto-detected from GPS |
| `status` | String | `pending, verified, working, solved` |
| `userId` | String | Reporter |
| `verifiedBy` | String | Admin who verified |
| `createdAt` / `updatedAt` | Date | Auto (timestamps: true) |

Index: `2dsphere` on `location`

### Alert
| Field | Type | Notes |
|---|---|---|
| `title` | String | Required |
| `description` | String | Required |
| `type` | String | `fire, flood, earthquake, landslide, storm, police, accident, other` |
| `location` | String | Free text location name |
| `timestamp` | Date | Default: now |
| `createdBy` | String | Admin user ID |

### ContactInfo
| Field | Type | Notes |
|---|---|---|
| `localGovName` | String | Indexed, required |
| `department` | String | Indexed, required |
| `contacts` | [Contact] | Array of `{ name, phone, role, description }` |

Unique compound index on `(localGovName, department)`

### SafeZone
| Field | Type | Notes |
|---|---|---|
| `name` | String | Required |
| `type` | String | `hospital, shelter, police, fire_station, distribution` |
| `location` | GeoJSON Point | `[lng, lat]` |
| `address` | String | Optional |
| `phone` | String | Optional |
| `isActive` | Boolean | Default: true |
| `createdAt` / `updatedAt` | Date | Auto |

Index: `2dsphere` on `location`

### PushSubscription
| Field | Type | Notes |
|---|---|---|
| `endpoint` | String | Unique, required |
| `keys` | `{ p256dh, auth }` | Required |
| `userId` | String | Optional |
| `createdAt` | Date | Default: now |

---

## Key Implementation Details

### GPS → GaPa/NaPa Detection
The `resolveGaPa.ts` utility loads GeoJSON boundary files from `data/geojson/` on first call. It uses Turf.js `booleanPointInPolygon` to determine which local government boundary contains the given GPS coordinates. This is used:
- At user registration (sets `user.localGovName`)
- At report creation (sets `report.localGovName`)
- Via the `GET /api/location/detect` endpoint for on-demand lookup

### Authentication Flow
1. User registers with `POST /api/auth/register` (phone + password + GPS coords)
2. Login at `POST /api/auth/login` returns JWT (1h expiry) in response body + httpOnly cookie
3. Frontend stores token in `localStorage`, attaches via `Authorization: Bearer <token>` header
4. `GET /api/auth/verify` validates the token and returns the full user object
5. Admin routes additionally check `requireAdmin` middleware

### Image Upload Flow
1. Frontend sends `multipart/form-data` with the image file
2. Multer parses into `req.file.buffer` (memory storage — required for Vercel serverless)
3. Controller uploads buffer to Cloudinary via stream
4. Cloudinary URL and public ID stored in the document

### Push Notification Flow
1. Frontend subscribes to push via `PushManager` with VAPID public key from `GET /api/push/vapid-public-key`
2. Subscription saved via `POST /api/push/subscribe`
3. When an admin creates an alert, `alertController.ts` calls `sendPushToAll()` internally
4. `sendPushToAll()` iterates all subscriptions, sends via `web-push`, and removes expired (410) subscriptions

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | Yes | Server port (default: 3000) |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | JWT signing secret |
| `CLIENT_URL` | Yes | Frontend URL (CORS) |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |
| `VAPID_PUBLIC_KEY` | No | Web push VAPID public key |
| `VAPID_PRIVATE_KEY` | No | Web push VAPID private key |
| `VAPID_EMAIL` | No | Email for VAPID configuration |
| `TWILIO_ACCOUNT_SID` | No | Twilio Account SID for SMS |
| `TWILIO_AUTH_TOKEN` | No | Twilio Auth Token for SMS |
| `TWILIO_MESSAGING_SERVICE_SID` | No | Twilio Messaging Service SID |
| `GEMINI_API_KEY` | No | Gemini AI API key for translation & image analysis |
| `NODE_ENV` | No | `production` for Vercel deployment |

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with `tsx --watch` (hot reload) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run compiled `dist/main.js` |
| `npm run seed` | Seed emergency contact data to MongoDB (reads from `.env`) |
| `npm run db:generate` | Initialize Prisma (legacy, not used) |
