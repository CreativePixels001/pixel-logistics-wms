#!/bin/bash

SERVER="68.178.157.215"
USER="akshay@creativepixels.in"
PASS="Dagaeron@!2345!"
REMOTE_PATH="/"

echo "🚀 Deploying Updated Contact Details..."
echo ""

# Upload updated pages with contact details
echo "📄 Uploading updated pages..."

for file in home.html get-in-touch.html about-us.html blog.html careers.html our-approach.html \
digital-transformation.html ai-ml.html product-design.html development.html consulting.html \
support.html partners.html press-kit.html \
blog-ai-enterprise.html blog-microservices.html blog-design-systems.html blog-digital-transformation.html; do
    if [ -f "$file" ]; then
        echo "  ✓ Uploading $file..."
        curl -T "$file" "ftp://${SERVER}${REMOTE_PATH}" --user "${USER}:${PASS}" 2>/dev/null
    fi
done

echo ""
echo "✅ Contact details updated across all pages!"
echo ""
echo "📧 Email: connect@creativepixels.in"
echo "📞 Call/WhatsApp: +91 90047 89969"
echo ""
echo "🌐 Live at: https://creativepixels.in"
