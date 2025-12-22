#!/bin/bash

SERVER="68.178.157.215"
USER="akshay@creativepixels.in"
PASS="Dagaeron@!2345!"
REMOTE_PATH="/public_html"

echo "🚀 Deploying Updated CPX Website to creativepixels.in..."
echo ""

# Upload .htaccess
echo "⚙️ Uploading .htaccess..."
curl -T ".htaccess" "ftp://${SERVER}${REMOTE_PATH}/" --user "${USER}:${PASS}" 2>/dev/null
echo "✅ .htaccess uploaded"

# Upload main pages
echo ""
echo "📄 Uploading main pages..."
for file in home.html index.html get-in-touch.html about-us.html ecosystem.html; do
    if [ -f "$file" ]; then
        echo "  - Uploading $file..."
        curl -T "$file" "ftp://${SERVER}${REMOTE_PATH}/" --user "${USER}:${PASS}" 2>/dev/null
    fi
done
echo "✅ Main pages uploaded"

# Upload blog pages
echo ""
echo "📝 Uploading blog pages..."
for file in blog.html blog-ai-enterprise.html blog-microservices.html blog-design-systems.html blog-digital-transformation.html; do
    if [ -f "$file" ]; then
        echo "  - Uploading $file..."
        curl -T "$file" "ftp://${SERVER}${REMOTE_PATH}/" --user "${USER}:${PASS}" 2>/dev/null
    fi
done
echo "✅ Blog pages uploaded"

# Upload company pages
echo ""
echo "🏢 Uploading company pages..."
for file in our-approach.html careers.html; do
    if [ -f "$file" ]; then
        echo "  - Uploading $file..."
        curl -T "$file" "ftp://${SERVER}${REMOTE_PATH}/" --user "${USER}:${PASS}" 2>/dev/null
    fi
done
echo "✅ Company pages uploaded"

# Upload service pages
echo ""
echo "🛠️ Uploading service pages..."
for file in digital-transformation.html ai-ml.html product-design.html development.html consulting.html; do
    if [ -f "$file" ]; then
        echo "  - Uploading $file..."
        curl -T "$file" "ftp://${SERVER}${REMOTE_PATH}/" --user "${USER}:${PASS}" 2>/dev/null
    fi
done
echo "✅ Service pages uploaded"

# Upload contact/info pages
echo ""
echo "📞 Uploading contact & info pages..."
for file in support.html partners.html press-kit.html privacy-policy.html terms-of-service.html cookie-policy.html; do
    if [ -f "$file" ]; then
        echo "  - Uploading $file..."
        curl -T "$file" "ftp://${SERVER}${REMOTE_PATH}/" --user "${USER}:${PASS}" 2>/dev/null
    fi
done
echo "✅ Contact & info pages uploaded"

# Upload additional pages
echo ""
echo "📄 Uploading additional pages..."
for file in *.html; do
    # Skip files already uploaded
    if [[ ! "$file" =~ ^(home|index|get-in-touch|about-us|ecosystem|blog|our-approach|careers|digital-transformation|ai-ml|product-design|development|consulting|support|partners|press-kit|privacy-policy|terms-of-service|cookie-policy).*\.html$ ]]; then
        echo "  - Uploading $file..."
        curl -T "$file" "ftp://${SERVER}${REMOTE_PATH}/" --user "${USER}:${PASS}" 2>/dev/null
    fi
done
echo "✅ Additional pages uploaded"

# Upload CSS files
echo ""
echo "🎨 Uploading CSS..."
if [ -d "css" ]; then
    for file in css/*.css; do
        if [ -f "$file" ]; then
            echo "  - Uploading $file..."
            curl -T "$file" --ftp-create-dirs "ftp://${SERVER}${REMOTE_PATH}/css/" --user "${USER}:${PASS}" 2>/dev/null
        fi
    done
    echo "✅ CSS files uploaded"
fi

# Upload JS files
echo ""
echo "⚙️ Uploading JavaScript..."
if [ -d "js" ]; then
    for file in js/*.js; do
        if [ -f "$file" ]; then
            echo "  - Uploading $file..."
            curl -T "$file" --ftp-create-dirs "ftp://${SERVER}${REMOTE_PATH}/js/" --user "${USER}:${PASS}" 2>/dev/null
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
            echo "  - Uploading $filename..."
            curl -T "$file" --ftp-create-dirs "ftp://${SERVER}${REMOTE_PATH}/images/" --user "${USER}:${PASS}" 2>/dev/null
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
        curl -T "$file" "ftp://${SERVER}${REMOTE_PATH}/" --user "${USER}:${PASS}" 2>/dev/null
    fi
done
echo "✅ Favicons uploaded"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Your website is live at:"
echo "   https://creativepixels.in"
echo ""
echo "📝 Blog pages available at:"
echo "   https://creativepixels.in/blog.html"
echo "   https://creativepixels.in/blog-ai-enterprise.html"
echo "   https://creativepixels.in/blog-microservices.html"
echo "   https://creativepixels.in/blog-design-systems.html"
echo "   https://creativepixels.in/blog-digital-transformation.html"
echo ""
echo "🔄 Clear your browser cache (Ctrl+Shift+R / Cmd+Shift+R) to see changes"
echo ""
