#!/bin/bash

# ===========================================
# Deploy Backend to AWS EC2
# Run this script from your LOCAL machine
# ===========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Pixel Academy - AWS Deployment Script${NC}"
echo ""

# ===========================================
# Configuration (UPDATE THESE)
# ===========================================
EC2_HOST="your-ec2-public-ip"  # e.g., 13.127.45.67
EC2_USER="ubuntu"
KEY_FILE="~/.ssh/pixel-academy-key.pem"  # Path to your EC2 key
APP_DIR="/var/www/pixel-academy-backend"
LOCAL_DIR="$(pwd)"

echo -e "${YELLOW}📋 Configuration:${NC}"
echo "  EC2 Host: $EC2_HOST"
echo "  EC2 User: $EC2_USER"
echo "  Key File: $KEY_FILE"
echo "  App Directory: $APP_DIR"
echo ""

# ===========================================
# Check prerequisites
# ===========================================
echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"

if [ ! -f "$KEY_FILE" ]; then
    echo -e "${RED}❌ EC2 key file not found: $KEY_FILE${NC}"
    echo "Download your .pem file from AWS and update KEY_FILE in this script"
    exit 1
fi

chmod 400 "$KEY_FILE"
echo -e "${GREEN}✓ EC2 key file found${NC}"

# Check SSH connection
echo -e "${YELLOW}🔗 Testing SSH connection...${NC}"
if ssh -i "$KEY_FILE" -o ConnectTimeout=5 "$EC2_USER@$EC2_HOST" "echo 'SSH OK'" 2>/dev/null; then
    echo -e "${GREEN}✓ SSH connection successful${NC}"
else
    echo -e "${RED}❌ Cannot connect to EC2 instance${NC}"
    echo "Check: EC2_HOST, KEY_FILE, and security group (port 22 open)"
    exit 1
fi

# ===========================================
# 1. Create directory on EC2
# ===========================================
echo ""
echo -e "${YELLOW}📁 Creating application directory...${NC}"
ssh -i "$KEY_FILE" "$EC2_USER@$EC2_HOST" "sudo mkdir -p $APP_DIR && sudo chown -R ubuntu:ubuntu $APP_DIR"
echo -e "${GREEN}✓ Directory created${NC}"

# ===========================================
# 2. Upload backend files
# ===========================================
echo ""
echo -e "${YELLOW}📤 Uploading backend files...${NC}"

# Create temporary archive
cd "$LOCAL_DIR/backend"
echo "  Creating archive..."
tar -czf ../backend-deploy.tar.gz \
    --exclude='node_modules' \
    --exclude='.env' \
    --exclude='*.log' \
    --exclude='uploads/*' \
    .

cd ..

# Upload archive
echo "  Uploading..."
scp -i "$KEY_FILE" backend-deploy.tar.gz "$EC2_USER@$EC2_HOST:$APP_DIR/"

# Extract on server
echo "  Extracting..."
ssh -i "$KEY_FILE" "$EC2_USER@$EC2_HOST" "cd $APP_DIR && tar -xzf backend-deploy.tar.gz && rm backend-deploy.tar.gz"

# Clean up local archive
rm backend-deploy.tar.gz

echo -e "${GREEN}✓ Files uploaded${NC}"

# ===========================================
# 3. Upload .env file (if exists)
# ===========================================
echo ""
echo -e "${YELLOW}📝 Checking for .env file...${NC}"

if [ -f "backend/.env.production" ]; then
    echo "  Uploading production .env..."
    scp -i "$KEY_FILE" backend/.env.production "$EC2_USER@$EC2_HOST:$APP_DIR/.env"
    echo -e "${GREEN}✓ Production .env uploaded${NC}"
else
    echo -e "${YELLOW}⚠ No .env.production found - you'll need to create .env manually${NC}"
fi

# ===========================================
# 4. Install dependencies
# ===========================================
echo ""
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
ssh -i "$KEY_FILE" "$EC2_USER@$EC2_HOST" << 'EOF'
cd /var/www/pixel-academy-backend
echo "  Running npm install..."
npm install --production
echo "✓ Dependencies installed"
EOF

# ===========================================
# 5. Create uploads directory
# ===========================================
echo ""
echo -e "${YELLOW}📁 Creating uploads directory...${NC}"
ssh -i "$KEY_FILE" "$EC2_USER@$EC2_HOST" << 'EOF'
cd /var/www/pixel-academy-backend
mkdir -p uploads/assignments uploads/profile-photos uploads/temp
chmod 755 uploads
echo "✓ Uploads directory created"
EOF

# ===========================================
# 6. Run database migrations/seed
# ===========================================
echo ""
echo -e "${YELLOW}🗄️  Setting up database...${NC}"
read -p "Run database seed? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ssh -i "$KEY_FILE" "$EC2_USER@$EC2_HOST" << 'EOF'
cd /var/www/pixel-academy-backend
npm run seed
echo "✓ Database seeded"
EOF
    echo -e "${GREEN}✓ Database setup complete${NC}"
else
    echo -e "${YELLOW}⚠ Skipped database seed${NC}"
fi

# ===========================================
# 7. Start/Restart with PM2
# ===========================================
echo ""
echo -e "${YELLOW}🚀 Starting application with PM2...${NC}"
ssh -i "$KEY_FILE" "$EC2_USER@$EC2_HOST" << 'EOF'
cd /var/www/pixel-academy-backend

# Stop existing process if running
pm2 delete pixel-academy-backend 2>/dev/null || true

# Start new process
pm2 start server.js --name pixel-academy-backend --env production

# Save PM2 configuration
pm2 save

# Show status
pm2 status

echo "✓ Application started"
EOF

# ===========================================
# 8. Test the deployment
# ===========================================
echo ""
echo -e "${YELLOW}🧪 Testing deployment...${NC}"

# Wait for server to start
sleep 3

# Test health endpoint
ssh -i "$KEY_FILE" "$EC2_USER@$EC2_HOST" "curl -s http://localhost:8080/health" > /tmp/health-check.json

if grep -q "ok" /tmp/health-check.json; then
    echo -e "${GREEN}✓ Health check passed!${NC}"
    cat /tmp/health-check.json | python3 -m json.tool
else
    echo -e "${RED}❌ Health check failed${NC}"
    echo "Check logs: ssh -i $KEY_FILE $EC2_USER@$EC2_HOST 'pm2 logs pixel-academy-backend'"
fi

rm /tmp/health-check.json

# ===========================================
# Summary
# ===========================================
echo ""
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📊 Deployment Summary:${NC}"
echo "  ✓ Files uploaded to EC2"
echo "  ✓ Dependencies installed"
echo "  ✓ Database configured"
echo "  ✓ Application running via PM2"
echo ""
echo -e "${YELLOW}🔗 Access URLs:${NC}"
echo "  Internal: http://localhost:8080/health"
echo "  External: http://$EC2_HOST:8080/health (if port open)"
echo "  After Nginx: http://$EC2_HOST/health"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "  1. Configure Nginx reverse proxy"
echo "  2. Set up SSL certificate"
echo "  3. Update frontend API URLs"
echo "  4. Test login flow"
echo ""
echo -e "${YELLOW}🔧 Useful Commands:${NC}"
echo "  View logs:    ssh -i $KEY_FILE $EC2_USER@$EC2_HOST 'pm2 logs pixel-academy-backend'"
echo "  Restart app:  ssh -i $KEY_FILE $EC2_USER@$EC2_HOST 'pm2 restart pixel-academy-backend'"
echo "  Stop app:     ssh -i $KEY_FILE $EC2_USER@$EC2_HOST 'pm2 stop pixel-academy-backend'"
echo "  Check status: ssh -i $KEY_FILE $EC2_USER@$EC2_HOST 'pm2 status'"
echo ""
echo -e "${GREEN}✨ Happy deploying!${NC}"
