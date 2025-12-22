#!/bin/bash

# ================================================
# PixelNotes Deployment Script
# Deploys to: creativepixels.in/Notes/
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

# Check if lftp is installed
if ! command -v lftp &> /dev/null; then
    echo "❌ lftp is not installed. Installing..."
    echo "Run: brew install lftp"
    exit 1
fi

echo ""
echo "📦 Preparing files..."
echo "Source: $SOURCE_DIR"
echo "Target: $REMOTE_DIR"
echo ""

# Create deployment package
echo "✅ Files to upload:"
ls -lh "$SOURCE_DIR"/*.html 2>/dev/null || echo "⚠️  No HTML files found in $SOURCE_DIR"

echo ""
read -p "🔍 Continue with deployment? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

echo ""
echo "🌐 Connecting to FTP server..."

# Deploy using lftp
lftp -e "
set ssl:verify-certificate no;
open -u $FTP_USER,$FTP_PASS $FTP_HOST;
echo '📁 Creating Notes directory...';
mkdir -pf $REMOTE_DIR;
cd $REMOTE_DIR;
echo '🗑️  Clearing old files...';
rm -f *.html;
echo '📤 Uploading PixelNotes files...';
lcd $SOURCE_DIR;
mput *.html;
echo '✅ Upload complete!';
ls -l;
bye
"

if [ $? -eq 0 ]; then
    echo ""
    echo "================================================"
    echo "✅ Deployment Successful!"
    echo "================================================"
    echo ""
    echo "🌐 Access URLs:"
    echo "   Demo Mode:   https://creativepixels.in/Notes/login.html"
    echo "   Login:       https://creativepixels.in/Notes/login.html"
    echo "   Dashboard:   https://creativepixels.in/Notes/dashboard.html"
    echo "   Editor:      https://creativepixels.in/Notes/editor.html"
    echo ""
    echo "📋 Next Steps:"
    echo "   1. Open https://creativepixels.in/Notes/login.html"
    echo "   2. Click 'Try Demo Mode' to test without Google login"
    echo "   3. Or click 'Continue with Google' for production"
    echo ""
    echo "⚙️  Google OAuth Setup (if using Google login):"
    echo "   1. Go to: https://console.cloud.google.com/apis/credentials"
    echo "   2. Edit OAuth Client ID: 264150556588-j05rnbhdtpsv0ha0la7g1v4479v5cm9l"
    echo "   3. Add to Authorized JavaScript origins:"
    echo "      - https://creativepixels.in"
    echo "   4. Add to Authorized redirect URIs:"
    echo "      - https://creativepixels.in/Notes/login.html"
    echo "      - https://creativepixels.in/Notes/dashboard.html"
    echo "   5. Save changes"
    echo ""
else
    echo ""
    echo "❌ Deployment failed!"
    echo "Please check FTP credentials and try again"
    exit 1
fi
