
# Smart Civic Issue Reporting System

A full-stack civic issue reporting and management platform that enables citizens to report public issues, administrators to manage and assign them, and field workers to resolve them through a secure, geospatially aware workflow.

The system combines **role-based access control, JWT authentication, geospatial search with PostGIS, duplicate issue detection, smart worker assignment, SLA monitoring, notifications, audit logging, image storage, and an AI-powered civic assistant** into a single platform.

---

# 1. Project Overview

The Smart Civic Issue Reporting System is designed to digitize the process of reporting, managing, assigning, tracking, and resolving civic issues.

Citizens can report problems such as:

- Road damage
- Potholes
- Garbage accumulation
- Streetlight failures
- Water leakage
- Drainage problems
- Public infrastructure issues
- Other civic problems

The platform provides a complete lifecycle from issue reporting to resolution.

## Core Workflow

```text
Citizen
   │
   │ Report Civic Issue
   ▼
Issue Created
   │
   ├── Location Stored Using PostGIS
   │
   ├── Duplicate Detection
   │
   └── Notification
   │
   ▼
Admin Review
   │
   │ Smart Assignment
   ▼
Field Worker
   │
   │ Status Updates
   ▼
Issue Resolution
   │
   ├── Citizen Notification
   ├── SLA Monitoring
   └── Audit Logging
   ▼
Resolved Issue
````

---

# 2. Objectives

The primary objectives of the system are:

* Provide citizens with an easy way to report civic issues.
* Capture accurate geographic locations for reported issues.
* Detect potentially duplicate reports.
* Allow administrators to manage the complete issue lifecycle.
* Automatically assist with field-worker assignment.
* Consider worker workload during assignment.
* Allow field workers to manage assigned issues.
* Track issue status transitions.
* Monitor SLA deadlines.
* Notify relevant users about important events.
* Maintain audit logs for accountability.
* Provide secure role-based access.
* Provide an AI assistant for authenticated users.
* Support containerized deployment using Docker.
* Provide a scalable foundation for future civic-tech improvements.

---

# 3. User Roles

The system contains three primary roles:

```text
CITIZEN
FIELD_WORKER
ADMIN
```

## Citizen

Citizens can:

* Register an account.
* Verify registration using OTP.
* Login securely.
* Manage their profile.
* Report civic issues.
* Upload issue images.
* Select issue locations using a map.
* View their own reported issues.
* View issue details.
* View status history.
* Receive notifications.
* Use the AI civic assistant.
* Track issue progress.

---

## Field Worker

Field workers can:

* Login securely.
* View their assigned issues.
* View issue details.
* View issue locations.
* Update issue status according to the allowed workflow.
* Receive assignment notifications.
* Receive SLA-related notifications.
* Receive issue-related notifications.

Field workers cannot access issues that are not assigned to them.

---

## Admin

Administrators can:

* Login securely.
* View system dashboard.
* View analytics.
* Manage users.
* Search users.
* Manage account status.
* View all civic issues.
* Assign issues to field workers.
* Monitor issue progress.
* View audit logs.
* Manage system settings.
* Receive administrative notifications.
* Use the AI civic assistant with administrator-scoped context.

---

# 4. Tech Stack

## Backend

| Technology         | Purpose                                       |
| ------------------ | --------------------------------------------- |
| Java 21            | Backend programming language                  |
| Spring Boot        | REST API and backend application framework    |
| Spring Security    | Authentication and authorization              |
| JWT                | Stateless authentication                      |
| Spring Data JPA    | Database access and repository abstraction    |
| Hibernate          | ORM and persistence                           |
| Hibernate Spatial  | Geographic data support                       |
| Jakarta Validation | Request and input validation                  |
| PostgreSQL         | Relational database                           |
| PostGIS            | Geographic and spatial database functionality |
| Flyway             | Database schema versioning and migrations     |
| Maven              | Backend dependency management and build       |
| JavaMail / SMTP    | Email delivery for OTP and account workflows  |
| Gemini API         | AI civic assistant                            |
| Docker             | Backend containerization                      |

---

## Frontend

| Technology    | Purpose                                    |
| ------------- | ------------------------------------------ |
| React         | Frontend user interface                    |
| Vite          | Frontend build tool and development server |
| JavaScript    | Frontend programming language              |
| React Router  | Client-side routing                        |
| Axios         | HTTP/API communication                     |
| Leaflet       | Interactive maps                           |
| OpenStreetMap | Map tile and geographic map data           |
| CSS           | UI styling and responsive layouts          |

---

## Database & Geospatial

| Technology        | Purpose                               |
| ----------------- | ------------------------------------- |
| PostgreSQL        | Primary relational database           |
| PostGIS           | Spatial/geographic database extension |
| Hibernate Spatial | JTS/PostGIS integration               |
| Flyway            | Version-controlled schema migrations  |
| GiST Index        | Efficient spatial queries             |

Issue locations are stored using:

```text
geometry(Point, 4326)
```

---

## AI

The project uses:

```text
Google Gemini API
```

The AI assistant is integrated into the Spring Boot backend and operates using authenticated, role-scoped application context.

The AI assistant is designed to be:

* Authentication protected
* Role aware
* Read only
* Context scoped
* Input validated
* Resistant to prompt injection
* Restricted from exposing secrets or unauthorized information

---

## Infrastructure

| Technology           | Purpose                                          |
| -------------------- | ------------------------------------------------ |
| Docker               | Containerization                                 |
| Docker Compose       | Multi-container orchestration                    |
| Nginx                | Production frontend static-file serving          |
| PostGIS Docker Image | PostgreSQL + PostGIS database container          |
| Git                  | Version control                                  |
| GitHub               | Source code repository and project collaboration |

---

# 5. Major Features

## Authentication & Authorization

The system implements secure authentication using:

* JWT
* Spring Security
* Password hashing
* Role-based authorization
* Account status validation
* Registration OTP verification
* Password reset OTP
* Registration OTP resend protection
* Password reset cooldown
* OTP concurrency protection

Authentication is stateless.

---

## Role-Based Access Control

Three roles are supported:

```text
CITIZEN
FIELD_WORKER
ADMIN
```

Backend authorization is enforced using Spring Security and method-level security.

Frontend protected routes provide an additional user-experience layer, while the backend remains the authoritative security boundary.

---

# 6. Authentication Flow

## Registration

```text
User Registration
       ↓
Input Validation
       ↓
Account Created
       ↓
Registration OTP
       ↓
OTP Verification
       ↓
Account Activated
```

---

## Login

```text
Email + Password
       ↓
Authentication
       ↓
Account Status Validation
       ↓
JWT Generated
       ↓
JWT Stored by Frontend
       ↓
Authenticated Requests
```

---

## Password Reset

```text
Forgot Password
       ↓
Password Reset OTP
       ↓
OTP Verification
       ↓
New Password
       ↓
Password Updated
```

The password reset flow contains cooldown protection to prevent OTP spam.

---

# 7. Security

Security was treated as a core requirement of the application.

## Backend Security

Implemented protections include:

* JWT authentication
* Role-based authorization
* Method-level authorization
* Stateless sessions
* Account enabled/locked checks
* Ownership checks
* IDOR protection
* Input validation
* Coordinate range validation
* OTP format validation
* OTP cooldown
* OTP concurrency protection
* Generic authentication error messages
* Account enumeration mitigation
* Path traversal protection
* Upload validation
* AI input length validation
* Pagination limits
* Admin-only sensitive APIs

---

## JWT Security

JWT authentication is applied to protected APIs.

The backend validates:

* Token presence
* Token validity
* User identity
* Account enabled status
* Account lock status

Suspended or disabled users cannot continue using previously issued JWTs.

---

## Sensitive API Protection

Administrative APIs are restricted to administrators.

Examples include:

```text
/api/v1/admin/**
/api/v1/audit-logs/**
```

Sensitive user-management operations are also restricted appropriately.

---

# 8. Civic Issue Management

Citizens can create civic issues containing information such as:

* Title
* Description
* Category
* Priority
* Location
* Images

The backend validates incoming data before persisting it.

---

# 9. Issue Status Workflow

Issues follow a controlled status lifecycle.

Status transitions are validated by the backend.

The workflow prevents unauthorized or invalid state transitions.

Status changes are recorded in issue status history.

Typical lifecycle:

```text
REPORTED
    ↓
ASSIGNED
    ↓
IN_PROGRESS
    ↓
RESOLVED
```

The exact transition rules are enforced by backend business logic.

---

# 10. Duplicate Issue Detection

The system contains geospatial duplicate detection.

When a citizen reports an issue, the system can identify nearby issues belonging to the same category.

The duplicate detection process considers:

* Geographic proximity
* Issue category
* Existing issue records

The system can indicate that an issue may already exist rather than blindly creating independent duplicate reports.

---

# 11. Geospatial System

The project uses:

```text
PostgreSQL + PostGIS
```

Issue locations are stored using:

```text
geometry(Point, 4326)
```

The system uses spatial indexing for efficient geographic queries.

## Geospatial Capabilities

The system supports:

* Storing issue coordinates
* Updating issue coordinates
* Nearby issue searches
* Duplicate detection
* Geographic filtering
* Map-based issue interaction

A GiST spatial index is used for location-based queries.

---

# 12. Location Picker

The citizen issue reporting interface provides map-based location selection.

The frontend uses:

* Leaflet
* OpenStreetMap

Users can select the location of a civic issue directly on the map.

---

# 13. Smart Assignment

The system supports administrator-driven smart assignment of issues to field workers.

Assignment considers worker workload and available field workers.

The assignment workflow also triggers notifications for relevant users.

Example:

```text
New Issue
    ↓
Assignment Logic
    ↓
Available Field Worker
    ↓
Worker Assigned
    ↓
Worker Notification
    ↓
Citizen Notification
```

---

# 14. SLA Monitoring

The system includes SLA monitoring for civic issues.

A scheduled backend process monitors issue deadlines.

The system can generate notifications for:

* SLA warning
* SLA breach

Duplicate notification prevention is implemented to avoid repeatedly generating the same SLA notification.

---

# 15. Notification System

The application contains an internal notification system.

Notifications can be generated for events such as:

* Issue creation
* Worker assignment
* Status updates
* Resolution
* SLA warning
* SLA breach

Notifications contain information such as:

* Notification type
* Title
* Message
* Optional reference ID
* Read/unread state
* Creation timestamp

## Notification Features

Users can:

* View notifications
* View unread notification count
* Mark an individual notification as read
* Mark notifications as read

The notification system is available across supported user roles.

---

# 16. Audit Logging

Important system actions are recorded in audit logs.

Audit logging provides accountability and traceability.

Audit information can include:

* Actor
* Action
* Entity
* Entity ID
* Timestamp
* Relevant metadata

Audit logs are restricted to administrators.

---

# 17. Image Upload & Storage

The system supports civic issue image uploads.

Images are stored outside the database using the application's storage layer.

The backend uses a local storage implementation.

Security protections include:

* File path containment validation
* Path traversal protection
* Upload validation
* Controlled image access

Docker maps the upload directory using a persistent bind mount.

---

# 18. AI Civic Assistant

The system includes an authenticated AI assistant powered by Gemini.

The AI assistant is designed as a civic information and issue-management assistant.

The assistant is:

* Authentication protected
* Role aware
* Read only
* Scoped to the authenticated user's permitted data

---

## AI Role Scoping

### Citizen

The assistant can work with citizen-scoped issue information.

### Field Worker

The assistant can work with worker-scoped issue and assignment information.

### Admin

The assistant can work with administrator-level civic system information allowed by the application.

The assistant does not bypass backend authorization.

---

## AI Security

AI security protections include:

* Authentication requirement
* Role-aware context
* Input length validation
* Prompt injection resistance
* No secret exposure
* No private unauthorized data
* No schema/security mechanism disclosure
* Read-only behavior

The AI assistant does not directly modify application state.

---

# 19. AI Context

The backend builds AI context from application data rather than giving the model unrestricted database access.

Recent issue information is scoped and limited before being supplied to the AI service.

This keeps the assistant aligned with the user's role and permissions.

---

# 20. Frontend

The frontend is built using:

* React
* Vite
* JavaScript
* React Router
* Axios
* Leaflet
* OpenStreetMap
* CSS

The frontend provides separate experiences for:

```text
Citizen
Field Worker
Admin
```

---

# 21. Frontend Routing

The application uses protected routing.

Routes are grouped according to access requirements.

The frontend contains protected routes for:

* Citizen pages
* Field worker pages
* Admin pages

The AI assistant is mounted globally while remaining authentication protected.

---

# 22. Frontend API Client

The application uses a centralized Axios API client.

The API client:

* Uses the configured API base URL.
* Automatically attaches JWT authorization headers.
* Handles unauthorized responses.
* Clears invalid authentication state.
* Redirects users to login when required.
* Normalizes backend error messages.

The frontend uses environment configuration for the API base URL.

Example:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

---

# 23. Frontend Security

Frontend security hardening includes:

* Protected routes
* Role checks
* Malformed localStorage handling
* Centralized API authentication
* Unauthorized response handling
* No hardcoded production API URLs
* No embedded backend secrets
* Controlled image URLs

Frontend authorization is not treated as a replacement for backend authorization.

---

# 24. Admin Dashboard

The admin dashboard provides system-level visibility.

It supports areas such as:

* Issue statistics
* User statistics
* Issue management
* User management
* Analytics
* Audit logs
* System settings
* Notifications

Administrative APIs are protected at the backend level.

---

# 25. Field Worker Dashboard

The field worker dashboard focuses on assigned work.

It provides:

* Assigned issue visibility
* Issue details
* Status management
* Location information
* Notifications
* SLA-related information

The interface is scoped to field-worker responsibilities.

---

# 26. Citizen Dashboard

The citizen dashboard provides:

* Personal issue overview
* Issue reporting
* Issue history
* Issue details
* Status history
* Notifications
* AI assistant access

Citizens can only access their authorized issue information.

---

# 27. Database

The project uses:

```text
PostgreSQL
PostGIS
```

The primary application entities include:

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

---

# 28. Database Relationships

Major relationships include:

```text
User
 ├── Reported Issues
 ├── Assigned Issues
 ├── Notifications
 ├── Email OTPs
 ├── Audit Logs
 └── Status History

Issue
 ├── Reporter
 ├── Assigned Field Worker
 └── Status History
```

Foreign keys maintain relational integrity.

---

# 29. Flyway Database Migrations

Database schema management is handled using Flyway.

The project uses versioned migrations.

The current verified schema version is:

```text
18
```

Hibernate is configured with:

```text
ddl-auto = validate
```

This means Hibernate validates the schema rather than modifying it automatically.

Flyway is responsible for database schema evolution.

---

# 30. PostGIS

PostGIS is enabled in the PostgreSQL environment.

The application uses Hibernate Spatial for geographic entity support.

The Docker database uses:

```text
postgis/postgis:latest
```

Spatial indexes are included for efficient geographic operations.

---

# 31. Backend Architecture

The backend follows a modular Spring Boot architecture.

Major modules include:

```text
admin
adminsettings
ai
audit
auth
common
config
issue
notification
storage
user
```

---

# 32. Backend Package Structure

High-level structure:

```text
backend/
└── src/
    └── main/
        ├── java/
        │   └── com/
        │       └── smartcivic/
        │           └── backend/
        │               ├── admin/
        │               ├── adminsettings/
        │               ├── ai/
        │               ├── audit/
        │               ├── auth/
        │               ├── common/
        │               ├── config/
        │               ├── issue/
        │               ├── notification/
        │               ├── storage/
        │               └── user/
        │
        └── resources/
            ├── db/
            │   └── migration/
            ├── application.yaml
            ├── application-dev.yaml
            └── application-prod.yaml
```

---

# 33. Backend Technologies

The backend uses:

* Java 21
* Spring Boot
* Spring Security
* Spring Data JPA
* Hibernate
* Hibernate Spatial
* PostgreSQL
* PostGIS
* Flyway
* JWT
* Jakarta Validation
* Maven
* JavaMail / SMTP
* Gemini API
* Docker

---

# 34. Frontend Technologies

The frontend uses:

* React
* Vite
* JavaScript
* React Router
* Axios
* Leaflet
* OpenStreetMap
* CSS

---

# 35. Docker Architecture

The complete application can run using Docker Compose.

Architecture:

```text
                         Browser
                            │
                            ▼
                 ┌─────────────────────┐
                 │ Frontend Container  │
                 │ React + Nginx       │
                 │ Host: 5173          │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ Backend Container   │
                 │ Spring Boot        │
                 │ Host: 8080          │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ PostgreSQL/PostGIS  │
                 │ Host: 5433          │
                 │ Container: 5432     │
                 └─────────────────────┘
```

---

# 36. Docker Services

Docker Compose contains three primary services:

```text
postgres
backend
frontend
```

## PostgreSQL Container

Image:

```text
postgis/postgis:latest
```

Container:

```text
smart-civic-postgres
```

Host port:

```text
5433
```

Container port:

```text
5432
```

---

## Backend Container

Image:

```text
smart-civic-backend:latest
```

Container:

```text
smart-civic-backend
```

Port:

```text
8080
```

Production Spring profile:

```text
prod
```

---

## Frontend Container

Image:

```text
smart-civic-frontend:latest
```

Container:

```text
smart-civic-frontend
```

Port mapping:

```text
5173 → 80
```

Nginx serves the production frontend build.

---

# 37. Docker Persistent Storage

PostgreSQL uses a named Docker volume:

```text
smart-civic-postgres-data
```

Issue images use:

```text
./uploads:/app/uploads
```

This keeps uploaded files outside the backend container filesystem.

---

# 38. Docker Restart Policy

Application containers use:

```yaml
restart: unless-stopped
```

This allows containers to automatically restart after unexpected failures while still allowing intentional shutdown.

---

# 39. PostgreSQL Healthcheck

PostgreSQL uses:

```text
pg_isready
```

to verify database readiness.

The backend depends on PostgreSQL becoming healthy before startup.

The backend itself does not use an application healthcheck endpoint in the current Docker Compose configuration.

---

# 40. Production Configuration

The project provides:

```text
application-dev.yaml
application-prod.yaml
```

Development uses local environment configuration.

Production uses environment variables injected by Docker or the deployment environment.

The production profile is activated through:

```text
SPRING_PROFILES_ACTIVE=prod
```

The production configuration disables SQL output intended for development and keeps Hibernate schema management in validation mode.

---

# 41. Environment Variables

Sensitive configuration must be supplied through environment variables.

Required backend variables include:

```env
DB_URL=<database-url>
DB_USERNAME=<database-username>
DB_PASSWORD=<database-password>

JWT_SECRET=<strong-jwt-secret>

GEMINI_API_KEY=<gemini-api-key>

MAIL_USERNAME=<smtp-username>
MAIL_PASSWORD=<smtp-password>
```

Docker Compose also uses:

```env
POSTGRES_DB=<database-name>
POSTGRES_USER=<database-user>
```

Never commit real secrets to Git.

---

# 42. Local Development

## Backend

Navigate to:

```powershell
cd backend
```

Configure the required environment variables.

Run:

```powershell
.\mvnw spring-boot:run
```

---

## Frontend

Navigate to:

```powershell
cd frontend
```

Install dependencies:

```powershell
npm install
```

Run development server:

```powershell
npm run dev
```

The frontend is normally available at:

```text
http://localhost:5173
```

---

# 43. Docker Deployment

From the project root:

```powershell
docker compose build
```

Start the complete stack:

```powershell
docker compose up -d
```

Check containers:

```powershell
docker compose ps
```

View backend logs:

```powershell
docker compose logs backend --tail 50
```

View PostgreSQL logs:

```powershell
docker compose logs postgres --tail 50
```

View frontend logs:

```powershell
docker compose logs frontend --tail 50
```

---

# 44. Docker Application URLs

Current local Docker deployment:

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:8080
```

PostgreSQL:

```text
Host: localhost
Port: 5433
```

---

# 45. pgAdmin Connection

To connect pgAdmin to the Docker PostgreSQL instance:

```text
Host: localhost
Port: 5433
Database: smart_civic_reportingdb
Username: postgres
Password: <DB_PASSWORD>
```

Important:

```text
localhost:5432
```

refers to a local PostgreSQL installation when one is running on that port.

Docker PostgreSQL is exposed on:

```text
localhost:5433
```

---

# 46. CORS

The backend uses Spring Security CORS integration.

The current Docker development/localhost frontend origin is:

```text
http://localhost:5173
```

Allowed request methods include:

```text
GET
POST
PUT
PATCH
DELETE
OPTIONS
```

The CORS configuration supports authorization headers required by JWT authentication.

When deploying to a real public domain, the configured frontend origin must be updated to the production frontend domain.

---

# 47. Current Deployment vs Future Cloud Deployment

The current project has a verified Docker-based deployment configuration.

Current local architecture:

```text
React + Nginx
      ↓
Spring Boot
      ↓
PostgreSQL + PostGIS
```

The project has **not yet locked a specific public cloud hosting provider**.

When public deployment is performed, the deployment documentation and README should be updated with the actual selected infrastructure.

The future deployment should specifically account for:

* Spring Boot backend hosting
* React frontend hosting
* PostgreSQL + PostGIS hosting
* Persistent issue-image storage
* Environment variables/secrets
* Production CORS
* HTTPS
* Database migrations
* Application URLs
* Monitoring
* Backup strategy

A free-tier deployment will be preferred where the required application functionality can realistically be supported.

---

# 48. Testing

The project underwent extensive testing during development.

Testing areas include:

* Authentication
* Authorization
* JWT validation
* Account status handling
* OTP flows
* Password reset
* Issue management
* Status workflow
* Duplicate detection
* Smart assignment
* Notifications
* SLA monitoring
* Audit logging
* PostGIS
* AI assistant
* Frontend routing
* Frontend security
* Docker deployment
* Backend/frontend integration

---

# 49. Backend Testing

Backend validation included:

* Maven build verification
* Authentication testing
* Authorization testing
* JWT regression testing
* OTP validation
* OTP cooldown testing
* OTP concurrency protection
* Issue access-control testing
* Admin endpoint protection
* Field-worker ownership checks
* Citizen ownership checks
* File path security
* Upload validation
* AI authorization and scoping
* Database/Flyway validation

A clean Maven test/build cycle was successfully completed during the project hardening phase.

---

# 50. Security Testing

Security testing covered:

```text
Authentication
Authorization
IDOR
JWT account-status validation
Account enumeration
OTP abuse
OTP concurrency
Input validation
Coordinate validation
File path traversal
File upload validation
Pagination limits
Admin endpoint protection
AI prompt injection
Sensitive data exposure
```

---

# 51. Frontend Testing

Frontend testing covered:

* Citizen authentication
* Citizen dashboard
* Citizen issue workflows
* Notifications
* Admin workflows
* Field worker workflows
* Protected routes
* Direct route refresh
* Image display
* AI assistant
* API integration

---

# 52. End-to-End Issue Lifecycle Test

The complete lifecycle was validated:

```text
Citizen Login
     ↓
Create Issue
     ↓
Issue Stored
     ↓
Admin Login
     ↓
Assign Field Worker
     ↓
Worker Notification
     ↓
Field Worker Login
     ↓
Update Status
     ↓
Citizen Notification
     ↓
Citizen Views Status
     ↓
Issue Resolution
```

---

# 53. Backend ↔ Frontend Integration

Backend and frontend integration was tested across the major application workflows.

The integration testing covered:

* Authentication
* JWT-protected API calls
* Role-based routing
* Issue creation
* Issue retrieval
* Issue assignment
* Status updates
* Notifications
* User management
* AI assistant
* Image handling

---

# 54. Performance Optimization

The frontend was optimized using lazy loading.

Before optimization, the initial JavaScript bundle was approximately:

```text
703.76 kB
```

After lazy loading:

```text
295.67 kB
```

Gzipped initial JavaScript was reduced to approximately:

```text
95.35 kB
```

The large initial bundle warning was eliminated.

---

# 55. Error Handling

Backend error handling uses centralized application exception handling.

The application avoids exposing unnecessary internal implementation details.

The backend logging audit removed:

```text
printStackTrace()
System.out
System.err
```

Frontend debug logging was also cleaned up.

Actual error handling remains logged where appropriate.

---

# 56. Production Image Security

The Docker build excludes sensitive and unnecessary files using `.dockerignore`.

Examples include:

```text
.env
.git
target
node_modules
dist
.idea
.vscode
*.log
```

Production images do not contain application secrets.

Frontend production builds are configured through build-time environment variables rather than embedding backend secrets.

---

# 57. Git & Secret Hygiene

Sensitive configuration must never be committed to Git.

The project keeps environment-specific secrets outside source code.

The following types of files should remain excluded from version control:

```text
.env
*.dump
target/
node_modules/
dist/
uploads/
*.log
```

Before committing, verify:

```powershell
git status
```

and inspect staged files:

```powershell
git diff --cached --name-only
```

Never commit:

* Database passwords
* JWT secrets
* Gemini API keys
* SMTP passwords
* Private credentials
* Private production configuration
* Database backups
* Real/private citizen images

---

# 58. Backup

A PostgreSQL custom-format backup can be created using:

```powershell
docker exec smart-civic-postgres pg_dump `
  -U postgres `
  -d smart_civic_reportingdb `
  -Fc `
  -f /tmp/smart-civic-backup.dump
```

Copy the backup to the host:

```powershell
docker cp `
  smart-civic-postgres:/tmp/smart-civic-backup.dump `
  .\smart-civic-backup.dump
```

The backup should be stored securely and should not be committed to Git.

## Backup Verification

The archive can be inspected using:

```powershell
pg_restore --list .\smart-civic-backup.dump
```

The project backup verification confirmed that the custom-format archive contained the application schema, data, indexes, constraints, Flyway metadata, and PostGIS-related objects.

A full restore test should be performed before relying on a backup for disaster recovery.

---

# 59. Project Structure

High-level project structure:

```text
Smart_Civic_Issue_Reporting_System/
│
├── backend/
│   ├── src/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── pom.xml
│   └── mvnw
│
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── .dockerignore
│   ├── package.json
│   └── vite.config.*
│
├── uploads/
│   └── issue-images/
│
├── docker-compose.yml
├── .env
├── .gitignore
├── README.md
└── DEPLOYMENT.md
```

---

# 60. API Architecture

The backend follows REST-style API organization.

Main API areas include:

```text
/api/v1/auth/**
/api/v1/users/**
/api/v1/issues/**
/api/v1/admin/**
/api/v1/audit-logs/**
/api/ai/chat
/api/images/**
```

Authentication-protected APIs require a valid JWT unless explicitly marked as public.

---

# 61. Public Authentication APIs

Examples of public authentication endpoints include:

```text
POST /api/v1/users/register
POST /api/v1/auth/login
POST /api/v1/auth/verify-registration-otp
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
POST /api/v1/auth/resend-registration-otp
```

---

# 62. AI API

The AI assistant endpoint is:

```text
POST /api/ai/chat
```

Authentication is required.

The endpoint validates incoming AI messages before processing.

---

# 63. Image API

Issue images are served through:

```text
/api/images/**
```

The storage layer validates paths before serving files.

---

# 64. Development Principles

The project follows these principles:

* Backend authorization is authoritative.
* Business logic stays in services.
* Controllers remain focused on HTTP concerns.
* Database schema is managed through Flyway.
* Hibernate validates rather than mutates the production schema.
* Sensitive configuration stays outside source code.
* Docker configuration is separated from application source.
* Role-specific data is scoped at the backend.
* Security validation happens server-side.
* Existing architecture is preserved instead of introducing unnecessary complexity.
* Production configuration is separated from development configuration.

---

# 65. Production Readiness Checklist

```text
[✓] JWT Authentication
[✓] Role-Based Authorization
[✓] Account Status Security
[✓] Input Validation
[✓] IDOR Protection
[✓] OTP Security
[✓] File Path Security
[✓] File Upload Validation
[✓] Admin API Protection
[✓] Audit Log Protection
[✓] AI Security
[✓] PostGIS
[✓] Flyway
[✓] Database Validation
[✓] Notifications
[✓] SLA Monitoring
[✓] Smart Assignment
[✓] Duplicate Detection
[✓] Frontend Security
[✓] E2E Testing
[✓] Integration Testing
[✓] Performance Optimization
[✓] Error Handling Audit
[✓] Docker Backend
[✓] Docker Frontend
[✓] Docker PostgreSQL/PostGIS
[✓] Docker Compose
[✓] Production Spring Profile
[✓] Environment-Based Secrets
[✓] CORS Audit
[✓] Docker Smoke Test
[✓] Database Backup Verification
```

---

# 66. Known Production Considerations

Before deploying to a public production domain:

1. Use HTTPS.
2. Configure the production frontend origin in CORS.
3. Store secrets in a secure secrets manager or deployment environment.
4. Do not expose PostgreSQL publicly unless required.
5. Use a strong database password.
6. Use a strong JWT secret.
7. Restrict firewall/network access.
8. Configure production monitoring.
9. Maintain regular database backups.
10. Keep Docker images and dependencies updated.
11. Use persistent storage for uploaded issue images.
12. Verify database restore procedures.
13. Configure production logging and observability.
14. Review free-tier limitations if using free hosting.

---

# 67. Troubleshooting

## Backend does not start

Check:

```powershell
docker compose logs backend --tail 100
```

Verify:

* Database credentials
* Database availability
* Environment variables
* Flyway migrations
* JWT secret
* Gemini configuration
* SMTP configuration

---

## PostgreSQL is unhealthy

Check:

```powershell
docker compose logs postgres --tail 100
```

Check:

```powershell
docker compose ps
```

Verify:

* Database name
* PostgreSQL username
* PostgreSQL password
* Docker volume
* Port configuration

---

## Frontend cannot reach backend

Verify:

```text
VITE_API_BASE_URL
```

For the current Docker localhost deployment:

```text
http://localhost:8080/api/v1
```

Also verify that the backend container is running.

---

## pgAdmin cannot connect

For Docker PostgreSQL use:

```text
Host: localhost
Port: 5433
```

Do not use port `5432` for the Docker database when the local PostgreSQL server is using that port.

---

## Flyway migration failure

Check backend logs:

```powershell
docker compose logs backend --tail 200
```

Verify:

* Database connectivity
* Migration version
* Database schema state
* Migration SQL
* Flyway history

Do not manually modify production schema unless the change is intentionally managed through a migration.

---

## Uploaded images are not visible

Verify:

```text
./uploads:/app/uploads
```

Check:

```powershell
docker compose ps
```

Check backend logs:

```powershell
docker compose logs backend --tail 100
```

Also verify that the requested image path is valid and passes backend storage validation.

---

# 68. Updating the Application

After changing backend code:

```powershell
docker build -t smart-civic-backend ./backend
docker compose up -d --force-recreate backend
```

After changing frontend code:

```powershell
docker build -t smart-civic-frontend ./frontend
docker compose up -d --force-recreate frontend
```

After major Docker configuration changes:

```powershell
docker compose down
docker compose build
docker compose up -d
```

Verify:

```powershell
docker compose ps
```

and:

```powershell
docker compose logs backend --tail 50
```

---

# 69. Future Improvements

Possible future enhancements include:

* Public cloud deployment
* Object storage for issue images
* WebSocket-based live notifications
* Advanced GIS visualization
* Citizen issue heatmaps
* More advanced worker routing
* Mobile application
* Push notifications
* Advanced AI analytics
* Automated infrastructure deployment
* Monitoring and observability
* Rate limiting at infrastructure level
* Production reverse proxy
* HTTPS automation

---

# 70. Project Status

The project has completed the major development, security, testing, optimization, Dockerization, and production-readiness phases.

Current major components:

```text
Backend                    COMPLETE
Frontend                   COMPLETE
Authentication             COMPLETE
Authorization              COMPLETE
Issue Management           COMPLETE
PostGIS                    COMPLETE
Duplicate Detection        COMPLETE
Smart Assignment           COMPLETE
SLA Monitoring             COMPLETE
Notifications              COMPLETE
Audit Logging              COMPLETE
AI Assistant               COMPLETE
Security Audit             COMPLETE
Frontend Audit             COMPLETE
E2E Testing                COMPLETE
Integration Testing        COMPLETE
Performance Audit          COMPLETE
Dockerization              COMPLETE
Production Configuration   COMPLETE
```

Public cloud deployment is a separate upcoming phase.

---

# 71. Current Verified Docker Architecture

```text
                         SMART CIVIC
                    ISSUE REPORTING SYSTEM
                              │
             ┌────────────────┼────────────────┐
             │                │                │
             ▼                ▼                ▼
         CITIZEN        FIELD WORKER        ADMIN
             │                │                │
             └────────────────┼────────────────┘
                              │
                              ▼
                         REACT / VITE
                              │
                              ▼
                         NGINX
                              │
                              ▼
                       SPRING BOOT API
                              │
             ┌────────────────┼────────────────┐
             │                │                │
             ▼                ▼                ▼
         SECURITY       BUSINESS LOGIC        AI
         JWT/RBAC       ISSUE SYSTEM         GEMINI
                              │
                 ┌────────────┼────────────┐
                 │            │            │
                 ▼            ▼            ▼
              PostGIS   Notifications      SLA
                 │
                 ▼
             PostgreSQL
                 │
                 ▼
             Audit Logs
```

Docker services:

```text
Frontend
   │
   └── React + Nginx
          │
          ▼
Backend
   │
   └── Spring Boot + Spring Security
          │
          ├── Issue Management
          ├── Assignment
          ├── Notifications
          ├── SLA Monitoring
          ├── Audit Logging
          ├── AI Assistant
          └── Storage
                  │
                  ▼
             PostgreSQL
                  │
                  └── PostGIS
```

---

# 72. License

This project is developed as a software engineering and civic-technology project.

Add an appropriate open-source license before public redistribution if required.

---

# 73. Author

## Smart Civic Issue Reporting System

Full-stack civic technology platform built with:

```text
Java 21
Spring Boot
Spring Security
JWT
Spring Data JPA
Hibernate
Hibernate Spatial
PostgreSQL
PostGIS
Flyway
React
Vite
React Router
Axios
Leaflet
OpenStreetMap
Docker
Nginx
Gemini AI
```

---

# Final Summary

The Smart Civic Issue Reporting System is a secure, geospatial, role-based civic issue management platform.

It provides:

```text
Citizen Reporting
        ↓
Geospatial Location
        ↓
Duplicate Detection
        ↓
Admin Management
        ↓
Smart Assignment
        ↓
Field Worker Resolution
        ↓
Status Workflow
        ↓
SLA Monitoring
        ↓
Notifications
        ↓
Audit Logging
```

The platform combines modern backend engineering, geospatial database technology, secure authentication, role-based authorization, AI assistance, responsive frontend development, automated database migrations, and containerized deployment.

The current implementation is Docker-ready and production-configured.

Public cloud deployment will be documented separately after the final hosting platform is selected and verified.

---

**Smart Civic Issue Reporting System — A secure, geospatial, role-based civic issue reporting and management platform.**

```
```
