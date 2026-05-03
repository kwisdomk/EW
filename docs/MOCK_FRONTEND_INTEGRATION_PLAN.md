# Mock Frontend Integration Plan
## EpidemiWatch Sentinel - Prototype to Production Migration

**Created:** 2026-05-02  
**Status:** Planning Phase  
**Priority:** High

---

## Executive Summary

The mock frontend prototype (`mock frontend/ew-frontend-main/`) demonstrates superior UI/UX patterns, visual design, and interaction models compared to the current EW frontend. This document outlines a strategic plan to integrate the best elements from the prototype into the production frontend while maintaining architectural integrity and backend compatibility.

---

## 1. Comparative Analysis

### 1.1 Architecture Comparison

| Aspect | Mock Prototype | Current Frontend | Recommendation |
|--------|---------------|------------------|----------------|
| **State Management** | Local useState | Zustand (global) | ✅ Keep Zustand |
| **Animation Library** | motion (v12) | framer-motion (v12) | ✅ Already aligned |
| **Styling** | Tailwind v4 + @theme | Tailwind v3 + custom CSS | 🔄 Upgrade to v4 |
| **Map Implementation** | Abstract SVG nodes | Leaflet with real coords | ✅ Keep Leaflet |
| **Component Structure** | Flat (single file) | Organized (folders) | ✅ Keep organized |
| **Data Flow** | Mock data file | SSE service + store | ✅ Keep current |

### 1.2 Component Mapping

| Mock Component | Current Component | Integration Strategy |
|----------------|-------------------|---------------------|
| `Header.tsx` | `header/Header.tsx` | **Enhance** - Add mode toggle UI, improve metrics display |
| `AlertFeed.tsx` | `feed/Feed.tsx` | **Enhance** - Adopt card design, improve animations |
| `KenyaMap.tsx` | `map/Map.tsx` | **Hybrid** - Keep Leaflet, add abstract overlay option |
| `InvestigationConsole.tsx` | `console/Console.tsx` | **Replace** - Superior tabbed design |
| `TrendAnalytics.tsx` | `charts/Charts.tsx` | **Enhance** - Better layout and styling |

---

## 2. Key Improvements to Adopt

### 2.1 Visual Design Enhancements

#### **Scanline Effect** ✨
- **Source:** Mock's animated scanline overlay
- **Implementation:** Already exists in current (`ScanLine.tsx`)
- **Action:** Verify animation matches mock's aesthetic

#### **Typography & Fonts** 🔤
- **Mock Uses:** Inter (sans) + JetBrains Mono (mono)
- **Current Uses:** System fonts
- **Action:** Import Google Fonts as in mock

#### **Color Palette Refinement** 🎨
```css
/* Mock's Superior Color System */
--bg-primary: #050505 (deeper black)
--bg-secondary: #02050A (map background)
--border: #1e293b (slate-800)
--text-primary: #e2e8f0 (slate-300)
--critical: #f43f5e (rose-500)
--elevated: #f59e0b (orange-500)
--monitoring: #facc15 (yellow-500)
--secure: #10b981 (emerald-500)
```

#### **Glow Effects** ✨
- Mock uses subtle glow on critical elements
- Add `box-shadow` with color-matched glows
- Example: `shadow-[0_0_15px_rgba(244,63,94,0.3)]`

### 2.2 Interaction Improvements

#### **Filter Controls** 🎛️
**Mock Implementation:**
- Floating HUD-style filter panel on map
- Severity filters (ALL, RED, ORG, YEL)
- Disease type filters (grid layout)
- Real-time filtering with visual feedback

**Current State:** No filtering UI

**Action:** Create `MapFilters.tsx` component with mock's design

#### **Alert Selection** 🎯
**Mock Features:**
- Crosshair animation on selected node
- Ping animation for active alerts
- Smooth scale transitions
- Tooltip on hover

**Action:** Enhance current Leaflet markers with these effects

#### **Tabbed Console** 📑
**Mock Design:**
- "Threat Synthesis" tab (AI analysis)
- "Logistics & Demo" tab (county stats)
- Smooth tab transitions with AnimatePresence
- Context-aware action buttons

**Current State:** Single view console

**Action:** Implement tabbed interface in Console component

### 2.3 Component-Specific Enhancements

#### **Header Component**
```typescript
// Adopt from mock:
1. Mode toggle button group (Operations/Analysis)
2. Severity counter badges (Critical/Elevated/Monitored)
3. "SECURE" connection indicator with pulse
4. Improved UTC time display
5. Fingerprint icon for branding
```

#### **Alert Feed**
```typescript
// Adopt from mock:
1. Compact card design with left severity indicator
2. Risk Score + Z-Score in grid layout
3. Timestamp in HH:MM format
4. "NEW" indicator for recent alerts
5. Hover state with chevron icon
6. Line-clamp-2 for summary text
```

#### **Map Component**
```typescript
// Hybrid approach:
1. Keep Leaflet for real geospatial data
2. Add abstract mode toggle (SVG overlay)
3. Implement filter HUD panel
4. Add radar sweep effect (optional)
5. Improve marker animations
6. Add connecting lines between clusters (optional)
```

#### **Investigation Console**
```typescript
// Major redesign:
1. Implement tabbed interface
2. Tab 1: Threat Synthesis
   - Alert header with severity icon
   - Metrics grid (Risk, Z-Score)
   - AI summary card with gradient
   - Action recommendations list
3. Tab 2: Logistics & Demographics
   - County population stats
   - Hospital capacity metrics
   - Utilization bar chart
   - Active response units
   - Stockpile status badges
4. Action buttons at bottom
   - Primary: "Initiate Emergency Protocol" (critical)
   - Secondary: "Acknowledge & Monitor"
   - Tertiary: "Disseminate" / "Log Event"
```

#### **Trend Analytics**
```typescript
// Layout improvements:
1. Left stats panel (80px width)
   - National aggregation number
   - 7-day moving average
   - Disease breakdown list
2. Right chart area
   - Area chart with gradient fill
   - Reference line for threshold
   - Baseline overlay
   - Improved tooltip styling
```

---

## 3. Data Model Alignment

### 3.1 Type Mapping

```typescript
// Mock Alert Type
interface Alert {
  id: string;              // "ALT-8492-CH"
  county: string;
  disease: string;
  severity: 'red' | 'orange' | 'yellow' | 'green';
  riskScore: number;
  zScore: number;
  timestamp: string;       // ISO string
  summary: string;
  isNew?: boolean;
}

// Current OutbreakAlert Type
interface OutbreakAlert {
  id: number;              // Numeric ID
  county: string;
  disease: string;
  weekKey: string;
  riskScore: number;
  alertLevel: 'RED' | 'ORANGE' | 'YELLOW' | 'GREEN';
  zScore: number;
  watsonSummary: string;
  recommendedAction: string;
  detectedAt: string;      // ISO string
  acknowledged: boolean;
  cases?: number;
  baseline?: number;
}
```

### 3.2 Adapter Strategy

**Option A: Extend Current Type** (Recommended)
```typescript
interface OutbreakAlert {
  // ... existing fields
  isNew?: boolean;         // Add for UI indication
  displayId?: string;      // Add formatted ID like "ALT-8492-CH"
}
```

**Option B: Create Display Adapter**
```typescript
function toDisplayAlert(alert: OutbreakAlert): DisplayAlert {
  return {
    ...alert,
    displayId: `ALT-${alert.id.toString().padStart(4, '0')}-${alert.disease.substring(0, 2).toUpperCase()}`,
    severity: alert.alertLevel.toLowerCase() as Severity,
    isNew: isWithinLast5Minutes(alert.detectedAt)
  };
}
```

### 3.3 County Stats Integration

Mock includes rich county demographic data:
```typescript
interface CountyStats {
  population: number;
  hospitalCapacity: number;
  currentUtilization: number;
  activeResponseUnits: number;
  stockpileStatus: 'optimal' | 'low' | 'critical';
}
```

**Action:** Create `countyStats.ts` data file or fetch from backend

---

## 4. Dependency Updates

### 4.1 Required Package Changes

```json
{
  "dependencies": {
    // Add/Update
    "motion": "^12.23.24",           // Mock uses this instead of framer-motion
    "clsx": "^2.1.1",                // For className utilities
    "tailwind-merge": "^3.5.0",      // For cn() utility
    
    // Keep existing
    "framer-motion": "^12.38.0",     // Compatible with motion
    "zustand": "^4.5.0",
    "react-leaflet": "^4.2.1",
    "recharts": "^2.10.0",
    "lucide-react": "^1.14.0"
  },
  "devDependencies": {
    // Upgrade
    "tailwindcss": "^4.1.14",        // Mock uses v4
    "@tailwindcss/vite": "^4.1.14"   // New v4 plugin
  }
}
```

### 4.2 Configuration Updates

**Tailwind v4 Migration:**
```css
/* index.css - New @theme syntax */
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular;
  
  /* Custom color tokens */
  --color-ew-bg: #050505;
  --color-ew-bg-alt: #0a0a0a;
  --color-ew-border: #1e293b;
}
```

**Font Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap');
```

---

## 5. Implementation Roadmap

### Phase 1: Foundation (Week 1)
**Priority: High | Effort: Medium**

- [x] ~~Analyze mock prototype~~ (Complete)
- [ ] Upgrade Tailwind to v4
- [ ] Import Google Fonts (Inter + JetBrains Mono)
- [ ] Create `cn()` utility function
- [ ] Update color palette in CSS
- [ ] Add county stats data file
- [ ] Create type adapters/extensions

**Deliverable:** Updated foundation with v4 Tailwind and fonts

### Phase 2: Component Enhancements (Week 2)
**Priority: High | Effort: High**

#### Header Component
- [ ] Add mode toggle button group
- [ ] Implement severity counter badges
- [ ] Add SECURE indicator with pulse
- [ ] Improve UTC time display
- [ ] Add Fingerprint icon

#### Alert Feed
- [ ] Redesign alert cards with mock's layout
- [ ] Add left severity indicator bar
- [ ] Implement compact metrics grid
- [ ] Add "NEW" badge for recent alerts
- [ ] Improve hover states

**Deliverable:** Enhanced Header and Feed components

### Phase 3: Map & Filters (Week 2-3)
**Priority: High | Effort: High**

- [ ] Create `MapFilters.tsx` component
- [ ] Implement severity filter buttons
- [ ] Implement disease type filter grid
- [ ] Add filter state to Zustand store
- [ ] Connect filters to alert display
- [ ] Enhance marker animations
- [ ] Add optional radar sweep effect
- [ ] Implement crosshair on selection

**Deliverable:** Interactive map with filtering

### Phase 4: Console Redesign (Week 3)
**Priority: High | Effort: High**

- [ ] Implement tabbed interface structure
- [ ] Build "Threat Synthesis" tab
  - [ ] Alert header with severity styling
  - [ ] Metrics grid (Risk + Z-Score)
  - [ ] AI summary card
  - [ ] Action recommendations
- [ ] Build "Logistics & Demographics" tab
  - [ ] Population stats
  - [ ] Hospital capacity display
  - [ ] Utilization bar chart
  - [ ] Response units status
  - [ ] Stockpile status badges
- [ ] Implement action buttons
- [ ] Add tab transition animations

**Deliverable:** Fully redesigned Investigation Console

### Phase 5: Charts & Polish (Week 4)
**Priority: Medium | Effort: Medium**

- [ ] Redesign TrendAnalytics layout
- [ ] Add left stats panel
- [ ] Improve chart styling
- [ ] Add gradient fills
- [ ] Implement reference lines
- [ ] Polish animations throughout
- [ ] Add glow effects to critical elements
- [ ] Final QA and testing

**Deliverable:** Polished, production-ready frontend

### Phase 6: Optional Enhancements (Future)
**Priority: Low | Effort: Variable**

- [ ] Abstract map mode (SVG overlay)
- [ ] Connecting lines between clusters
- [ ] Advanced filter combinations
- [ ] Export/share functionality
- [ ] Keyboard shortcuts
- [ ] Accessibility improvements

---

## 6. Risk Assessment

### 6.1 Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Tailwind v4 breaking changes | High | Medium | Thorough testing, gradual migration |
| Animation performance issues | Medium | Low | Use CSS transforms, optimize renders |
| State management complexity | Medium | Low | Keep Zustand, add selectors carefully |
| Map rendering conflicts | High | Low | Test Leaflet + overlay interactions |
| Type system mismatches | Low | Medium | Use adapters, extend types carefully |

### 6.2 UX Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Information overload | Medium | Medium | Progressive disclosure, clear hierarchy |
| Filter confusion | Low | Low | Clear labels, reset button |
| Mobile responsiveness | High | High | Test on multiple devices, adjust layouts |
| Color accessibility | Medium | Low | Verify WCAG contrast ratios |

---

## 7. Testing Strategy

### 7.1 Component Testing
- [ ] Unit tests for new utility functions
- [ ] Component tests for filter logic
- [ ] Integration tests for state updates
- [ ] Visual regression tests for styling

### 7.2 User Acceptance Testing
- [ ] Verify all mock features work in production
- [ ] Test filter combinations
- [ ] Validate data accuracy
- [ ] Check animation smoothness
- [ ] Verify responsive behavior

### 7.3 Performance Testing
- [ ] Measure render times with 100+ alerts
- [ ] Check animation frame rates
- [ ] Monitor memory usage
- [ ] Test on low-end devices

---

## 8. Success Criteria

### 8.1 Functional Requirements
✅ All mock UI patterns successfully integrated  
✅ Filtering works across all severity levels and diseases  
✅ Tabbed console displays all information correctly  
✅ Animations are smooth (60fps)  
✅ Real-time updates work with new UI  

### 8.2 Non-Functional Requirements
✅ Page load time < 2 seconds  
✅ Time to interactive < 3 seconds  
✅ No console errors or warnings  
✅ WCAG AA accessibility compliance  
✅ Works on Chrome, Firefox, Safari, Edge  

### 8.3 User Experience Goals
✅ Users can quickly identify critical alerts  
✅ Filtering reduces cognitive load  
✅ Console provides actionable intelligence  
✅ Visual hierarchy guides attention  
✅ System feels responsive and modern  

---

## 9. Rollout Plan

### 9.1 Development Environment
1. Create feature branch: `feature/mock-integration`
2. Implement changes incrementally
3. Test each phase before proceeding
4. Merge to `develop` after Phase 2

### 9.2 Staging Environment
1. Deploy after Phase 3 completion
2. Conduct UAT with stakeholders
3. Gather feedback and iterate
4. Performance testing

### 9.3 Production Deployment
1. Deploy after Phase 5 completion
2. Monitor for issues
3. Collect user feedback
4. Plan Phase 6 enhancements

---

## 10. Maintenance & Future Considerations

### 10.1 Documentation
- [ ] Update component documentation
- [ ] Create style guide for new patterns
- [ ] Document filter usage
- [ ] Update README with new features

### 10.2 Future Enhancements
- Consider adding more visualization modes
- Explore 3D map rendering
- Add predictive analytics overlay
- Implement collaborative features
- Mobile app considerations

---

## Appendix A: Code Snippets

### A.1 cn() Utility Function
```typescript
// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### A.2 Filter State in Store
```typescript
// Add to useSystemStore
interface SystemStore {
  // ... existing
  filterSeverity: AlertLevel | 'ALL';
  filterDisease: string | 'ALL';
  setFilterSeverity: (level: AlertLevel | 'ALL') => void;
  setFilterDisease: (disease: string | 'ALL') => void;
  getFilteredAlerts: () => OutbreakAlert[];
}
```

### A.3 County Stats Data Structure
```typescript
// src/data/countyStats.ts
export const COUNTY_STATS: Record<string, CountyStats> = {
  "Nairobi": {
    population: 4397073,
    hospitalCapacity: 4500,
    currentUtilization: 65,
    activeResponseUnits: 8,
    stockpileStatus: 'optimal'
  },
  // ... more counties
};
```

---

## Conclusion

The mock frontend prototype demonstrates significant UX improvements that will enhance the EpidemiWatch Sentinel system. By following this phased integration plan, we can adopt the best elements while maintaining architectural integrity and backend compatibility.

**Next Steps:**
1. Review and approve this plan
2. Begin Phase 1 implementation
3. Schedule weekly progress reviews
4. Adjust timeline based on findings

**Estimated Timeline:** 4 weeks for Phases 1-5  
**Estimated Effort:** ~120 hours development + 40 hours testing

---

*Document prepared by: Bob (Planning Mode)*  
*Last updated: 2026-05-02*