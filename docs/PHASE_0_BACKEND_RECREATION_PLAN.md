# Phase 0: Backend Recreation Plan
**Date:** 2026-05-01  
**Status:** PLANNING COMPLETE - READY FOR IMPLEMENTATION  
**Objective:** Recreate complete Quarkus backend from scratch based on Block 1A & 1B specifications

---

## 🎯 SITUATION ANALYSIS

### Problem Identified
- Backend files shown in VSCode tabs but don't exist in file system
- No `backend/` directory in workspace
- Blocks 1A and 1B marked as complete but code is missing
- **Decision:** Clean recreation required (not patching or debugging)

### Success Criteria
- ✅ Backend compiles successfully with Maven
- ✅ Quarkus server starts on port 8080
- ✅ All endpoints functional and tested
- ✅ H2 database configured and working
- ✅ Detection algorithm produces alerts
- ✅ Ready for Phase 1 (frontend integration)

---

## 📋 COMPLETE BACKEND SPECIFICATION

### 1. Project Structure
```
backend/
├── pom.xml
├── .mvn/
│   └── wrapper/
│       └── maven-wrapper.properties
├── src/
│   └── main/
│       ├── java/com/epidemiwatch/
│       │   ├── entity/
│       │   │   ├── DiseaseReport.java
│       │   │   └── OutbreakAlert.java
│       │   ├── repository/
│       │   │   ├── DiseaseReportRepository.java
│       │   │   └── OutbreakAlertRepository.java
│       │   ├── service/
│       │   │   └── OutbreakDetector.java
│       │   ├── resource/
│       │   │   ├── HealthResource.java
│       │   │   └── ReportResource.java
│       │   └── DataSeeder.java
│       └── resources/
│           └── application.properties
```

### 2. Maven Configuration (pom.xml)
**Requirements:**
- GroupId: `com.epidemiwatch`
- ArtifactId: `epidemiwatch-backend`
- Quarkus Version: 3.8.1
- Java Version: 17+

**Dependencies:**
- `quarkus-resteasy-reactive-jackson` - REST API with JSON
- `quarkus-hibernate-orm-panache` - ORM with Panache repositories
- `quarkus-jdbc-postgresql` - PostgreSQL driver (for production)
- `quarkus-jdbc-h2` - H2 in-memory database (for development)
- `quarkus-smallrye-openapi` - OpenAPI/Swagger documentation
- `quarkus-arc` - CDI dependency injection

### 3. Application Configuration (application.properties)
**Database (H2 for development):**
```properties
quarkus.datasource.db-kind=h2
quarkus.datasource.jdbc.url=jdbc:h2:mem:epidemiwatch
quarkus.hibernate-orm.database.generation=drop-and-create
quarkus.hibernate-orm.log.sql=true
```

**CORS Configuration:**
```properties
quarkus.http.cors=true
quarkus.http.cors.origins=http://localhost:5173
quarkus.http.cors.methods=GET,POST,PUT,DELETE
```

**Server Configuration:**
```properties
quarkus.http.port=8080
```

**OpenAPI:**
```properties
quarkus.smallrye-openapi.path=/swagger
```

### 4. Entity: DiseaseReport
**Package:** `com.epidemiwatch.entity`

**Fields:**
- `id` (Long) - Auto-generated primary key
- `county` (String) - @NotNull, Kenyan county name
- `subCounty` (String) - Sub-county name
- `disease` (String) - @NotNull, disease name
- `cases` (Integer) - Number of cases reported
- `reportDate` (LocalDate) - Date of report
- `createdAt` (LocalDateTime) - Auto-set on creation with @PrePersist

**Annotations:**
- `@Entity`
- `@Table(name = "disease_reports")`
- Validation: `@NotNull` on county and disease

### 5. Repository: DiseaseReportRepository
**Package:** `com.epidemiwatch.repository`

**Type:** Interface extending `PanacheRepository<DiseaseReport>`

**Custom Query Methods:**
```java
// Find reports from last 4 weeks for specific county and disease
List<DiseaseReport> findLast4WeeksByCountyAndDisease(String county, String disease);

// Find distinct county-disease pairs from last 7 days
List<Object[]> findDistinctCountyDiseasePairsLast7Days();
```

**Annotations:**
- `@ApplicationScoped`

### 6. Entity: OutbreakAlert
**Package:** `com.epidemiwatch.entity`

**Fields:**
- `id` (Long) - Auto-generated primary key
- `county` (String) - County where outbreak detected
- `disease` (String) - Disease name
- `riskScore` (BigDecimal) - Risk score 0-100
- `alertLevel` (String) - YELLOW/ORANGE/RED
- `zScore` (BigDecimal) - Statistical z-score
- `watsonSummary` (String) - AI-generated summary (mock for now)
- `recommendedAction` (String) - Recommended response action
- `detectedAt` (LocalDateTime) - When alert was created
- `acknowledged` (Boolean) - Default false, tracks if alert reviewed

**Annotations:**
- `@Entity`
- `@Table(name = "outbreak_alerts")`

### 7. Repository: OutbreakAlertRepository
**Package:** `com.epidemiwatch.repository`

**Type:** Interface extending `PanacheRepository<OutbreakAlert>`

**Custom Query Methods:**
```java
// Find all unacknowledged alerts
List<OutbreakAlert> findUnacknowledged();

// Find alerts by county
List<OutbreakAlert> findByCounty(String county);

// Find alerts by severity level
List<OutbreakAlert> findByAlertLevel(String alertLevel);
```

**Annotations:**
- `@ApplicationScoped`

### 8. Service: OutbreakDetector
**Package:** `com.epidemiwatch.service`

**Purpose:** Statistical anomaly detection using z-score algorithm

**Method:** `OutbreakAlert detect(String county, String disease)`

**Algorithm:**
1. Query last 4 weeks of reports for county+disease
2. Group by calendar week, sum cases per week
3. Calculate mean and standard deviation
4. Get latest week's cases
5. Calculate z-score: `(latest - mean) / stdDev`
6. Apply thresholds:
   - z-score < 2.0 → No alert (return null)
   - z-score 2.0-3.0 → YELLOW alert
   - z-score 3.0-4.0 → ORANGE alert
   - z-score > 4.0 → RED alert
7. Calculate risk score: `min(100, ((latest - mean) / (2*stdDev)) * 100)`

**Edge Cases:**
- If stdDev = 0: Use fallback threshold (1.5x mean)
- Require minimum 2 weeks of data
- Return null if no anomaly detected

**Annotations:**
- `@ApplicationScoped`
- `@Inject` DiseaseReportRepository

### 9. Resource: HealthResource
**Package:** `com.epidemiwatch.resource`

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "UP",
  "message": "EpidemiWatch Sentinel Backend is running"
}
```

**Annotations:**
- `@Path("/health")`
- `@Produces(MediaType.APPLICATION_JSON)`

### 10. Resource: ReportResource
**Package:** `com.epidemiwatch.resource`

**Base Path:** `/api`

**Endpoints:**

#### POST /api/reports
- Accepts DiseaseReport JSON
- Saves via repository
- Returns 201 with saved entity
- `@Transactional`

#### GET /api/reports
- Returns all reports as JSON array

#### GET /api/reports/{id}
- Returns single report by ID
- Returns 404 if not found

#### DELETE /api/reports/{id}
- Deletes report by ID
- Returns 204 on success
- `@Transactional`

#### POST /api/detect
- Finds distinct county-disease pairs from last 7 days
- For each pair, calls OutbreakDetector.detect()
- If alert returned:
  - Set detectedAt = now
  - Set watsonSummary = mock message
  - Set recommendedAction = guidance text
  - Save to database
- Returns: `{"alertsCreated": count}`
- `@Transactional`

#### GET /api/alerts
- Returns all outbreak alerts

#### GET /api/alerts/unacknowledged
- Returns only unacknowledged alerts

#### PUT /api/alerts/{id}/acknowledge
- Marks alert as acknowledged
- Returns updated alert
- `@Transactional`

**Annotations:**
- `@Path("/api")`
- `@Produces(MediaType.APPLICATION_JSON)`
- `@Consumes(MediaType.APPLICATION_JSON)`
- `@Inject` repositories and services

### 11. DataSeeder
**Package:** `com.epidemiwatch`

**Purpose:** Auto-seed test data on startup for demo stability

**Trigger:** `@Observes StartupEvent`

**Test Data:**
- Baseline: Nairobi cholera (weeks 1-3: 22-30 cases each)
- Anomaly: Nairobi cholera (week 4: 150-180 cases) - should trigger RED alert
- Normal data: Other counties/diseases for variety

**Expected Result:**
When POST /api/detect is called, should create 1 RED alert for Nairobi cholera

**Console Output:**
```
🌱 Seeding test data...
✅ Test data seeded successfully!
📊 Total reports: 13
🚨 Expected: Nairobi cholera should trigger RED alert when /api/detect is called
```

### 12. Maven Wrapper
**Files:**
- `.mvn/wrapper/maven-wrapper.properties`
- `mvnw` (Unix shell script)
- `mvnw.cmd` (Windows batch file)

**Purpose:** Allow running Maven without system installation

---

## 🔧 IMPLEMENTATION SEQUENCE

### Phase 0.1: Project Foundation (Files 1-3)
1. Create `backend/` directory
2. Create `pom.xml` with all dependencies
3. Create `application.properties` with H2 config
4. Create Maven wrapper files

### Phase 0.2: Data Layer (Files 4-7)
5. Create `DiseaseReport` entity
6. Create `DiseaseReportRepository` with custom queries
7. Create `OutbreakAlert` entity
8. Create `OutbreakAlertRepository` with custom queries

### Phase 0.3: Business Logic (File 8)
9. Create `OutbreakDetector` service with z-score algorithm

### Phase 0.4: API Layer (Files 9-10)
10. Create `HealthResource` for health check
11. Create `ReportResource` with all endpoints

### Phase 0.5: Test Data (File 11)
12. Create `DataSeeder` for automatic test data

### Phase 0.6: Verification
13. Compile: `./mvnw clean compile`
14. Start server: `./mvnw quarkus:dev`
15. Test all endpoints with curl/Postman

---

## ✅ TESTING CHECKLIST

### Compilation Test
```bash
cd backend
./mvnw clean compile
```
**Expected:** BUILD SUCCESS

### Server Startup Test
```bash
./mvnw quarkus:dev
```
**Expected:** 
- "Listening on: http://localhost:8080"
- DataSeeder console output showing test data

### Health Check Test
```bash
curl http://localhost:8080/health
```
**Expected:** `{"status":"UP","message":"EpidemiWatch Sentinel Backend is running"}`

### Reports API Test
```bash
# Get all reports
curl http://localhost:8080/api/reports

# Create new report
curl -X POST http://localhost:8080/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "county": "Nairobi",
    "subCounty": "Westlands",
    "disease": "cholera",
    "cases": 43,
    "reportDate": "2026-05-01"
  }'
```
**Expected:** 201 response with saved entity

### Detection Test
```bash
curl -X POST http://localhost:8080/api/detect
```
**Expected:** `{"alertsCreated": 1}` (for Nairobi cholera spike)

### Alerts API Test
```bash
# Get all alerts
curl http://localhost:8080/api/alerts

# Get unacknowledged alerts
curl http://localhost:8080/api/alerts/unacknowledged

# Acknowledge alert
curl -X PUT http://localhost:8080/api/alerts/1/acknowledge
```
**Expected:** Alert objects with proper structure

---

## 📊 SUCCESS METRICS

### Code Completeness
- [ ] 12 files created
- [ ] All entities have proper JPA annotations
- [ ] All repositories have custom queries
- [ ] Detection algorithm handles edge cases
- [ ] All endpoints return proper HTTP status codes

### Functional Completeness
- [ ] Server starts without errors
- [ ] Health endpoint responds
- [ ] Can create disease reports
- [ ] Can retrieve disease reports
- [ ] Detection generates alerts
- [ ] Can view alerts
- [ ] Can acknowledge alerts
- [ ] Test data seeds automatically

### Quality Indicators
- [ ] No compilation errors
- [ ] No runtime exceptions on startup
- [ ] Proper error handling in endpoints
- [ ] Console logging shows clear status
- [ ] API responses match expected format

---

## 🚀 READY FOR PHASE 1

Once Phase 0 is complete and all tests pass:

### Phase 1 Prerequisites Met
- ✅ Backend running on localhost:8080
- ✅ All API endpoints functional
- ✅ Detection algorithm working
- ✅ Test data available
- ✅ CORS configured for frontend

### Phase 1 Objectives
1. **Detection Engine Enhancement**
   - Refine z-score thresholds if needed
   - Add more sophisticated statistical analysis
   - Implement trend detection

2. **Alert Management**
   - Add alert filtering capabilities
   - Implement alert history
   - Add alert notifications

3. **Frontend Integration**
   - React dashboard consuming APIs
   - Real-time alert display
   - County map visualization

---

## 📝 NOTES

### Why Clean Recreation?
- Phantom files in VSCode tabs indicate incomplete save/commit
- Faster to recreate than debug file system issues
- Ensures all code is properly saved and version controlled
- Provides opportunity to verify all specifications

### Key Design Decisions
- **H2 Database:** Simplifies development, no external dependencies
- **Panache Repositories:** Reduces boilerplate code
- **Mock Watson Summaries:** Preserves IBM narrative without API dependency
- **DataSeeder:** Ensures demo stability with predictable test data
- **Z-score Algorithm:** Credible public health approach, simple to implement

### Risk Mitigation
- All specifications extracted from completion logs
- Bob prompts provide clear implementation guidance
- Test data ensures detection algorithm can be demonstrated
- Fallback to mock summaries if Watson integration fails

---

**Phase 0 Status:** SPECIFICATION COMPLETE - READY FOR CODE MODE  
**Next Action:** Switch to Code mode and begin implementation  
**Estimated Time:** 2-3 hours for complete backend recreation