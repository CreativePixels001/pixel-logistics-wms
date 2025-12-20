#!/bin/bash

# ===========================================
# AWS EC2 Server Setup Script
# Run this on your EC2 instance after first login
# ===========================================

set -e  # Exit on error

echo "🚀 Starting Pixel Academy Backend Setup on AWS EC2..."

# ===========================================
# 1. Update System
# ===========================================
echo "📦 Updating system packages..."
sudo apt update
sudo apt upgrade -y

# ===========================================
# 2. Install Node.js 18.x
# ===========================================
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version

# ===========================================
# 3. Install PostgreSQL Client (for local testing)
# ===========================================
echo "📦 Installing PostgreSQL client..."
sudo apt install -y postgresql-client

# ===========================================
# 4. Install PM2 (Process Manager)
# ===========================================
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Configure PM2 to start on boot
pm2 startup systemd -u ubuntu --hp /home/ubuntu
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu

# ===========================================
# 5. Install Nginx (Reverse Proxy)
# ===========================================
echo "📦 Installing Nginx..."
sudo apt install -y nginx

# ===========================================
# 6. Install Certbot (for SSL)
# ===========================================
echo "📦 Installing Certbot for SSL..."
sudo apt install -y certbot python3-certbot-nginx

# ===========================================
# 7. Create Application Directory
# ===========================================
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/pixel-academy-backend
sudo chown -R ubuntu:ubuntu /var/www/pixel-academy-backend
cd /var/www/pixel-academy-backend

# ===========================================
# 8. Install Git
# ===========================================
echo "📦 Installing Git..."
sudo apt install -y git

# ===========================================
# 9. Set up Firewall
# ===========================================
echo "🔥 Configuring firewall..."
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw allow 8080/tcp   # API (temporary, will use Nginx proxy)
sudo ufw --force enable

# ===========================================
# 10. Create .env file template
# ===========================================
echo "📝 Creating .env template..."
cat > /var/www/pixel-academy-backend/.env.template << 'EOF'
NODE_ENV=production
PORT=8080

# Database (replace with your RDS endpoint)
DB_HOST=your-rds-endpoint.ap-south-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=pixel_academy_prod
DB_USER=postgres
DB_PASSWORD=YOUR_DB_PASSWORD

# JWT (generate new secret)
JWT_SECRET=GENERATE_NEW_SECRET_64_CHARS
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Frontend URL
FRONTEND_URL=https://your-domain.com

# Admin
ADMIN_EMAILS=admin@creativepixels.in
EOF

echo "✅ EC2 setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Upload your backend code to /var/www/pixel-academy-backend"
echo "2. Copy .env.template to .env and fill in values"
echo "3. Run: npm install"
echo "4. Run: npm run seed"
echo "5. Start with PM2: pm2 start server.js --name pixel-academy-backend"
echo "6. Configure Nginx reverse proxy"
echo "7. Set up SSL with Certbot"
echo ""
echo "🎉 Your server is ready!"
