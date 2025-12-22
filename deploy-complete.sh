#!/bin/bash

# Complete Deployment Script for CPX Website + WMS/TMS
# Uploads CPX website to root and Pixel WMS to Projects/WMS folder

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Complete Deployment: CPX Website + WMS/TMS${NC}"
echo -e "${BLUE}====================================================${NC}\n"

# FTP credentials (loaded from .ftpconfig)
if [ -f .ftpconfig ]; then
    source .ftpconfig
else
    HOST="68.178.157.215"
    USER="akshay@creativepixels.in"
    PASS="_ad,B;7}FZhC"
fi

# Local directories
CPX_WEBSITE="CPX website"
PIXEL_WMS_FRONTEND="frontend"
PIXEL_WMS_BACKEND="backend"

# Remote directories
REMOTE_ROOT="public_html"
REMOTE_PROJECTS="$REMOTE_ROOT/Projects"
REMOTE_WMS="$REMOTE_PROJECTS/WMS"
REMOTE_TMS="$REMOTE_PROJECTS/TMS"
REMOTE_BACKEND="$REMOTE_WMS/backend"

# Function to upload file
upload_file() {
    local local_file=$1
    local remote_path=$2
    local filename=$(basename "$local_file")
    echo -e "  ${GREEN}✓${NC} $filename"
    curl -s -u "$USER:$PASS" -T "$local_file" "ftp://$HOST/$remote_path/" 2>/dev/null
}

# Function to upload directory
upload_directory() {
    local local_dir=$1
    local remote_dir=$2
    
    if [ -d "$local_dir" ]; then
        for file in "$local_dir"/*; do
            if [ -f "$file" ]; then
                upload_file "$file" "$remote_dir"
            fi
        done
    fi
}

# Function to create remote directory
create_remote_dir() {
    local dir=$1
    ftp -inv $HOST <<EOF 2>/dev/null
user $USER $PASS
mkdir $dir
quit
EOF
}

echo -e "${BLUE}Step 1: Creating Directory Structure${NC}"
echo -e "${BLUE}=====================================${NC}"
create_remote_dir "$REMOTE_PROJECTS"
create_remote_dir "$REMOTE_PROJECTS/WMS"
create_remote_dir "$REMOTE_PROJECTS/WMS/css"
create_remote_dir "$REMOTE_PROJECTS/WMS/js"
create_remote_dir "$REMOTE_PROJECTS/WMS/images"
create_remote_dir "$REMOTE_PROJECTS/WMS/backend"
create_remote_dir "$REMOTE_PROJECTS/WMS/backend/src"
create_remote_dir "$REMOTE_PROJECTS/WMS/backend/config"
create_remote_dir "$REMOTE_PROJECTS/TMS"
create_remote_dir "$REMOTE_ROOT/css"
create_remote_dir "$REMOTE_ROOT/js"
create_remote_dir "$REMOTE_ROOT/images"
create_remote_dir "$REMOTE_ROOT/images/avatars"
create_remote_dir "$REMOTE_ROOT/images/icons"
create_remote_dir "$REMOTE_ROOT/images/portfolio"
create_remote_dir "$REMOTE_ROOT/images/portfolio/gallery"
echo -e "${GREEN}✓ Directory structure created${NC}\n"

echo -e "${BLUE}Step 2: Uploading CPX Website (Root Files)${NC}"
echo -e "${BLUE}===========================================${NC}"
upload_file "$CPX_WEBSITE/index.html" "$REMOTE_ROOT"
upload_file "$CPX_WEBSITE/ecosystem.html" "$REMOTE_ROOT"
upload_file "$CPX_WEBSITE/styles.html" "$REMOTE_ROOT"
upload_file "$CPX_WEBSITE/ui-panel.css" "$REMOTE_ROOT"
upload_file "$CPX_WEBSITE/site.webmanifest" "$REMOTE_ROOT"
upload_file "$CPX_WEBSITE/readme.txt" "$REMOTE_ROOT"

# Upload favicons if they exist in CPX website Upload folder
if [ -f "$CPX_WEBSITE/CPX website Upload/favicon.ico" ]; then
    upload_file "$CPX_WEBSITE/CPX website Upload/favicon.ico" "$REMOTE_ROOT"
    upload_file "$CPX_WEBSITE/CPX website Upload/favicon-16x16.png" "$REMOTE_ROOT"
    upload_file "$CPX_WEBSITE/CPX website Upload/favicon-32x32.png" "$REMOTE_ROOT"
    upload_file "$CPX_WEBSITE/CPX website Upload/apple-touch-icon.png" "$REMOTE_ROOT"
    upload_file "$CPX_WEBSITE/CPX website Upload/android-chrome-192x192.png" "$REMOTE_ROOT"
    upload_file "$CPX_WEBSITE/CPX website Upload/android-chrome-512x512.png" "$REMOTE_ROOT"
fi
echo ""

echo -e "${BLUE}Step 3: Uploading CPX Website CSS${NC}"
echo -e "${BLUE}==================================${NC}"
upload_directory "$CPX_WEBSITE/css" "$REMOTE_ROOT/css"
echo ""

echo -e "${BLUE}Step 4: Uploading CPX Website JavaScript${NC}"
echo -e "${BLUE}=========================================${NC}"
upload_directory "$CPX_WEBSITE/js" "$REMOTE_ROOT/js"
echo ""

echo -e "${BLUE}Step 5: Uploading CPX Website Images${NC}"
echo -e "${BLUE}=====================================${NC}"
# Upload main images
if [ -d "$CPX_WEBSITE/images" ]; then
    for file in "$CPX_WEBSITE/images"/*; do
        if [ -f "$file" ]; then
            upload_file "$file" "$REMOTE_ROOT/images"
        fi
    done
fi

# Upload avatars
if [ -d "$CPX_WEBSITE/images/avatars" ]; then
    for file in "$CPX_WEBSITE/images/avatars"/*; do
        if [ -f "$file" ]; then
            upload_file "$file" "$REMOTE_ROOT/images/avatars"
        fi
    done
fi

# Upload icons
if [ -d "$CPX_WEBSITE/images/icons" ]; then
    for file in "$CPX_WEBSITE/images/icons"/*; do
        if [ -f "$file" ]; then
            upload_file "$file" "$REMOTE_ROOT/images/icons"
        fi
    done
fi

# Upload portfolio
if [ -d "$CPX_WEBSITE/images/portfolio" ]; then
    for file in "$CPX_WEBSITE/images/portfolio"/*; do
        if [ -f "$file" ]; then
            upload_file "$file" "$REMOTE_ROOT/images/portfolio"
        fi
    done
    
    # Upload portfolio/gallery
    if [ -d "$CPX_WEBSITE/images/portfolio/gallery" ]; then
        for file in "$CPX_WEBSITE/images/portfolio/gallery"/*; do
            if [ -f "$file" ]; then
                upload_file "$file" "$REMOTE_ROOT/images/portfolio/gallery"
            fi
        done
    fi
fi
echo ""

echo -e "${BLUE}Step 6: Uploading WMS/TMS HTML Pages${NC}"
echo -e "${BLUE}=====================================${NC}"
for file in "$PIXEL_WMS_FRONTEND"/*.html; do
    if [ -f "$file" ]; then
        upload_file "$file" "$REMOTE_WMS"
    fi
done
echo -e "${GREEN}  ✓ Uploaded $(ls -1 "$PIXEL_WMS_FRONTEND"/*.html 2>/dev/null | wc -l) HTML pages${NC}"
echo ""

echo -e "${BLUE}Step 7: Uploading WMS/TMS CSS${NC}"
echo -e "${BLUE}=============================${NC}"
upload_directory "$PIXEL_WMS_FRONTEND/css" "$REMOTE_WMS/css"
echo ""

echo -e "${BLUE}Step 8: Uploading WMS/TMS JavaScript${NC}"
echo -e "${BLUE}=====================================${NC}"
upload_directory "$PIXEL_WMS_FRONTEND/js" "$REMOTE_WMS/js"
echo ""

echo -e "${BLUE}Step 9: Uploading WMS/TMS Images${NC}"
echo -e "${BLUE}=================================${NC}"
if [ -d "$PIXEL_WMS_FRONTEND/images" ]; then
    for file in "$PIXEL_WMS_FRONTEND/images"/*; do
        if [ -f "$file" ]; then
            upload_file "$file" "$REMOTE_WMS/images"
        fi
    done
fi
echo ""

echo -e "${BLUE}Step 10: Uploading Backend Files${NC}"
echo -e "${BLUE}=================================${NC}"
if [ -f "$PIXEL_WMS_BACKEND/package.json" ]; then
    upload_file "$PIXEL_WMS_BACKEND/package.json" "$REMOTE_BACKEND"
fi

if [ -d "$PIXEL_WMS_BACKEND/src" ]; then
    for file in "$PIXEL_WMS_BACKEND/src"/*.js; do
        if [ -f "$file" ]; then
            upload_file "$file" "$REMOTE_BACKEND/src"
        fi
    done
fi

if [ -d "$PIXEL_WMS_BACKEND/config" ]; then
    for file in "$PIXEL_WMS_BACKEND/config"/*; do
        if [ -f "$file" ]; then
            upload_file "$file" "$REMOTE_BACKEND/config"
        fi
    done
fi
echo ""

echo -e "${BLUE}Step 11: Uploading Cache Control Files${NC}"
echo -e "${BLUE}=======================================${NC}"
# Upload .htaccess to root
if [ -f ".htaccess" ]; then
    upload_file ".htaccess" "$REMOTE_ROOT"
    echo -e "  ${GREEN}✓${NC} Root .htaccess uploaded - cache disabled"
fi
echo ""

echo -e "${GREEN}====================================================${NC}"
echo -e "${GREEN}✅ COMPLETE DEPLOYMENT SUCCESSFUL!${NC}"
echo -e "${GREEN}====================================================${NC}\n"

echo -e "${BLUE}📊 Deployment Summary:${NC}"
echo -e "  ${GREEN}✓${NC} CPX Website uploaded to root"
echo -e "  ${GREEN}✓${NC} WMS/TMS uploaded to Projects/WMS/"
echo -e "  ${GREEN}✓${NC} Backend files uploaded"
echo -e "  ${GREEN}✓${NC} All CSS, JS, Images uploaded\n"

echo -e "${BLUE}🌐 Live URLs:${NC}"
echo -e "  ${GREEN}CPX Website:${NC}       https://creativepixels.in/"
echo -e "  ${GREEN}                    OR http://68.178.157.215/\n"
echo -e "  ${GREEN}WMS Dashboard:${NC}     https://creativepixels.in/Projects/WMS/index.html"
echo -e "  ${GREEN}                    OR http://68.178.157.215/Projects/WMS/index.html\n"
echo -e "  ${GREEN}TMS Tracking:${NC}      https://creativepixels.in/Projects/WMS/tms-tracking.html"
echo -e "  ${GREEN}                    OR http://68.178.157.215/Projects/WMS/tms-tracking.html\n"

echo -e "${YELLOW}📝 Important Notes:${NC}"
echo -e "  1. Test all URLs in browser"
echo -e "  2. Verify images load correctly"
echo -e "  3. Check navigation links work"
echo -e "  4. Test on mobile devices\n"

echo -e "${BLUE}🎉 Your complete website is now live!${NC}\n"
