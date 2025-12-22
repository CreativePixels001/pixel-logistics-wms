#!/bin/bash

SERVER="68.178.157.215"
USER="akshay@creativepixels.in"
PASS="Dagaeron@!2345!"
REMOTE_PATH="/public_html/Projects/WMS"

echo "🚀 Deploying TMS API Integration..."

# Upload new API integration JS
echo "📤 Uploading tms-api-integration.js..."
curl -T "frontend/js/tms-api-integration.js" "ftp://${SERVER}${REMOTE_PATH}/js/" --user "${USER}:${PASS}"

# Upload updated TMS dashboard HTML
echo "📤 Uploading updated tms-dashboard.html..."
curl -T "frontend/tms-dashboard.html" "ftp://${SERVER}${REMOTE_PATH}/" --user "${USER}:${PASS}"

# Upload updated TMS dashboard JS
echo "📤 Uploading tms-dashboard.js..."
curl -T "frontend/js/tms-dashboard.js" "ftp://${SERVER}${REMOTE_PATH}/js/" --user "${USER}:${PASS}"

echo ""
echo "✅ API Integration deployed successfully!"
echo "🌐 Test at: http://68.178.157.215/Projects/WMS/tms-dashboard.html"
echo ""
echo "📝 Note: Make sure backend server is running for full functionality"
