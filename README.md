# Smart Civic Issue Reporting System

A full-stack civic issue reporting and management platform that lets citizens report public problems, administrators manage and assign them, and field workers update and resolve assigned issues.

The system includes secure authentication, role-based access control, geospatial issue handling with PostGIS, duplicate detection, smart assignment, SLA monitoring, notifications, audit logging, image uploads, and an authenticated AI civic assistant.

## Live Deployment

| Part | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | PostgreSQL + PostGIS |
| Source Code | GitHub |

**Frontend:**`https://smart-civic-issue-reporting-system-omega.vercel.app`
**Backend:** `https://smart-civic-issue-reporting-system.onrender.com`

The frontend is deployed separately on Vercel and communicates with the Render backend through the configured `VITE_API_BASE_URL`.

## Main Roles

### Citizen
- Register and verify account using OTP
- Login securely
- Report civic issues
- Upload issue images
- Select issue location on a map
- View submitted issues and status history
- Receive notifications
- Use the AI civic assistant

### Field Worker
- Login securely
- View assigned issues
- Open issue details and locations
- Update issue status
- Receive assignment, issue, and SLA notifications

### Admin
- View system dashboard and analytics
- Manage users
- View and manage civic issues
- Assign issues to field workers
- Monitor issue progress
- View audit logs
- Manage system settings
- Receive administrative notifications
- Use the AI civic assistant with admin-scoped context

## Core Workflow

```text
Citizen
   ↓
Report Issue
   ↓
Location + Images
   ↓
PostgreSQL / PostGIS
   ↓
Duplicate Detection
   ↓
Admin Review
   ↓
Field Worker Assignment
   ↓
Status Updates
   ↓
SLA Monitoring + Notifications
   ↓
Resolution
   ↓
Audit History
```

## Key Features

- JWT authentication
- Spring Security role-based authorization
- Citizen / Field Worker / Admin access control
- OTP registration verification
- Password reset with OTP
- Account status checks
- Civic issue creation and management
- Controlled issue status workflow
- Issue status history
- Geospatial location storage using `geometry(Point, 4326)`
- Nearby issue search
- Geospatial duplicate detection
- Smart field-worker assignment based on workload/availability
- SLA warning and breach notifications
- In-app notifications
- Audit logging
- Local image storage with upload/path validation
- Authenticated, role-aware, read-only Gemini AI assistant
- Responsive React frontend
- Leaflet + OpenStreetMap maps
- Flyway database migrations
- Docker and Docker Compose support

## Technology Stack

### Backend

- Java 21
- Spring Boot
- Spring Security
- JWT
- Spring Data JPA
- Hibernate
- Hibernate Spatial
- Jakarta Validation
- PostgreSQL
- PostGIS
- Flyway
- Maven
- JavaMail / SMTP
- Google Gemini API
- Docker

### Frontend

- React
- Vite
- JavaScript
- React Router
- Axios
- Leaflet
- OpenStreetMap
- CSS

### Local/Container Infrastructure

- Docker
- Docker Compose
- Nginx
- Git
- GitHub

### Public Hosting

- Vercel — frontend
- Render — backend

## Geospatial System

Issue locations are stored in PostgreSQL/PostGIS as:

```text
geometry(Point, 4326)
```

The system supports:

- Location storage and updates
- Nearby issue searches
- Duplicate issue detection
- Geographic filtering
- Map-based issue interaction
- Spatial indexing with GiST

## Authentication & Security

The backend is the authoritative security boundary.

Implemented protections include:

- JWT authentication
- Role-based authorization
- Method-level authorization
- Stateless authentication
- Account enabled/locked checks
- Ownership checks
- IDOR protection
- Request validation
- Coordinate validation
- OTP format and cooldown validation
- OTP concurrency protection
- Upload validation
- Path traversal protection
- Pagination limits
- Admin-only sensitive APIs
- AI input validation and role-scoped context

The frontend uses protected routes and centralized Axios authentication, but frontend checks are not treated as a replacement for backend authorization.

## AI Civic Assistant

The AI assistant uses the Google Gemini API through the Spring Boot backend.

It is:

- Authentication protected
- Role aware
- Read only
- Scoped to the authenticated user's permitted data
- Input validated
- Designed to resist prompt injection
- Restricted from exposing secrets or unauthorized information

The AI service does not receive unrestricted database access and does not directly modify application state.

## Database

Main application entities include:

```text
users
issues
notifications
issue_status_history
email_otps
audit_logs
admin_settings
flyway_schema_history
```

Flyway manages versioned schema migrations, while Hibernate uses schema validation rather than automatically changing the database schema.

## Image Storage

Issue images are stored using the application's local storage layer rather than an external object-storage service.

The Docker setup persists uploads through:

```text
./uploads:/app/uploads
```

Upload handling includes path containment and validation protections.

## Frontend API Configuration

The frontend uses:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

for local development.

For the deployed frontend, `VITE_API_BASE_URL` points to the Render backend API:

```env
VITE_API_BASE_URL=https://smart-civic-issue-reporting-system.onrender.com/api/v1
```

Because Vite embeds environment variables during the build, the frontend must be rebuilt/redeployed after changing this value.

## Local Development

### Backend

```powershell
cd backend
.\mvnw spring-boot:run
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Typical local frontend:

```text
http://localhost:5173
```

Typical local backend:

```text
http://localhost:8080
```

## Docker

The project also has a Docker Compose setup for running the application locally/containerized.

Services:

```text
postgres
backend
frontend
```

Build:

```powershell
docker compose build
```

Start:

```powershell
docker compose up -d
```

Check:

```powershell
docker compose ps
```

Local Docker ports:

| Component | Host Port |
|---|---:|
| Frontend / Nginx | 5173 |
| Backend / Spring Boot | 8080 |
| PostgreSQL / PostGIS | 5433 |

Inside Docker, the backend connects to PostgreSQL through:

```text
postgres:5432
```

## Public Deployment

The current public deployment is:

```text
Vercel
   ↓
React + Vite Frontend
   ↓
Render
   ↓
Spring Boot Backend
   ↓
PostgreSQL + PostGIS
```

The backend is deployed on Render and the frontend is deployed on Vercel.

Production environment variables are configured through the respective deployment platforms rather than committed to the repository.

Important production configuration includes:

- Backend environment variables
- `VITE_API_BASE_URL`
- JWT secret
- Database credentials
- Gemini API key
- SMTP credentials
- Correct production CORS origin

## Deployment Documentation

Detailed local Docker deployment and troubleshooting instructions are available in:

```text
DEPLOYMENT.md
```

## Project Structure

```text
Smart_Civic_Issue_Reporting_System/
│
├── backend/
│   ├── src/
│   ├── pom.xml
│   ├── Dockerfile
│   └── mvnw
│
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
│
├── uploads/
├── docker-compose.yml
├── README.md
└── DEPLOYMENT.md
```

## Current Implementation Status

Implemented project areas include:

- Authentication and authorization
- Citizen issue reporting
- Field-worker workflow
- Admin management
- Notifications
- SLA monitoring
- Audit logging
- PostGIS geospatial features
- Duplicate detection
- Smart assignment
- Gemini AI assistant
- Responsive frontend
- Docker-based local deployment
- Public frontend deployment on Vercel
- Public backend deployment on Render

## Important Technology Scope

This project documentation intentionally lists only technologies actually used by the current implementation.

The project does **not** claim the use of:

- RabbitMQ
- Redis
- AWS S3
- AWS EC2
- GitHub Actions CI/CD
- Kubernetes
- A Node.js backend

Node/npm may be used as part of the normal React/Vite frontend development toolchain, but the application backend is Java/Spring Boot.

## Engineering Principles

- Backend authorization is the source of truth.
- Secrets are supplied through environment variables.
- Database schema changes are handled through Flyway.
- Spatial data uses PostGIS instead of storing geographic data only as plain coordinates.
- Uploaded images are kept outside the database.
- AI access is authenticated and role scoped.
- Production deployment details are documented from the actual hosting setup rather than planned infrastructure.

## License

This project was developed as a software engineering and civic-technology project.

Add an appropriate open-source license before public redistribution if required.
