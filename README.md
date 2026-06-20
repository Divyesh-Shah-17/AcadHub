# Academic Project Management System (APMS)

A modern, role-based web application designed to streamline academic project administration, student grouping, evaluator assignments, weekly log tracking, and analytics.

---

## Technical Stack

* **Backend**: Java Spring Boot, Spring Security (JWT), Hibernate, JPA, H2 Database (File-Based Persistence)
* **Frontend**: React (Vite), Tailwind CSS, Recharts, Lucide Icons

---

## Repository Structure

* **`backend/`**: Contains the Spring Boot server, JPA entities, controllers, service layers, and seeds.
* **`frontend/`**: Contains the React dashboard SPA client, routing, and Tailwind styling.
* **`maven/`**: Bundled Maven executables.
* **`run_mvn.cmd`**: Helper script wrapping maven commands with the designated Java SDK.

---

## Setup & Running Locally

### Prerequisites
* Java JDK 16+
* Node.js (v16+)

### 1. Run the Spring Boot Backend

Navigate to the `backend` directory and execute:
```powershell
..\run_mvn.cmd spring-boot:run
```
* **Port**: Runs on `http://localhost:8080`
* **H2 Database Console**: Available at `http://localhost:8080/h2-console`
  * **JDBC URL**: `jdbc:h2:file:./data/projectdb`
  * **Username**: `sa`
  * **Password**: *(Leave empty)*

### 2. Run the Vite/React Frontend

Navigate to the `frontend` directory and execute:
```bash
npm install
npm run dev
```
* **Port**: Runs on `http://localhost:5173` (or `http://localhost:5174` if port 5173 is occupied).

---

## Default Administrator Credentials

Use these credentials to perform the initial setup:
* **Username**: `admin`
* **Password**: `admin123`

---

## Key System Features

1. **Multi-Route Portals**: Dedicated and responsive sidebars for Administrator, Student, and Teacher portals that collapse into accessible drawers on mobile screen viewports.
2. **Persistent Database**: All CSV imports, student groups, progress timelines, grades, and comments are saved locally under the `backend/data/` folder, preserving state between restarts.
3. **Advanced Allocations**: Includes controls to partition students into random capacity-bounded groups and assign balanced primary/secondary teacher evaluators.
4. **Interactive Analytics**: Graphical representations of grade distributions and week-over-week performance trends using Recharts.
