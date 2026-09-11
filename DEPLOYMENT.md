Smart Civic Issue Reporting System — Deployment Guide

This guide documents the actual deployment setup of the Smart Civic Issue Reporting System.

The project has two deployment contexts:

Public deployment: Vercel frontend + Render backend

Local/containerized deployment: Docker Compose with PostgreSQL/PostGIS

No AWS EC2, GitHub Actions CI/CD, RabbitMQ, Redis, or S3 deployment is claimed here.

1. Current Public Deployment

Browser
│
▼
Vercel
React + Vite Frontend
│
│ HTTPS API requests
▼
Render
Spring Boot Backend
│
▼
Supabase
PostgreSQL + PostGIS

Backend

https://smart-civic-issue-reporting-system.onrender.com

The API base path used by the frontend is:

https://smart-civic-issue-reporting-system.onrender.com/api/v1

Frontend

The frontend is deployed on Vercel.

The frontend uses the environment variable:

VITE_API_BASE_URL=https://smart-civic-issue-reporting-system.onrender.com/api/v1

The exact Vercel project/domain can be viewed in the Vercel deployment configuration.

2. Public Deployment Responsibilities

Vercel

Vercel hosts the React/Vite frontend.

The frontend build uses:

React
Vite
JavaScript
React Router
Axios
Leaflet
OpenStreetMap
CSS

Render

Render hosts the Spring Boot backend.

The backend uses:

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
JavaMail / SMTP
Gemini API

The backend receives its production configuration through environment variables.

3. Production Environment Variables

Do not commit real values to Git.

Backend configuration includes:

DB_URL=<database-url>
DB_USERNAME=<database-username>
DB_PASSWORD=<database-password>

JWT_SECRET=<strong-jwt-secret>

GEMINI_API_KEY=<gemini-api-key>

MAIL_USERNAME=<smtp-username>
MAIL_PASSWORD=<smtp-password>

Frontend configuration:

VITE_API_BASE_URL=https://smart-civic-issue-reporting-system.onrender.com/api/v1

Important

Vite environment variables are embedded during the frontend build.

If VITE_API_BASE_URL changes, the frontend must be rebuilt/redeployed.

4. CORS

The backend uses Spring Security CORS configuration.

For the public deployment, the backend must allow the actual Vercel frontend origin.

The required request methods include:

GET
POST
PUT
PATCH
DELETE
OPTIONS

JWT authorization headers must also be allowed.

If the frontend loads but API requests fail in the browser, check:

Vercel frontend origin

Backend CORS configuration

VITE_API_BASE_URL

Render backend status

Browser developer-console errors

Render backend logs

5. Local Development

Backend

cd backend
.\mvnw spring-boot:run

Frontend

cd frontend
npm install
npm run dev

Typical local URLs:

Frontend: http://localhost:5173
Backend:  http://localhost:8080

6. Local Docker Deployment

The repository also contains a Docker Compose setup.

Services:

postgres
backend
frontend

Build:

docker compose build

Start:

docker compose up -d

Check:

docker compose ps

7. Local Docker Architecture

Browser
│
▼
Frontend Container
React + Nginx
│
▼
Backend Container
Spring Boot + Java 21
│
▼
PostgreSQL + PostGIS Container

Local Docker Ports

Component

Container Port

Host Port

Frontend / Nginx

80

5173

Backend / Spring Boot

8080

8080

PostgreSQL / PostGIS

5432

5433

Inside Docker, the backend connects to:

postgres:5432

The host machine connects to the Docker PostgreSQL instance through:

localhost:5433

8. Docker Environment

The root .env file is used for Docker Compose configuration.

Example structure:

POSTGRES_DB=<database-name>
POSTGRES_USER=<database-user>
DB_PASSWORD=<database-password>

JWT_SECRET=<strong-jwt-secret>

GEMINI_API_KEY=<gemini-api-key>

MAIL_USERNAME=<smtp-username>
MAIL_PASSWORD=<smtp-password>

Never commit the real .env file.

9. Production Spring Profile

The Docker deployment supports the production Spring profile:

prod

The production configuration uses:

spring.jpa.hibernate.ddl-auto=validate

Hibernate validates the database schema rather than modifying it automatically.

Flyway handles schema migrations.

10. Database & PostGIS

The project uses:

PostgreSQL
PostGIS
Hibernate Spatial
Flyway

Issue locations use:

geometry(Point, 4326)

The application supports:

Geographic location storage

Nearby issue searches

Duplicate detection

Geographic filtering

Map-based issue interaction

Spatial indexing

11. Uploaded Images

Issue images use the application's local storage layer.

Docker maps:

./uploads:/app/uploads

This is a local/containerized storage approach.

The project does not use AWS S3 for issue-image storage.

12. Flyway Migrations

Flyway manages database schema changes.

The backend validates migrations during startup.

Useful Docker log command:

docker compose logs backend --tail 100

13. Verify the Local Deployment

Check services:

docker compose ps

Expected:

smart-civic-postgres    Up (healthy)
smart-civic-backend     Up
smart-civic-frontend    Up

Frontend:

http://localhost:5173

Backend:

http://localhost:8080

14. Docker Logs

Backend:

docker compose logs backend --tail 50

Frontend:

docker compose logs frontend --tail 50

PostgreSQL:

docker compose logs postgres --tail 50

Follow backend logs:

docker compose logs -f backend

15. Rebuild After Changes

Backend

docker build -t smart-civic-backend ./backend
docker compose up -d --force-recreate backend

Frontend

docker build -t smart-civic-frontend ./frontend
docker compose up -d --force-recreate frontend

Full rebuild

docker compose build --no-cache
docker compose up -d

Use --no-cache only when a clean rebuild is actually needed.

16. Stop / Start

Stop:

docker compose down

Start:

docker compose up -d

Recreate:

docker compose up -d --force-recreate

17. Database Persistence

The Docker PostgreSQL setup uses a named volume:

smart-civic-postgres-data

The issue-image directory is:

./uploads

Do not delete either when you need to preserve the local database and uploaded images.

Warning

This command removes the PostgreSQL Docker volume:

docker compose down -v

Use it only when an intentional database reset is required.

18. Public Deployment Troubleshooting

Frontend opens but API calls fail

Check:

VITE_API_BASE_URL

It should point to:

https://smart-civic-issue-reporting-system.onrender.com/api/v1

Then check backend CORS and Render logs.

CORS error

Check:

Vercel frontend origin
↓
Spring Security CORS
↓
Render backend

The backend must allow the deployed Vercel origin.

Backend unavailable

Check the Render service status and backend logs.

The backend is:

https://smart-civic-issue-reporting-system.onrender.com

Images not loading

For local Docker deployment, check:

uploads/

and:

./uploads:/app/uploads

19. Functional Smoke Test

Citizen

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

Admin

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

Field Worker

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

20. Full Issue Lifecycle

Citizen creates issue
↓
Issue stored in PostgreSQL
↓
Location stored in PostGIS
↓
Duplicate detection
↓
Admin reviews issue
↓
Admin assigns field worker
↓
Worker receives notification
↓
Worker updates status
↓
Status history recorded
↓
Citizen receives notification
↓
Issue resolved

21. Security Rules

Never commit:

.env
JWT secrets
Database passwords
Gemini API keys
SMTP passwords

Production configuration should be supplied through the hosting platform's environment-variable settings.

The backend remains the authoritative authorization layer.

22. Actual Technology Scope

The current project uses:

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
Jakarta Validation
Maven
JavaMail / SMTP
Gemini API
React
Vite
JavaScript
React Router
Axios
Leaflet
OpenStreetMap
CSS
Docker
Docker Compose
Nginx
Git
GitHub
Render
Vercel

The project does not claim these technologies as implemented:

RabbitMQ
Redis
AWS S3
AWS EC2
GitHub Actions CI/CD
Kubernetes
Node.js backend

Node/npm may exist as part of the React/Vite frontend tooling environment; there is no Node.js backend in this project.

23. Deployment Summary

Public

Frontend → Vercel
Backend  → Render
Database → Supabase=PostgreSQL + PostGIS

Local

Frontend → React + Nginx Docker container
Backend  → Spring Boot Docker container
Database → PostgreSQL + PostGIS Docker container

This document intentionally separates the actual public deployment from the local Docker deployment and does not describe unimplemented AWS or CI/CD infrastructure as comp