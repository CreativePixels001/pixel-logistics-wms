#!/bin/bash

SERVER="68.178.157.215"
USER="akshay@creativepixels.in"
PASS="Dagaeron@!2345!"
REMOTE_PATH="/public_html"

echo "🚀 Deploying CPX Website to Server Root..."

# Upload main HTML files
echo "📄 Uploading HTML files..."
curl -T "index.html" --ftp-create-dirs "ftp://${SERVER}${REMOTE_PATH}/" --user "${USER}:${PASS}"
curl -T "ecosystem.html" --ftp-create-dirs "ftp://${SERVER}${REMOTE_PATH}/" --user "${USER}:${PASS}"
curl -T "styles.html" --ftp-create-dirs "ftp://${SERVER}${REMOTE_PATH}/" --user "${USER}:${PASS}"

# Upload CSS files
echo "🎨 Uploading CSS..."
for file in css/*.css; do
    curl -T "$file" --ftp-create-dirs "ftp://${SERVER}${REMOTE_PATH}/css/" --user "${USER}:${PASS}"
done

# Upload JS files
echo "⚙️ Uploading JS..."
for file in js/*.js; do
    curl -T "$file" --ftp-create-dirs "ftp://${SERVER}${REMOTE_PATH}/js/" --user "${USER}:${PASS}"
done

# Upload images
echo "🖼️ Uploading images..."
for file in images/*; do
    if [ -f "$file" ]; then
        curl -T "$file" --ftp-create-dirs "ftp://${SERVER}${REMOTE_PATH}/images/" --user "${USER}:${PASS}"
    fi
done

# Upload favicons
echo "🌟 Uploading favicons..."
curl -T "favicon.ico" "ftp://${SERVER}${REMOTE_PATH}/" --user "${USER}:${PASS}"
curl -T "apple-touch-icon.png" "ftp://${SERVER}${REMOTE_PATH}/" --user "${USER}:${PASS}"
curl -T "favicon-16x16.png" "ftp://${SERVER}${REMOTE_PATH}/" --user "${USER}:${PASS}"
curl -T "favicon-32x32.png" "ftp://${SERVER}${REMOTE_PATH}/" --user "${USER}:${PASS}"
curl -T "site.webmanifest" "ftp://${SERVER}${REMOTE_PATH}/" --user "${USER}:${PASS}"

echo "✅ CPX Website deployed to http://68.178.157.215/"
