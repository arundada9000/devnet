# Sajilo Sahayata — Backend

**Disaster Reporting & Coordination API**

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
| **Push Notifications** | web-push (VAPID) |
| **Geospatial** | Turf.js (point-in-polygon) |
| **Date** | Day.js |

## Folder Structure

```
backend/
├── data/
│   └── geojson/              # GeoJSON boundary files for GaPa/NaPa detection
├── src/
│   ├── config/
│   │   ├── db.ts             # MongoDB connection via Mongoose
│   │   └── cloudinary.ts     # Cloudinary SDK config
│   ├── controllers/
│   │   ├── authController.ts      # Register, Login, Verify, Profile CRUD, Role management
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
│   │   ├── userModel.ts           # User schema (with timestamps)
│   │   ├── reportModel.ts         # Report schema (with timestamps)
│   │   ├── alertModel.ts          # Alert schema
│   │   ├── contactModel.ts        # ContactInfo schema (nested contacts array)
│   │   ├── safeZoneModel.ts       # SafeZone schema (with timestamps)
│   │   └── pushSubscriptionModel.ts  # Web push subscription schema
│   ├── routes/
│   │   ├── authRoutes.ts          # Auth endpoints
│   │   ├── reportRoutes.ts        # Report endpoints
│   │   ├── alertRoutes.ts         # Alert endpoints
│   │   ├── contactRoutes.ts       # Contact endpoints
│   │   ├── locationRoutes.ts      # Location endpoints
│   │   ├── pushRoutes.ts          # Push notification endpoints
│   │   └── safeZoneRoutes.ts      # Safe zone endpoints
│   ├── utils/
│   │   └── resolveGaPa.ts         # GPS → GaPa/NaPa name resolver (shared)
│   ├── env.ts                     # Typed environment config
│   ├── express.d.ts               # Express Request augmentation
│   ├── main.ts                    # App entry point + Vercel export
│   ├── seed.ts                    # Database seed script
│   └── seedSafeZones.ts           # Safe zone seed data
├── .env.example
├── package.json
├── tsconfig.json
└── vercel.json                    # Vercel serverless config
```

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

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | Yes | Server port (default: 3000) |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | JWT signing secret |
| `CLIENT_URL` | Yes | Frontend URL (CORS) |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |
| `VAPID_PUBLIC_KEY` | No | Web push VAPID public key |
| `VAPID_PRIVATE_KEY` | No | Web push VAPID private key |
| `VAPID_EMAIL` | No | Email for VAPID configuration |
| `NODE_ENV` | No | `production` for Vercel deployment |

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with `tsx --watch` (hot reload) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run compiled `dist/main.js` |
| `npm run seed` | Run seed script to populate sample data |
