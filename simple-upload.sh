#!/bin/bash

# Simple upload using rsync or scp (one by one to avoid timeout)
SERVER="akshay@creativepixels.in@68.178.157.215"

echo "🚀 Simple File Upload to creativepixels.in"
echo ""

# Upload CPX Website index
echo "📤 Uploading CPX index.html..."
scp -o ConnectTimeout=30 "CPX website/index.html" $SERVER:/var/www/html/ 2>&1

echo ""
echo "📤 Uploading frontend files to Projects/wms/..."
scp -o ConnectTimeout=30 frontend/index.html $SERVER:/var/www/html/Projects/wms/ 2>&1
scp -o ConnectTimeout=30 frontend/login.html $SERVER:/var/www/html/Projects/wms/ 2>&1
scp -o ConnectTimeout=30 frontend/landing.html $SERVER:/var/www/html/Projects/wms/ 2>&1
scp -o ConnectTimeout=30 frontend/tms-tracking.html $SERVER:/var/www/html/Projects/wms/ 2>&1

echo ""
echo "✅ Upload attempt complete!"
echo "Check: http://68.178.157.215/Projects/wms/index.html"
