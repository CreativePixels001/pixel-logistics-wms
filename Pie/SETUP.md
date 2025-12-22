# 🚀 SETUP GUIDE - Indian Government Q&A System

Complete step-by-step guide to get the application running locally and in production.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Running the Application](#running-the-application)
6. [Testing](#testing)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

---

## 1. Prerequisites

### Required Software

- **Node.js**: 20.x or higher ([Download](https://nodejs.org/))
- **PostgreSQL**: 15.x or higher ([Download](https://www.postgresql.org/download/))
- **Redis**: 7.x or higher ([Download](https://redis.io/download))
- **Docker** (Optional but recommended): [Download](https://www.docker.com/products/docker-desktop)
- **Git**: For version control

### API Keys Required

1. **OpenAI API Key** - [Get it here](https://platform.openai.com/api-keys)
   - Sign up for OpenAI account
   - Generate API key
   - Minimum $5 credit recommended

2. **data.gov.in API Key** - [Register here](https://data.gov.in/user/register)
   - Create account on data.gov.in
   - Request API access
   - Get your API key from profile

3. **NDAP API Key** (Optional) - [Apply here](https://ndap.niti.gov.in/)
   - Register on NDAP platform
   - Apply for API access
   - Wait for approval (usually 2-3 days)

### System Requirements

- **Minimum**: 4GB RAM, 2 CPU cores, 10GB disk
- **Recommended**: 8GB RAM, 4 CPU cores, 20GB disk
- **OS**: macOS, Linux, or Windows with WSL2

---

## 2. Local Development Setup

### Option A: Using Docker (Recommended)

This is the easiest way to get started - everything runs in containers.

```bash
# 1. Clone the repository
git clone https://github.com/CreativePixels001/pixel-logistics-wms.git
cd Pie

# 2. Create environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Edit the .env files (see Environment Configuration section)
nano backend/.env  # or use your preferred editor

# 4. Start all services
docker-compose up

# Access:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:5000
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379
```

### Option B: Manual Setup

If you prefer to run services individually:

```bash
# 1. Clone the repository
git clone https://github.com/CreativePixels001/pixel-logistics-wms.git
cd Pie

# 2. Install backend dependencies
cd backend
npm install

# 3. Install frontend dependencies
cd ../frontend
npm install
```

---

## 3. Environment Configuration

### Backend Environment Variables

Edit `backend/.env`:

```bash
# ===========================================
# CORE CONFIGURATION
# ===========================================
NODE_ENV=development
PORT=5000
APP_NAME=Indian-Gov-QA-Backend

# ===========================================
# DATABASE
# ===========================================
# Local PostgreSQL
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/indian_gov_qa?schema=public"

# Docker PostgreSQL (if using docker-compose)
# DATABASE_URL="postgresql://postgres:postgres123@postgres:5432/indian_gov_qa?schema=public"

# ===========================================
# REDIS
# ===========================================
# Local Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Docker Redis (if using docker-compose)
# REDIS_HOST=redis

# ===========================================
# JWT AUTHENTICATION
# ===========================================
# IMPORTANT: Change these in production!
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-token-secret-min-32-characters
JWT_REFRESH_EXPIRES_IN=30d

# Generate strong secrets:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# ===========================================
# OPENAI CONFIGURATION
# ===========================================
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=2000
OPENAI_TEMPERATURE=0.7

# Alternative: Use GPT-3.5 for lower costs
# OPENAI_MODEL=gpt-3.5-turbo

# ===========================================
# ANTHROPIC CLAUDE (Optional Alternative)
# ===========================================
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
ANTHROPIC_MODEL=claude-3-sonnet-20240229

# ===========================================
# INDIAN GOVERNMENT APIs
# ===========================================
# data.gov.in
DATA_GOV_IN_API_KEY=your-data-gov-in-api-key-here

# NDAP (National Data & Analytics Platform)
NDAP_API_KEY=your-ndap-api-key
NDAP_CLIENT_ID=your-ndap-client-id
NDAP_CLIENT_SECRET=your-ndap-client-secret

# ===========================================
# PINECONE VECTOR DATABASE (Optional)
# ===========================================
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=us-west1-gcp
PINECONE_INDEX_NAME=indian-gov-qa

# ===========================================
# SECURITY & RATE LIMITING
# ===========================================
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# ===========================================
# CACHE CONFIGURATION (seconds)
# ===========================================
CACHE_TTL_SHORT=300      # 5 minutes
CACHE_TTL_MEDIUM=1800    # 30 minutes
CACHE_TTL_LONG=3600      # 1 hour

# ===========================================
# API RETRY CONFIGURATION
# ===========================================
API_RETRY_ATTEMPTS=3
API_RETRY_DELAY=1000

# ===========================================
# LOGGING
# ===========================================
LOG_LEVEL=info
# Options: error, warn, info, debug

# ===========================================
# MONITORING (Optional)
# ===========================================
SENTRY_DSN=
GRAFANA_API_KEY=
```

### Frontend Environment Variables

Edit `frontend/.env`:

```bash
# API Backend URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# Production URL (when deploying)
# NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
```

---

## 4. Database Setup

### Using Docker (Automatic)

If you're using `docker-compose up`, PostgreSQL and Redis are automatically set up.

### Manual PostgreSQL Setup

```bash
# 1. Install PostgreSQL
# macOS
brew install postgresql@15
brew services start postgresql@15

# Ubuntu/Debian
sudo apt-get install postgresql-15
sudo systemctl start postgresql

# 2. Create database
psql postgres
CREATE DATABASE indian_gov_qa;
CREATE USER postgres WITH PASSWORD 'postgres123';
GRANT ALL PRIVILEGES ON DATABASE indian_gov_qa TO postgres;
\q

# 3. Run Prisma migrations
cd backend
npm run prisma:generate
npm run prisma:migrate

# 4. (Optional) Seed database with sample data
npx prisma db seed
```

### Manual Redis Setup

```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis

# Verify Redis is running
redis-cli ping
# Should return: PONG
```

---

## 5. Running the Application

### Full Stack with Docker

```bash
# Start everything
docker-compose up

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop everything
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v
```

### Manual Development Mode

#### Terminal 1: Start Backend

```bash
cd backend

# First time setup
npm run prisma:generate
npm run prisma:migrate

# Start dev server (with hot reload)
npm run dev

# Backend will run on http://localhost:5000
```

#### Terminal 2: Start Frontend

```bash
cd frontend

# Start dev server (with hot reload)
npm run dev

# Frontend will run on http://localhost:3000
```

#### Terminal 3: Start Redis (if not using Docker)

```bash
redis-server
```

### Verify Everything is Running

1. **Backend Health Check**: http://localhost:5000/health
   - Should return: `{"success": true, "status": "healthy"}`

2. **Frontend**: http://localhost:3000
   - Should show the chat interface

3. **Database**: 
   ```bash
   cd backend
   npm run prisma:studio
   # Opens Prisma Studio at http://localhost:5555
   ```

---

## 6. Testing

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

### Frontend Tests

```bash
cd frontend

# Run tests
npm test

# Run Storybook (component development)
npm run storybook
```

### Manual Testing Flow

1. **Register a User**
   ```bash
   curl -X POST http://localhost:5000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "name": "Test User",
       "password": "password123"
     }'
   ```

2. **Login**
   ```bash
   curl -X POST http://localhost:5000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "identifier": "test@example.com",
       "password": "password123"
     }'
   ```

3. **Send a Query** (use the access token from login)
   ```bash
   curl -X POST http://localhost:5000/api/v1/chat/query \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     -d '{
       "query": "What is PM-KISAN scheme?"
     }'
   ```

---

## 7. Production Deployment

### AWS Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

Quick overview:

```bash
# 1. Build Docker images
docker build -t indian-gov-qa-backend ./backend
docker build -t indian-gov-qa-frontend ./frontend

# 2. Push to ECR
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin YOUR_ECR_URL
docker tag indian-gov-qa-backend YOUR_ECR_URL/backend:latest
docker push YOUR_ECR_URL/backend:latest

# 3. Deploy to ECS
aws ecs update-service --cluster indian-gov-qa --service backend --force-new-deployment
```

### Environment Variables for Production

**CRITICAL**: Change these before deploying:

```bash
NODE_ENV=production
JWT_SECRET=<generate-strong-secret>
DATABASE_URL=<production-database-url>
CORS_ORIGIN=https://yourdomain.com
```

---

## 8. Troubleshooting

### Common Issues

#### 1. "Cannot connect to PostgreSQL"

```bash
# Check if PostgreSQL is running
pg_isadmin -U postgres

# Check connection string
echo $DATABASE_URL

# Restart PostgreSQL
brew services restart postgresql@15
# or
sudo systemctl restart postgresql
```

#### 2. "Redis connection failed"

```bash
# Check if Redis is running
redis-cli ping

# Start Redis
brew services start redis
# or
sudo systemctl start redis
```

#### 3. "Prisma Client not generated"

```bash
cd backend
npm run prisma:generate
```

#### 4. "OpenAI API error"

- Verify your API key is correct
- Check you have credits: https://platform.openai.com/account/usage
- Try using `gpt-3.5-turbo` if rate limited

#### 5. "Port already in use"

```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or change port in .env
PORT=5001
```

#### 6. "Module not found" errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Getting Help

1. Check the [FAQ](./docs/FAQ.md)
2. Search [GitHub Issues](https://github.com/CreativePixels001/pixel-logistics-wms/issues)
3. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Environment details (OS, Node version, etc.)

---

## 🎉 Success!

If everything is working:

1. Open http://localhost:3000
2. You should see the welcome screen
3. Try asking: "What is the PM-KISAN scheme?"
4. You should get an AI-generated response with sources

**Next Steps:**

- Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the system
- Explore the [API Documentation](./backend/README.md)
- Try different queries
- Customize the UI
- Add more Government API sources

---

**Happy Coding! 🚀🇮🇳**
