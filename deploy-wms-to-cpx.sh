#!/bin/bash

###############################################################################
# WMS Deployment Script to wms.creativepixels.in
# Date: December 7, 2025
# Purpose: Deploy WMS Application to Creative Pixels Production Server
###############################################################################

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# FTP Credentials
FTP_HOST="68.178.157.215"
FTP_USER="akshay@creativepixels.in"
FTP_PASS='_ad,B;7}FZhC'
FTP_DIR="/wms.creativepixels.in"

# Local paths
LOCAL_WMS_DIR="frontend/WMS"
LOCAL_CSS_DIR="frontend/css"
LOCAL_JS_DIR="frontend/js"
LOCAL_IMAGES_DIR="frontend/images"
LOCAL_ASSETS_DIR="frontend/assets"

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   WMS Deployment to wms.creativepixels.in${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Step 1: Check if we're in the correct directory
if [ ! -d "frontend/WMS" ]; then
    echo -e "${RED}❌ Error: Must run from 'Pixel ecosystem' directory${NC}"
    echo -e "${YELLOW}Current directory: $(pwd)${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Directory check passed${NC}"
echo ""

# Step 2: Create deployment package
echo -e "${YELLOW}📦 Step 1: Creating deployment structure...${NC}"

# Create a temporary deployment directory
DEPLOY_DIR="deploy_temp_wms"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

# Copy WMS HTML files
echo -e "  → Copying WMS HTML files..."
cp -r $LOCAL_WMS_DIR/*.html $DEPLOY_DIR/ 2>/dev/null

# Create .htaccess for default page routing
echo -e "  → Creating .htaccess for default page..."
cat > $DEPLOY_DIR/.htaccess << 'EOF'
DirectoryIndex PixelLogistics.html index.html
Options -Indexes

# Enable compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript
</IfModule>

# Browser caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
EOF

# Copy CSS directory
echo -e "  → Copying CSS files..."
mkdir -p $DEPLOY_DIR/css
cp -r $LOCAL_CSS_DIR/* $DEPLOY_DIR/css/ 2>/dev/null

# Copy JS directory
echo -e "  → Copying JavaScript files..."
mkdir -p $DEPLOY_DIR/js
cp -r $LOCAL_JS_DIR/* $DEPLOY_DIR/js/ 2>/dev/null

# Copy images
echo -e "  → Copying images..."
mkdir -p $DEPLOY_DIR/images
cp -r $LOCAL_IMAGES_DIR/* $DEPLOY_DIR/images/ 2>/dev/null

# Copy assets
echo -e "  → Copying assets..."
if [ -d "$LOCAL_ASSETS_DIR" ]; then
    mkdir -p $DEPLOY_DIR/assets
    cp -r $LOCAL_ASSETS_DIR/* $DEPLOY_DIR/assets/ 2>/dev/null
fi

# Copy WMS App Images if exists
if [ -d "$LOCAL_WMS_DIR/WMS App Images" ]; then
    echo -e "  → Copying WMS App Images..."
    cp -r "$LOCAL_WMS_DIR/WMS App Images" $DEPLOY_DIR/
fi

echo -e "${GREEN}✓ Deployment package created${NC}"
echo ""

# Step 3: Show what will be deployed
echo -e "${YELLOW}📋 Step 2: Deployment Summary${NC}"
echo -e "  Source: $(pwd)/$LOCAL_WMS_DIR"
echo -e "  Target: ftp://$FTP_HOST$FTP_DIR"
echo -e "  Files to upload:"
echo -e "    - $(ls $DEPLOY_DIR/*.html 2>/dev/null | wc -l | xargs) HTML files"
echo -e "    - CSS directory ($(find $DEPLOY_DIR/css -type f 2>/dev/null | wc -l | xargs) files)"
echo -e "    - JS directory ($(find $DEPLOY_DIR/js -type f 2>/dev/null | wc -l | xargs) files)"
echo -e "    - Images directory"
echo -e "    - Assets directory"
echo ""

# Step 4: Confirm deployment
echo -e "${YELLOW}⚠️  Ready to deploy to PRODUCTION server${NC}"
read -p "Continue with deployment? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${RED}❌ Deployment cancelled${NC}"
    rm -rf $DEPLOY_DIR
    exit 0
fi

echo ""
echo -e "${YELLOW}🚀 Step 3: Uploading files to server...${NC}"

# Step 5: Upload using curl (batch FTP)
upload_file() {
    local file=$1
    local remote_path=$2
    
    curl -s --ftp-create-dirs -T "$file" \
        --user "$FTP_USER:$FTP_PASS" \
        "ftp://$FTP_HOST$FTP_DIR/$remote_path"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}  ✓${NC} Uploaded: $remote_path"
        return 0
    else
        echo -e "${RED}  ✗${NC} Failed: $remote_path"
        return 1
    fi
}

# Upload .htaccess first
echo -e "\n${BLUE}Uploading .htaccess...${NC}"
if [ -f "$DEPLOY_DIR/.htaccess" ]; then
    upload_file "$DEPLOY_DIR/.htaccess" ".htaccess"
fi

# Upload all HTML files
echo -e "\n${BLUE}Uploading HTML files...${NC}"
for file in $DEPLOY_DIR/*.html; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        upload_file "$file" "$filename"
    fi
done

# Upload CSS files
echo -e "\n${BLUE}Uploading CSS files...${NC}"
if [ -d "$DEPLOY_DIR/css" ]; then
    for file in $DEPLOY_DIR/css/*; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            upload_file "$file" "css/$filename"
        fi
    done
fi

# Upload JS files
echo -e "\n${BLUE}Uploading JavaScript files...${NC}"
if [ -d "$DEPLOY_DIR/js" ]; then
    for file in $DEPLOY_DIR/js/*; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            upload_file "$file" "js/$filename"
        fi
    done
fi

# Upload images
echo -e "\n${BLUE}Uploading images...${NC}"
if [ -d "$DEPLOY_DIR/images" ]; then
    for file in $DEPLOY_DIR/images/*; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            upload_file "$file" "images/$filename"
        fi
    done
fi

# Upload assets
echo -e "\n${BLUE}Uploading assets...${NC}"
if [ -d "$DEPLOY_DIR/assets" ]; then
    find $DEPLOY_DIR/assets -type f | while read file; do
        relative_path=${file#$DEPLOY_DIR/assets/}
        upload_file "$file" "assets/$relative_path"
    done
fi

# Upload WMS App Images
if [ -d "$DEPLOY_DIR/WMS App Images" ]; then
    echo -e "\n${BLUE}Uploading WMS App Images...${NC}"
    for file in "$DEPLOY_DIR/WMS App Images"/*; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            upload_file "$file" "WMS App Images/$filename"
        fi
    done
fi

# Step 6: Cleanup
echo -e "\n${YELLOW}🧹 Cleaning up temporary files...${NC}"
rm -rf $DEPLOY_DIR
echo -e "${GREEN}✓ Cleanup complete${NC}"

# Step 7: Final summary
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}🌐 Your WMS application is now live at:${NC}"
echo -e "${BLUE}   http://wms.creativepixels.in/${NC}"
echo -e "${BLUE}   (Default page: PixelLogistics.html)${NC}"
echo ""
echo -e "${GREEN}📱 Test on your iPad:${NC}"
echo -e "${BLUE}   Just visit: http://wms.creativepixels.in${NC}"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo -e "   1. Open Safari on your iPad"
echo -e "   2. Visit: http://wms.creativepixels.in"
echo -e "   3. PixelLogistics.html will load automatically"
echo -e "   4. Test navigation and all features"
echo -e "   5. Share demo link with clients!"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
