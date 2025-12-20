# Pixel Academy Backend API

RESTful API for Pixel Academy learning management system with Google OAuth authentication, course management, progress tracking, and assignment submissions.

## 🚀 Features

- **Google OAuth Authentication** - Secure login with Google
- **Role-Based Access Control** - Student and Admin roles
- **Course Management** - Courses, modules, and chapters
- **Progress Tracking** - Track student completion and time spent
- **Assignment Submissions** - File uploads with approve/reject workflow
- **Analytics Dashboard** - Comprehensive admin analytics
- **RESTful API** - Clean, documented endpoints

## 📋 Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 13
- Google Cloud Console project (for OAuth)

## 🛠️ Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE pixel_academy;
CREATE USER pixel_admin WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE pixel_academy TO pixel_admin;
```

### 3. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pixel_academy
DB_USER=pixel_admin
DB_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Application
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:8000

# Admin emails (comma-separated)
ADMIN_EMAILS=admin@pixelacademy.com,your-email@example.com
```

### 4. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized JavaScript origins: `http://localhost:8000`
   - Authorized redirect URIs: `http://localhost:8000/login.html`
5. Copy Client ID and Client Secret to `.env`

### 5. Database Migration & Seeding

The server will automatically create tables on first run. To seed with initial course data:

```bash
npm run seed
```

This creates:
- 1 Course: "Design, Technology & AI for Designers"
- 5 Modules
- 15 Chapters

## 🎯 Running the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

Server will run on `http://localhost:3000`

## 📚 API Documentation

### Authentication

#### POST `/api/auth/google`
Authenticate with Google OAuth token

**Request:**
```json
{
  "token": "google-id-token"
}
```

**Response:**
```json
{
  "token": "jwt-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "student",
    "profilePhoto": "https://..."
  }
}
```

#### GET `/api/auth/me`
Get current authenticated user (requires JWT)

### Courses

#### GET `/api/courses`
Get all published courses

#### GET `/api/courses/:slug`
Get course by slug with modules and chapters

#### POST `/api/courses/:courseId/enroll`
Enroll in a course (authenticated)

#### GET `/api/courses/:courseId/my-progress`
Get user's progress in a course (authenticated)

### Progress

#### POST `/api/progress/chapter`
Mark a chapter as complete

**Request:**
```json
{
  "courseId": "uuid",
  "moduleId": "uuid",
  "chapterId": "uuid",
  "timeSpent": 300
}
```

#### POST `/api/progress/module`
Mark a module as complete

#### GET `/api/progress/:courseId`
Get user's progress for a course

### Assignments

#### POST `/api/assignments`
Submit an assignment with files

**Request (multipart/form-data):**
```
moduleId: uuid
caseStudy: text
files[]: file uploads (max 5 files, 10MB each)
```

#### GET `/api/assignments`
Get assignments (filtered by role)

#### GET `/api/assignments/pending`
Get pending assignments (admin only)

#### PUT `/api/assignments/:id/approve`
Approve an assignment (admin only)

**Request:**
```json
{
  "feedback": "Great work!"
}
```

#### PUT `/api/assignments/:id/reject`
Reject an assignment (admin only)

**Request:**
```json
{
  "feedback": "Please revise according to guidelines."
}
```

### Analytics (Admin Only)

#### GET `/api/analytics/overview`
Get overall platform analytics

#### GET `/api/analytics/courses/:courseId`
Get analytics for specific course

#### GET `/api/analytics/students`
Get student analytics

#### GET `/api/analytics/modules`
Get module-level analytics

### Users (Admin Only)

#### GET `/api/users`
Get all users with pagination

#### GET `/api/users/:id`
Get user by ID with progress

#### PUT `/api/users/:id`
Update user

#### DELETE `/api/users/:id`
Delete user

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

## 🎭 Roles

- **Student**: Can view courses, track progress, submit assignments
- **Admin**: Full access + review assignments, view analytics, manage users

Admin role is automatically assigned to emails listed in `ADMIN_EMAILS` environment variable.

## 📁 File Structure

```
backend/
├── models/           # Sequelize models
│   ├── index.js
│   ├── User.js
│   ├── Course.js
│   ├── Module.js
│   ├── Chapter.js
│   ├── Enrollment.js
│   ├── Progress.js
│   ├── Assignment.js
│   └── AssignmentFile.js
├── routes/           # API routes
│   ├── auth.js
│   ├── users.js
│   ├── courses.js
│   ├── progress.js
│   ├── assignments.js
│   └── analytics.js
├── middleware/       # Express middleware
│   └── auth.js
├── scripts/          # Utility scripts
│   └── seed.js
├── uploads/          # File uploads directory
├── server.js         # Main application file
├── package.json
└── .env
```

## 🧪 Testing

```bash
# Test database connection
curl http://localhost:3000/health

# Test authentication
curl -X POST http://localhost:3000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"token":"your-google-token"}'
```

## 🚢 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
DB_HOST=your-production-db-host
DB_NAME=pixel_academy
DB_USER=postgres
DB_PASSWORD=secure-password
JWT_SECRET=production-secret-min-32-chars
FRONTEND_URL=https://academy.yourdomain.com
```

### Recommended Platforms

- **Backend**: Heroku, Railway, Render, AWS EC2
- **Database**: Railway PostgreSQL, AWS RDS, Heroku Postgres
- **File Storage**: AWS S3 (replace local uploads)

## 📝 Development Notes

- Database tables are auto-created on first run (development mode)
- Use migrations for production deployments
- File uploads are stored locally in `/uploads` directory
- For production, configure AWS S3 for file storage
- Default max file size: 10MB per file, 5 files max per assignment

## 🔧 Troubleshooting

**Database connection failed:**
- Check PostgreSQL is running: `pg_isready`
- Verify credentials in `.env`
- Check database exists: `psql -l`

**Google OAuth error:**
- Verify Client ID and Secret
- Check authorized origins in Google Console
- Ensure redirect URIs match exactly

**Port already in use:**
- Change PORT in `.env`
- Kill existing process: `lsof -ti:3000 | xargs kill`

## 📄 License

MIT License - Creative Pixels

## 👥 Support

For issues or questions, contact: support@creativepixels.com
