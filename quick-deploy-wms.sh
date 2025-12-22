#!/bin/bash

###############################################################################
# Quick WMS Deployment - Single Command Upload
###############################################################################

FTP_HOST="68.178.157.215"
FTP_USER="akshay@creativepixels.in"
FTP_PASS='_ad,B;7}FZhC'
FTP_DIR="/wms.creativepixels.in"

echo "🚀 Quick WMS Deployment Starting..."
echo ""

# Check directory
if [ ! -d "frontend/WMS" ]; then
    echo "❌ Error: Run from 'Pixel ecosystem' directory"
    exit 1
fi

# Create temp directory
TEMP="wms_deploy_$(date +%s)"
mkdir -p $TEMP

echo "📦 Packaging files..."
cp -r frontend/WMS/*.html $TEMP/
mkdir -p $TEMP/css && cp -r frontend/css/* $TEMP/css/
mkdir -p $TEMP/js && cp -r frontend/js/* $TEMP/js/
mkdir -p $TEMP/images && cp -r frontend/images/* $TEMP/images/
[ -d "frontend/assets" ] && mkdir -p $TEMP/assets && cp -r frontend/assets/* $TEMP/assets/

# Create .htaccess for default page
echo 'DirectoryIndex PixelLogistics.html index.html' > $TEMP/.htaccess
echo 'Options -Indexes' >> $TEMP/.htaccess

echo "📤 Uploading to wms.creativepixels.in..."

# Upload function
upload() {
    curl -s --ftp-create-dirs -T "$1" --user "$FTP_USER:$FTP_PASS" "ftp://$FTP_HOST$FTP_DIR/$2" > /dev/null 2>&1
    [ $? -eq 0 ] && echo "  ✓ $2" || echo "  ✗ $2"
}

# Upload all files
find $TEMP -type f | while read file; do
    relative=${file#$TEMP/}
    upload "$file" "$relative"
done

# Cleanup
rm -rf $TEMP

echo ""
echo "✅ Deployment Complete!"
echo "🌐 Visit: http://wms.creativepixels.in/"
echo "📱 Default page: PixelLogistics.html"
echo "🧪 Test on iPad now!"
