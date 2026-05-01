# EpidemiWatch Sentinel - Frontend

## Status: 🚧 Implementation Pending

The frontend dashboard for EpidemiWatch Sentinel is currently under development.

### Planned Technology Stack
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Maps:** Leaflet
- **HTTP Client:** Fetch API / Axios

### Planned Features
- 📊 Real-time alert dashboard
- 🗺️ Interactive Kenya county map
- 🚨 Color-coded severity indicators (RED/ORANGE/YELLOW)
- ✅ Alert acknowledgment functionality
- 📡 SSE live updates
- 📱 Mobile-responsive design

### Backend Integration
The backend API is complete and running at `http://localhost:8080`

**Available Endpoints:**
- `GET /api/alerts` - Fetch outbreak alerts
- `GET /api/alerts/stream` - SSE live feed
- `PUT /api/alerts/{id}/acknowledge` - Mark alert as reviewed
- `GET /api/reports` - View disease reports

### Development Timeline
- **Block 2:** React scaffold + Alert dashboard (2-3 hours)
- **Block 3:** Leaflet map integration (1-2 hours)
- **Block 4:** UI polish + mobile responsiveness (1 hour)

### Getting Started (When Ready)
```bash
cd frontend
npm install
npm run dev
```

---

**Note:** Backend is production-ready. Frontend development starts after repository stabilization.