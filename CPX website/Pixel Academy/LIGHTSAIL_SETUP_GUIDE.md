# 🚀 AWS Lightsail Setup - Step by Step

## Your Configuration:
- **Service:** AWS Lightsail
- **Plan:** $5/month (512MB RAM, 20GB SSD, 1TB transfer)
- **Region:** ap-south-1 (Mumbai)
- **Domain:** academy.creativepixels.in
- **Cost:** Fixed $5/month (no surprises!)

---

## Step 1: Go to Lightsail

1. In AWS Console search bar (top), type: **Lightsail**
2. Click on **Amazon Lightsail**
3. You'll be taken to the Lightsail home page

---

## Step 2: Create Instance

1. Click **"Create instance"** (orange button)

2. **Select Location:**
   - Region: **Asia Pacific (Mumbai)** 
   - Availability Zone: **ap-south-1a** (default is fine)

3. **Pick Instance Image:**
   - Select: **Linux/Unix**
   - Select blueprint: **OS Only**
   - Choose: **Ubuntu 22.04 LTS**

4. **Add Launch Script (IMPORTANT!):**
   Click "+ Add launch script" and paste this:

```bash
#!/bin/bash
# Update system
apt-get update && apt-get upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install PostgreSQL client
apt-get install -y postgresql-client

# Install PM2 globally
npm install -g pm2

# Create app directory
mkdir -p /var/www/pixel-academy-backend
chown -R ubuntu:ubuntu /var/www/pixel-academy-backend

# Install Git
apt-get install -y git curl

echo "Setup complete!"
```

5. **Choose Your Instance Plan:**
   - Select: **$5 USD** plan (first option)
   - Specs: 512 MB RAM, 1 vCPU, 20 GB SSD, 1 TB transfer

6. **Identify Your Instance:**
   - Name: `pixel-academy-backend`

7. **Click "Create instance"**

**Wait 2-3 minutes** for instance to be ready (status will show "Running")

---

## Step 3: Create Database

1. In Lightsail, click **"Databases"** tab (top menu)
2. Click **"Create database"**

3. **Database Location:**
   - Region: **Asia Pacific (Mumbai)** - same as instance

4. **Choose Database Engine:**
   - Select: **PostgreSQL**
   - Version: Latest (probably PostgreSQL 12 or 13)

5. **Choose Database Plan:**
   - Select: **$15 USD/month** (smallest plan)
   - Specs: 1 GB RAM, 1 vCPU, 40 GB SSD

   ⚠️ **Total Cost: $5 (instance) + $15 (database) = $20/month**
   
   **Alternative:** Use free PostgreSQL from ElephantSQL or Supabase to save $15/month

6. **Identify Your Database:**
   - Name: `pixel-academy-db`

7. **Create Master User:**
   - Master username: `postgres` (default is fine)
   - Master password: **Create strong password** (save this!)

8. Click **"Create database"**

**Wait 5-10 minutes** for database to be ready

---

## Step 4: Get Connection Info

### Instance IP Address:
1. Go to **Instances** tab
2. Click on `pixel-academy-backend`
3. Note the **Public IP address** (e.g., 13.127.45.123)

### Database Connection:
1. Go to **Databases** tab
2. Click on `pixel-academy-db`
3. Go to **"Connect"** tab
4. Copy the **Endpoint** (e.g., ls-xxxx.czowadgeezqi.ap-south-1.rds.amazonaws.com)
5. Copy the **Port** (usually 5432)

---

## Step 5: Configure Networking

### Open Ports on Instance:
1. Go to instance `pixel-academy-backend`
2. Click **"Networking"** tab
3. Under **"Firewall"**, click **"Add rule"**
4. Add these rules:
   - Application: **Custom**, Protocol: **TCP**, Port: **8080**
   - Application: **HTTPS**, Protocol: **TCP**, Port: **443**

### Connect Database to Instance:
1. Go to database `pixel-academy-db`
2. Go to **"Networking"** tab
3. Under **"Public mode"**, enable it (or setup VPC peering)

---

## Step 6: Connect via SSH

1. Go to instance `pixel-academy-backend`
2. Click **"Connect using SSH"** (easy way)
   OR
3. Download SSH key and connect from terminal:
   ```bash
   ssh -i LightsailDefaultKey-ap-south-1.pem ubuntu@YOUR_IP_ADDRESS
   ```

---

## ✅ After Setup Complete, Give Me:

```yaml
Instance_Public_IP: "13.127.45.123"  # Your actual IP
Database_Endpoint: "ls-xxxx.czowadgeezqi.ap-south-1.rds.amazonaws.com"
Database_Port: "5432"
Database_Password: "your-strong-password"
```

---

## 💰 Cost Breakdown:

**Option 1: With Lightsail Database**
- Instance: $5/month
- Database: $15/month
- **Total: $20/month**

**Option 2: With External Free Database** ⭐ RECOMMENDED to save money
- Instance: $5/month
- Database: FREE (use Supabase or ElephantSQL)
- **Total: $5/month**

**Which do you prefer?**

---

## 🎯 Next Steps (After You Create):

1. ✅ Create Lightsail instance
2. ✅ Choose database option (Lightsail $15/month OR Free external)
3. ✅ Get IP address and connection info
4. ✅ I'll SSH in and deploy the backend
5. ✅ Set up domain: academy.creativepixels.in
6. ✅ Configure Google OAuth
7. ✅ Upload frontend to FTP
8. ✅ GO LIVE! 🚀

---

**Start creating the instance now! Let me know when it's ready or if you need help with any step.**
