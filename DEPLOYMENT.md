
# Smart Civic Issue Reporting System — Deployment Guide

This document explains how to configure, build, run, verify, maintain, and troubleshoot the Smart Civic Issue Reporting System using Docker.

The deployment consists of three containers:

```text
Frontend
   │
   ▼
Backend
   │
   ▼
PostgreSQL + PostGIS
````

---

# 1. Deployment Architecture

The Docker deployment contains:

```text
┌─────────────────────────────────────────────┐
│                  Browser                    │
│                                             │
│             http://localhost:5173          │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│              Frontend Container             │
│                                             │
│               React + Vite                  │
│                  Nginx                      │
│                  Port 80                    │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│               Backend Container             │
│                                             │
│                Spring Boot                  │
│                  Java 21                    │
│                  Port 8080                  │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│          PostgreSQL + PostGIS               │
│                                             │
│             PostgreSQL 17                   │
│               PostGIS                       │
│             Port 5432                      │
└─────────────────────────────────────────────┘
```

---

# 2. Prerequisites

Before deployment, install:

* Docker Desktop
* Docker Compose
* Git

Recommended environment:

```text
Docker Desktop
WSL2
Windows 10/11
```

Verify Docker:

```powershell
docker --version
```

Verify Docker Compose:

```powershell
docker compose version
```

---

# 3. Project Structure

The deployment expects the following structure:

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
│   └── package-lock.json
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

# 4. Environment Variables

The deployment uses environment variables for sensitive configuration.

The root `.env` file is used by Docker Compose.

Required values include:

```env
POSTGRES_DB=<database-name>
POSTGRES_USER=<database-user>

DB_PASSWORD=<database-password>

JWT_SECRET=<strong-jwt-secret>

GEMINI_API_KEY=<gemini-api-key>

MAIL_USERNAME=<smtp-username>
MAIL_PASSWORD=<smtp-password>
```

Do not commit the `.env` file to Git.

Never place real secrets inside:

* Source code
* README.md
* DEPLOYMENT.md
* Dockerfiles
* Frontend source
* Frontend build
* GitHub repositories

---

# 5. Production Spring Profile

The Docker backend runs using the production Spring profile.

Docker Compose sets:

```yaml
SPRING_PROFILES_ACTIVE: prod
```

The backend therefore loads:

```text
application-prod.yaml
```

Production configuration uses environment variables instead of local `.env` importing.

---

# 6. Production Configuration

The production backend uses:

```text
spring.jpa.hibernate.ddl-auto=validate
```

Hibernate validates the existing database schema instead of automatically changing it.

Flyway manages database migrations.

The production profile also disables SQL statement output:

```text
show-sql=false
```

This reduces unnecessary SQL logging in production.

---

# 7. Docker Services

The deployment contains three services.

## PostgreSQL

```text
Service: postgres
Container: smart-civic-postgres
Image: postgis/postgis:latest
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

## Backend

```text
Service: backend
Container: smart-civic-backend
Image: smart-civic-backend:latest
```

Port:

```text
8080
```

Spring profile:

```text
prod
```

---

## Frontend

```text
Service: frontend
Container: smart-civic-frontend
Image: smart-civic-frontend:latest
```

Host port:

```text
5173
```

Container port:

```text
80
```

Nginx serves the React production build.

---

# 8. Build Docker Images

Navigate to the project root:

```powershell
cd Smart_Civic_Issue_Reporting_System
```

Build all images:

```powershell
docker compose build
```

Or build individually:

```powershell
docker build -t smart-civic-backend ./backend
```

```powershell
docker build -t smart-civic-frontend ./frontend
```

---

# 9. Start the Application

Start all services:

```powershell
docker compose up -d
```

The `-d` option runs containers in detached mode.

---

# 10. Verify Containers

Run:

```powershell
docker compose ps
```

Expected state:

```text
smart-civic-backend     Up
smart-civic-frontend    Up
smart-civic-postgres    Up (healthy)
```

PostgreSQL has a healthcheck using:

```text
pg_isready
```

The backend waits for PostgreSQL to become healthy before starting.

---

# 11. Frontend Verification

Open:

```text
http://localhost:5173
```

The React application should load.

Verify:

* Login page
* Registration
* Navigation
* Dashboard
* Protected routes

---

# 12. Backend Verification

Backend is exposed at:

```text
http://localhost:8080
```

The root endpoint may return:

```text
403 Forbidden
```

if the endpoint is protected by Spring Security.

This does not indicate that the backend is down.

Backend startup should instead be verified through logs.

---

# 13. Backend Logs

View recent backend logs:

```powershell
docker compose logs backend --tail 50
```

A successful startup should contain:

```text
The following 1 profile is active: "prod"
```

and:

```text
Tomcat started on port 8080
```

and:

```text
Started BackendApplication
```

---

# 14. PostgreSQL Logs

View PostgreSQL logs:

```powershell
docker compose logs postgres --tail 50
```

Check container health:

```powershell
docker compose ps
```

PostgreSQL should show:

```text
healthy
```

---

# 15. Frontend Logs

View frontend logs:

```powershell
docker compose logs frontend --tail 50
```

Nginx should remain running without fatal errors.

---

# 16. Database Configuration

Inside Docker, the backend connects to PostgreSQL using the Docker service name:

```text
postgres
```

The backend database URL is:

```text
jdbc:postgresql://postgres:5432/<database-name>
```

Important:

```text
postgres:5432
```

is the internal Docker connection.

It should not be replaced with:

```text
localhost:5433
```

inside the backend container.

---

# 17. PostgreSQL Host Connection

From the host machine, PostgreSQL is exposed on:

```text
localhost:5433
```

Connection information:

```text
Host: localhost
Port: 5433
Database: <database-name>
Username: <database-user>
Password: <database-password>
```

---

# 18. pgAdmin Connection

For pgAdmin:

```text
Host: localhost
Port: 5433
Database: <database-name>
Username: <database-user>
Password: <database-password>
```

Do not use:

```text
localhost:5432
```

for the Docker database if local PostgreSQL is already using port 5432.

---

# 19. Flyway Migration Verification

The backend automatically runs Flyway during startup.

Check:

```powershell
docker compose logs backend --tail 100
```

Successful migration output should indicate:

```text
Successfully validated migrations
```

and:

```text
Schema "public" is up to date.
```

The current application schema version is:

```text
18
```

---

# 20. PostGIS Verification

The PostgreSQL image includes PostGIS.

The backend uses Hibernate Spatial.

Startup logs should contain:

```text
Hibernate Spatial integration enabled: true
```

The issue location is stored as a geographic point using:

```text
geometry(Point, 4326)
```

Spatial indexes support geographic queries.

---

# 21. Uploaded Images

Issue images are persisted outside the backend container.

Docker maps:

```text
./uploads:/app/uploads
```

This prevents uploaded files from being lost when the backend container is recreated.

Do not delete the `uploads` directory unless the stored issue images are intentionally being removed.

---

# 22. Docker Persistent Database Storage

PostgreSQL uses the Docker named volume:

```text
smart-civic-postgres-data
```

The database data is stored in this persistent volume.

Recreating containers does not automatically delete the database volume.

---

# 23. Stop the Application

Stop all services:

```powershell
docker compose down
```

This removes the containers and network but keeps the named PostgreSQL volume.

---

# 24. Start the Existing Deployment Again

Run:

```powershell
docker compose up -d
```

The existing PostgreSQL data should remain available because the database uses a persistent Docker volume.

---

# 25. Recreate Containers

If configuration changes:

```powershell
docker compose up -d --force-recreate
```

This recreates containers using the current Compose configuration.

---

# 26. Rebuild After Backend Code Changes

After backend source changes:

```powershell
docker build -t smart-civic-backend ./backend
```

Then:

```powershell
docker compose up -d --force-recreate backend
```

Check:

```powershell
docker compose logs backend --tail 50
```

---

# 27. Rebuild After Frontend Code Changes

After frontend source changes:

```powershell
docker build -t smart-civic-frontend ./frontend
```

Then:

```powershell
docker compose up -d --force-recreate frontend
```

---

# 28. Full Rebuild

To rebuild both application images:

```powershell
docker compose build --no-cache
```

Then:

```powershell
docker compose up -d
```

Use `--no-cache` only when a clean image rebuild is actually required.

---

# 29. Restart a Single Service

Backend:

```powershell
docker compose restart backend
```

Frontend:

```powershell
docker compose restart frontend
```

PostgreSQL:

```powershell
docker compose restart postgres
```

Avoid restarting PostgreSQL unnecessarily in a production environment.

---

# 30. Complete Application Health Check

Run:

```powershell
docker compose ps
```

Verify:

```text
PostgreSQL → Up (healthy)
Backend     → Up
Frontend    → Up
```

Then open:

```text
http://localhost:5173
```

---

# 31. Functional Smoke Test

After deployment, verify the following.

## Citizen

```text
Login
↓
Dashboard
↓
Create Issue
↓
Select Location
↓
Upload Image
↓
View Issue
↓
View Status
↓
View Notifications
↓
Use AI Assistant
```

---

## Admin

```text
Login
↓
Admin Dashboard
↓
View Issues
↓
Assign Worker
↓
View Users
↓
View Audit Logs
↓
View Notifications
↓
Use AI Assistant
```

---

## Field Worker

```text
Login
↓
Field Worker Dashboard
↓
View Assigned Issues
↓
Open Issue
↓
Update Status
↓
View Notifications
```

---

# 32. Complete Issue Lifecycle Test

Verify the complete workflow:

```text
Citizen creates issue
        ↓
Issue stored in PostgreSQL
        ↓
Location stored in PostGIS
        ↓
Admin views issue
        ↓
Admin assigns field worker
        ↓
Field worker receives notification
        ↓
Field worker updates status
        ↓
Status history recorded
        ↓
Citizen receives notification
        ↓
Issue eventually resolved
```

---

# 33. CORS Configuration

The current Docker frontend runs at:

```text
http://localhost:5173
```

The backend CORS configuration allows the frontend origin.

Allowed methods include:

```text
GET
POST
PUT
PATCH
DELETE
OPTIONS
```

JWT authorization headers are supported.

For a real production domain, update the allowed frontend origin from the localhost origin to the actual HTTPS frontend domain.

---

# 34. Security Requirements

Before public production deployment:

* Use HTTPS.
* Use a strong JWT secret.
* Use a strong database password.
* Never expose `.env`.
* Never commit API keys.
* Never commit SMTP passwords.
* Never expose PostgreSQL unnecessarily.
* Restrict database access through firewall/network rules.
* Configure the correct production CORS origin.
* Keep dependencies updated.
* Keep Docker images updated.

---

# 35. Secrets Management

Secrets must be supplied through the deployment environment.

Do not store secrets in:

```text
Java source
JavaScript source
application source
Dockerfile
docker-compose.yml
README.md
DEPLOYMENT.md
Git history
```

The `.env` file should remain ignored by Git.

---

# 36. Docker Image Security

The backend `.dockerignore` excludes sensitive and unnecessary files such as:

```text
target/
.git/
.env
uploads/
*.log
.idea/
.vscode/
```

The frontend `.dockerignore` excludes:

```text
node_modules/
dist/
.git/
.env
.env.*
.idea/
.vscode/
*.log
```

This prevents unnecessary local files from entering Docker build contexts.

---

# 37. Backup

Create a PostgreSQL custom-format backup:

```powershell
docker exec smart-civic-postgres pg_dump `
  -U postgres `
  -d smart_civic_reportingdb `
  -Fc `
  -f /tmp/smart-civic-backup.dump
```

Copy it to the host:

```powershell
docker cp `
  smart-civic-postgres:/tmp/smart-civic-backup.dump `
  .\smart-civic-backup.dump
```

Verify that the file exists:

```powershell
Get-Item .\smart-civic-backup.dump
```

Do not commit database backup files to Git.

---

# 38. Backup Verification

Verify the archive contents:

```powershell
pg_restore --list .\smart-civic-backup.dump
```

The archive should contain the application's database objects and data.

Important application tables include:

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

# 39. Restore

Restore backups only into an appropriate target database.

Example:

```powershell
docker cp .\smart-civic-backup.dump smart-civic-postgres:/tmp/smart-civic-backup.dump
```

Then use:

```powershell
docker exec smart-civic-postgres pg_restore `
  -U postgres `
  -d <target-database> `
  --clean `
  --if-exists `
  /tmp/smart-civic-backup.dump
```

Never restore over the active production database without a verified recovery plan.

---

# 40. Database Volume Warning

The following command permanently deletes the PostgreSQL Docker volume:

```powershell
docker compose down -v
```

This can destroy the stored database data.

**Do not use `-v` unless you intentionally want to remove the database volume.**

---

# 41. Clean Development Reset

If a complete database reset is intentionally required:

```powershell
docker compose down -v
```

Then:

```powershell
docker compose up -d
```

This creates a fresh PostgreSQL volume.

This should not be used on a production database containing important data.

---

# 42. Troubleshooting — Backend

Check:

```powershell
docker compose logs backend --tail 100
```

Look for:

```text
Database connection errors
Flyway migration errors
Environment variable errors
JWT configuration errors
SMTP configuration errors
Gemini configuration errors
Port binding errors
```

---

# 43. Troubleshooting — PostgreSQL

Check:

```powershell
docker compose logs postgres --tail 100
```

Then:

```powershell
docker compose ps
```

Verify PostgreSQL is:

```text
healthy
```

Check:

* Database name
* Username
* Password
* Docker volume
* Port 5433
* PostgreSQL container status

---

# 44. Troubleshooting — Frontend

Check:

```powershell
docker compose logs frontend --tail 100
```

If the frontend loads but API calls fail, verify the frontend API base URL.

For the local Docker deployment:

```text
http://localhost:8080/api/v1
```

The frontend must be rebuilt if the Vite environment variable changes because Vite environment variables are embedded during the build process.

---

# 45. Troubleshooting — CORS

If the browser reports a CORS error:

1. Verify the frontend origin.
2. Verify the backend CORS configuration.
3. Verify the API base URL.
4. Verify the backend is running.
5. Verify the request is reaching the backend.
6. Check browser developer tools.
7. Check backend logs.

For the current local Docker deployment:

```text
Frontend:
http://localhost:5173

Backend:
http://localhost:8080
```

---

# 46. Troubleshooting — Images

If issue images do not appear:

Verify the host directory:

```text
uploads/
```

Verify the Docker mapping:

```text
./uploads:/app/uploads
```

Check backend logs:

```powershell
docker compose logs backend --tail 100
```

Verify the required image files exist in the host upload directory.

---

# 47. Troubleshooting — pgAdmin

If pgAdmin reports:

```text
password authentication failed
```

verify that you are connecting to the correct PostgreSQL instance.

Local PostgreSQL may use:

```text
localhost:5432
```

Docker PostgreSQL uses:

```text
localhost:5433
```

Use the Docker database credentials from the current deployment environment.

---

# 48. Updating the Application

For a new backend version:

```powershell
docker build -t smart-civic-backend ./backend
```

Then:

```powershell
docker compose up -d --force-recreate backend
```

For a new frontend version:

```powershell
docker build -t smart-civic-frontend ./frontend
```

Then:

```powershell
docker compose up -d --force-recreate frontend
```

After deployment:

```powershell
docker compose ps
```

Then perform the smoke tests.

---

# 49. Deployment Verification Checklist

Before considering a deployment successful:

```text
[ ] Docker is running
[ ] Environment variables are configured
[ ] Backend image built successfully
[ ] Frontend image built successfully
[ ] PostgreSQL container running
[ ] PostgreSQL healthy
[ ] Backend container running
[ ] Frontend container running
[ ] Production Spring profile active
[ ] Flyway migrations validated
[ ] Database schema up to date
[ ] Hibernate Spatial enabled
[ ] Frontend accessible
[ ] Backend accessible
[ ] Citizen login tested
[ ] Admin login tested
[ ] Field worker login tested
[ ] Issue creation tested
[ ] Issue assignment tested
[ ] Status update tested
[ ] Notifications tested
[ ] AI assistant tested
[ ] Image upload tested
[ ] Image serving tested
[ ] CORS verified
[ ] No secrets committed
[ ] Backup created
```

---

# 50. Production Deployment Checklist

For public deployment:

```text
[ ] HTTPS configured
[ ] Production domain configured
[ ] Production frontend URL configured
[ ] Production CORS origin configured
[ ] Secure secrets configured
[ ] Database firewall configured
[ ] PostgreSQL not publicly exposed unnecessarily
[ ] Persistent database storage configured
[ ] Persistent image storage configured
[ ] Automated backups configured
[ ] Monitoring configured
[ ] Logging configured
[ ] Resource limits evaluated
[ ] Docker images updated
[ ] Dependencies updated
[ ] Final smoke test completed
```

---

# 51. Useful Docker Commands

Show running containers:

```powershell
docker compose ps
```

Show all logs:

```powershell
docker compose logs
```

Backend logs:

```powershell
docker compose logs backend
```

Frontend logs:

```powershell
docker compose logs frontend
```

PostgreSQL logs:

```powershell
docker compose logs postgres
```

Follow backend logs:

```powershell
docker compose logs -f backend
```

Stop stack:

```powershell
docker compose down
```

Start stack:

```powershell
docker compose up -d
```

Recreate stack:

```powershell
docker compose up -d --force-recreate
```

Build images:

```powershell
docker compose build
```

---

# 52. Deployment Ports

| Component           | Container Port | Host Port |
| ------------------- | -------------: | --------: |
| Frontend/Nginx      |             80 |      5173 |
| Backend/Spring Boot |           8080 |      8080 |
| PostgreSQL/PostGIS  |           5432 |      5433 |

---

# 53. Internal Docker Ports

Containers communicate using Docker service names.

Backend → PostgreSQL:

```text
postgres:5432
```

Browser → Frontend:

```text
localhost:5173
```

Browser/API Client → Backend:

```text
localhost:8080
```

---

# 54. Important Production Notes

The current Docker configuration is suitable for local/containerized deployment and production-oriented testing.

For a public production environment, additional infrastructure should normally be added around the application:

* HTTPS
* Domain/reverse proxy
* Firewall
* Secure secret management
* Database backup automation
* Monitoring
* Log aggregation
* Persistent production storage

These infrastructure concerns are separate from the core application implementation.

---

# 55. Final Deployment Verification

Run:

```powershell
docker compose ps
```

Then:

```powershell
docker compose logs backend --tail 40
```

Confirm:

```text
The following 1 profile is active: "prod"
```

Confirm:

```text
Started BackendApplication
```

Confirm PostgreSQL:

```text
Up (healthy)
```

Open:

```text
http://localhost:5173
```

Finally perform the complete application smoke test.

---

# 56. Deployment Status

The Smart Civic Issue Reporting System has completed:

```text
Docker Backend              COMPLETE
Docker Frontend             COMPLETE
PostgreSQL/PostGIS          COMPLETE
Docker Compose              COMPLETE
Production Profile          COMPLETE
Environment Configuration   COMPLETE
Persistent DB Storage       COMPLETE
Persistent Image Storage    COMPLETE
CORS Audit                  COMPLETE
Docker Smoke Testing        COMPLETE
Backup Creation             COMPLETE
Backup Verification         COMPLETE
```

---

# 57. Final Architecture

```text
                    ┌──────────────────────┐
                    │       Browser        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Frontend / Nginx     │
                    │ React + Vite         │
                    │ localhost:5173       │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Backend              │
                    │ Spring Boot          │
                    │ Java 21              │
                    │ localhost:8080       │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
       ┌──────────────────┐        ┌──────────────────┐
       │ PostgreSQL       │        │ Gemini AI        │
       │ + PostGIS        │        │ Assistant        │
       │ Docker           │        │                  │
       └──────────────────┘        └──────────────────┘
                 │
                 ▼
       ┌──────────────────┐
       │ Persistent Data  │
       │ Docker Volume    │
       └──────────────────┘

                 +
       ┌──────────────────┐
       │ Upload Storage   │
       │ ./uploads        │
       └──────────────────┘
```

---

# 58. End of Deployment Guide

For normal local Docker deployment:

```powershell
docker compose build
docker compose up -d
docker compose ps
```

Then open:

```text
http://localhost:5173
```

For production deployment, configure HTTPS, domain, secure secrets, database protection, persistent storage, backups, monitoring, and the production CORS origin before exposing the application publicly.

````



