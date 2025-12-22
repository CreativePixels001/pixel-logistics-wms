#!/bin/bash

# Complete WMS Upload Script
# Uploads all HTML, CSS, JS, and images to wms.creativepixels.in

HOST="68.178.157.215"
USER="akshay@creativepixels.in"
PASS="_ad,B;7}FZhC"
DEST="wms.creativepixels.in"

echo "🚀 Uploading WMS to http://wms.creativepixels.in"
echo ""

cd "/Users/ashishkumar2/Documents/Deloitte/DEV Project./Pixel ecosystem"

# Upload main HTML files
echo "📄 Uploading HTML files..."
for file in frontend/*.html; do
    filename=$(basename "$file")
    echo "   - $filename"
    curl -s -u "$USER:$PASS" -T "$file" ftp://$HOST/$DEST/$filename
done

echo ""
echo "✅ Upload complete!"
echo ""
echo "🌐 Your live URLs:"
echo "   Dashboard: http://wms.creativepixels.in/"
echo "   Login: http://wms.creativepixels.in/login.html"
echo "   Landing: http://wms.creativepixels.in/landing.html"
