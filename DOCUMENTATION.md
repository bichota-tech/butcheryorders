# ButcheryOrders - Complete Project Documentation

**Version:** 1.0 (En progreso - 35% Complete)  
**Author:** bichota-tech  
**Repository:** https://github.com/bichota-tech/butcheryorders  
**Project Board:** https://github.com/users/bichota-tech/projects/4

---

## 📖 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Setup & Installation](#setup--installation)
5. [Development Workflow](#development-workflow)
6. [API Documentation](#api-documentation)
7. [Database Schema](#database-schema)
8. [Deployment](#deployment)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

**ButcheryOrders** is a production-ready voice-first order management system designed for butcheries, featuring AI-powered natural language processing for Spanish voice commands.

### Key Features
- 🎙️ **Voice Input**: Web Speech API + Google Cloud Speech-to-Text
- 🤖 **AI Processing**: NLP for parsing Spanish voice transcripts
- 🔐 **Authentication**: JWT with refresh token rotation
- 📊 **Real-time Dashboard**: Order tracking and analytics
- 🐳 **Containerized**: Docker-ready with docker-compose
- 📋 **Project Management**: GitHub Projects Kanban board

### Current Status
- Backend Infrastructure: ✅ 100%
- Voice & AI Integration: 🔄 50%
- Frontend Development: 🔄 60%
- Testing & QA: ⏳ 0%
- **Overall Progress: 35%**

---

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────┐
│           Frontend (Vue 3 + Vite)           │
│  ┌────────────┐  ┌──────────┐  ┌─────────┐ │
│  │   Views    │  │  Stores  │  │  Router │ │
│  │  (Pages)   │  │  (Pinia) │  │  Guards │ │
│  └────────────┘  └──────────┘  └─────────┘ │
│  ┌────────────┐  ┌──────────┐             │
│  │ Components │  │ Services │             │
│  │ (Reusable) │  │  (API)   │             │
│  └────────────┘  └──────────┘              │
└──────────────┬──────────────────────────────┘
               │ HTTP/REST API
               │ JWT Authentication
┌──────────────▼──────────────────────────────┐
│         Backend (Express + Node.js)         │
│  ┌────────┐ ┌────────────┐ ┌─────────────┐ │
│  │ Routes │→│Controllers │→│  Services   │ │
│  └────────┘ └────────────┘ └─────────────┘ │
│  ┌────────────┐  ┌──────────┐              │
│  │ Middleware │  │   Utils  │              │
│  │ (Auth/Val) │  │ (Helpers)│              │
│  └────────────┘  └──────────┘              │
└──────────────┬──────────────────────────────┘
               │ Prisma ORM
┌──────────────▼──────────────────────────────┐
│       Database (PostgreSQL 15)              │
│   Users | Orders | Products | Sessions     │
└─────────────────────────────────────────────┘
```

### Directory Structure

```
butcheryorders/
├── backend/                    # Express API Server
│   ├── src/
│   │   ├── config/            # Database, auth, CORS config
│   │   ├── controllers/       # HTTP request handlers
│   │   ├── middleware/        # Auth, validation, errors
│   │   ├── routes/            # API endpoints
│   │   ├── services/          # Business logic & NLP
│   │   ├── utils/             # Validators & helpers
│   │   └── server.js          # Entry point
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   ├── migrations/        # DB migration files
│   │   └── seed.js            # Test data
│   ├── tests/                 # Backend tests (planned)
│   ├── Dockerfile
│   ├── .env                   # Environment variables
│   └── package.json
├── src/                       # Vue 3 Frontend
│   ├── components/            # Reusable Vue components
│   ├── composables/           # Composition API logic
│   ├── services/              # API client services
│   ├── stores/                # Pinia state management
│   ├── router/                # Vue Router config
│   ├── views/                 # Page components
│   ├── assets/                # Static assets
│   └── main.js                # Frontend entry point
├── docker-compose.yml         # Multi-container setup
├── .env                       # Frontend env variables
├── vite.config.js             # Vite bundler config
├── README.md                  # Project overview
├── SETUP.md                   # Setup instructions
└── package.json               # Frontend dependencies
```

---

## 🔧 Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Vue.js | 3.5.26 | Progressive JavaScript framework |
| Vite | 7.3.0 | Build tool & dev server |
| Pinia | 3.0.4 | State management |
| Vue Router | 4.6.4 | Client-side routing |
| Axios | 1.13.5 | HTTP client |
| Bootstrap | 5.3.8 | UI framework |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 22.20.0 | JavaScript runtime |
| Express | 4.21.2 | Web framework |
| Prisma | 6.3.0 | ORM & migrations |
| PostgreSQL | 15 | Relational database |
| JWT | 9.0.2 | Authentication tokens |
| Winston | 3.17.0 | Logging |
| Joi | 17.13.3 | Schema validation |

### DevOps & Tools
- **Docker**: Containerization
- **Git**: Version control
- **GitHub Projects**: Kanban project management
- **Node Scripts**: Automation utilities

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js `>= 22.12.0` or `^20.19.0`
- PostgreSQL 15 (or Docker)
- Git

### Option 1: Docker (Recommended)

```bash
# Clone repository
git clone https://github.com/bichota-tech/butcheryorders.git
cd butcheryorders

# Start all services
docker-compose up -d

# Access:
# - Frontend: http://localhost:5173
# - Backend: http://localhost:3000
# - Database: localhost:5432
```

### Option 2: Manual Setup

#### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your PostgreSQL connection string

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database with test data
npm run seed

# Start development server
npm run dev
```

**Backend runs on:** http://localhost:3000

#### Frontend Setup
```bash
# From project root
npm install

# Configure environment
echo "VITE_API_URL=/api" > .env

# Start development server
npm run dev
```

**Frontend runs on:** http://localhost:5173

### Default Test Accounts
| Email | Password | Role |
|-------|----------|------|
| admin@butcheryorders.com | admin123 | Admin |
| test@example.com | test123 | User |

---

## 💻 Development Workflow

### Running the Project

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend  
npm run dev
```

### Database Management

```bash
# Create a new migration
npx prisma migrate dev --name description

# Reset database
npx prisma migrate reset

# Open Prisma Studio (DB GUI)
npx prisma studio
```

### Code Quality

```bash
# Run linter (planned)
npm run lint

# Run tests (planned)
npm run test

# Build for production
npm run build
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

#### POST `/api/auth/login`
Authenticate user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** Same as register

#### POST `/api/auth/refresh`
Refresh access token.

**Request:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response:**
```json
{
  "accessToken": "new_token..."
}
```

### Orders Endpoints

#### GET `/api/orders`
Get all orders (authenticated).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "totalAmount": 125.50,
    "status": "PENDING",
    "items": [
      {
        "productId": "uuid",
        "quantity": 2,
        "price": 62.75
      }
    ],
    "createdAt": "2026-02-15T10:00:00Z"
  }
]
```

#### POST `/api/orders`
Create new order.

**Request:**
```json
{
  "items": [
    {
      "productId": "uuid",
      "quantity": 2
    }
  ],
  "notes": "Optional notes"
}
```

**Response:** `201 Created`

#### GET `/api/orders/:id`
Get specific order.

#### PATCH `/api/orders/:id`
Update order status.

**Request:**
```json
{
  "status": "COMPLETED"
}
```

### Products Endpoints

#### GET `/api/products`
Get all products.

#### POST `/api/products` (Admin only)
Create new product.

**Request:**
```json
{
  "name": "Ribeye Steak",
  "price": 45.99,
  "unit": "kg",
  "category": "BEEF",
  "stock": 50
}
```

### Voice Processing Endpoint

#### POST `/api/voice/process`
Process voice transcript into order.

**Request:**
```json
{
  "transcript": "Quiero dos kilos de carne de res y un kilo de pollo"
}
```

**Response:**
```json
{
  "parsed": {
    "items": [
      {"product": "carne de res", "quantity": 2, "unit": "kg"},
      {"product": "pollo", "quantity": 1, "unit": "kg"}
    ]
  },
  "confidence": 0.95
}
```

---

## 🗄️ Database Schema

### Entity Relationship Diagram

```
Users                   Orders                OrderItems
┌─────────────┐        ┌─────────────┐       ┌──────────────┐
│ id (PK)     │────┐   │ id (PK)     │───┬──→│ id (PK)      │
│ email       │    └──→│ userId (FK) │   │   │ orderId (FK) │
│ password    │        │ totalAmount │   │   │ productId(FK)│
│ name        │        │ status      │   │   │ quantity     │
│ role        │        │ createdAt   │   │   │ price        │
│ createdAt   │        └─────────────┘   │   └──────────────┘
└─────────────┘                          │
                                         │   Products
RefreshTokens                            │   ┌──────────────┐
┌─────────────┐                          └──→│ id (PK)      │
│ id (PK)     │                              │ name         │
│ userId (FK) │─────────────────────────────→│ price        │
│ token       │                              │ unit         │
│ expiresAt   │                              │ category     │
└─────────────┘                              │ stock        │
                                             │ active       │
                                             └──────────────┘
```

### Prisma Schema Excerpt

```prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  password      String
  name          String
  role          Role     @default(USER)
  createdAt     DateTime @default(now())
  orders        Order[]
  refreshTokens RefreshToken[]
}

model Order {
  id          String      @id @default(uuid())
  userId      String
  user        User        @relation(fields: [userId], references: [id])
  totalAmount Float
  status      OrderStatus @default(PENDING)
  items       OrderItem[]
  createdAt   DateTime    @default(now())
}

enum OrderStatus {
  PENDING
  PROCESSING
  COMPLETED
  CANCELLED
}

enum Role {
  USER
  ADMIN
}
```

---

## 🚢 Deployment

### Environment Variables

**Backend (`.env`):**
```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/butchery"
JWT_SECRET="your-secure-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
PORT=3000
NODE_ENV=production
```

**Frontend (`.env`):**
```bash
VITE_API_URL=https://api.yourapp.com
```

### Production Build

```bash
# Backend
cd backend
npm install --production
npx prisma generate
npx prisma migrate deploy

# Frontend
npm install
npm run build
# Dist folder: ./dist
```

### Deployment Platforms

**Recommended:**
- **Frontend**: Vercel, Netlify
- **Backend**: Railway, Render, Fly.io
- **Database**: Railway, Supabase, Neon

---

## 🧪 Testing

### Backend Tests (Planned)
```bash
cd backend
npm run test
```

### Frontend Tests (Planned)
```bash
npm run test:unit     # Vitest
npm run test:e2e      # Playwright
```

---

## 🔧 Troubleshooting

### Common Issues

**Issue: Port already in use**
```bash
# Find process using port 3000
lsof -i :3000
# Kill process
kill -9 <PID>
```

**Issue: Prisma migration errors**
```bash
# Reset database
npx prisma migrate reset
# Regenerate client
npx prisma generate
```

**Issue: CORS errors**
- Check `backend/src/config/cors.js` whitelist
- Ensure frontend URL matches allowed origins

**Issue: Authentication failures**
- Verify JWT secrets in `.env`
- Check token expiration times
- Clear localStorage/cookies

---

## 📞 Support & Contact

**Author:** bichota-tech  
**GitHub:** https://github.com/bichota-tech  
**Repository:** https://github.com/bichota-tech/butcheryorders  
**Project Board:** https://github.com/users/bichota-tech/projects/4

---

## 📄 License

This project is published for demonstration purposes.

---

**Last Updated:** 2026-02-15
