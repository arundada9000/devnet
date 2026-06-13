# Sajilo Sahayata — Frontend

**React PWA for Disaster Reporting & Coordination**

[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-purple)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-blue)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-5-orange)](https://zustand.docs.pmnd.rs/)

---

## Tech Stack

| Category | Choice |
|---|---|
| **UI Framework** | React 18.3 |
| **Build Tool** | Vite 6.3 |
| **CSS** | Tailwind CSS v4 (with `@tailwindcss/vite` plugin) |
| **Animation** | Framer Motion 12 |
| **State (Client)** | Zustand 5 |
| **State (Server)** | TanStack React Query 5 |
| **Routing** | React Router v7 |
| **HTTP** | Axios (interceptors for JWT) |
| **Maps** | Leaflet 1.9 + React-Leaflet 4 + MarkerCluster |
| **Charts** | Chart.js 4 + react-chartjs-2 |
| **i18n** | i18next 25 + react-i18next 15 |
| **Icons** | Lucide React |
| **Notifications** | React Hot Toast |
| **PWA** | vite-plugin-pwa + custom `sw.js` |
| **Geospatial** | Turf.js |
| **Date** | Day.js |

---

## Features

- **Incident Reporting** — Live photo from camera/gallery + auto GPS location
- **SMS & AI Integration** — Twilio SMS support & Gemini AI for automated multilingual translation and image severity analysis
- **Offline Queue** — Reports queued in IndexedDB, auto-synced via Background Sync
- **Emergency Contacts** — Department-specific contacts cached offline
- **Interactive Map** — Clustered Leaflet map with type-colored markers
- **Push Notifications** — Web push for admin alerts with map deep linking
- **12 Languages** — English (bundled), 11 others lazy-loaded on demand via `import.meta.glob`
- **Admin Panel** — Dashboard, user/report/alert/contact/safezone management, and two-way SMS replies
- **Code Splitting** — Route-based lazy loading + Vite manual chunks + i18n lazy loading

---

## Folder Structure

```
frontend/
├── public/                          # Static assets (copied as-is to dist)
│   ├── assets/                      #   images & logos
│   │   ├── dummy/                   #   placeholder images
│   │   ├── logo.png
│   │   └── logo/
│   ├── icons/                       #   SVG/PNG icons (emergency types, nav, etc.)
│   │   ├── map-icons-red/           #   red-variant map markers
│   │   ├── accident-red.svg, accident.svg, call.svg, camera.png
│   │   ├── fire-red.svg, fire.png, fire.svg
│   │   ├── flood-red.svg, flood.svg
│   │   ├── landslide-red.svg, landslide.svg
│   │   ├── police-red.svg, police.svg
│   │   ├── emergency-icon.svg, emergency.svg
│   │   ├── home-icon.svg, home.svg, location-icon.svg, location.svg
│   │   ├── map.svg, notification.svg, notification-homepage.svg
│   │   ├── other.png, other.svg, others-red.svg, garbage.svg
│   │   ├── profile-icon.svg, profile.png, setting-icon.svg, rename-icon.svg
│   │   ├── admin-profile.png, back.png, back-white.png
│   │   └── report.png
│   ├── sw.js                        # Service Worker (cache, push, bg-sync)
│   ├── manifest.json                # PWA manifest
│   ├── favicon.ico / vite.svg
│   ├── _redirects                   # SPA fallback redirects
│   └── static.json                  # Static asset hosting config
├── src/
│   ├── Admin/                       # Admin page components
│   │   ├── Dashboard.jsx
│   │   ├── Manage-Users.jsx
│   │   ├── Manage-Reports.jsx
│   │   ├── ManageContacts.jsx
│   │   ├── ManageSafeZones.jsx
│   │   └── SendAlerts.jsx
│   ├── Auth/                        # Auth components (RequireAdmin, Login, etc.)
│   ├── api/
│   │   └── axios.js                 # Axios instance with JWT interceptor (30s timeout)
│   ├── components/
│   │   ├── admin/                   # Admin sub-components
│   │   │   ├── AdminFilterBar.jsx
│   │   │   ├── ContactEditModal.jsx
│   │   │   ├── Pagination.jsx
│   │   │   └── TableSkeleton.jsx
│   │   ├── charts/
│   │   │   └── ReportsByStatusChart.jsx  # Chart.js wrapper
│   │   ├── AdminSidebar.jsx
│   │   ├── AdminSkeletonLoader.jsx
│   │   ├── AlertModal.jsx
│   │   ├── DetailModal.jsx
│   │   ├── ErrorBoundary.jsx
│   │   ├── MapSkeleton.jsx
│   │   ├── OfflineSyncBanner.jsx    # "Offline" / "Sync now" banner
│   │   ├── PageLoader.jsx
│   │   ├── ReportCard.jsx
│   │   ├── ReportDetailModal.jsx
│   │   ├── ReportEditModal.jsx
│   │   ├── SummaryCard.jsx
│   │   └── UpdateBanner.jsx         # SW update notification
│   ├── data/
│   │   └── dummyReports.js          # Fixture data for development
│   ├── hooks/
│   │   ├── useDebounce.js
│   │   ├── useImagePreview.jsx
│   │   ├── useLocalGovernment.js    # GPS → GaPa lookup
│   │   ├── usePushNotifications.js  # Web push subscription
│   │   └── useSWUpdate.js           # SW update detection
│   ├── layouts/
│   │   ├── AdminLayout.jsx          # Sidebar + admin wrapper
│   │   └── Navigation.jsx           # Bottom nav for user dashboard
│   ├── locales/                     # i18n translation JSON (12 languages)
│   │   ├── en/ / ne/ / bhojpuri/ / hindi/ / maithili/ / magar/
│   │   ├── newar/ / tamang/ / tharu/ / chinese/ / japanese/ / korean/
│   │   └── each has translation.json
│   ├── pages/                       # Lazy-loaded route pages
│   │   ├── Admin/Dashboard.jsx
│   │   ├── Alerts/AlertsFeed.jsx
│   │   ├── Auth/ (Login, Signup, VerifyOTP, ForgotPassword, Welcome)
│   │   ├── Dashboard/ (Home, Alerts, MapPage, Reports, Profile, DynamicContact, EmergencyTypeSelection)
│   │   ├── Reports/ReportForm.jsx
│   │   ├── NotFound.jsx
│   │   └── Unauthorized.jsx
│   ├── routes/
│   │   └── AppRoutes.jsx            # All routes with lazy loading + guards
│   ├── services/                     # (removed — unused)
│   ├── stores/                      # Zustand state stores
│   │   ├── localGovStore.js         # GPS → GaPa cache (30 min expiry)
│   │   ├── useAuth.js               # Auth state login/logout/autoLogin
│   │   ├── useAuthStore.js          # Legacy demo store
│   │   ├── useAdminLocationStore.js # Admin location filter
│   │   ├── useRegistration.js       # Registration form state
│   │   └── UsePreference.jsx        # Theme, font, language preferences
│   ├── utils/
│   │   ├── exportCsv.js             # CSV export utility
│   │   └── offlineQueue.js          # IndexedDB queue + Background Sync
│   ├── App.jsx / i18n.js / index.css / main.jsx
├── index.html / vercel.json / vite.config.js
├── eslint.config.js / package.json
└── information/Additional-information.txt  # Quick-start notes
```

---

## Key Packages Explained

### `src/api/axios.js`
- Base URL from `VITE_API_URL`
- 30s timeout
- Request interceptor attaches `Bearer` token from `localStorage`

### `src/utils/offlineQueue.js`
- **IndexedDB** database (`sajilo-offline-db` v2) with two stores:
  - `offlineReports` — queued report submissions
  - `offlineContacts` — cached emergency contacts
- `saveReportOffline()` — saves report + registers Background Sync
- `syncPendingReports()` — replays queued reports to the API
- `cacheContacts()` / `getCachedContacts()` — emergency contact offline cache
- Background Sync registration via `navigator.serviceWorker.ready.sync.register("sync-reports")`

### `public/sw.js`
- **Build-time Injection**: `self.__WB_MANIFEST` replaced by `vite-plugin-pwa` with all hashed build assets
- **Install**: Pre-caches core shell + all build-manifest assets via `Promise.allSettled` (no single-failure cascading)
- **Activate**: Cleans old caches
- **Fetch Strategy**:
  - CARTO map tiles → Cache-first
  - API calls (`/api/...`) → Network-first with cache fallback
  - Static assets → Cache-first with network fallback
  - Navigation requests → serve `/index.html` when offline (SPA fallback)
- **Push**: Displays push notifications with View/Dismiss actions
- **Background Sync**: Listens for `sync-reports` events, posts `SYNC_REPORTS` message to clients

### `src/stores/useAuth.js`
- `login(user, token)` — saves token to localStorage, sets state
- `logout()` — clears token, nulls user
- `autoLogin()` — calls `/auth/verify` on mount with `Authorization` header to restore session
- `updateUser(data)` — merges data into existing user (for profile edits)

### `src/stores/localGovStore.js`
- Caches GPS-detected GaPa/NaPa name with 30-minute expiry
- `setLocalGov(name, coords)` — stores with timestamp
- `getLocalGov()` / `getCoordinates()` — returns `null` if expired

### `src/i18n.js`
- English (`en`) is statically imported at init for instant first paint
- 11 other languages are lazy-loaded via `import.meta.glob` — each language's JSON is a separate async chunk
- `loadLanguage(lang)` is called from `main.jsx` whenever the user switches language, loading the translation chunk on demand

### `src/stores/UsePreference.jsx`
- Persists theme (light/dark), font size, font family, language to `localStorage`
- Applied in `main.jsx` via `ApplyPreferences` wrapper component

### `src/routes/AppRoutes.jsx`
- All pages lazy-loaded with `React.lazy()` + `Suspense`
- Framer Motion `AnimatePresence` for page transitions
- Admin routes are grouped under `AdminLayout` with a stable route key to prevent remounting
- Dynamic contact route: `/dashboard/:localGov/:department`
- Catch-all route renders `NotFound`

### `vite.config.js`
- **PWA**: `vite-plugin-pwa` in `injectManifest` mode — reads `public/sw.js`, injects hashed asset manifest at `self.__WB_MANIFEST`, writes `dist/sw.js`
- **Manual chunk splitting** for optimal caching:
  - `vendor-react` (react, react-dom, react-router-dom)
  - `vendor-ui` (framer-motion, lucide-react)
  - `vendor-map` (leaflet, react-leaflet, react-leaflet-cluster)
  - `vendor-data` (axios, @tanstack/react-query, zustand)
  - `vendor-chart` (chart.js, react-chartjs-2)
  - `vendor-i18n` (i18next, react-i18next)

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | Backend API base URL (e.g. `http://localhost:3000/api`) |

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | ESLint check |

---

## PWA / Offline Support

The app is a full Progressive Web Application:

1. **Installable** — Service Worker registers on first visit; browser prompts install
2. **Build-time Pre-caching** — `vite-plugin-pwa` injects the hashed asset manifest into `sw.js` at build time, so all build artifacts are pre-cached on install
3. **Offline Reports** — When offline, report submissions are saved to IndexedDB. On reconnect, `OfflineSyncBanner` shows a "Sync Now" button and auto-syncs
4. **Background Sync** — Even if the user closes the tab, the service worker fires a `sync` event when connectivity returns, triggering re-sync
5. **Contact Cache** — Emergency contacts fetched from the API are cached in IndexedDB. When offline, `DynamicContact.jsx` falls back to the cache with an amber "showing cached data" indicator
6. **Map Tiles** — CARTO basemap tiles are cached via a cache-first strategy, so the map works offline for previously viewed areas
