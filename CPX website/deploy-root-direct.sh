#!/bin/bash

SERVER="68.178.157.215"
USER="akshay@creativepixels.in"
PASS="Dagaeron@!2345!"
REMOTE_PATH="/public_html"

echo "🚀 Deploying directly to /public_html root..."
echo ""

# Create updated .htaccess for root
echo "⚙️ Creating .htaccess in root..."
cat > /tmp/new_htaccess << 'EOF'
# Enable Rewrite Engine
RewriteEngine On
RewriteBase /

# Set home.html as the default directory index
DirectoryIndex home.html index.html

# Allow access to all HTML files
<FilesMatch "\.(html|css|js|png|jpg|jpeg|gif|ico|svg|webmanifest)$">
    Order Allow,Deny
    Allow from all
</FilesMatch>

# Redirect index.html to home.html
RewriteCond %{THE_REQUEST} /index\.html [NC]
RewriteRule ^index\.html$ /home.html [R=301,L]

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Disable directory browsing
Options -Indexes

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>

# Cache control for static files
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType text/html "access plus 0 seconds"
</IfModule>
EOF

curl -T "/tmp/new_htaccess" "ftp://${SERVER}${REMOTE_PATH}/.htaccess" --user "${USER}:${PASS}" 2>/dev/null
echo "✅ .htaccess uploaded to root"

# Upload ALL HTML files
echo ""
echo "📄 Uploading all HTML files to root..."
count=0
for file in *.html; do
    if [ -f "$file" ]; then
        echo "  - Uploading $file..."
        curl -T "$file" "ftp://${SERVER}${REMOTE_PATH}/" --user "${USER}:${PASS}" 2>/dev/null
        ((count++))
    fi
done
echo "✅ $count HTML files uploaded"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Test your website:"
echo "   https://creativepixels.in"
echo "   https://creativepixels.in/blog.html"
echo "   https://creativepixels.in/blog-ai-enterprise.html"
echo ""
echo "🔄 IMPORTANT: Clear browser cache completely!"
echo "   - Chrome/Edge: Ctrl+Shift+Delete → Clear cached images and files"
echo "   - Or use Incognito/Private mode"
echo ""

rm -f /tmp/new_htaccess
