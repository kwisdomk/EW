# EpidemiWatch Frontend: Epidemic Intelligence Command Center

## 🎯 CORE IDENTITY

**NOT**: A dashboard UI layer  
**IS**: A real-time county-level epidemic intelligence command center that transforms statistical anomaly detection into operational health decisions

---

## 📊 BACKEND CAPABILITIES ANALYSIS

### Available Data Structures

#### OutbreakAlert Entity
```typescript
interface OutbreakAlert {
  id: number;
  county: string;              // Normalized county name
  disease: string;             // Normalized disease name
  weekKey: string;             // ISO week "YYYY-Www" (e.g., "2026-W18")
  riskScore: number;           // 0-100 scale
  alertLevel: "RED" | "ORANGE" | "YELLOW";
  zScore: number;              // Statistical anomaly score
  watsonSummary: string;       // AI-generated context (max 2000 chars)
  recommendedAction: string;   // Action guidance (max 1000 chars)
  detectedAt: string;          // ISO timestamp
  acknowledged: boolean;       // County officer review status
}
```

### Available API Endpoints

| Endpoint | Method | Purpose | Response |
|----------|--------|---------|----------|
| `/api/alerts` | GET | Fetch alerts (paginated, filterable) | `OutbreakAlert[]` |
| `/api/alerts/stream` | GET | SSE live feed | Server-Sent Events |
| `/api/alerts/unacknowledged` | GET | Pending alerts requiring action | `OutbreakAlert[]` |
| `/api/alerts/{id}/acknowledge` | PUT | Mark alert as reviewed | `OutbreakAlert` |
| `/api/reports` | GET | Historical disease reports | `DiseaseReport[]` |
| `/api/detection/trigger` | POST | Manual detection run | Detection stats |

### Backend Intelligence Engine

- **Z-Score Anomaly Detection**: 4-week rolling baseline with sample standard deviation
- **Alert Classification**:
  - `RED`: z-score ≥ 4.0 (immediate containment)
  - `ORANGE`: z-score ≥ 3.0 (urgent investigation)
  - `YELLOW`: z-score ≥ 2.0 (elevated monitoring)
- **Automatic Detection**: Runs every 30 seconds
- **Alert Escalation**: Updates existing alerts if severity increases
- **Idempotency**: One alert per (county + disease + ISO week)

---

## 🏗️ FRONTEND ARCHITECTURE

### System Role Definition

The frontend is **NOT** a visualization layer. It is:

> **"The decision interface of the epidemic intelligence system"**

This means:
- Backend = Detects outbreaks
- SSE = Broadcasts intelligence
- Frontend = Simulates county health officer command center

---

## 🧩 4-PANEL COMMAND CENTER LAYOUT

```
┌─────────────────────────────────────────────────────────────┐
│  🟦 TOP BAR: National Health Surveillance Status            │
├──────────────────┬──────────────────────────────────────────┤
│                  │                                          │
│  🟥 LEFT PANEL   │  🗺️ RIGHT PANEL                         │
│  Alert Inbox     │  Geospatial Intelligence Map            │
│  (Decision       │  (County-level epidemic spread)         │
│   Queue)         │                                          │
│                  │                                          │
├──────────────────┴──────────────────────────────────────────┤
│  📡 BOTTOM PANEL: Early Warning Intelligence Stream         │
└─────────────────────────────────────────────────────────────┘
```

### Panel Specifications

#### 🟦 1. TOP BAR - National Health Surveillance Status
**Purpose**: Simulate national surveillance authority overview

**Data Display**:
- System title: "Kenya Epidemic Surveillance System"
- Active outbreak count (RED + ORANGE alerts)
- Counties affected (unique county count from active alerts)
- Alert escalation rate (alerts updated in last hour)
- Detection cycle heartbeat (last detection timestamp)
- System status indicator (backend health check)

**Visual Design**:
- Dark background (#1a1a2e)
- Critical metrics in large, bold typography
- Pulsing indicator for active detection cycles
- Color-coded status badges

**Data Source**: 
- `GET /api/alerts?severity=RED,ORANGE`
- `GET /api/health` (backend health)
- SSE stream for real-time updates

---

#### 🟥 2. LEFT PANEL - County Health Officer Alert Inbox
**Purpose**: Decision queue requiring county health officer attention

**Alert Card Structure**:
```
┌─────────────────────────────────────┐
│ 🔴 RED ALERT                        │
│ Nairobi County - CHOLERA            │
│ ─────────────────────────────────   │
│ Risk Score: 87/100                  │
│ Z-Score: 4.35 (4.3σ above baseline) │
│ Detected: 2 hours ago               │
│ ─────────────────────────────────   │
│ AI Summary:                         │
│ [watsonSummary text]                │
│ ─────────────────────────────────   │
│ Recommended Action:                 │
│ [recommendedAction text]            │
│ ─────────────────────────────────   │
│ [ACKNOWLEDGE] [VIEW DETAILS]        │
└─────────────────────────────────────┘
```

**Severity Interpretation**:
- **RED** → "Immediate containment required"
- **ORANGE** → "Investigate anomaly"
- **YELLOW** → "Monitor baseline"

**Features**:
- Sortable by: severity, time, county, disease
- Filterable by: severity level, county, acknowledged status
- Real-time insertion of new alerts (SSE)
- Visual pulse animation for new unacknowledged alerts
- Acknowledge button → `PUT /api/alerts/{id}/acknowledge`

**Data Source**:
- Initial load: `GET /api/alerts/unacknowledged`
- Live updates: SSE `/api/alerts/stream`
- Pagination: `GET /api/alerts?page=0&size=20`

---

#### 🗺️ 3. RIGHT PANEL - Epidemic Geospatial Intelligence Map
**Purpose**: County-level epidemic spread visualization system

**Map Features**:
- **Base Layer**: Kenya county boundaries (GeoJSON)
- **Alert Visualization**:
  - County fill color based on highest severity alert
  - RED counties: #dc2626 (high opacity)
  - ORANGE counties: #f97316 (medium opacity)
  - YELLOW counties: #fbbf24 (low opacity)
  - No alerts: #e5e7eb (neutral gray)
  
**Interactive Elements**:
- **Hover**: Display county name + active alert count
- **Click**: Open county detail panel showing:
  - All active alerts for that county
  - Historical trend preview (last 4 weeks)
  - Quick acknowledge all button
  
**Cluster Visualization** (Optional Enhancement):
- Outbreak intensity gradients for adjacent counties
- Disease-specific layer toggles (Cholera, Malaria, Typhoid, etc.)

**Data Source**:
- Alert data: `GET /api/alerts`
- County boundaries: Static GeoJSON file or external API
- Real-time updates: SSE stream

**Technology**:
- Leaflet.js for map rendering
- GeoJSON for county boundaries
- Custom overlay for alert visualization

---

#### 📡 4. BOTTOM PANEL - Early Warning Intelligence Stream
**Purpose**: AI-generated epidemiological intelligence feed

**Stream Entry Format**:
```
[23:45:12] 🔴 OUTBREAK DETECTED
           Nairobi County - Cholera
           Z-score: 4.35 | Risk: 87/100
           Pattern: 4.3σ above 4-week baseline
           
[23:44:08] 🟠 ALERT ESCALATED
           Mombasa County - Typhoid
           YELLOW → ORANGE (z-score: 3.2)
           
[23:42:15] 🟡 ELEVATED CASES
           Kisumu County - Malaria
           Z-score: 2.4 | Monitoring required
```

**Features**:
- Auto-scroll to latest (with pause on user scroll)
- Color-coded severity indicators
- Timestamp for each event
- Detection event types:
  - New outbreak detected
  - Alert escalated
  - Pattern detection trigger
  - System status messages
  
**Data Source**:
- SSE `/api/alerts/stream`
- Transform alert objects into human-readable intelligence entries

---

## 🔧 TECHNOLOGY STACK

### Core Framework
- **React 18** with TypeScript
- **Vite** for build tooling (fast HMR, optimized production builds)

### Styling & UI
- **Tailwind CSS** for utility-first styling
- **Headless UI** for accessible components (modals, dropdowns)
- **Lucide React** for consistent iconography

### State Management
- **Zustand** (lightweight, TypeScript-friendly)
  - Alert store (SSE-synced)
  - UI state (filters, selected county)
  - System status

### Data Fetching
- **TanStack Query (React Query)** for REST API
  - Automatic caching
  - Background refetching
  - Optimistic updates
  
### Real-time Communication
- **Native EventSource API** for SSE
- Custom hook: `useAlertStream()`

### Mapping
- **Leaflet** + **React-Leaflet**
- **GeoJSON** for Kenya county boundaries

### Date/Time
- **date-fns** for timestamp formatting

---

## 📐 COMPONENT HIERARCHY

```
App
├── CommandCenterLayout
│   ├── TopBar (National Status)
│   │   ├── SystemTitle
│   │   ├── MetricCard (Active Outbreaks)
│   │   ├── MetricCard (Counties Affected)
│   │   ├── MetricCard (Escalation Rate)
│   │   └── SystemHeartbeat
│   │
│   ├── MainGrid
│   │   ├── AlertInbox (Left Panel)
│   │   │   ├── AlertFilters
│   │   │   ├── AlertList
│   │   │   │   └── AlertCard[]
│   │   │   │       ├── SeverityBadge
│   │   │   │       ├── AlertHeader
│   │   │   │       ├── AlertMetrics
│   │   │   │       ├── AISummary
│   │   │   │       ├── RecommendedAction
│   │   │   │       └── AlertActions
│   │   │   └── Pagination
│   │   │
│   │   └── EpidemicMap (Right Panel)
│   │       ├── MapContainer (Leaflet)
│   │       ├── CountyLayer (GeoJSON)
│   │       ├── AlertOverlay
│   │       └── CountyDetailPanel (Modal)
│   │
│   └── IntelligenceStream (Bottom Panel)
│       ├── StreamHeader
│       ├── StreamFeed
│       │   └── StreamEntry[]
│       └── StreamControls (pause/resume)
│
└── Providers
    ├── QueryClientProvider
    └── AlertStreamProvider
```

---

## 🔄 STATE MANAGEMENT STRATEGY

### Zustand Stores

#### 1. Alert Store
```typescript
interface AlertStore {
  alerts: OutbreakAlert[];
  unacknowledgedCount: number;
  
  // Actions
  setAlerts: (alerts: OutbreakAlert[]) => void;
  addAlert: (alert: OutbreakAlert) => void;
  updateAlert: (id: number, updates: Partial<OutbreakAlert>) => void;
  acknowledgeAlert: (id: number) => void;
  
  // Computed
  getAlertsByCounty: (county: string) => OutbreakAlert[];
  getAlertsBySeverity: (severity: string) => OutbreakAlert[];
  getActiveOutbreakCount: () => number;
  getAffectedCounties: () => string[];
}
```

#### 2. UI Store
```typescript
interface UIStore {
  selectedCounty: string | null;
  severityFilter: string[];
  acknowledgedFilter: boolean;
  streamPaused: boolean;
  
  // Actions
  setSelectedCounty: (county: string | null) => void;
  toggleSeverityFilter: (severity: string) => void;
  setAcknowledgedFilter: (value: boolean) => void;
  toggleStreamPause: () => void;
}
```

---

## 📡 API INTEGRATION PATTERNS

### REST API (React Query)

```typescript
// Fetch alerts with filters
const { data: alerts, isLoading } = useQuery({
  queryKey: ['alerts', { severity, county, page }],
  queryFn: () => fetchAlerts({ severity, county, page }),
  refetchInterval: 30000, // Background sync every 30s
});

// Acknowledge alert (optimistic update)
const acknowledgeMutation = useMutation({
  mutationFn: (alertId: number) => acknowledgeAlert(alertId),
  onMutate: async (alertId) => {
    // Optimistic update
    await queryClient.cancelQueries(['alerts']);
    const previous = queryClient.getQueryData(['alerts']);
    queryClient.setQueryData(['alerts'], (old) => 
      updateAlertInCache(old, alertId, { acknowledged: true })
    );
    return { previous };
  },
  onError: (err, alertId, context) => {
    // Rollback on error
    queryClient.setQueryData(['alerts'], context.previous);
  },
});
```

### SSE Integration (Custom Hook)

```typescript
function useAlertStream() {
  const addAlert = useAlertStore(state => state.addAlert);
  const updateAlert = useAlertStore(state => state.updateAlert);
  
  useEffect(() => {
    const eventSource = new EventSource('http://localhost:8080/api/alerts/stream');
    
    eventSource.onmessage = (event) => {
      const alert: OutbreakAlert = JSON.parse(event.data);
      
      // Check if alert exists (update) or is new (add)
      const existing = useAlertStore.getState().alerts.find(a => a.id === alert.id);
      if (existing) {
        updateAlert(alert.id, alert);
      } else {
        addAlert(alert);
      }
    };
    
    eventSource.onerror = () => {
      console.error('SSE connection lost. Reconnecting...');
      eventSource.close();
    };
    
    return () => eventSource.close();
  }, []);
}
```

---

## 🗺️ KENYA COUNTY GEOSPATIAL DATA

### Required GeoJSON Structure

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "Nairobi",
        "code": "047",
        "population": 4397073
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[...]]
      }
    }
  ]
}
```

### Data Sources
1. **Primary**: Kenya Open Data Portal (official county boundaries)
2. **Fallback**: OpenStreetMap Kenya extract
3. **Backup**: Hardcoded simplified GeoJSON (47 counties)

### County Name Normalization
- Backend normalizes county names (e.g., "nairobi" → "Nairobi")
- Frontend must match this normalization for map overlay
- Use same normalization utility as backend

---

## 🎨 SEVERITY-BASED UI INTERPRETATION

### Color System

| Severity | Hex Color | Tailwind Class | Semantic Meaning |
|----------|-----------|----------------|------------------|
| RED | #dc2626 | `bg-red-600` | Immediate containment required |
| ORANGE | #f97316 | `bg-orange-500` | Investigate anomaly |
| YELLOW | #fbbf24 | `bg-yellow-400` | Monitor baseline |
| NEUTRAL | #e5e7eb | `bg-gray-200` | No active alerts |

### Alert Card Styling

```typescript
const severityStyles = {
  RED: {
    border: 'border-l-4 border-red-600',
    bg: 'bg-red-50',
    badge: 'bg-red-600 text-white',
    icon: '🔴',
    action: 'IMMEDIATE ACTION REQUIRED'
  },
  ORANGE: {
    border: 'border-l-4 border-orange-500',
    bg: 'bg-orange-50',
    badge: 'bg-orange-500 text-white',
    icon: '🟠',
    action: 'URGENT INVESTIGATION'
  },
  YELLOW: {
    border: 'border-l-4 border-yellow-400',
    bg: 'bg-yellow-50',
    badge: 'bg-yellow-400 text-gray-900',
    icon: '🟡',
    action: 'ELEVATED MONITORING'
  }
};
```

### Map County Styling

```typescript
function getCountyStyle(alerts: OutbreakAlert[]) {
  if (!alerts.length) return { fillColor: '#e5e7eb', fillOpacity: 0.3 };
  
  const highestSeverity = alerts.reduce((max, alert) => 
    SEVERITY_RANK[alert.alertLevel] > SEVERITY_RANK[max] ? alert.alertLevel : max
  , 'YELLOW');
  
  const styles = {
    RED: { fillColor: '#dc2626', fillOpacity: 0.7 },
    ORANGE: { fillColor: '#f97316', fillOpacity: 0.6 },
    YELLOW: { fillColor: '#fbbf24', fillOpacity: 0.5 }
  };
  
  return styles[highestSeverity];
}
```

---

## 📱 MOBILE RESPONSIVENESS STRATEGY

### Breakpoint System

| Breakpoint | Width | Layout Adaptation |
|------------|-------|-------------------|
| Mobile | < 768px | Single column, collapsible panels |
| Tablet | 768px - 1024px | 2-column grid (inbox + map stacked) |
| Desktop | > 1024px | Full 4-panel command center |

### Mobile Layout Transformation

```
Mobile (< 768px):
┌─────────────────┐
│ Top Bar         │ ← Collapsed metrics
├─────────────────┤
│ Tab Navigation  │ ← Switch between panels
│ [Alerts][Map]   │
├─────────────────┤
│ Active Panel    │ ← Full-width content
│                 │
│                 │
├─────────────────┤
│ Stream (drawer) │ ← Slide-up drawer
└─────────────────┘
```

### Responsive Considerations
- Touch-friendly alert cards (larger tap targets)
- Swipe gestures for panel navigation
- Simplified map controls
- Collapsible intelligence stream
- Reduced data density on small screens

---

## 🚀 IMPLEMENTATION PHASES

### Phase 1: Foundation (Block 2)
**Goal**: React scaffold + Alert inbox functional

**Tasks**:
1. Initialize Vite + React + TypeScript project
2. Install dependencies (Tailwind, Zustand, React Query, Leaflet)
3. Create basic layout structure (4-panel grid)
4. Implement Alert Store (Zustand)
5. Build AlertCard component with severity styling
6. Implement REST API integration (React Query)
7. Create AlertInbox with filtering and pagination
8. Add acknowledge functionality

**Deliverable**: Functional alert inbox displaying real backend data

---

### Phase 2: Geospatial Intelligence (Block 3)
**Goal**: Interactive Kenya county map with alert overlay

**Tasks**:
1. Obtain Kenya county GeoJSON data
2. Integrate Leaflet + React-Leaflet
3. Render county boundaries
4. Implement alert-based county coloring
5. Add hover tooltips (county name + alert count)
6. Create county detail modal (click interaction)
7. Sync map with alert store

**Deliverable**: Interactive map showing epidemic spread across counties

---

### Phase 3: Real-time Intelligence (Block 3.5)
**Goal**: SSE integration for live updates

**Tasks**:
1. Create `useAlertStream()` custom hook
2. Implement EventSource connection to `/api/alerts/stream`
3. Handle alert creation vs. update logic
4. Build IntelligenceStream component
5. Transform alerts into human-readable stream entries
6. Add auto-scroll with pause functionality
7. Implement visual notifications for new alerts

**Deliverable**: Live-updating command center with real-time intelligence feed

---

### Phase 4: Command Center Polish (Block 4)
**Goal**: Production-ready epidemic intelligence interface

**Tasks**:
1. Implement TopBar with national metrics
2. Add system heartbeat indicator
3. Create loading states and error boundaries
4. Implement mobile responsive layout
5. Add keyboard shortcuts (accessibility)
6. Performance optimization (virtualized lists)
7. Add dark mode support
8. Create user guide overlay
9. Final UI polish and animations

**Deliverable**: Production-ready epidemic intelligence command center

---

## 🎯 SUCCESS CRITERIA

### Functional Requirements
- ✅ Display all outbreak alerts from backend
- ✅ Real-time updates via SSE (< 1s latency)
- ✅ Interactive Kenya county map with alert overlay
- ✅ Alert acknowledgment with optimistic updates
- ✅ Filtering by severity, county, acknowledged status
- ✅ Mobile-responsive design (all breakpoints)

### Performance Requirements
- ✅ Initial load < 2 seconds
- ✅ SSE reconnection on disconnect
- ✅ Smooth animations (60fps)
- ✅ Handle 100+ alerts without lag

### User Experience Requirements
- ✅ Clear severity interpretation (RED/ORANGE/YELLOW)
- ✅ Actionable recommendations visible
- ✅ Intuitive navigation (no training required)
- ✅ Accessible (WCAG 2.1 AA)

---

## 🧠 CRITICAL DESIGN TRUTHS

### What Judges Will Perceive

**If implemented correctly**:
> "This is a functioning epidemic surveillance system"

**NOT**:
> "This is a student dashboard project"

### Key Differentiators

1. **Language**: Use "epidemic intelligence", "outbreak detection", "surveillance system" (not "dashboard", "UI", "frontend")

2. **Functionality**: Every feature maps to real epidemic response workflow:
   - Alert inbox = County health officer decision queue
   - Map = Geospatial spread analysis
   - Stream = AI-generated intelligence feed
   - Acknowledge = Officer review confirmation

3. **Data Interpretation**: Frontend adds semantic meaning to backend statistics:
   - Z-score 4.35 → "4.3σ above baseline"
   - Alert level RED → "Immediate containment required"
   - Risk score 87 → "High-risk outbreak forming"

---

## 📋 NEXT STEPS

1. **Review this plan** with stakeholders
2. **Validate Kenya county GeoJSON** data availability
3. **Confirm backend API** is running and accessible
4. **Switch to Code mode** to begin Phase 1 implementation
5. **Create frontend project** scaffold with Vite + React + TypeScript

---

## 🔗 REFERENCES

- Backend API: `http://localhost:8080/api`
- Backend Source: `backend/src/main/java/com/epidemiwatch/`
- IBM Brief: Focus on "AI detects outbreak patterns, sends early warnings"
- Target Users: County health officers (decision-makers, not analysts)

---

**Document Status**: ✅ Ready for Implementation  
**Last Updated**: 2026-05-02  
**Author**: Bob (Plan Mode)