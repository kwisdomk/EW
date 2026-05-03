# EpidemiWatch Frontend - Backend Integration Guide

## 🎯 Overview

This frontend has been integrated with the production Quarkus backend to display real-time epidemic surveillance data from Kenya's 47 counties.

## 🔧 What Was Changed

### New Files Created
1. **`src/services/api.ts`** - REST API service layer
   - Connects to backend at `http://localhost:8080/api`
   - Functions: `fetchAlerts()`, `acknowledgeAlert()`, `fetchReports()`, `triggerDetection()`
   - Type-safe with backend `OutbreakAlert` entity

2. **`src/services/sseService.ts`** - Real-time SSE streaming
   - Connects to `/api/alerts/stream` for live updates
   - Auto-reconnection logic (max 5 attempts)
   - Singleton pattern for app-wide use

3. **`src/vite-env.d.ts`** - TypeScript environment definitions
   - Adds `VITE_API_BASE_URL` to ImportMeta types

### Modified Files
1. **`src/App.tsx`** - Main application
   - Replaced mock data with `fetchAlerts()` API call
   - Added SSE connection for real-time updates
   - Loading and error states
   - Connection status indicator

2. **`src/components/Header.tsx`**
   - Added `sseConnected` and `alertCount` props
   - Shows live connection status

3. **`src/components/AlertFeed.tsx`**
   - Added `selectedId` prop for highlighting

4. **`src/components/InvestigationConsole.tsx`**
   - Added `onRefresh` callback prop

5. **`src/components/TrendAnalytics.tsx`**
   - Added `selectedAlert` prop for context

6. **`.env`** - Environment configuration
   - `VITE_API_BASE_URL=http://localhost:8080/api`

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ installed
- Backend running at `http://localhost:8080`

### Step 1: Install Dependencies
```bash
cd "mock frontend/ew-frontend-main"
npm install
```

### Step 2: Start Backend
In a separate terminal:
```bash
cd backend
./mvnw quarkus:dev
```

Wait for: `Listening on: http://0.0.0.0:8080`

### Step 3: Start Frontend
```bash
npm run dev
```

Frontend will start at: `http://localhost:3000`

### Step 4: Verify Connection
1. Open browser to `http://localhost:3000`
2. Check for "SSE Connected" indicator in header
3. Alerts should load from backend
4. Click any alert to see details

## 🧪 Testing the Integration

### Test 1: Initial Data Load
```bash
# Backend should have seeded data
curl http://localhost:8080/api/alerts
```

Expected: JSON array of alerts including Nairobi cholera RED alert

### Test 2: Real-time SSE Updates
```bash
# Trigger detection manually
curl -X POST http://localhost:8080/api/detect \
  -H "X-API-KEY: epidemiwatch-dev"
```

Expected: Frontend updates in real-time without refresh

### Test 3: Acknowledge Alert
1. Click any alert in the feed
2. Click "Acknowledge" button in console
3. Alert should update immediately

## 📡 API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/alerts` | GET | Fetch all alerts (paginated) |
| `/api/alerts/unacknowledged` | GET | Fetch pending alerts |
| `/api/alerts/{id}/acknowledge` | PUT | Mark alert as reviewed |
| `/api/alerts/stream` | GET (SSE) | Real-time alert stream |
| `/api/reports` | GET | Historical disease reports |
| `/api/detect` | POST | Trigger outbreak detection |

## 🔍 Data Flow

```
Backend (Quarkus)
    ↓
OutbreakDetectorService (every 30s)
    ↓
Detects anomalies (z-score > 2.0)
    ↓
Creates/Updates OutbreakAlert entities
    ↓
Broadcasts via SSE (/api/alerts/stream)
    ↓
Frontend (React)
    ↓
alertStreamService receives event
    ↓
Updates Zustand store
    ↓
Components re-render with new data
```

## 🐛 Troubleshooting

### Issue: "Connection Failed" Error
**Solution**: Ensure backend is running
```bash
curl http://localhost:8080/health
```

### Issue: CORS Errors
**Solution**: Backend already configured for `http://localhost:3000`
Check `backend/src/main/resources/application.properties`:
```properties
quarkus.http.cors.origins=http://localhost:3000
```

### Issue: SSE Not Connecting
**Solution**: Check browser console for errors
- EventSource should connect to `http://localhost:8080/api/alerts/stream`
- Backend logs should show SSE connection

### Issue: No Alerts Displayed
**Solution**: Trigger detection manually
```bash
curl -X POST http://localhost:8080/api/detect \
  -H "X-API-KEY: epidemiwatch-dev"
```

## 📊 Demo Scenario

The backend seeds guaranteed demo data:

**Baseline (Weeks 1-3)**:
- Nairobi cholera: 8-23 cases/week

**Spike (Week 4)**:
- Nairobi cholera: 120-200 cases

**Expected Result**:
- RED alert with z-score ≥ 4.0
- Visible in frontend immediately
- AI summary explains the outbreak

## 🎬 Demo Flow

1. **Start Backend**: `./mvnw quarkus:dev`
2. **Start Frontend**: `npm run dev`
3. **Show Alert List**: Nairobi cholera RED alert visible
4. **Click Alert**: Investigation console shows details
5. **Show Map**: Nairobi county highlighted in red
6. **Trigger Detection**: `curl -X POST ...`
7. **Watch SSE Update**: New alerts appear in real-time

## 📝 Next Steps

1. ✅ Backend integration complete
2. ⏳ Add Kenya GeoJSON for accurate county boundaries
3. ⏳ Update README.md with comprehensive documentation
4. ⏳ Create demo video
5. ⏳ Prepare IBM Bob usage documentation

## 🔗 Related Files

- Backend API: `backend/src/main/java/com/epidemiwatch/resource/`
- Detection Logic: `backend/src/main/java/com/epidemiwatch/service/OutbreakDetectorService.java`
- Data Seeder: `backend/src/main/java/com/epidemiwatch/bootstrap/DataSeeder.java`

---

**Integration Status**: ✅ Complete  
**Last Updated**: 2026-05-03  
**Author**: IBM Bob (Code Mode)