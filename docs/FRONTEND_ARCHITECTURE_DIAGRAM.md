# EpidemiWatch Frontend Architecture Diagram

## System Overview

```mermaid
graph TB
    subgraph "Backend (Quarkus)"
        BE[Backend API<br/>localhost:8080]
        SSE[SSE Broadcaster<br/>/api/alerts/stream]
        DB[(PostgreSQL<br/>Disease Reports<br/>Outbreak Alerts)]
        DETECTOR[Outbreak Detector<br/>Z-Score Analysis<br/>30s intervals]
    end

    subgraph "Frontend (React + Vite)"
        APP[App Component]
        
        subgraph "State Management"
            ALERT_STORE[Alert Store<br/>Zustand]
            UI_STORE[UI Store<br/>Zustand]
            QUERY[React Query<br/>Cache]
        end
        
        subgraph "Command Center Layout"
            TOP[Top Bar<br/>National Status]
            LEFT[Alert Inbox<br/>Decision Queue]
            RIGHT[Epidemic Map<br/>Geospatial Intel]
            BOTTOM[Intelligence Stream<br/>Live Feed]
        end
        
        subgraph "Data Layer"
            REST[REST API Client<br/>Fetch/Axios]
            SSE_HOOK[useAlertStream Hook<br/>EventSource]
        end
    end

    DETECTOR -->|Detects Anomalies| DB
    DB -->|Persists Alerts| BE
    BE -->|REST API| REST
    BE -->|SSE Stream| SSE_HOOK
    SSE -->|Broadcasts| SSE_HOOK
    
    REST -->|Queries| QUERY
    SSE_HOOK -->|Real-time Updates| ALERT_STORE
    QUERY -->|Cached Data| ALERT_STORE
    
    ALERT_STORE -->|Alert Data| LEFT
    ALERT_STORE -->|Alert Data| RIGHT
    ALERT_STORE -->|Alert Data| BOTTOM
    ALERT_STORE -->|Metrics| TOP
    
    UI_STORE -->|Filters| LEFT
    UI_STORE -->|Selection| RIGHT
    UI_STORE -->|Controls| BOTTOM
    
    APP -->|Renders| TOP
    APP -->|Renders| LEFT
    APP -->|Renders| RIGHT
    APP -->|Renders| BOTTOM
```

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant Backend
    participant SSE
    participant EventSource
    participant AlertStore
    participant Components
    participant User

    Note over Backend: Detection runs every 30s
    Backend->>Backend: Analyze disease reports
    Backend->>Backend: Calculate z-scores
    
    alt New Alert Created
        Backend->>SSE: Broadcast new alert
        SSE->>EventSource: Push alert event
        EventSource->>AlertStore: addAlert(alert)
        AlertStore->>Components: Trigger re-render
        Components->>User: Display new alert
    end
    
    alt Alert Escalated
        Backend->>SSE: Broadcast updated alert
        SSE->>EventSource: Push alert event
        EventSource->>AlertStore: updateAlert(id, alert)
        AlertStore->>Components: Trigger re-render
        Components->>User: Show escalation
    end
    
    User->>Components: Click "Acknowledge"
    Components->>Backend: PUT /api/alerts/{id}/acknowledge
    Backend->>Components: Return updated alert
    Components->>AlertStore: Update local state
    AlertStore->>Components: Trigger re-render
    Components->>User: Show acknowledged state
```

## Component Hierarchy

```mermaid
graph TD
    APP[App]
    
    APP --> PROVIDERS[Providers]
    PROVIDERS --> QUERY_PROVIDER[QueryClientProvider]
    PROVIDERS --> STREAM_PROVIDER[AlertStreamProvider]
    
    APP --> LAYOUT[CommandCenterLayout]
    
    LAYOUT --> TOPBAR[TopBar]
    TOPBAR --> TITLE[SystemTitle]
    TOPBAR --> METRIC1[MetricCard: Active Outbreaks]
    TOPBAR --> METRIC2[MetricCard: Counties Affected]
    TOPBAR --> METRIC3[MetricCard: Escalation Rate]
    TOPBAR --> HEARTBEAT[SystemHeartbeat]
    
    LAYOUT --> MAINGRID[MainGrid]
    
    MAINGRID --> INBOX[AlertInbox]
    INBOX --> FILTERS[AlertFilters]
    INBOX --> LIST[AlertList]
    LIST --> CARD1[AlertCard]
    LIST --> CARD2[AlertCard]
    LIST --> CARD3[AlertCard]
    CARD1 --> BADGE[SeverityBadge]
    CARD1 --> HEADER[AlertHeader]
    CARD1 --> METRICS[AlertMetrics]
    CARD1 --> SUMMARY[AISummary]
    CARD1 --> ACTION[RecommendedAction]
    CARD1 --> BUTTONS[AlertActions]
    INBOX --> PAGINATION[Pagination]
    
    MAINGRID --> MAP[EpidemicMap]
    MAP --> LEAFLET[MapContainer]
    MAP --> COUNTIES[CountyLayer GeoJSON]
    MAP --> OVERLAY[AlertOverlay]
    MAP --> DETAIL[CountyDetailPanel]
    
    LAYOUT --> STREAM[IntelligenceStream]
    STREAM --> STREAM_HEADER[StreamHeader]
    STREAM --> FEED[StreamFeed]
    FEED --> ENTRY1[StreamEntry]
    FEED --> ENTRY2[StreamEntry]
    FEED --> ENTRY3[StreamEntry]
    STREAM --> CONTROLS[StreamControls]
```

## State Management Flow

```mermaid
graph LR
    subgraph "Alert Store (Zustand)"
        ALERTS[alerts: OutbreakAlert[]]
        COUNT[unacknowledgedCount: number]
        ACTIONS[Actions:<br/>setAlerts<br/>addAlert<br/>updateAlert<br/>acknowledgeAlert]
        COMPUTED[Computed:<br/>getAlertsByCounty<br/>getAlertsBySeverity<br/>getActiveOutbreakCount]
    end
    
    subgraph "UI Store (Zustand)"
        COUNTY[selectedCounty: string]
        SEVERITY[severityFilter: string[]]
        ACK[acknowledgedFilter: boolean]
        PAUSE[streamPaused: boolean]
        UI_ACTIONS[Actions:<br/>setSelectedCounty<br/>toggleSeverityFilter<br/>setAcknowledgedFilter<br/>toggleStreamPause]
    end
    
    subgraph "Components"
        INBOX_COMP[AlertInbox]
        MAP_COMP[EpidemicMap]
        STREAM_COMP[IntelligenceStream]
        TOP_COMP[TopBar]
    end
    
    ALERTS --> INBOX_COMP
    ALERTS --> MAP_COMP
    ALERTS --> STREAM_COMP
    ALERTS --> TOP_COMP
    
    SEVERITY --> INBOX_COMP
    ACK --> INBOX_COMP
    COUNTY --> MAP_COMP
    PAUSE --> STREAM_COMP
    
    INBOX_COMP -->|User filters| UI_ACTIONS
    MAP_COMP -->|User clicks county| UI_ACTIONS
    STREAM_COMP -->|User pauses| UI_ACTIONS
```

## API Integration Pattern

```mermaid
graph TB
    subgraph "React Query Layer"
        QUERY_ALERTS[useQuery: alerts]
        QUERY_REPORTS[useQuery: reports]
        MUTATION_ACK[useMutation: acknowledge]
    end
    
    subgraph "REST API"
        GET_ALERTS[GET /api/alerts]
        GET_REPORTS[GET /api/reports]
        PUT_ACK[PUT /api/alerts/:id/acknowledge]
    end
    
    subgraph "SSE Layer"
        HOOK[useAlertStream Hook]
        EVENT_SOURCE[EventSource]
        SSE_ENDPOINT[GET /api/alerts/stream]
    end
    
    subgraph "Store Updates"
        STORE[Alert Store]
    end
    
    QUERY_ALERTS -->|Fetch| GET_ALERTS
    QUERY_REPORTS -->|Fetch| GET_REPORTS
    MUTATION_ACK -->|Update| PUT_ACK
    
    GET_ALERTS -->|Response| QUERY_ALERTS
    GET_REPORTS -->|Response| QUERY_REPORTS
    PUT_ACK -->|Response| MUTATION_ACK
    
    QUERY_ALERTS -->|Cache| STORE
    MUTATION_ACK -->|Optimistic Update| STORE
    
    HOOK -->|Connect| EVENT_SOURCE
    EVENT_SOURCE -->|Subscribe| SSE_ENDPOINT
    SSE_ENDPOINT -->|Push Events| EVENT_SOURCE
    EVENT_SOURCE -->|Parse| HOOK
    HOOK -->|Update| STORE
```

## 4-Panel Layout Structure

```mermaid
graph TD
    subgraph "Command Center Layout"
        subgraph "Top Bar - h-16"
            TB[National Health Surveillance Status<br/>System Title | Active Outbreaks | Counties Affected | Escalation Rate | Heartbeat]
        end
        
        subgraph "Main Grid - flex-1"
            subgraph "Left Panel - w-1/3"
                LP[Alert Inbox<br/>Decision Queue<br/>Filters | Alert Cards | Pagination]
            end
            
            subgraph "Right Panel - w-2/3"
                RP[Epidemic Map<br/>Geospatial Intelligence<br/>Kenya Counties | Alert Overlay | Interactions]
            end
        end
        
        subgraph "Bottom Panel - h-48"
            BP[Intelligence Stream<br/>Live Feed<br/>Auto-scroll | Event Entries | Controls]
        end
    end
    
    TB -.->|Metrics from| LP
    TB -.->|Metrics from| RP
    LP -.->|Synced with| RP
    BP -.->|Events from| LP
    BP -.->|Events from| RP
```

## Mobile Responsive Transformation

```mermaid
graph TB
    subgraph "Desktop Layout > 1024px"
        D_TOP[Top Bar - Full Metrics]
        D_LEFT[Alert Inbox - 33%]
        D_RIGHT[Map - 67%]
        D_BOTTOM[Stream - Fixed Height]
    end
    
    subgraph "Tablet Layout 768-1024px"
        T_TOP[Top Bar - Collapsed Metrics]
        T_STACK[Stacked Layout<br/>Alert Inbox Full Width<br/>Map Full Width]
        T_DRAWER[Stream - Slide-up Drawer]
    end
    
    subgraph "Mobile Layout < 768px"
        M_TOP[Top Bar - Minimal]
        M_TABS[Tab Navigation<br/>Alerts | Map | Stream]
        M_ACTIVE[Active Panel - Full Width]
    end
    
    D_TOP -->|Breakpoint 1024px| T_TOP
    T_TOP -->|Breakpoint 768px| M_TOP
    
    D_LEFT -->|Stack| T_STACK
    D_RIGHT -->|Stack| T_STACK
    T_STACK -->|Tabs| M_TABS
    
    D_BOTTOM -->|Drawer| T_DRAWER
    T_DRAWER -->|Tab| M_TABS
```

## Technology Stack Integration

```mermaid
graph TB
    subgraph "Build & Dev"
        VITE[Vite<br/>Fast HMR<br/>Optimized Builds]
        TS[TypeScript<br/>Type Safety]
    end
    
    subgraph "UI Framework"
        REACT[React 18<br/>Component Model]
        TAILWIND[Tailwind CSS<br/>Utility Styling]
        HEADLESS[Headless UI<br/>Accessible Components]
        LUCIDE[Lucide React<br/>Icons]
    end
    
    subgraph "State & Data"
        ZUSTAND[Zustand<br/>Global State]
        RQ[React Query<br/>Server State]
        DATEFNS[date-fns<br/>Time Formatting]
    end
    
    subgraph "Mapping"
        LEAFLET[Leaflet<br/>Map Engine]
        RL[React-Leaflet<br/>React Bindings]
        GEOJSON[GeoJSON<br/>County Boundaries]
    end
    
    subgraph "Real-time"
        ES[EventSource API<br/>SSE Client]
    end
    
    VITE --> REACT
    TS --> REACT
    REACT --> TAILWIND
    REACT --> HEADLESS
    REACT --> LUCIDE
    REACT --> ZUSTAND
    REACT --> RQ
    REACT --> LEAFLET
    LEAFLET --> RL
    RL --> GEOJSON
    REACT --> ES
    REACT --> DATEFNS
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        DEV_VITE[Vite Dev Server<br/>localhost:5173]
        DEV_BE[Backend<br/>localhost:8080]
    end
    
    subgraph "Production Build"
        BUILD[npm run build]
        DIST[dist/ folder<br/>Static Assets]
    end
    
    subgraph "Deployment Options"
        OPTION1[Option 1: Static Hosting<br/>Vercel/Netlify/GitHub Pages]
        OPTION2[Option 2: Same Server<br/>Quarkus serves static files]
        OPTION3[Option 3: Container<br/>Nginx + Backend]
    end
    
    DEV_VITE -->|Proxy API| DEV_BE
    DEV_VITE -->|Hot Reload| BUILD
    BUILD --> DIST
    DIST --> OPTION1
    DIST --> OPTION2
    DIST --> OPTION3
```

---

## Key Architecture Decisions

### 1. State Management: Zustand over Redux
**Rationale**: Lightweight, TypeScript-friendly, minimal boilerplate. Perfect for real-time alert updates without complex middleware.

### 2. Data Fetching: React Query + SSE
**Rationale**: React Query handles REST caching/refetching. Native EventSource for SSE keeps it simple and reliable.

### 3. Mapping: Leaflet over Google Maps
**Rationale**: Open-source, no API keys, excellent GeoJSON support, lightweight.

### 4. Styling: Tailwind CSS
**Rationale**: Rapid development, consistent design system, excellent responsive utilities.

### 5. Build Tool: Vite over CRA
**Rationale**: 10x faster HMR, optimized production builds, modern ESM-based architecture.

---

## Performance Considerations

```mermaid
graph LR
    subgraph "Optimization Strategies"
        LAZY[Code Splitting<br/>React.lazy]
        VIRTUAL[Virtualized Lists<br/>react-window]
        MEMO[Memoization<br/>useMemo/React.memo]
        DEBOUNCE[Debounced Filters<br/>useDebounce]
        CACHE[React Query Cache<br/>Stale-while-revalidate]
    end
    
    LAZY -->|Reduces| BUNDLE[Initial Bundle Size]
    VIRTUAL -->|Handles| LARGE[Large Alert Lists]
    MEMO -->|Prevents| RERENDER[Unnecessary Re-renders]
    DEBOUNCE -->|Reduces| API_CALLS[API Call Frequency]
    CACHE -->|Improves| UX[User Experience]
```

---

**Document Status**: ✅ Architecture Defined  
**Last Updated**: 2026-05-02  
**Author**: Bob (Plan Mode)