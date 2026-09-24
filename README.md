# Campus Compass

Campus Compass is a student Smart-Campus web application for Leuphana Universität Lüneburg. The system provides real-time occupancy data, historical analytics, and predictive machine-learning forecasts to optimize campus logistics and help students find the best time to visit the Mensa.

> **Project status:** Student project at Leuphana Universität Lüneburg. Not an officially released university service.

## Core Features

- **Real-Time Data Integration:** Live tracking of connected devices indicating current occupancy.
- **Predictive Forecasts:** 15-120 minute multi-horizon forecasts visualizing expected occupancy and confidence intervals.
- **Data Analytics:** Deep insights through time-series charts, weekly heatmaps, and typical baseline comparisons.
- **3D Digital Twin:** MapLibre-powered interactive 3D map featuring OpenStreetMap data, building search, and live occupancy overlays.
- **Privacy by Design:** Aggregation of raw device connections; no facial recognition, no individual tracking, and no personal movement profiles.

## Project Structure

```text
src/
  app/                 Router / application root
  components/
    charts/             Recharts visualizations
    dashboard/          Occupancy and recommendation widgets
    layout/             App shell / navigation
    map/                Active map preview + archived Three.js components
    ui/                 Reusable UI primitives
  config/               Central configuration and thresholds
  data/                 DataProvider, Supabase adapter
  hooks/                Campus data context
  lib/                  Supabase client
  pages/                Route pages
  styles/               Design system
  types/                Domain contracts
  digital-twin/         Active MapLibre map, POIs, styles
public/
  branding/             Logo asset slot
  campus/               Map asset slot
  icons/                PWA / favicon placeholder
```

## Setup & Deployment

### Prerequisites

- Node.js 20.19+ or 22.12+ recommended
- npm
- Firebase CLI (for deployment)

### Local Development

1. Create a `.env.local` file from the example:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_APP_VERSION=1.0.0
   ```
2. Install dependencies and start the Vite development server:
   ```bash
   npm ci
   npm run dev
   ```

### Quality Assurance

```bash
npm run test
npm run lint
npm run build
```

### Firebase Hosting

This project is prepared for Firebase Hosting deployment (SPA rewrite to `index.html`):

```bash
npm run build
firebase deploy --only hosting
```

## System Architecture

The frontend is a React + TypeScript SPA built with Vite. It connects to a Supabase backend for real-time Postgres subscriptions and time-series data. 
The capacity is centralized in `src/config/app.ts` (currently set to 700).

Data freshness thresholds:
- Warning (stale): 120 seconds
- Offline: 300 seconds
