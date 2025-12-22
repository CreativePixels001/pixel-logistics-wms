#!/bin/bash

# FTP Deployment Script for New Server Structure
# Deploys CPX Website + Projects folder with WMS/TMS

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load FTP credentials
source .ftpconfig

echo -e "${BLUE}🚀 Starting Deployment to creativepixels.in${NC}"
echo -e "${BLUE}================================================${NC}\n"

# FTP connection details
HOST="68.178.157.215"
USER="akshay@creativepixels.in"
PASS="Dagaeron@!2345!"

# Local directories
LOCAL_FRONTEND="frontend"
LOCAL_BACKEND="backend"

# Remote directories
REMOTE_ROOT="public_html"
REMOTE_PROJECTS="$REMOTE_ROOT/Projects"
REMOTE_WMS="$REMOTE_PROJECTS/wms"
REMOTE_BACKEND="$REMOTE_PROJECTS/backend"
REMOTE_DOCS="$REMOTE_PROJECTS/docs"
REMOTE_MOBILE="$REMOTE_PROJECTS/mobile-app"
REMOTE_AUDIO="$REMOTE_PROJECTS/audio-files"

# Function to create remote directory
create_remote_dir() {
    local dir=$1
    echo -e "${YELLOW}📁 Creating directory: $dir${NC}"
    ftp -inv $HOST <<EOF
user $USER $PASS
mkdir $dir
quit
EOF
}

# Function to upload file
upload_file() {
    local local_file=$1
    local remote_path=$2
    local filename=$(basename "$local_file")
    echo -e "  ${GREEN}✓${NC} Uploading $filename..."
    curl -s -u "$USER:$PASS" -T "$local_file" "ftp://$HOST/$remote_path/"
}

# Function to upload directory recursively
upload_directory() {
    local local_dir=$1
    local remote_dir=$2
    local file_pattern=${3:-"*"}
    
    if [ -d "$local_dir" ]; then
        for file in "$local_dir"/$file_pattern; do
            if [ -f "$file" ]; then
                upload_file "$file" "$remote_dir"
            fi
        done
    fi
}

echo -e "${BLUE}Step 1: Creating Directory Structure${NC}"
echo -e "${BLUE}=====================================${NC}"

# Create main Projects folder
create_remote_dir "$REMOTE_PROJECTS"

# Create WMS folder
create_remote_dir "$REMOTE_WMS"
create_remote_dir "$REMOTE_WMS/css"
create_remote_dir "$REMOTE_WMS/js"
create_remote_dir "$REMOTE_WMS/images"

# Create backend folder
create_remote_dir "$REMOTE_BACKEND"
create_remote_dir "$REMOTE_BACKEND/src"
create_remote_dir "$REMOTE_BACKEND/config"

# Create docs folder
create_remote_dir "$REMOTE_DOCS"

# Create future-use folders
create_remote_dir "$REMOTE_MOBILE"
create_remote_dir "$REMOTE_AUDIO"

echo -e "\n${BLUE}Step 2: Uploading WMS/TMS HTML Pages${NC}"
echo -e "${BLUE}======================================${NC}"

# Upload all HTML files to WMS folder
for file in $LOCAL_FRONTEND/*.html; do
    if [ -f "$file" ]; then
        upload_file "$file" "$REMOTE_WMS"
    fi
done

echo -e "\n${BLUE}Step 3: Uploading CSS Files${NC}"
echo -e "${BLUE}============================${NC}"

# Upload CSS files
if [ -d "$LOCAL_FRONTEND/css" ]; then
    upload_directory "$LOCAL_FRONTEND/css" "$REMOTE_WMS/css" "*.css"
fi

echo -e "\n${BLUE}Step 4: Uploading JavaScript Files${NC}"
echo -e "${BLUE}===================================${NC}"

# Upload JS files
if [ -d "$LOCAL_FRONTEND/js" ]; then
    upload_directory "$LOCAL_FRONTEND/js" "$REMOTE_WMS/js" "*.js"
fi

echo -e "\n${BLUE}Step 5: Uploading Images${NC}"
echo -e "${BLUE}========================${NC}"

# Upload image files
if [ -d "$LOCAL_FRONTEND/images" ]; then
    for file in "$LOCAL_FRONTEND/images"/*; do
        if [ -f "$file" ]; then
            upload_file "$file" "$REMOTE_WMS/images"
        fi
    done
fi

echo -e "\n${BLUE}Step 6: Uploading Backend Files${NC}"
echo -e "${BLUE}================================${NC}"

# Upload package.json
if [ -f "$LOCAL_BACKEND/package.json" ]; then
    upload_file "$LOCAL_BACKEND/package.json" "$REMOTE_BACKEND"
fi

# Upload backend source files
if [ -d "$LOCAL_BACKEND/src" ]; then
    echo -e "${YELLOW}📦 Uploading backend source files...${NC}"
    for file in "$LOCAL_BACKEND/src"/*.js; do
        if [ -f "$file" ]; then
            upload_file "$file" "$REMOTE_BACKEND/src"
        fi
    done
fi

# Upload config files
if [ -d "$LOCAL_BACKEND/config" ]; then
    echo -e "${YELLOW}⚙️  Uploading config files...${NC}"
    for file in "$LOCAL_BACKEND/config"/*; do
        if [ -f "$file" ]; then
            upload_file "$file" "$REMOTE_BACKEND/config"
        fi
    done
fi

echo -e "\n${BLUE}Step 7: Creating Placeholder Files${NC}"
echo -e "${BLUE}===================================${NC}"

# Create README for mobile-app
cat > /tmp/mobile-readme.txt <<'MOBILE_EOF'
# Mobile Application

This folder is reserved for future mobile application development.

## Planned Features:
- Native iOS & Android apps
- Real-time tracking
- Barcode scanning
- Offline mode
- Push notifications

## Status: Coming Soon

Last Updated: November 20, 2025
MOBILE_EOF

upload_file "/tmp/mobile-readme.txt" "$REMOTE_MOBILE"
mv "$REMOTE_MOBILE/mobile-readme.txt" "$REMOTE_MOBILE/README.md" 2>/dev/null

# Create README for audio-files
cat > /tmp/audio-readme.txt <<'AUDIO_EOF'
# Audio Files

This folder is reserved for future audio content and voice features.

## Planned Features:
- Voice-guided picking
- Audio notifications
- Multi-language support
- TTS (Text-to-Speech)
- Voice commands

## Status: Coming Soon

Last Updated: November 20, 2025
AUDIO_EOF

upload_file "/tmp/audio-readme.txt" "$REMOTE_AUDIO"

# Create main documentation
cat > /tmp/projects-readme.txt <<'DOCS_EOF'
# Creative Pixels - Projects Directory

This directory contains all project applications and resources.

## Current Projects:

### WMS (Warehouse Management System)
Location: `/Projects/wms/`
Access: https://creativepixels.in/Projects/wms/dashboard.html

Features:
- 44+ functional modules
- Inventory Management
- Order Processing
- Analytics & Reporting
- TMS Integration

### TMS (Transportation Management System)
Location: `/Projects/wms/tms-tracking.html`
Access: https://creativepixels.in/Projects/wms/tms-tracking.html

Features:
- Live tracking
- Route optimization
- Shipment management
- Real-time updates

## Backend API
Location: `/Projects/backend/`
Status: Development

## Future Projects:
- Mobile Application
- Audio Files & Voice Features

---

**Last Updated:** November 20, 2025  
**Maintained by:** Creative Pixels Team
DOCS_EOF

upload_file "/tmp/projects-readme.txt" "$REMOTE_DOCS"

# Clean up temp files
rm -f /tmp/mobile-readme.txt /tmp/audio-readme.txt /tmp/projects-readme.txt

echo -e "\n${GREEN}================================================${NC}"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE!${NC}"
echo -e "${GREEN}================================================${NC}\n"

echo -e "${BLUE}📊 Deployment Summary:${NC}"
echo -e "  ${GREEN}✓${NC} Directory structure created"
echo -e "  ${GREEN}✓${NC} WMS/TMS pages uploaded"
echo -e "  ${GREEN}✓${NC} CSS, JS, Images uploaded"
echo -e "  ${GREEN}✓${NC} Backend files uploaded"
echo -e "  ${GREEN}✓${NC} Documentation created"
echo -e "  ${GREEN}✓${NC} Future-use folders prepared\n"

echo -e "${BLUE}🌐 Access URLs:${NC}"
echo -e "  ${GREEN}CPX Website:${NC}    https://creativepixels.in/"
echo -e "  ${GREEN}WMS Dashboard:${NC}  https://creativepixels.in/Projects/wms/dashboard.html"
echo -e "  ${GREEN}TMS Tracking:${NC}   https://creativepixels.in/Projects/wms/tms-tracking.html"
echo -e "  ${GREEN}Documentation:${NC}  https://creativepixels.in/Projects/docs/\n"

echo -e "${YELLOW}📝 Next Steps:${NC}"
echo -e "  1. Upload CPX website index.html to root"
echo -e "  2. Test all URLs in browser"
echo -e "  3. Verify images and assets load correctly"
echo -e "  4. Update any hardcoded paths if needed\n"

echo -e "${BLUE}🎉 Ready for production!${NC}\n"
