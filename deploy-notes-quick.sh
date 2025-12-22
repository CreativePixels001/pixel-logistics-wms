#!/bin/bash

# ================================================
# PixelNotes Quick Deployment Script
# Deploys to: creativepixels.in/Notes/
# Uses: curl (built-in on macOS)
# ================================================

echo "🚀 PixelNotes Deployment to creativepixels.in/Notes/"
echo "================================================"

# FTP Configuration
FTP_HOST="ftp.creativepixels.in"
FTP_USER="u258849571"
FTP_PASS="Deloitte@001"
REMOTE_DIR="/domains/creativepixels.in/public_html/Notes"

# Source directory
SOURCE_DIR="./PixelNotes"

echo ""
echo "📦 Preparing files from: $SOURCE_DIR"
echo ""

# Check if source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo "❌ Error: Directory $SOURCE_DIR not found!"
    exit 1
fi

# List files to upload
echo "✅ Files to upload:"
ls -1 "$SOURCE_DIR"/*.html 2>/dev/null | while read file; do
    echo "   - $(basename "$file")"
done

echo ""
read -p "🔍 Continue with deployment? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

echo ""
echo "🌐 Connecting to FTP server..."
echo ""

# Create Notes directory on server
echo "📁 Creating Notes directory..."
curl -s --ftp-create-dirs \
  ftp://$FTP_HOST$REMOTE_DIR/ \
  --user $FTP_USER:$FTP_PASS

# Upload each HTML file
echo "📤 Uploading files..."
for file in "$SOURCE_DIR"/*.html; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        echo "   ⬆️  Uploading $filename..."
        curl -s -T "$file" \
          ftp://$FTP_HOST$REMOTE_DIR/$filename \
          --user $FTP_USER:$FTP_PASS
        
        if [ $? -eq 0 ]; then
            echo "   ✅ $filename uploaded successfully"
        else
            echo "   ❌ Failed to upload $filename"
        fi
    fi
done

echo ""
echo "================================================"
echo "✅ Deployment Complete!"
echo "================================================"
echo ""
echo "🌐 Access Your App:"
echo "   🔗 https://creativepixels.in/Notes/login.html"
echo ""
echo "🎯 Try Demo Mode:"
echo "   1. Open: https://creativepixels.in/Notes/login.html"
echo "   2. Click: 'Try Demo Mode (No Login Required)'"
echo "   3. Start using PixelNotes instantly!"
echo ""
echo "🔐 Or Use Google Login:"
echo "   1. Click: 'Continue with Google'"
echo "   2. (First time: Add URLs to Google OAuth Console)"
echo ""
echo "⚙️  Google OAuth Setup (if needed):"
echo "   Go to: https://console.cloud.google.com/apis/credentials"
echo "   Edit Client ID: 264150556588-j05rnbhdtpsv0ha0la7g1v4479v5cm9l"
echo ""
echo "   Add Authorized JavaScript origins:"
echo "   • https://creativepixels.in"
echo ""
echo "   Add Authorized redirect URIs:"
echo "   • https://creativepixels.in/Notes/login.html"
echo "   • https://creativepixels.in/Notes/dashboard.html"
echo ""
echo "🎉 Done! Your app is live at creativepixels.in/Notes/"
echo ""
