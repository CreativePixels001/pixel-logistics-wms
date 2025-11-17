#!/bin/bash

# FTP Deployment Script for WMS Demo
# This script deploys the frontend files to your FTP server

# Load FTP credentials
source .ftpconfig

echo "🚀 Starting FTP Deployment to $HOST..."

# Base directory - wms-demo folder
REMOTE_DIR="wms-demo"
LOCAL_DIR="frontend"

# Upload all HTML files
echo "📄 Uploading HTML files..."
for file in $LOCAL_DIR/*.html; do
    filename=$(basename "$file")
    echo "  - Uploading $filename..."
    curl -s -u "$USER:$PASS" -T "$file" "ftp://$HOST/$REMOTE_DIR/"
done

# Upload CSS files
echo "🎨 Uploading CSS files..."
for file in $LOCAL_DIR/css/*.css; do
    filename=$(basename "$file")
    echo "  - Uploading $filename..."
    curl -s -u "$USER:$PASS" -T "$file" "ftp://$HOST/$REMOTE_DIR/css/"
done

# Upload JS files
echo "⚙️  Uploading JS files..."
for file in $LOCAL_DIR/js/*.js; do
    filename=$(basename "$file")
    echo "  - Uploading $filename..."
    curl -s -u "$USER:$PASS" -T "$file" "ftp://$HOST/$REMOTE_DIR/js/"
done

# Create images directory and upload
if [ -d "$LOCAL_DIR/images" ]; then
    echo "🖼️  Uploading images..."
    for file in $LOCAL_DIR/images/*; do
        filename=$(basename "$file")
        echo "  - Uploading $filename..."
        curl -s -u "$USER:$PASS" -T "$file" "ftp://$HOST/$REMOTE_DIR/images/"
    done
fi

echo ""
echo "✅ Deployment Complete!"
echo "🌐 Your WMS Demo should be accessible at:"
echo "   http://creativepixels.in/wms-demo/landing.html"
echo "   http://68.178.157.215/wms-demo/landing.html"
echo ""
echo "📝 Note: If you get 404 errors, please contact your hosting provider to:"
echo "   - Enable directory access for /wms-demo/"
echo "   - Set up DNS for a subdomain like wms.creativepixels.in"
echo ""
