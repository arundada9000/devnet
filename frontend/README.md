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
| **CSS** | Tailwind CSS v4 |
| **Animation** | Framer Motion 12 |
| **State (Client)** | Zustand 5 |
| **State (Server)** | TanStack React Query 5 |
| **Routing** | React Router v7 |
| **HTTP** | Axios |
| **Maps** | Leaflet 1.9 + React-Leaflet 4 + MarkerCluster |
| **Charts** | Chart.js 4 + react-chartjs-2 |
| **i18n** | i18next 25 + react-i18next 15 |
| **Icons** | Lucide React |
| **Notifications** | React Hot Toast |
| **PWA** | vite-plugin-pwa + custom sw.js |
| **Geospatial** | Turf.js |
| **Date** | Day.js |

---

## Features

- **Incident Reporting** — Live photo from camera + auto GPS location
- **Offline Queue** — Reports queued in IndexedDB, auto-synced via Background Sync
- **Emergency Contacts** — Department-specific contacts cached offline
- **Interactive Map** — Clustered Leaflet map with type-colored markers
- **Push Notifications** — Web push for admin alerts
- **12 Languages** — English + 11 regional/international languages
- **Admin Panel** — Dashboard, user/report/alert/contact/safezone management
- **Code Splitting** — Route-based lazy loading + Vite manual chunks + i18n lazy loading

---

## Folder Structure

```
frontend/
├── public/                     # Static assets
│   ├── assets/                 #   images & logos
│   ├── icons/                  #   SVG/PNG icons
│   ├── sw.js                   #   Service Worker
│   ├── manifest.json           #   PWA manifest
│   └── _redirects              #   SPA fallback
├── src/
│   ├── Admin/                  # Admin page components
│   ├── Auth/                   # Auth guards & components
│   ├── api/                    # Axios client
│   ├── components/             # Shared UI components
│   │   ├── admin/              #   Admin sub-components
│   │   └── charts/             #   Chart wrappers
│   ├── data/                   # Fixture data
│   ├── hooks/                  # Custom hooks
│   ├── layouts/                # Navigation layouts
│   ├── locales/                # 12 language translations
│   ├── pages/                  # Lazy-loaded route pages
│   ├── routes/                 # Route config
│   ├── stores/                 # Zustand state stores
│   └── utils/                  # Utilities (offline queue, CSV export)
├── index.html
└── vite.config.js
```

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

1. **Installable** — Service Worker registers on first visit
2. **Build-time Pre-caching** — All build artifacts pre-cached on install
3. **Offline Reports** — Submissions saved to IndexedDB, synced on reconnect
4. **Background Sync** — Service worker re-syncs when connectivity returns
5. **Contact Cache** — Emergency contacts cached for offline fallback
6. **Map Tiles** — CARTO basemap tiles cache-first for offline map use
