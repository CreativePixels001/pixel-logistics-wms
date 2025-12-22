#!/bin/bash

# Quick deployment script for Creative Pixels server
# This will upload and organize files according to the structure

SERVER="akshay@creativepixels.in@68.178.157.215"
PROJECT_DIR="/Users/ashishkumar2/Documents/Deloitte/DEV Project./Pixel ecosystem"

echo "🚀 Deploying to creativepixels.in (68.178.157.215)..."
echo ""

# Create the directory structure on server
echo "📁 Creating directory structure..."
ssh $SERVER << 'EOF'
cd /var/www/html
rm -rf *
mkdir -p css js images
mkdir -p Projects/wms/css Projects/wms/js Projects/wms/images
mkdir -p Projects/backend/src Projects/backend/config
mkdir -p Projects/docs
mkdir -p mobile-app
mkdir -p audio-files
echo "Directory structure created!"
EOF

echo ""
echo "📤 Uploading CPX Website files..."
scp "CPX website/index.html" $SERVER:/var/www/html/
scp -r "CPX website/css/"* $SERVER:/var/www/html/css/
scp -r "CPX website/js/"* $SERVER:/var/www/html/js/
scp -r "CPX website/images/"* $SERVER:/var/www/html/images/

echo ""
echo "📤 Uploading WMS files..."
scp frontend/dashboard.html $SERVER:/var/www/html/Projects/wms/
scp frontend/inventory-management.html $SERVER:/var/www/html/Projects/wms/
scp frontend/tms-tracking.html $SERVER:/var/www/html/Projects/wms/
scp frontend/login.html $SERVER:/var/www/html/Projects/wms/
scp frontend/landing.html $SERVER:/var/www/html/Projects/wms/
scp frontend/index.html $SERVER:/var/www/html/Projects/wms/
scp -r frontend/css/* $SERVER:/var/www/html/Projects/wms/css/ 2>/dev/null
scp -r frontend/js/* $SERVER:/var/www/html/Projects/wms/js/ 2>/dev/null
scp -r frontend/images/* $SERVER:/var/www/html/Projects/wms/images/ 2>/dev/null

echo ""
echo "📤 Uploading Backend files..."
scp -r backend/src/* $SERVER:/var/www/html/Projects/backend/src/ 2>/dev/null
scp -r backend/config/* $SERVER:/var/www/html/Projects/backend/config/ 2>/dev/null
scp backend/package.json $SERVER:/var/www/html/Projects/backend/ 2>/dev/null

echo ""
echo "📤 Uploading Documentation..."
scp *.md $SERVER:/var/www/html/Projects/docs/ 2>/dev/null

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "🌐 Your URLs:"
echo "   CPX Website: http://68.178.157.215/index.html"
echo "   WMS Dashboard: http://68.178.157.215/Projects/wms/dashboard.html"
echo "   WMS Login: http://68.178.157.215/Projects/wms/login.html"
echo "   TMS Tracking: http://68.178.157.215/Projects/wms/tms-tracking.html"
echo ""
