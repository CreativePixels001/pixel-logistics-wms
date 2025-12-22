# MongoDB Setup Guide

## Option 1: MongoDB Atlas (Cloud - Recommended for Development)

### Quick Setup (5 minutes):

1. **Create Free Account**
   - Go to: https://www.mongodb.com/cloud/atlas/register
   - Sign up with email or Google

2. **Create Free Cluster**
   - Choose "Shared" (Free tier)
   - Select AWS or Google Cloud
   - Choose region closest to you
   - Cluster Name: "PixelLogistics"
   - Click "Create Cluster"

3. **Create Database User**
   - Click "Database Access" (left sidebar)
   - Click "Add New Database User"
   - Username: `admin`
   - Password: `PixelLogistics2024!` (or generate one)
   - Database User Privileges: "Atlas Admin"
   - Click "Add User"

4. **Allow Network Access**
   - Click "Network Access" (left sidebar)
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Or add your IP: 0.0.0.0/0
   - Click "Confirm"

5. **Get Connection String**
   - Click "Database" (left sidebar)
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Select Driver: Node.js, Version: 5.5 or later
   - Copy connection string
   - Should look like: `mongodb+srv://admin:<password>@pixellogistics.xxxxx.mongodb.net/?retryWrites=true&w=majority`

6. **Update .env File**
   ```bash
   MONGODB_URI=mongodb+srv://admin:PixelLogistics2024!@pixellogistics.xxxxx.mongodb.net/pixel-logistics?retryWrites=true&w=majority
   ```
   Replace `<password>` with your actual password
   Replace `xxxxx` with your cluster ID

7. **Run Seed Script**
   ```bash
   cd backend
   npm run seed:tms
   ```

---

## Option 2: Install MongoDB Locally (macOS)

### 1. Install Homebrew (if not installed)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Install MongoDB
```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
```

### 3. Start MongoDB
```bash
brew services start mongodb-community@7.0
```

### 4. Verify MongoDB is Running
```bash
mongosh
```

### 5. Update .env File
```bash
MONGODB_URI=mongodb://localhost:27017/pixel-logistics
```

### 6. Run Seed Script
```bash
cd backend
npm run seed:tms
```

---

## Option 3: Use Docker (Easiest)

### 1. Install Docker Desktop
Download from: https://www.docker.com/products/docker-desktop

### 2. Run MongoDB Container
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 3. Update .env File
```bash
MONGODB_URI=mongodb://localhost:27017/pixel-logistics
```

### 4. Run Seed Script
```bash
cd backend
npm run seed:tms
```

---

## Quick Start (Recommended)

**Use MongoDB Atlas** - it's free, fast to setup, and doesn't require any installation:

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create free cluster (takes 3-5 minutes)
3. Get connection string
4. Update backend/.env:
   ```
   MONGODB_URI=your_connection_string_here
   ```
5. Run: `npm run seed:tms`

---

## Verify Database is Seeded

After running the seed script, you should see:
```
🌱 Starting database seed...
✅ Connected to MongoDB
🗑️  Clearing existing data...
✅ Existing data cleared
📦 Creating carriers...
✅ Created 5 carriers
🚛 Creating shipments...
✅ Created 50 shipments
🗺️  Creating routes...
✅ Created 10 routes
==================================================
📊 SEED SUMMARY
==================================================
Carriers:  5
Shipments: 50
Routes:    10
==================================================
✨ Database seeded successfully!
```

---

## Troubleshooting

### Connection Refused Error
- **MongoDB Atlas**: Check IP whitelist allows your IP
- **Local MongoDB**: Run `brew services start mongodb-community@7.0`
- **Docker**: Run `docker ps` to verify container is running

### Authentication Failed
- Verify username/password in connection string
- Check database user privileges in Atlas

### Network Timeout
- Check firewall settings
- Verify internet connection
- Try different cluster region in Atlas

---

## Next Steps

Once MongoDB is connected:
1. ✅ Run seed script: `npm run seed:tms`
2. ✅ Start backend: `npm start`
3. ✅ Test API: `http://localhost:5000/api/tms/dashboard/stats`
4. ✅ Open dashboard: `http://68.178.157.215/Projects/WMS/tms-dashboard.html`

---

Last Updated: November 20, 2025
