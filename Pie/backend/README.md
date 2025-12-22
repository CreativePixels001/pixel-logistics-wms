# Indian Government Q&A System - Backend

Production-ready backend API for AI-powered Indian Government Data Q&A application.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your credentials

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
```

## 📦 Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm start            # Start production server
npm test             # Run tests with coverage
npm run lint         # Lint code
npm run prisma:studio # Open Prisma Studio (Database GUI)
```

## 🐳 Docker

```bash
# Build Docker image
npm run docker:build

# Run container
npm run docker:run

# Or use Docker Compose (from root directory)
docker-compose up backend
```

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.ts  # Prisma client
│   │   ├── redis.ts     # Redis client
│   │   └── environment.ts # Environment variables
│   ├── controllers/     # Route controllers
│   │   ├── auth.controller.ts
│   │   ├── chat.controller.ts
│   │   └── api.controller.ts
│   ├── services/        # Business logic
│   │   ├── ai.service.ts       # AI/GPT integration
│   │   └── govApi.service.ts   # Government API wrappers
│   ├── middleware/      # Express middleware
│   │   ├── auth.ts
│   │   ├── rateLimiter.ts
│   │   └── errorHandler.ts
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── index.ts         # Application entry point
├── prisma/
│   └── schema.prisma    # Database schema
├── tests/               # Test files
├── Dockerfile
├── package.json
└── tsconfig.json
```

## 🔐 Environment Variables

Required environment variables (see `.env.example`):

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_HOST` - Redis host
- `JWT_SECRET` - JWT signing secret
- `OPENAI_API_KEY` - OpenAI API key
- `DATA_GOV_IN_API_KEY` - data.gov.in API key

## 📚 API Documentation

### Authentication

#### POST `/api/v1/auth/register`
Register a new user
```json
{
  "email": "user@example.com",
  "phone": "9876543210",
  "name": "John Doe",
  "password": "securepassword"
}
```

#### POST `/api/v1/auth/login`
Login user
```json
{
  "identifier": "user@example.com",
  "password": "securepassword"
}
```

### Chat

#### POST `/api/v1/chat/query`
Send a query (requires authentication)
```json
{
  "query": "What is the PM-KISAN scheme?",
  "conversationId": "optional-uuid"
}
```

#### GET `/api/v1/chat/conversations`
Get user's conversations (requires authentication)

### Government APIs

#### GET `/api/v1/gov-api/sources`
Get available government data sources

#### GET `/api/v1/gov-api/analytics`
Get query analytics (admin only)

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm test -- --coverage
```

## 📊 Database

### Migrations

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Prisma Studio

```bash
# Open Prisma Studio
npm run prisma:studio
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting (100 req/min per user)
- Helmet.js security headers
- Input validation with Zod
- SQL injection prevention (Prisma ORM)
- CORS configuration

## 📈 Performance

- Redis caching for API responses
- Database query optimization with indexes
- Compression middleware
- Connection pooling

## 🌐 Deployment

### Production Checklist

- [ ] Set strong `JWT_SECRET`
- [ ] Configure production database
- [ ] Set up Redis cluster
- [ ] Configure CORS origins
- [ ] Enable SSL/TLS
- [ ] Set up monitoring (Sentry, Grafana)
- [ ] Configure logging
- [ ] Set up CI/CD pipeline
- [ ] Run security audit: `npm audit`

### Environment Setup

```bash
# Production build
npm run build

# Start production server
NODE_ENV=production npm start
```

## 📝 License

MIT

## 👥 Contributors

CreativePixels001
