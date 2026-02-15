# ButcheryOrders - Quick Setup Guide

## 🚀 Quick Start (Recommended for Testing)

### Option 1: Using Docker (Easiest)

**Prerequisites:** Docker Desktop installed

```bash
# From project root
docker-compose up -d
```

This will:
- Start PostgreSQL database
- Run migrations automatically
- Start the backend API on port 3000

**Test the API:**
```bash
curl http://localhost:3000/health
```

---

### Option 2: Local Setup (Without Docker)

#### Step 1: Install PostgreSQL

**Windows:**
1. Download from https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the password you set for the `postgres` user

**Or use a cloud database:**
- [Supabase](https://supabase.com) (Free tier)
- [Railway](https://railway.app) (Free tier)
- [Neon](https://neon.tech) (Free tier)

#### Step 2: Create Database

```sql
CREATE DATABASE butcheryorders;
```

#### Step 3: Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` and update:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/butcheryorders
JWT_SECRET=your-random-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here
```

#### Step 4: Install Dependencies & Run Migrations

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
```

#### Step 5: Start Backend

```bash
npm run dev
```

Backend runs on `http://localhost:3000`

---

## 🎯 Frontend Setup

```bash
# From project root
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## 🧪 Test Credentials

After running `npm run seed`:

- **Admin:** admin@butcheryorders.com / admin123
- **User:** test@example.com / test123

---

## 📝 API Endpoints

### Health Check
```bash
GET http://localhost:3000/health
```

### Register
```bash
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User"
}
```

### Login
```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "test123"
}
```

---

## 🐛 Troubleshooting

### "Prisma Client not found"
```bash
cd backend
npx prisma generate
```

### "Cannot connect to database"
- Check PostgreSQL is running
- Verify DATABASE_URL in `.env`
- Test connection: `psql -U postgres -d butcheryorders`

### "bcrypt compilation error" (Already Fixed)
We use `bcryptjs` instead of `bcrypt` to avoid native compilation issues on Windows.

### Port already in use
```bash
# Backend (port 3000)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Frontend (port 5173)
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

---

## 🔧 Useful Commands

### Backend
```bash
cd backend

# Development
npm run dev

# Database
npx prisma studio          # Open DB GUI
npx prisma migrate dev     # Create migration
npx prisma migrate reset   # Reset DB (WARNING: deletes all data)
npm run seed              # Seed test data

# Testing
npm test
```

### Frontend
```bash
# Development
npm run dev

# Build
npm run build

# Preview production build
npm run preview
```

---

## 📚 Next Steps

1. ✅ Backend is ready
2. ✅ Frontend service layer is ready
3. 🔄 Create Login/Register views
4. 🔄 Create NewOrder view with voice input
5. 🔄 Add testing infrastructure

---

## 🆘 Need Help?

Check the detailed documentation:
- Backend: `backend/README.md`
- Implementation Plan: See artifacts
- Walkthrough: See progress summary
