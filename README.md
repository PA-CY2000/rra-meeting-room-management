# RRA Meeting Room Management System

A Meeting Room Booking System for Rwanda Revenue Authority.

## Tech Stack
- **Backend**: Java 21, Spring Boot 3, Spring Security + JWT, Spring Data JPA, MySQL
- **Frontend**: React.js, React Router, Axios

---

## Quick Start

### Prerequisites
- Java 21
- Maven
- MySQL (database: `roommanagement_db`)
- Node.js 18+

---

### 1. Setup Database

Make sure MySQL is running and create the database:

```sql
CREATE DATABASE roommanagement_db;
```

---

### 2. Configure Database Password

Edit `backend/src/main/resources/application.properties`:

```properties
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

---

### 3. Run Backend

```bash
cd backend
mvn spring-boot:run
```

Backend runs on: http://localhost:8080

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
1. Register or Login
2. Go to **Available Rooms** → Select start & end date → Search
3. Click **Book Now** on any available room
4. Enter purpose and submit
5. Go to **My Bookings** to track status

---

## Business Rules
- ❌ No bookings on **weekends** (Saturday/Sunday)
- ❌ No bookings on **public holidays**
- ❌ No **double booking** of the same room
- ❌ Start date cannot be after end date
- ⏳ All bookings start as **PENDING** and need admin approval
- 🔒 Booked rooms are **hidden** from available rooms list

---

## API Endpoints

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/auth/login | Public |
| POST | /api/auth/register | Public |
| GET | /api/rooms | Authenticated |
| POST | /api/rooms | Admin |
| PUT | /api/rooms/{id} | Admin |
| DELETE | /api/rooms/{id} | Admin |
| GET | /api/rooms/available?startDate=&endDate= | Authenticated |
| POST | /api/bookings | Authenticated |
| GET | /api/bookings | Authenticated |
| PUT | /api/bookings/{id}/approve | Admin |
| PUT | /api/bookings/{id}/reject | Admin |
| GET | /api/dashboard/statistics | Admin |
| GET | /api/holidays | Admin |
| POST | /api/holidays | Admin |
| DELETE | /api/holidays/{id} | Admin |

Swagger UI: http://localhost:8080/swagger-ui/index.html

---

## Docker

```bash
docker compose up
```
