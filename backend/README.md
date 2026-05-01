# EpidemiWatch Sentinel - Backend

A Quarkus-based backend system for real-time epidemic surveillance and outbreak detection in Kenya.

## Technology Stack

- **Java**: 17
- **Framework**: Quarkus 3.15.1
- **Build Tool**: Maven (with wrapper)
- **Database**: H2 (in-memory for development)
- **ORM**: Hibernate Panache
- **REST**: RESTEasy Reactive with Jackson

## Prerequisites

- Java 17 or higher
- No Maven installation required (uses Maven wrapper)

## Quick Start

### 1. Compile the project

```bash
./mvnw clean compile
```

### 2. Run in development mode

```bash
./mvnw quarkus:dev
```

The application will start on `http://localhost:8080`

## API Endpoints

### Health Check
- `GET /health` - Returns "OK" if service is running

### Disease Reports
- `POST /api/reports` - Create a new disease report
- `GET /api/reports` - List all reports
- `GET /api/reports/{id}` - Get specific report
- `DELETE /api/reports/{id}` - Delete a report
- `GET /api/reports/county/{county}` - Get reports by county
- `GET /api/reports/disease/{disease}` - Get reports by disease

### Outbreak Detection
- `POST /api/detect` - Run outbreak detection algorithm
  - Returns: `{ "alertsCreated": number, "alerts": [...] }`

### Alerts
- `GET /api/alerts` - List all alerts
- `GET /api/alerts/unacknowledged` - List unacknowledged alerts
- `GET /api/alerts/{id}` - Get specific alert
- `PUT /api/alerts/{id}/acknowledge` - Mark alert as acknowledged
- `GET /api/alerts/county/{county}` - Get alerts by county
- `GET /api/alerts/disease/{disease}` - Get alerts by disease
- `GET /api/alerts/level/{level}` - Get alerts by level (GREEN, YELLOW, ORANGE, RED)

## Testing the System

### 1. Check health
```bash
curl http://localhost:8080/health
```

### 2. List reports (auto-seeded on startup)
```bash
curl http://localhost:8080/api/reports
```

### 3. Run outbreak detection
```bash
curl -X POST http://localhost:8080/api/detect
```

### 4. View alerts
```bash
curl http://localhost:8080/api/alerts
```

## Outbreak Detection Algorithm

The system uses statistical anomaly detection:

1. Collects last 4 weeks of data per county-disease pair
2. Groups data by week
3. Calculates mean and standard deviation from historical weeks
4. Computes z-score: `(latest - mean) / stddev`
5. Determines alert level:
   - `z < 2`: No alert
   - `2 ≤ z < 3`: YELLOW alert
   - `3 ≤ z < 4`: ORANGE alert
   - `z ≥ 4`: RED alert

## Mock Data

The system auto-generates mock data on startup:

- **10 Kenyan Counties**: Nairobi, Mombasa, Kisumu, Nakuru, Kiambu, Machakos, Uasin Gishu, Kakamega, Kilifi, Meru
- **3 Diseases**: malaria, cholera, typhoid
- **4 weeks** of historical data
- **Outbreak spike**: Nairobi cholera (150-200 cases) - guaranteed RED alert

## Development

### Package the application
```bash
./mvnw package
```

### Run tests
```bash
./mvnw test
```

### Clean build
```bash
./mvnw clean install
```

## CORS Configuration

CORS is enabled for frontend development:
- Allowed origins: `http://localhost:3000`, `http://127.0.0.1:3000`
- Allowed methods: GET, POST, PUT, DELETE, OPTIONS

## Database

H2 in-memory database is used for development:
- Console: Not exposed (in-memory only)
- Schema: Auto-created on startup
- Data: Seeded automatically

## Project Structure

```
backend/
├── src/
│   └── main/
│       ├── java/com/epidemiwatch/
│       │   ├── entity/          # JPA entities
│       │   ├── repository/      # Panache repositories
│       │   ├── service/         # Business logic
│       │   ├── resource/        # REST endpoints
│       │   └── bootstrap/       # Data seeding
│       └── resources/
│           └── application.properties
├── pom.xml
├── mvnw
└── mvnw.cmd
```

## License

MIT License