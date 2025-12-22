# Pixel Logistics WMS - Backend Quick Start Guide

## 🚀 What We've Built

A production-ready Node.js/Express backend API with:
- ✅ JWT Authentication & Authorization
- ✅ PostgreSQL Database with Sequelize ORM
- ✅ User Management with Role-Based Access
- ✅ Inventory Management System
- ✅ Security Features (Helmet, CORS, Rate Limiting)
- ✅ Winston Logging with File Rotation
- ✅ Input Validation with Express-Validator
- ✅ Comprehensive Error Handling

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js       # Sequelize PostgreSQL connection
│   │   ├── config.js         # Application configuration
│   │   └── logger.js         # Winston logger setup
│   ├── controllers/
│   │   ├── auth.controller.js       # Authentication logic
│   │   └── inventory.controller.js  # Inventory management
│   ├── middleware/
│   │   ├── auth.middleware.js       # JWT verification
│   │   ├── error.middleware.js      # Error handling
│   │   └── validator.middleware.js  # Input validation
│   ├── models/
│   │   ├── User.js          # User model with auth features
│   │   └── Inventory.js     # Inventory model
│   ├── routes/
│   │   ├── auth.routes.js       # Auth endpoints
│   │   └── inventory.routes.js  # Inventory endpoints
│   └── server.js            # Express app entry point
├── setup.js                 # Database setup script
├── package.json            # Dependencies
├── .env                    # Environment variables
└── .gitignore             # Git ignore rules
```

## 🛠️ Setup Instructions

### Step 1: Install PostgreSQL

**macOS (using Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Create Database:**
```bash
createdb pixel_wms
```

### Step 2: Configure Environment

The `.env` file is already created. Update these values:

```env
DB_PASSWORD=your_postgres_password
JWT_SECRET=change-this-to-random-32-char-string
JWT_REFRESH_SECRET=change-this-to-different-random-32-char-string
```

**Generate secure secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Run Database Setup

This will create tables and sample data:

```bash
node setup.js
```

**Default Admin Account Created:**
- Email: `admin@pixellogistics.com`
- Password: `Admin@123`
- ⚠️ **CHANGE THIS PASSWORD IMMEDIATELY AFTER FIRST LOGIN!**

### Step 4: Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will run on: `http://localhost:5000`

## 🔐 Testing the API

### 1. Login to Get Token

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@pixellogistics.com",
    "password": "Admin@123"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@pixellogistics.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Copy the `token` value for next requests.**

### 2. Get All Inventory

```bash
curl -X GET http://localhost:5000/api/v1/inventory \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Get Inventory Stats

```bash
curl -X GET http://localhost:5000/api/v1/inventory/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Create New Inventory Item

```bash
curl -X POST http://localhost:5000/api/v1/inventory \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "itemCode": "SKU-004",
    "itemName": "Wireless Mouse",
    "description": "Ergonomic wireless mouse",
    "category": "Electronics",
    "uom": "EA",
    "quantity": 200,
    "reorderLevel": 50,
    "unitPrice": 29.99,
    "location": "A-02"
  }'
```

## 📡 Available API Endpoints

### Authentication (`/api/v1/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | Login user | Public |
| GET | `/me` | Get current user | Private |
| POST | `/refresh` | Refresh token | Public |
| POST | `/logout` | Logout user | Private |
| PUT | `/update-password` | Change password | Private |

### Inventory (`/api/v1/inventory`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all items (paginated) | Private |
| GET | `/:id` | Get single item | Private |
| POST | `/` | Create item | Admin, Manager |
| PUT | `/:id` | Update item | Admin, Manager |
| DELETE | `/:id` | Delete item | Admin |
| POST | `/:id/adjust` | Adjust quantity | Admin, Manager, Supervisor |
| GET | `/stats` | Get statistics | Private |
| GET | `/reports/low-stock` | Low stock items | Private |
| GET | `/reports/expired` | Expired items | Private |

## 👥 User Roles

- **admin** - Full access to everything
- **manager** - Can manage inventory, orders, users (limited)
- **supervisor** - Can adjust inventory, view reports
- **operator** - Can create orders, update shipments
- **viewer** - Read-only access

## 🔍 Query Parameters (Inventory List)

```
GET /api/v1/inventory?page=1&limit=20&search=laptop&category=Electronics&status=available&lowStock=true&sortBy=itemName&sortOrder=ASC
```

Parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `search` - Search in itemCode, itemName, SKU, barcode
- `category` - Filter by category
- `status` - Filter by status (available, reserved, allocated, on_hold, damaged, expired)
- `location` - Filter by location
- `zone` - Filter by warehouse zone
- `lowStock` - Show only low stock items (true/false)
- `expired` - Show only expired items (true/false)
- `sortBy` - Sort field (default: itemName)
- `sortOrder` - ASC or DESC (default: ASC)

## 🛡️ Security Features

1. **JWT Authentication** - Secure token-based auth
2. **Password Hashing** - bcrypt with 10 rounds
3. **Account Locking** - Locks after 5 failed login attempts for 30 minutes
4. **Role-Based Access** - Granular permissions
5. **Rate Limiting** - 100 requests per 15 minutes
6. **Helmet** - Security headers
7. **CORS** - Configured allowed origins
8. **Input Validation** - Express-validator on all inputs

## 📊 Database Schema

### Users Table
- UUID primary key
- Email (unique)
- Password (bcrypt hashed)
- Role (admin, manager, supervisor, operator, viewer)
- Login attempts tracking
- Account lock mechanism
- Password reset tokens

### Inventory Table
- UUID primary key
- Item code (unique)
- SKU, Barcode (unique, optional)
- Quantity tracking (total, available, allocated, reserved)
- Location details (zone, aisle, rack, shelf, bin)
- Reorder levels
- Pricing information
- Batch/Lot/Serial numbers
- Expiry dates
- Custom fields (JSON)

## 🚨 Error Handling

All errors return consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

Common error codes:
- `VALIDATION_ERROR` (400)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `DUPLICATE_ENTRY` (400)
- `ACCOUNT_LOCKED` (423)

## 📝 Logging

Logs are saved in `logs/` directory:
- `combined.log` - All logs
- `error.log` - Error logs only

Format: JSON with timestamps

## 🔄 Next Steps

1. ✅ **Authentication & Inventory** - COMPLETE
2. ⏳ **Orders Management** - Create Order model and endpoints
3. ⏳ **Shipping & Receiving** - Inbound/outbound operations
4. ⏳ **Yard Management** - Trailer tracking
5. ⏳ **WebSocket Integration** - Real-time updates with Socket.io
6. ⏳ **Frontend Integration** - Connect to your 56 HTML pages
7. ⏳ **Deployment** - Deploy to 68.178.157.215

## 🆘 Troubleshooting

### Database Connection Failed
```bash
# Check if PostgreSQL is running
brew services list

# Start PostgreSQL
brew services start postgresql@15

# Check database exists
psql -l
```

### Port Already in Use
```bash
# Change PORT in .env file
PORT=5001
```

### Permission Denied
```bash
# Check file permissions
chmod +x setup.js
```

## 📚 Resources

- [Express.js Documentation](https://expressjs.com/)
- [Sequelize ORM](https://sequelize.org/)
- [JWT.io](https://jwt.io/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

**Created by:** GitHub Copilot  
**Date:** 2024  
**Version:** 1.0.0
