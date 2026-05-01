# EpidemiWatch Sentinel (EW)

> AI-Powered Epidemic Surveillance, Early Warning & County Health Response Platform  
> **IBM Dev Day Hackathon 2026** | Built with IBM Bob

[![Backend Status](https://img.shields.io/badge/Backend-Complete-success)]()
[![Frontend Status](https://img.shields.io/badge/Frontend-Pending-yellow)]()
[![License](https://img.shields.io/badge/License-MIT-blue)]()

---

## 🎯 Project Overview

EpidemiWatch Sentinel is a real-time epidemic surveillance system designed for Kenyan county health officers. It uses **statistical anomaly detection** (z-score analysis) to identify disease outbreaks and generate actionable alerts with AI-powered summaries.

### Key Features
- ✅ **Statistical Outbreak Detection** - Z-score algorithm with edge case handling
- ✅ **Real-Time Alerts** - SSE streaming for live updates
- ✅ **API Key Security** - Protected write endpoints
- ✅ **Idempotent Detection** - One alert per county+disease+week
- ✅ **Alert Escalation** - Automatic severity updates
- ⏳ **Interactive Dashboard** - React frontend (in development)
- ⏳ **County Map Visualization** - Leaflet integration (planned)

---

## 🏗️ Architecture Status

### ✅ Backend: COMPLETE (Production-Ready)
- **Framework:** Quarkus 3.15.1
- **Language:** Java 17
- **Database:** H2 (file-backed, persistent)
- **API:** 8 RESTful endpoints + SSE streaming
- **Security:** API key authentication
- **Detection:** Statistical z-score analysis

### ⏳ Frontend: PENDING
- **Framework:** React + Vite (planned)
- **Styling:** Tailwind CSS (planned)
- **Map:** Leaflet (planned)

---

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Maven (or use included wrapper)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/kwisdomk/EW.git
   cd EW
   ```

2. **Start the backend**
   ```bash
   cd backend
   ./mvnw quarkus:dev
   ```
   
   Server starts at: `http://localhost:8080`

3. **Verify health**
   ```bash
   curl http://localhost:8080/health
   ```

4. **View seeded data**
   ```bash
   curl http://localhost:8080/api/reports
   ```

5. **Run outbreak detection**
   ```bash
   curl -X POST http://localhost:8080/api/detect \
     -H "X-API-KEY: epidemiwatch-dev"
   ```

6. **View generated alerts**
   ```bash
   curl http://localhost:8080/api/alerts
   ```

---

## 📡 API Endpoints

### Public Endpoints (No API Key Required)
- `GET /health` - Health check
- `GET /api/reports` - List disease reports (paginated)
- `GET /api/reports?county=Nairobi` - Filter by county
- `GET /api/reports?disease=cholera` - Filter by disease
- `GET /api/alerts` - List outbreak alerts (paginated)
- `GET /api/alerts?county=Nairobi&severity=RED` - Filter alerts
- `GET /api/alerts/unacknowledged` - Active alerts only
- `GET /api/alerts/stream` - SSE live alert feed
- `PUT /api/alerts/{id}/acknowledge` - Mark alert as reviewed

### Protected Endpoints (Require `X-API-KEY: epidemiwatch-dev`)
- `POST /api/reports` - Create disease report
- `DELETE /api/reports/{id}` - Delete report
- `POST /api/detect` - Trigger outbreak detection

---

## 🧪 Detection Algorithm

### Statistical Z-Score Analysis
```
1. Collect last 4 weeks of data per county+disease
2. Group by ISO week, sum cases per week
3. Calculate mean and sample standard deviation (n-1)
4. Compute z-score: (latest - mean) / stddev
5. Classify severity:
   - z < 2.0  → No alert
   - 2.0-3.0  → YELLOW alert
   - 3.0-4.0  → ORANGE alert
   - z ≥ 4.0  → RED alert
```

### Edge Case Handling
- ✅ Zero standard deviation → Bounded fallback (3.5 z-score)
- ✅ Missing weeks → Zero-padding for continuous time series
- ✅ Insufficient data → Requires minimum 2 weeks
- ✅ Duplicate alerts → Idempotent (one per county+disease+week)

---

## 🗂️ Repository Structure

```
EW/
├── README.md                    # This file
├── LICENSE                      # MIT License
├── .gitignore                   # Git exclusions
│
├── backend/                     # Quarkus backend (COMPLETE)
│   ├── src/main/java/com/epidemiwatch/
│   │   ├── entity/              # JPA entities
│   │   ├── repository/          # Panache repositories
│   │   ├── service/             # Business logic
│   │   ├── resource/            # REST endpoints
│   │   ├── security/            # API key filter
│   │   ├── sse/                 # SSE broadcaster
│   │   ├── util/                # Data normalizer
│   │   └── bootstrap/           # Data seeder
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── pom.xml
│   └── README.md
│
├── frontend/                    # React frontend (PENDING)
│   └── README.md                # Placeholder
│
├── data/mock/                   # Test data generation
│   ├── disease_reports.csv
│   └── generate_disease_reports.py
│
└── docs/                        # Documentation
    ├── bob_logs/                # IBM Bob usage logs
    ├── Bob_Prompts/             # Prompt templates
    ├── EW_COMPREHENSIVE_REVIEW.md
    ├── PHASE_0_BACKEND_RECREATION_PLAN.md
    ├── PRE_FRONTEND_STABILIZATION_REPORT.md
    ├── JUDGING_CHEKLIST.md
    └── FAILSAFE.md
```

---

## 🛠️ Technology Stack

### Backend
- **Quarkus 3.15.1** - Supersonic Subatomic Java
- **Hibernate Panache** - Simplified ORM
- **RESTEasy Reactive** - Non-blocking REST
- **H2 Database** - File-backed persistence
- **SmallRye Mutiny** - Reactive streams (SSE)
- **JAX-RS** - REST API standard

### Frontend (Planned)
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Utility-first styling
- **Leaflet** - Interactive maps

### AI Integration
- **IBM Bob** - Code generation assistant
- **Mock Watson Summaries** - AI-generated alert descriptions (placeholder for Watson NLU)

---

## 🏆 Hackathon Context

**Event:** IBM Dev Day Hackathon 2026  
**Theme:** AI-Powered Solutions for Public Health  
**Duration:** 72 hours  
**Team:** Solo developer + IBM Bob

### Judging Criteria Alignment
- ✅ **Completeness:** Backend fully functional, frontend in progress
- ✅ **Creativity:** Statistical detection + real-time streaming
- ✅ **Effectiveness:** Addresses real-world epidemic surveillance
- ✅ **IBM Technology:** Built with IBM Bob, designed for Watson integration

---

## 📊 Demo Scenario

The system includes **guaranteed demo data**:

1. **Baseline:** Nairobi cholera (weeks 1-3: 8-23 cases)
2. **Spike:** Nairobi cholera (week 4: 120-200 cases)
3. **Expected Result:** RED alert with z-score ≥ 4.0

**Demo Flow:**
```bash
# 1. View baseline data
curl http://localhost:8080/api/reports?county=Nairobi&disease=cholera

# 2. Trigger detection
curl -X POST http://localhost:8080/api/detect -H "X-API-KEY: epidemiwatch-dev"

# 3. View generated alert
curl http://localhost:8080/api/alerts
```

---

## 🔐 Security

- **API Key Authentication:** Write operations require `X-API-KEY` header
- **Default Key:** `epidemiwatch-dev` (configurable via `epidemiwatch.api.key` property)
- **Public Endpoints:** All GET operations open for dashboard access
- **CORS:** Configured for `http://localhost:5173` (Vite default)

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

- **IBM Bob** - AI-powered code generation
- **Quarkus Team** - Supersonic Java framework
- **Kenya Ministry of Health** - Inspiration for county-based surveillance

---

## 📞 Contact

**Project:** EpidemiWatch Sentinel
**Hackathon:** IBM Dev Day 2026
**Repository:** https://github.com/kwisdomk/EW

---

**Status:** Backend Complete ✅ | Frontend In Progress ⏳ | Demo Ready 🚀
