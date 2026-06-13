# Volunteer Management System

## Overview
Efficient dispatch of human resources is critical in disaster zones. The Volunteer Management System provides administrators with a dedicated dashboard to view, filter, contact, and broadcast alerts to registered volunteers based on their skills and location.

## Implementation Details

### 1. Backend Data Retrieval
The system uses the `GET /api/auth/users` endpoint to fetch all registered users. On the frontend, this list is filtered in-memory to isolate users who have opted in as volunteers (`isVolunteer === true`).

### 2. Geospatial Nearby Volunteers (`GET /api/auth/volunteers/nearby`)
A specialized endpoint powered by MongoDB's `$near` queries with a `2dsphere` index on the `location` field. This endpoint accepts `latitude`, `longitude`, and `radius` (in km) as query parameters and returns volunteers sorted by proximity.

This endpoint is used in two places:
- **Report Detail Modal**: When an admin views a specific disaster report and clicks "Find Nearby", the frontend calls this endpoint with the report's coordinates and displays the closest volunteers inline.
- **Ping Volunteers**: The `POST /api/reports/:id/ping-volunteers` endpoint uses this internally to dispatch push notifications to nearby volunteers.

### 3. The Admin Dashboard (`frontend/src/Admin/ManageVolunteers.jsx`)
The Volunteer Management page is a dedicated administrative view lazy-loaded under `/admin/manage-volunteers`.

**Key Features:**
- **Dynamic Stat Cards**: Instantly summarizes the total number of available volunteers, the number of unique skills across the pool, and how many volunteers have provided direct phone contact info.
- **Real-time Search**: A fast client-side search bar filters the volunteer pool by username, email, phone number, or specific skills (e.g., typing "medical" instantly isolates doctors/nurses).
- **Comprehensive Table**: Displays volunteer names (with avatar fallbacks), contact details, location data, and skill tags formatted as pill badges.
- **Click-to-Call**: Phone numbers are rendered as `tel:` links. Admins viewing the dashboard on a mobile device or a Mac/PC with integrated calling can instantly dial a volunteer with a single click.

### 4. Bulk Selection & Broadcast
Admins can select multiple volunteers and send them a coordinated push notification alert:

1. **Checkboxes**: Every row in the volunteer table has a checkbox. A "Select All" checkbox in the table header toggles the entire visible page.
2. **Selection Bar**: When one or more volunteers are selected, a floating indigo bar appears at the top showing "{N} volunteers selected" with a **"Broadcast Alert"** button.
3. **Broadcast Modal**: Clicking the button opens a modal with a textarea where the admin types a custom emergency message (e.g., *"Flood rescue needed at Pokhara. Report to staging area immediately."*).
4. **Backend Dispatch**: The message is sent via `POST /api/push/broadcast`, which accepts an array of `userIds` and a `message` string. It calls `sendPushToUsers()` internally to deliver web push notifications to the selected volunteers' subscribed devices.

### 5. Find Nearby Volunteers (Per-Report)
From the Report Details Modal in `Manage-Reports.jsx`:

1. Admin clicks the **"Find Nearby"** button in the modal footer.
2. The frontend calls `GET /api/auth/volunteers/nearby` with the report's GPS coordinates and a 10km radius.
3. A scrollable list appears inside the modal showing each nearby volunteer's name, phone number (as a clickable `tel:` link), and skills.
4. If no volunteers are within range, a "No volunteers found within 10km" message is displayed.

### 6. Internationalization (i18n)
To ensure the dashboard is usable by local administrative staff who may prefer Nepali, the entire UI is wrapped in the `react-i18next` framework.
- Titles, placeholders, table headers, empty-state messages, and broadcast modal text all use the `t()` hook.
- Example: `t("admin.manageVolunteers.broadcastPlaceholder", "Type your emergency broadcast message here...")`

### 7. Error Handling & Pagination
- If the `/users` API fails to load or the server is momentarily unreachable, the UI gracefully falls back to a centralized error state: `Failed to load volunteers. Please try refreshing the page.`, preventing the application from crashing.
- The list uses a custom `<Pagination />` component with a `PAGE_SIZE` of 10 to ensure performance even with hundreds of registered volunteers.
