# IBM Bob Prompts Used - EpidermiWatch

This document tracks all prompts used with IBM Bob during the development of EpidermiWatch.

---

## BLOCK 1A: Backend Foundation

### 1.1 Mock Data CSV Generator
**Prompt:** Generate Python script to create mock disease reports CSV  
**File:** `data/mock/generate_disease_reports.py`  
**Status:** ✅ Complete

### 1.2 Quarkus Project Scaffold
**Prompt:** Create Quarkus Maven project with REST, Hibernate, H2  
**Files:** `backend/pom.xml`, `application.properties`  
**Status:** ✅ Complete

### 1.3 DiseaseReport Entity + Repository
**Prompt:** Create JPA entity and Panache repository for disease reports  
**Files:** `DiseaseReport.java`, `DiseaseReportRepository.java`  
**Status:** ✅ Complete

### 1.4 REST API for Reports
**Prompt:** Create REST endpoints for CRUD operations on disease reports  
**File:** `ReportResource.java`  
**Status:** ✅ Complete

---

## BLOCK 1B: Detection Engine

### 2.1 OutbreakDetector Service
**Prompt:** Implement z-score based statistical anomaly detection  
**File:** `OutbreakDetectorService.java`  
**Status:** ✅ Complete

### 2.2 Alert Entity + Repository
**Prompt:** Create OutbreakAlert entity with severity levels  
**Files:** `OutbreakAlert.java`, `OutbreakAlertRepository.java`  
**Status:** ✅ Complete

### 2.3 Detection Endpoint
**Prompt:** Create POST /api/detect endpoint to trigger detection  
**File:** `DetectionResource.java`  
**Status:** ✅ Complete

### 2.4 Alert Resource
**Prompt:** Create REST endpoints for alert management  
**File:** `AlertResource.java`  
**Status:** ✅ Complete

### 2.5 Data Seeder
**Prompt:** Create startup data seeder with guaranteed RED alert  
**File:** `DataSeeder.java`  
**Status:** ✅ Complete

---

## BLOCK 2: Frontend (Pending)

### 1.5 React + Vite + Tailwind
**Prompt:** Initialize React project with Vite and Tailwind CSS  
**Status:** 🚧 Pending

### 3.1 Fetch Alerts in React
**Prompt:** Create React component to fetch and display alerts  
**Status:** 🚧 Pending

---

## BLOCK 3: Map Integration (Pending)

### 3.2 County Map with Leaflet
**Prompt:** Integrate Leaflet map with Kenya counties  
**Status:** 🚧 Pending

### 3.3 Map Alerts Endpoint
**Prompt:** Create endpoint to get alerts grouped by county  
**Status:** 🚧 Pending

---

## BLOCK 4: AI Integration (Optional)

### 4.1 Watson Summarizer Service
**Prompt:** Integrate Watson NLU for alert summaries  
**Status:** ⏳ Optional (using mock summaries)

### 4.2 Integrate into Detection Endpoint
**Prompt:** Connect Watson service to detection flow  
**Status:** ⏳ Optional

---

## BLOCK 5: Deployment (Optional)

### 5.1 Dockerfile for Quarkus
**Prompt:** Create multi-stage Dockerfile for Quarkus  
**Status:** ⏳ Optional

### 5.2 OpenShift Deployment YAML
**Prompt:** Create Kubernetes manifests for OpenShift  
**Status:** ⏳ Optional

---

## Additional Prompts

### Security: API Key Filter
**Prompt:** Create JAX-RS filter for API key authentication  
**File:** `ApiKeyFilter.java`  
**Status:** ✅ Complete

### Utilities: Data Normalizer
**Prompt:** Create utility for consistent data formatting  
**File:** `DataNormalizer.java`  
**Status:** ✅ Complete

### SSE: Alert Broadcaster
**Prompt:** Create SSE broadcaster for real-time alerts  
**File:** `AlertBroadcaster.java`  
**Status:** ✅ Complete

---

## Prompt Template Format

Each Bob prompt followed this structure:
1. **Context:** What we're building and why
2. **Requirements:** Specific technical requirements
3. **Constraints:** Technology stack, patterns to follow
4. **Expected Output:** Files to create, structure to follow

---

**Note:** This log will be updated as frontend development progresses.