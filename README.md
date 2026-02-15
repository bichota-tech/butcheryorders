# ButcheryOrders — Voice-First Order Management System

**Status:** 🚧 En progreso (35% Complete)  
**Project Board:** 📊 [Butchery Kanban](https://github.com/users/bichota-tech/projects/4)

Production-ready application for managing butchery orders via voice input with AI-powered natural language processing.

---

## 🎯 Project Overview

This project transforms a basic Vue 3 MVP into a full-stack, production-ready application with:

- 🎙️ **Voice-First Interface**: Web Speech API + Google Cloud Speech-to-Text
- 🤖 **AI Processing**: NLP for Spanish voice transcript parsing
- 🔐 **Secure Authentication**: JWT with refresh tokens
- 📊 **Real-time Dashboard**: Order tracking and analytics
- 🐳 **Docker Ready**: Easy deployment with docker-compose
- ✅ **Production Quality**: Testing, CI/CD, monitoring

---

## ✨ Current Features

### Backend (✅ Complete)
- REST API with Express + PostgreSQL + Prisma
- JWT authentication with refresh tokens
- NLP service for voice transcript processing
- Complete CRUD for orders, products, users
- Rate limiting and security middleware
- Docker containerization

### Frontend (🔄 60% Complete)
- Service layer with API client
- Pinia stores (auth, orders, voice, products)
- Voice recording composable (Web Speech API)
- Router with authentication guards

---

## 🚀 Quick Start

See **[SETUP.md](./SETUP.md)** for detailed setup instructions.

### Using Docker (Recommended)
```bash
docker-compose up -d
```

### Manual Setup
```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your database URL
npx prisma generate
npx prisma migrate dev
npm run seed
npm run dev

# Frontend (in another terminal)
cd ..
npm install
npm run dev
```

**Test Credentials:**
- Admin: admin@butcheryorders.com / admin123
- User: test@example.com / test123

---

## 📚 Tech Stack

**Frontend:**
- Vue 3 + Vite
- Pinia (state management)
- Vue Router
- Axios
- Bootstrap 5

**Backend:**
- Node.js + Express
- PostgreSQL + Prisma ORM
- JWT authentication
- Winston (logging)
- Joi (validation)

**DevOps:**
- Docker + Docker Compose
- GitHub Actions (planned)
- Vercel (frontend deployment - planned)
- Railway/Render (backend deployment - planned)

---

## 📊 Progress

- ✅ Phase 0: Planning & Design (100%)
- ✅ Phase 1: Backend Infrastructure (100%)
- 🔄 Phase 2: Voice & AI Integration (50%)
- 🔄 Phase 3: Frontend Refactoring (60%)
- ⏳ Phase 4: Testing & Quality (0%)
- ⏳ Phase 5-8: Security, Monitoring, Features, Deployment (0%)

**Overall: ~35% Complete**

See [walkthrough.md](./brain/walkthrough.md) for detailed progress.

---

## 📁 Project Structure

```
butcheryorders/
├── backend/              # Express API
│   ├── src/
│   │   ├── config/      # Database, auth, CORS
│   │   ├── controllers/ # Request handlers
│   │   ├── middleware/  # Auth, validation, errors
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   └── utils/       # Helpers
│   ├── prisma/          # Database schema & migrations
│   └── tests/           # Backend tests
├── src/                 # Vue 3 frontend
│   ├── components/      # Vue components
│   ├── composables/     # Reusable logic
│   ├── services/        # API clients
│   ├── stores/          # Pinia stores
│   ├── router/          # Vue Router
│   └── views/           # Page components
├── docker-compose.yml   # Docker setup
└── SETUP.md            # Setup instructions
```

---

## 🔮 Roadmap

### Next Up
- [ ] Create Login/Register views
- [ ] Build NewOrder view with voice UI
- [ ] Add testing infrastructure (Vitest + Playwright)
- [ ] Set up CI/CD pipeline
- [ ] Deploy to staging

### Future Features
- [ ] Multi-language support (i18n)
- [ ] PWA with offline support
- [ ] Admin dashboard
- [ ] Real-time notifications
- [ ] Analytics and reporting

---

## 👤 Author

Ada (bichota-tech)  
GitHub: https://github.com/bichota-tech  

---

## 📄 License

This project is published for demonstration purposes.
