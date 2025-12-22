#!/bin/bash

# Pixel Notes - Quick Deploy Script
# Deploy to Netlify/Vercel with Google OAuth

echo "🚀 Pixel Notes - Deployment Script"
echo "===================================="
echo ""

# Check if we're in the right directory
if [ ! -d "PixelNotes" ]; then
    echo "❌ Error: PixelNotes directory not found"
    echo "Please run this script from the project root"
    exit 1
fi

echo "📁 Found PixelNotes directory"
echo ""

# Ask for Google credentials
echo "🔐 Google OAuth Setup"
echo "---------------------"
echo ""
echo "Do you have Google OAuth credentials? (y/n)"
read has_credentials

if [ "$has_credentials" = "y" ] || [ "$has_credentials" = "Y" ]; then
    echo ""
    echo "Enter your Google Client ID:"
    read client_id
    
    echo "Enter your Google API Key:"
    read api_key
    
    # Update the google-drive-sync.js file
    if [ -f "PixelNotes/google-drive-sync.js" ]; then
        sed -i.bak "s/YOUR_GOOGLE_CLIENT_ID/$client_id/g" PixelNotes/google-drive-sync.js
        sed -i.bak "s/YOUR_GOOGLE_API_KEY/$api_key/g" PixelNotes/google-drive-sync.js
        echo "✅ Updated Google credentials"
        rm PixelNotes/google-drive-sync.js.bak
    fi
else
    echo "⚠️  Skipping credentials (demo mode will work)"
    echo "   Get credentials from: https://console.cloud.google.com/"
fi

echo ""
echo "📦 Deployment Options"
echo "--------------------"
echo "1. Netlify (Recommended)"
echo "2. Vercel"
echo "3. GitHub Pages"
echo "4. Just prepare files (manual deployment)"
echo ""
echo "Choose option (1-4):"
read deploy_option

case $deploy_option in
    1)
        echo ""
        echo "🌐 Deploying to Netlify..."
        echo ""
        echo "Option A: Drag & Drop"
        echo "  1. Open https://app.netlify.com/drop"
        echo "  2. Drag the PixelNotes folder"
        echo "  3. Done! Your site is live"
        echo ""
        echo "Option B: Git-based (better for updates)"
        echo "  1. Push to GitHub first"
        echo "  2. Connect repository at netlify.com"
        echo "  3. Set publish directory: PixelNotes"
        echo ""
        ;;
    2)
        echo ""
        echo "🌐 Deploying to Vercel..."
        echo ""
        echo "Steps:"
        echo "  1. Go to https://vercel.com/new"
        echo "  2. Import Git repository"
        echo "  3. Root Directory: PixelNotes"
        echo "  4. Click Deploy"
        echo ""
        ;;
    3)
        echo ""
        echo "🌐 Deploying to GitHub Pages..."
        echo ""
        
        # Check if git is initialized
        if [ -d ".git" ]; then
            echo "Git repository found"
            echo ""
            echo "Committing changes..."
            git add PixelNotes/
            git commit -m "Add Pixel Notes with Google OAuth"
            
            echo ""
            echo "Pushing to GitHub..."
            git push origin main
            
            echo ""
            echo "✅ Pushed to GitHub"
            echo ""
            echo "Now enable GitHub Pages:"
            echo "  1. Go to repository Settings → Pages"
            echo "  2. Source: Deploy from branch"
            echo "  3. Branch: main → Folder: /PixelNotes"
            echo "  4. Save"
        else
            echo "Git not initialized. Run:"
            echo "  git init"
            echo "  git add PixelNotes/"
            echo "  git commit -m 'Add Pixel Notes'"
            echo "  git remote add origin YOUR_REPO_URL"
            echo "  git push -u origin main"
        fi
        ;;
    4)
        echo ""
        echo "📁 Files ready for manual deployment"
        echo ""
        echo "Upload these files to your web server:"
        echo "  - PixelNotes/"
        echo ""
        echo "Make sure to update authorized origins in Google Cloud Console!"
        ;;
    *)
        echo "Invalid option"
        exit 1
        ;;
esac

echo ""
echo "⚠️  IMPORTANT: Update Google OAuth Settings"
echo "============================================"
echo ""
echo "After deployment, add your live URL to:"
echo "https://console.cloud.google.com/apis/credentials"
echo ""
echo "Add to Authorized JavaScript origins:"
echo "  - Your live URL (e.g., https://pixel-notes.netlify.app)"
echo ""
echo "Add to Authorized redirect URIs:"
echo "  - Your live URL + /login.html"
echo ""

echo ""
echo "✅ Deployment preparation complete!"
echo ""
echo "📚 Documentation available in:"
echo "  - GOOGLE_OAUTH_SETUP.md"
echo "  - TEST_INSTRUCTIONS.md"
echo ""
echo "🎉 Your Pixel Notes app is ready to go live!"
