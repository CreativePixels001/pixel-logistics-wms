#!/bin/bash

###############################################################################
# TMS Deployment Script to tms.creativepixels.in
###############################################################################

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

FTP_HOST="68.178.157.215"
FTP_USER="akshay@creativepixels.in"
FTP_PASS='_ad,B;7}FZhC'
FTP_DIR="/tms.creativepixels.in"

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   TMS Deployment to tms.creativepixels.in${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

if [ ! -d "frontend/TMS" ]; then
    echo -e "${RED}❌ Error: Must run from 'Pixel ecosystem' directory${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Directory check passed${NC}"
echo ""

DEPLOY_DIR="deploy_temp_tms"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

echo -e "${YELLOW}📦 Creating deployment package...${NC}"
cp -r frontend/TMS/*.html $DEPLOY_DIR/ 2>/dev/null
mkdir -p $DEPLOY_DIR/css && cp -r frontend/css/* $DEPLOY_DIR/css/ 2>/dev/null
mkdir -p $DEPLOY_DIR/js && cp -r frontend/js/* $DEPLOY_DIR/js/ 2>/dev/null
mkdir -p $DEPLOY_DIR/images && cp -r frontend/images/* $DEPLOY_DIR/images/ 2>/dev/null
[ -d "frontend/assets" ] && mkdir -p $DEPLOY_DIR/assets && cp -r frontend/assets/* $DEPLOY_DIR/assets/ 2>/dev/null

# Create .htaccess
cat > $DEPLOY_DIR/.htaccess << 'EOF'
DirectoryIndex tms-index.html tms-dashboard.html index.html
Options -Indexes
EOF

echo -e "${GREEN}✓ Package created${NC}"
echo ""

upload() {
    curl -s --ftp-create-dirs -T "$1" --user "$FTP_USER:$FTP_PASS" "ftp://$FTP_HOST$FTP_DIR/$2" > /dev/null 2>&1
    [ $? -eq 0 ] && echo -e "${GREEN}  ✓${NC} $2" || echo -e "${RED}  ✗${NC} $2"
}

echo -e "${YELLOW}🚀 Uploading to tms.creativepixels.in...${NC}"

upload "$DEPLOY_DIR/.htaccess" ".htaccess"

for file in $DEPLOY_DIR/*.html; do
    [ -f "$file" ] && upload "$file" "$(basename "$file")"
done

if [ -d "$DEPLOY_DIR/css" ]; then
    for file in $DEPLOY_DIR/css/*; do
        [ -f "$file" ] && upload "$file" "css/$(basename "$file")"
    done
fi

if [ -d "$DEPLOY_DIR/js" ]; then
    for file in $DEPLOY_DIR/js/*; do
        [ -f "$file" ] && upload "$file" "js/$(basename "$file")"
    done
fi

if [ -d "$DEPLOY_DIR/images" ]; then
    find $DEPLOY_DIR/images -type f | while read file; do
        relative=${file#$DEPLOY_DIR/images/}
        upload "$file" "images/$relative"
    done
fi

rm -rf $DEPLOY_DIR

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ TMS DEPLOYMENT COMPLETE!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}🌐 Live at: ${BLUE}http://tms.creativepixels.in${NC}"
echo -e "${GREEN}📱 Test on iPad now!${NC}"
echo ""
