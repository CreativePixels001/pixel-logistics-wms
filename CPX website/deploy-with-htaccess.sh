#!/bin/bash

SERVER="68.178.157.215"
USER="akshay@creativepixels.in"
PASS="Dagaeron@!2345!"
REMOTE_PATH="/public_html"
SITE_DIR="creativepixels"

echo "🚀 Setting up CreativePixels website structure..."
echo ""

# Create creativepixels directory
echo "📁 Creating /public_html/creativepixels/ directory..."
curl -s --ftp-create-dirs "ftp://${SERVER}${REMOTE_PATH}/${SITE_DIR}/" --user "${USER}:${PASS}" -Q "MKD ${SITE_DIR}" 2>/dev/null
echo "✅ Directory created"

# Upload .htaccess to root
echo ""
echo "⚙️ Creating root .htaccess with domain redirect..."
cat > /tmp/root_htaccess << 'EOF'
# Redirect creativepixels.in to creativepixels folder
RewriteEngine On
RewriteBase /

# If accessing creativepixels.in domain, serve from creativepixels folder
RewriteCond %{HTTP_HOST} ^(www\.)?creativepixels\.in$ [NC]
RewriteCond %{REQUEST_URI} !^/creativepixels/
RewriteRule ^(.*)$ /creativepixels/$1 [L]

# Set home.html as default directory index
DirectoryIndex home.html index.html
EOF

curl -T "/tmp/root_htaccess" "ftp://${SERVER}${REMOTE_PATH}/.htaccess" --user "${USER}:${PASS}" 2>/dev/null
echo "✅ Root .htaccess uploaded"

# Upload site .htaccess to creativepixels folder
echo ""
echo "⚙️ Uploading site .htaccess..."
if [ -f ".htaccess" ]; then
    curl -T ".htaccess" "ftp://${SERVER}${REMOTE_PATH}/${SITE_DIR}/.htaccess" --user "${USER}:${PASS}" 2>/dev/null
fi
echo "✅ Site .htaccess uploaded"

# Upload all HTML files to creativepixels folder
echo ""
echo "📄 Uploading all HTML files to creativepixels folder..."
for file in *.html; do
    if [ -f "$file" ]; then
        echo "  - Uploading $file..."
        curl -T "$file" "ftp://${SERVER}${REMOTE_PATH}/${SITE_DIR}/" --user "${USER}:${PASS}" 2>/dev/null
    fi
done
echo "✅ HTML files uploaded"

# Upload CSS files
echo ""
echo "🎨 Uploading CSS files..."
if [ -d "css" ]; then
    for file in css/*.css; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            echo "  - Uploading css/$filename..."
            curl -T "$file" --ftp-create-dirs "ftp://${SERVER}${REMOTE_PATH}/${SITE_DIR}/css/" --user "${USER}:${PASS}" 2>/dev/null
        fi
    done
    echo "✅ CSS files uploaded"
fi

# Upload JS files
echo ""
echo "⚙️ Uploading JavaScript files..."
if [ -d "js" ]; then
    for file in js/*.js; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            echo "  - Uploading js/$filename..."
            curl -T "$file" --ftp-create-dirs "ftp://${SERVER}${REMOTE_PATH}/${SITE_DIR}/js/" --user "${USER}:${PASS}" 2>/dev/null
        fi
    done
    echo "✅ JavaScript files uploaded"
fi

# Upload images
echo ""
echo "🖼️ Uploading images..."
if [ -d "images" ]; then
    for file in images/*; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            echo "  - Uploading images/$filename..."
            curl -T "$file" --ftp-create-dirs "ftp://${SERVER}${REMOTE_PATH}/${SITE_DIR}/images/" --user "${USER}:${PASS}" 2>/dev/null
        fi
    done
    echo "✅ Images uploaded"
fi

# Upload favicons
echo ""
echo "🌟 Uploading favicons..."
for file in favicon.ico apple-touch-icon.png favicon-16x16.png favicon-32x32.png site.webmanifest; do
    if [ -f "$file" ]; then
        echo "  - Uploading $file..."
        curl -T "$file" "ftp://${SERVER}${REMOTE_PATH}/${SITE_DIR}/" --user "${USER}:${PASS}" 2>/dev/null
    fi
done
echo "✅ Favicons uploaded"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📁 File structure:"
echo "   /public_html/"
echo "   ├── .htaccess (redirects creativepixels.in → /creativepixels/)"
echo "   └── creativepixels/"
echo "       ├── .htaccess"
echo "       ├── home.html"
echo "       ├── blog*.html"
echo "       ├── css/"
echo "       ├── js/"
echo "       └── images/"
echo ""
echo "🌐 Your website is now live at:"
echo "   https://creativepixels.in"
echo ""
echo "📝 Blog pages:"
echo "   https://creativepixels.in/blog.html"
echo "   https://creativepixels.in/blog-ai-enterprise.html"
echo "   https://creativepixels.in/blog-microservices.html"
echo "   https://creativepixels.in/blog-design-systems.html"
echo "   https://creativepixels.in/blog-digital-transformation.html"
echo ""
echo "🔄 Clear browser cache (Ctrl+Shift+R / Cmd+Shift+R) to see changes"
echo ""
echo "⏰ Wait 2-3 minutes for .htaccess to take effect"
echo ""

# Clean up temp file
rm -f /tmp/root_htaccess
