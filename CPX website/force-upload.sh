#!/bin/bash

SERVER="68.178.157.215"
USER="akshay@creativepixels.in"
PASS="Dagaeron@!2345!"

echo "🔄 Force uploading index.html to overwrite existing file..."

# Delete existing index.html first
curl -v -X "DELE index.html" "ftp://${SERVER}/public_html/" --user "${USER}:${PASS}" 2>&1 | grep -i "250\|550" || true

# Upload new index.html
echo "📤 Uploading new index.html..."
curl -v -T "index.html" "ftp://${SERVER}/public_html/" --user "${USER}:${PASS}"

echo ""
echo "✅ Upload complete. Check http://68.178.157.215/"
