# 📌 Project README

## 🧩 Project Overview

This project is a **full-stack task management application** implementing a Kanban-style board with three statuses:

- **TODO**
- **IN_PROGRESS**
- **DONE**

### Features
Each task supports:
- Create
- Edit
- Delete
- Duplicate
- Drag & Drop within the same column
- Pagination per column
- Backend persistence (PostgreSQL)
- API integration via REST
- State management via React Query

---

## 🚀 Getting Started

This project has two separate apps:

### ✅ 1) Backend (NestJS)

#### Prerequisites
Make sure you have:
- Node.js v18+
- PostgreSQL
- Yarn or npm

#### Installation
```bash
cd backend
yarn install
cp .env.exemple .env
```

#### Setup Environment
Fill the `.env` file with:
```env
PORT=backend_port
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=your_database
FRONTEND_URL=FRONTEND_URL
```

#### Make sure that:
- PostgreSQL is running
- The credentials match your local PostgreSQL configuration
- A database with the specified name already exists
``
#### Run Backend
```bash
yarn start
```

API will be available at:  
👉 [http://localhost:PORT](http://localhost:4000)

---

### ✅ 2) Frontend (Next.js)

#### Prerequisites
- Node.js v18+
- Yarn or npm

#### Installation
```bash
cd frontend
npm install
cp .env.exemple .env

```

#### Setup Environment
Fill the `.env` file with:
```env
PORT=frontend_port
NEXT_PUBLIC_API_URL=backend_url
```

#### Run Frontend
```bash
npm run dev
```

Frontend will be available at:  
👉 [http://localhost:PORT](http://localhost:3000)

---

## 🔧 Architecture

### Backend
- NestJS
- PostgreSQL
- TypeORM

#### Endpoints
- `GET /tasks`
- `POST /tasks`
- `PUT /tasks/:id`
- `DELETE /tasks/:id`
- `POST /tasks/:id/duplicate`

---

### Frontend
- Next.js (App Router)
- React Query
- Axios

#### Folder structure
```bash
frontend/
  ├── .next/
  ├── app/
  │   ├── api/
  │   │   └── tasks.ts
  │   ├── components/
  │   │   ├── ColumnPagination.tsx
  │   │   ├── TaskCard.tsx
  │   │   └── TaskColumn.tsx
  │   ├── lib/
  │   │   └── api.ts
  │   ├── tasks/
  │   │   └── page.tsx
  │   └── page.tsx
  ├── favicon.ico
  ├── globals.css
  ├── layout.tsx
  ├── providers.tsx
  └── package.json
```

---

## 🧠 Technical Choices (Why these?)

### ✅ NestJS (Backend Framework)
Chosen for:
- Clean architecture and modular structure
- Built-in support for dependency injection
- Easy scalability and maintainability
- Strong TypeScript support and powerful CLI

### ✅ PostgreSQL (Database)
Chosen for:
- Strong relational data support
- ACID compliance for data integrity
- Great performance and reliability
- Easy to scale and widely supported in production

### ✅ Next.js (App Router)
Chosen for:
- Fast rendering
- Built-in routing
- Great developer experience
- Optimized performance

### ✅ React Query (State Management + Server Cache)
Used because:
- Removes the need for Redux/Zustand
- Handles:
  - caching
  - loading states
  - error states
  - optimistic updates
  - automatic refetching

---

## 🧪 What Was Done in TDD

The main goal of TDD was to ensure robust task actions.

### ✔️ Tested Features
- Task creation
- Task fetching
- Task deletion
- Task editing

### ✔️ TDD Approach
- Write failing tests for each feature
- Implement minimal code to pass tests
- Refactor while keeping tests green

---

## 🔧 Improvements I Would Make With More Time


### 1. End-to-End Tests
Using Cypress / Playwright to cover:
- drag & drop
- pagination

### 2. Better Error UX
Add:
- toast system
- retry logic
- global error boundary

### 3. Authentication
Add:
- JWT auth
- Role-based permissions
- Protected routes

### 4. Backend Improvements
Add:
- better dependency injection and modular architecture
- centralized logging and monitoring (ELK or similar)
---