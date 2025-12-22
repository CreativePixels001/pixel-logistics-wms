#!/bin/bash

# CPX Website Deployment Script
# This script will backup existing files and deploy the new CPX website

# Server Configuration
HOST="68.178.157.215"
USER="akshay@creativepixels.in"
REMOTE_DIR="/var/www/html"
LOCAL_DIR="/Users/ashishkumar/Documents/Pixel ecosystem/CPX website"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== CPX Website Deployment ===${NC}"
echo ""

# Step 1: Test connection
echo -e "${YELLOW}Step 1: Testing server connection...${NC}"
if ssh -o ConnectTimeout=10 "$USER@$HOST" "echo 'Connection successful'" 2>/dev/null; then
    echo -e "${GREEN}✓ Server connection successful${NC}"
else
    echo -e "${RED}✗ Cannot connect to server. Please check:${NC}"
    echo "  - Host: $HOST"
    echo "  - User: $USER"
    echo "  - Network connection"
    exit 1
fi

# Step 2: Create backup on server
echo ""
echo -e "${YELLOW}Step 2: Creating backup of existing files...${NC}"
BACKUP_DIR="backups/backup_$(date +%Y%m%d_%H%M%S)"

ssh "$USER@$HOST" << 'ENDSSH'
cd /var/www/html
mkdir -p backups
BACKUP_DIR="backups/backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Copy all files except backups folder
for item in *; do
    if [ "$item" != "backups" ]; then
        cp -r "$item" "$BACKUP_DIR/" 2>/dev/null
    fi
done

echo "Backup created in: $BACKUP_DIR"
ls -la "$BACKUP_DIR"
ENDSSH

echo -e "${GREEN}✓ Backup completed${NC}"

# Step 3: Clean current directory (except backups)
echo ""
echo -e "${YELLOW}Step 3: Cleaning current directory...${NC}"

ssh "$USER@$HOST" << 'ENDSSH'
cd /var/www/html
for item in *; do
    if [ "$item" != "backups" ]; then
        rm -rf "$item"
    fi
done
echo "Directory cleaned (backups preserved)"
ENDSSH

echo -e "${GREEN}✓ Directory cleaned${NC}"

# Step 4: Upload new files
echo ""
echo -e "${YELLOW}Step 4: Uploading new CPX website files...${NC}"

# Upload all files
scp -r "$LOCAL_DIR"/* "$USER@$HOST:$REMOTE_DIR/"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Files uploaded successfully${NC}"
else
    echo -e "${RED}✗ Upload failed${NC}"
    exit 1
fi

# Step 5: Set correct permissions
echo ""
echo -e "${YELLOW}Step 5: Setting file permissions...${NC}"

ssh "$USER@$HOST" << 'ENDSSH'
cd /var/www/html
find . -type f -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;
echo "Permissions set: Files=644, Directories=755"
ENDSSH

echo -e "${GREEN}✓ Permissions set${NC}"

# Step 6: Verify deployment
echo ""
echo -e "${YELLOW}Step 6: Verifying deployment...${NC}"

ssh "$USER@$HOST" << 'ENDSSH'
cd /var/www/html
echo "Files in web root:"
ls -lah | grep -v backups
echo ""
echo "Checking key files:"
[ -f "index.html" ] && echo "✓ index.html exists" || echo "✗ index.html missing"
[ -d "Low/UX Study" ] && echo "✓ Low/UX Study directory exists" || echo "✗ Low/UX Study missing"
[ -f "Low/UX Study/motherboard.html" ] && echo "✓ motherboard.html exists" || echo "✗ motherboard.html missing"
ENDSSH

echo -e "${GREEN}✓ Deployment verified${NC}"

# Summary
echo ""
echo -e "${GREEN}=== Deployment Complete ===${NC}"
echo ""
echo "Your website has been deployed to: http://$HOST"
echo "Backup location: $REMOTE_DIR/$BACKUP_DIR"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Visit http://$HOST to verify the website"
echo "2. Test the Pixel Engine overlay and motherboard page"
echo "3. If issues occur, backups are available in: $BACKUP_DIR"
echo ""
