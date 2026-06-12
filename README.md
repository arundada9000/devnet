# Sajilo Sahayata

### Real-Time Disaster Reporting and Emergency Coordination Platform

> From alert to action, instantly.

Sajilo Sahayata is an offline-first disaster management platform built to improve communication between citizens and local government responders during emergencies such as floods, fires, landslides, accidents, and earthquakes.

Built for DeerHack 2026 by Team DevNet.

---

## Overview

In critical situations, response time matters more than anything.

Sajilo Sahayata reduces the gap between incident reporting and official response through:

* real-time incident reporting
* automatic location detection
* geospatial coordination
* offline-first infrastructure
* multilingual accessibility

Citizens can report incidents with GPS coordinates and media evidence, while local authorities receive live updates through an administrative coordination dashboard.

Designed for reliability in low-connectivity environments, the platform continues functioning even when the network does not.

---

## Core Features

### Citizen Platform

* Live GPS-based incident reporting
* Photo evidence upload
* Offline report queue with auto-sync
* Interactive disaster map
* Emergency contact access
* Real-time emergency alerts
* Multi-language support
* Safe zone discovery

### Administrative Dashboard

* Incident monitoring and verification
* Report filtering and status management
* Emergency alert broadcasting
* User and responder management
* Safe zone management
* Analytics and visualization tools

---

## Technical Highlights

* Progressive Web App architecture
* IndexedDB offline persistence
* Background Sync API support
* Geospatial mapping with Leaflet
* MongoDB 2dsphere indexing
* Push notification infrastructure
* Mobile-first responsive design
* Serverless deployment compatibility

The system is engineered to behave like emergency infrastructure, not just another CRUD application.

---

## Tech Stack

### Frontend

* React 18
* TypeScript
* Vite 6
* Tailwind CSS v4
* Zustand
* TanStack React Query
* React Router v7
* Leaflet

### Backend

* Node.js
* Express
* TypeScript
* MongoDB
* Mongoose
* JWT Authentication
* Cloudinary
* Web Push

---

## Project Structure

```bash
sajilo-sahayata/
│
├── frontend/      # React PWA
├── backend/       # Express API
├── docs/          # Documentation
├── assets/        # Branding and media
└── README.md
```

---

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/arundada9000/devnet.git
cd devnet
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

---

## Development Status

```txt
[✓] Frontend architecture initialized
[✓] Backend scaffolding completed
[ ] Authentication system
[ ] Incident reporting workflow
[ ] Offline synchronization engine
[ ] Interactive map integration
[ ] Push notification system
[ ] Admin coordination dashboard
[ ] Deployment pipeline
```

Still early. The infrastructure is waking up.

---

## Team DevNet

### Arun Neupane

Frontend Engineering, System Architecture, Project Coordination

### Sudhir Aryal

Research, Strategy, Presentation

### Shubham Gyawali

Backend Engineering, API Architecture

---

## Future Scope

* AI-assisted incident classification
* SMS fallback communication
* Real-time responder tracking
* Disaster heatmaps and prediction
* Government emergency integrations
* Advanced geospatial analytics

---

## License

Educational and hackathon use only.

---

## Final Note

Disasters are chaotic enough.
Communication should not be.
