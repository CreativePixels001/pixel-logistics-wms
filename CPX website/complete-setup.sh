#!/bin/bash

SERVER="68.178.157.215"
USER="akshay@creativepixels.in"
PASS="Dagaeron@!2345!"

echo "🚀 Complete CPX Website Setup..."

# Create .htaccess to ensure index.html is used
echo "📝 Creating .htaccess..."
cat > .htaccess << 'HTACCESS'
DirectoryIndex index.html index.php
Options -Indexes
RewriteEngine On
HTACCESS

# Upload .htaccess
curl -T ".htaccess" "ftp://${SERVER}/public_html/" --user "${USER}:${PASS}"

# Re-upload index.html with force
echo "📤 Re-uploading index.html..."
curl -T "index.html" "ftp://${SERVER}/public_html/index.html" --user "${USER}:${PASS}"

# Upload all CSS files
echo "🎨 Uploading CSS files..."
for file in css/*.css; do
    filename=$(basename "$file")
    curl -T "$file" "ftp://${SERVER}/public_html/css/${filename}" --user "${USER}:${PASS}"
done

# Upload all JS files
echo "⚙️ Uploading JS files..."
for file in js/*.js; do
    filename=$(basename "$file")
    curl -T "$file" "ftp://${SERVER}/public_html/js/${filename}" --user "${USER}:${PASS}"
done

echo ""
echo "✅ Setup complete!"
echo "🌐 Visit: http://68.178.157.215/"
echo ""
echo "If you still see placeholder, try:"
echo "  - Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)"
echo "  - Visit: http://68.178.157.215/index.html directly"
