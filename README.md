# RRA Meeting Room Management System

A Meeting Room Booking System for Rwanda Revenue Authority.

## Tech Stack
- **Backend**: Java 21, Spring Boot 3, Spring Security + JWT, Spring Data JPA, PostgreSQL
- **Frontend**: React.js (Vite), React Router, Axios

---

## Quick Start

### Prerequisites
- Java 21
- Maven
- PostgreSQL (database: `roommanagement_db`)
- Node.js 18+

---

### 1. Setup Database

Make sure PostgreSQL is running and create the database:

```sql
CREATE DATABASE roommanagement_db;
```

---

### 2. Configure Database Password

Edit `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/roommanagement_db
spring.datasource.username=postgres
spring.datasource.password=YOUR_POSTGRES_PASSWORD
```

---

### 3. Run Backend

```bash
cd backend
mvn spring-boot:run
```

Backend runs on: http://localhost:8081

**Default Admin Account (auto-created on startup):**
- Email: `admin@rra.gov.rw`
- Password: `Admin@1234`

---

### 4. Run Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on: http://localhost:3000

---

## Workflow

### Admin
1. Login with admin credentials
2. Go to **Manage Rooms** → Add rooms
3. Go to **Booking Requests** → Approve or Reject bookings
4. Go to **Public Holidays** → Add Rwanda public holidays

### User
1. Register on `/register` or Login
2. Go to **Available Rooms** → Click **Book** on any room
3. Enter start date, end date, time and purpose
4. Go to **My Bookings** to track status

---

## Business Rules
- ❌ No bookings on **weekends** (Saturday/Sunday)
- ❌ No bookings on **public holidays**
- ❌ No **double booking** of the same room
- ❌ Start date cannot be after end date
- ⚠️ Bookings outside **08:00 – 17:00** show a warning
- ⏳ All bookings start as **PENDING** and need admin approval
- ✅ Admin can **Approve** or **Reject** bookings
- ✅ Users can request **cancellation** of approved bookings

---

## API Endpoints

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/auth/login | Public |
| POST | /api/auth/register | Public |
| POST | /api/auth/forgot-password | Public |
| POST | /api/auth/reset-password | Public |
| GET | /api/rooms | Authenticated |
| POST | /api/rooms | Admin |
| PUT | /api/rooms/{id} | Admin |
| DELETE | /api/rooms/{id} | Admin |
| POST | /api/bookings | Authenticated |
| GET | /api/bookings | Authenticated |
| PUT | /api/bookings/{id}/approve | Admin |
| PUT | /api/bookings/{id}/reject | Admin |
| PUT | /api/bookings/{id}/cancel | Authenticated |
| PUT | /api/bookings/{id}/approve-cancel | Admin |
| PUT | /api/bookings/{id}/reject-cancel | Admin |
| GET | /api/dashboard/statistics | Admin |
| GET | /api/holidays | Admin |
| POST | /api/holidays | Admin |
| DELETE | /api/holidays/{id} | Admin |

Swagger UI: http://localhost:8081/swagger-ui/index.html

---

## Docker

```bash
docker compose up
```
