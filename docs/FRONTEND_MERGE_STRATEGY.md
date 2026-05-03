# EpidemiWatch - Frontend Merge Strategy
**Date**: May 3, 2026, 4:13 PM EAT  
**Architect**: Bob (Senior Software Architect)  
**Status**: CRITICAL EXECUTION PLAN

---

## 🎯 EXECUTIVE SUMMARY

### THE SITUATION
We have **TWO SEPARATE FRONTENDS**:
1. **`frontend/`** - Original scaffold with mock SSE service (incomplete)
2. **`mock frontend/ew-frontend-main/`** - Enhanced prototype with real backend integration (complete)

### THE PROBLEM
- The prototype (`mock frontend/`) has SUPERIOR UI/UX and Kenya map with GeoJSON
- The original (`frontend/`) has basic structure but uses mock data
- **BOTH exist simultaneously**, causing confusion
- The prototype actually HAS real backend integration via `api.ts` and `sseService.ts`

### THE SOLUTION
**REPLACE the original frontend with the prototype**, because:
- ✅ Prototype has real API integration (`api.ts`)
- ✅ Prototype has real SSE service (`sseService.ts`)
- ✅ Prototype has superior Kenya map with GeoJSON boundaries
- ✅ Prototype has better UI components
- ✅ Prototype has filter controls
- ✅ Prototype is production-ready

---

## 📊 COMPARATIVE ANALYSIS

### Original Frontend (`frontend/`)
**Strengths:**
- Basic structure exists
- Uses Zustand for state management
- Has component organization

**Weaknesses:**
- ❌ Uses MOCK SSE service (not real backend)
- ❌ Basic map with only CircleMarkers (no county boundaries)
- ❌ No filter controls
- ❌ Incomplete implementation
- ❌ No GeoJSON integration

### Prototype Frontend (`mock frontend/ew-frontend-main/`)
**Strengths:**
- ✅ **Real backend integration** via `api.ts`
- ✅ **Real SSE service** via `sseService.ts`
- ✅ **Kenya GeoJSON** with 47 county boundaries
- ✅ **Superior map** with interactive counties
- ✅ **Filter controls** for severity and disease
- ✅ **Better UI/UX** with animations
- ✅ **Production-ready** code

**Weaknesses:**
- Located in wrong directory (`mock frontend/`)
- Needs to be moved to `frontend/`

---

## 🚀 EXECUTION PLAN

### PHASE 1: BACKUP (5 minutes)
```bash
# Create safety backup branch
git checkout -b backup-pre-merge-may-3-2026
git add .
git commit -m "BACKUP: Pre-merge state with both frontends"
git push origin backup-pre-merge-may-3-2026
git checkout main
```

### PHASE 2: FRONTEND REPLACEMENT (10 minutes)
```bash
# Remove old frontend
rm -rf frontend/

# Move prototype to production location
mv "mock frontend/ew-frontend-main" frontend/

# Remove now-empty mock frontend directory
rm -rf "mock frontend/"
```

### PHASE 3: VERIFICATION (5 minutes)
```bash
# Verify structure
ls -la frontend/

# Check that GeoJSON exists
ls -la frontend/public/kenya-counties.geojson

# Check that real API services exist
ls -la frontend/src/services/api.ts
ls -la frontend/src/services/sseService.ts
```

### PHASE 4: DEPENDENCY INSTALLATION (5 minutes)
```bash
cd frontend
npm install
```

### PHASE 5: CONFIGURATION CHECK (5 minutes)
Verify `frontend/.env` or environment variables:
- `VITE_API_BASE_URL=http://localhost:8080/api` (default in code)

### PHASE 6: BUILD TEST (5 minutes)
```bash
cd frontend
npm run build
```

### PHASE 7: INTEGRATION TEST (10 minutes)
**Terminal 1 - Backend:**
```bash
cd backend
./mvnw quarkus:dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Verify:**
- Frontend loads at http://localhost:3000
- SSE connection indicator shows "CONNECTED"
- Kenya map displays with county boundaries
- Alerts appear in feed
- Clicking county/alert shows details
- Filters work

---

## 🔍 KEY DIFFERENCES RESOLVED

### API Integration
**Before (Original):**
```typescript
// frontend/src/services/mockSseService.ts
export class MockSseService {
  // Generates fake data
}
```

**After (Prototype):**
```typescript
// frontend/src/services/api.ts
export async function fetchAlerts(params?: {...}): Promise<OutbreakAlert[]> {
  const response = await fetch(`${API_BASE}/alerts...`);
  return response.json();
}

// frontend/src/services/sseService.ts
export class AlertStreamService {
  connect(onAlert, onError, onConnect) {
    this.eventSource = new EventSource(`${API_BASE}/alerts/stream`);
  }
}
```

### Map Component
**Before (Original):**
```typescript
// frontend/src/components/map/Map.tsx
// Uses CircleMarker only, no county boundaries
<CircleMarker center={[coord.lat, coord.lng]} />
```

**After (Prototype):**
```typescript
// frontend/src/components/KenyaMap.tsx
// Uses GeoJSON with county boundaries + markers
<GeoJSON data={geoData} style={countyStyle} />
<Marker position={position} icon={customIcon} />
```

### State Management
**Before (Original):**
- Uses Zustand store
- Mock data generation

**After (Prototype):**
- Uses React useState
- Real backend data
- SSE real-time updates

---

## 📋 POST-MERGE CHECKLIST

### Immediate Verification
- [ ] Frontend directory structure correct
- [ ] `kenya-counties.geojson` exists in `frontend/public/`
- [ ] `api.ts` and `sseService.ts` exist in `frontend/src/services/`
- [ ] `npm install` completes successfully
- [ ] `npm run build` completes successfully

### Integration Testing
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Frontend connects to backend (check console)
- [ ] SSE connection established (check UI indicator)
- [ ] Alerts load from backend
- [ ] Kenya map displays with boundaries
- [ ] County hover shows tooltips
- [ ] Alert markers appear on map
- [ ] Clicking alert shows details
- [ ] Filters work (severity, disease)
- [ ] Acknowledge button works

### Git Cleanup
- [ ] `.gitignore` created/updated
- [ ] Only production files staged
- [ ] Professional commit message
- [ ] Pushed to GitHub
- [ ] Verified on GitHub web

---

## 🎯 SUCCESS CRITERIA

### MUST HAVE (Critical)
✅ Single `frontend/` directory (no duplicates)  
✅ Real backend integration working  
✅ SSE real-time updates working  
✅ Kenya map with GeoJSON boundaries  
✅ End-to-end flow tested  
✅ Code committed and pushed  

### SHOULD HAVE (Important)
✅ Filter controls functional  
✅ Acknowledge alerts working  
✅ Error handling robust  
✅ Loading states present  
✅ Documentation updated  

### NICE TO HAVE (Optional)
✅ Mobile responsive  
✅ Performance optimized  
✅ Accessibility features  

---

## 🚨 RISK MITIGATION

### Risk 1: Data Loss
**Mitigation**: Backup branch created before any changes

### Risk 2: Integration Breaks
**Mitigation**: Test backend connection before frontend changes

### Risk 3: Build Failures
**Mitigation**: Verify dependencies and build before committing

### Risk 4: Git Conflicts
**Mitigation**: Clean working directory, stage files carefully

---

## 📝 TECHNICAL NOTES

### Why Prototype is Superior

1. **Real Backend Integration**
   - Uses actual API endpoints
   - Real SSE connection
   - Proper error handling

2. **Better Map Implementation**
   - GeoJSON county boundaries (547 lines)
   - Interactive hover effects
   - County-level severity coloring
   - Custom marker icons with animations

3. **Enhanced UI/UX**
   - Filter controls for severity/disease
   - Loading and error states
   - Connection status indicator
   - Better visual hierarchy

4. **Production-Ready Code**
   - Proper TypeScript types
   - Error boundaries
   - Reconnection logic
   - Clean architecture

### Why Original Should Be Replaced

1. **Mock Data Only**
   - Not connected to real backend
   - Generates fake alerts
   - No real SSE

2. **Basic Map**
   - Only CircleMarkers
   - No county boundaries
   - Limited interactivity

3. **Incomplete Features**
   - No filters
   - Basic UI
   - Missing components

---

## 🎬 EXECUTION TIMELINE

**Total Time**: 45 minutes

| Phase | Duration | Status |
|-------|----------|--------|
| Backup | 5 min | Pending |
| Replacement | 10 min | Pending |
| Verification | 5 min | Pending |
| Dependencies | 5 min | Pending |
| Configuration | 5 min | Pending |
| Build Test | 5 min | Pending |
| Integration Test | 10 min | Pending |

---

## ✅ FINAL RECOMMENDATION

**ACTION**: Replace `frontend/` with `mock frontend/ew-frontend-main/`

**RATIONALE**:
- Prototype has real backend integration (not mock)
- Prototype has superior UI/UX
- Prototype has Kenya GeoJSON map
- Prototype is production-ready
- Original is incomplete and uses mock data

**CONFIDENCE**: 95% (very safe, prototype is better in every way)

**NEXT STEP**: Execute Phase 1 (Backup) immediately

---

*Strategy prepared by Bob (Senior Software Architect) - May 3, 2026*