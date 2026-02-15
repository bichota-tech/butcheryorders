# ButcheryOrders Backend API

Production-ready REST API for the ButcheryOrders voice-first order management system.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- npm or pnpm

### Installation

```bash
cd backend
npm install
```

### Environment Setup

```bash
cp .env.example .env
# Edit .env with your configuration
```

### Database Setup

```bash
# Run migrations
npm run migrate

# Seed database with test data
npm run seed
```

### Development

```bash
npm run dev
```

Server runs on `http://localhost:3000`

## 🐳 Docker Setup

```bash
# From project root
docker-compose up -d
```

This starts PostgreSQL and the backend API with automatic migrations.

## 📚 API Documentation

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

### Orders

#### Create Order
```http
POST /api/orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "items": [
    {
      "productId": "carne-roja",
      "quantity": 2,
      "unit": "kg"
    }
  ],
  "transcript": "2 kilos de carne roja"
}
```

#### Get Orders
```http
GET /api/orders?page=1&limit=10
Authorization: Bearer {token}
```

### Products

#### List Products
```http
GET /api/products
Authorization: Bearer {token}
```

#### Search Products
```http
GET /api/products/search?q=carne
Authorization: Bearer {token}
```

### Voice Processing

#### Process Transcript
```http
POST /api/voice/process
Authorization: Bearer {token}
Content-Type: application/json

{
  "transcript": "quiero 2 kilos de carne roja y 1 kilo de pollo"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "intent": "create_order",
    "confidence": 0.8,
    "items": [
      {
        "productId": "carne-roja",
        "productName": "Carne Roja",
        "quantity": 2,
        "unit": "kg",
        "confidence": 0.9
      }
    ],
    "validation": {
      "isValid": true,
      "errors": []
    }
  }
}
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   └── server.js        # Express app
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.js          # Seed data
└── tests/               # Test files
```

## 🔐 Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting (100 req/15min general, 5 req/15min auth)
- CORS protection
- Helmet security headers
- Request validation with Joi
- SQL injection prevention (Prisma)

## 📊 Database Schema

- **User**: Authentication and profile
- **Order**: Customer orders with status tracking
- **OrderItem**: Individual items in orders
- **Product**: Product catalog
- **RefreshToken**: JWT refresh token storage

## 🛠️ Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (DB GUI)
- `npm run seed` - Seed database with test data

## 🌐 Environment Variables

See `.env.example` for all available configuration options.

## 📝 Test Credentials

After running `npm run seed`:

- **Admin**: admin@butcheryorders.com / admin123
- **User**: test@example.com / test123
