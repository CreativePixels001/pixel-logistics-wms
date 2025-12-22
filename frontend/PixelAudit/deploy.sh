#!/bin/bash

echo "🚀 PixelAudit Deployment Script"
echo "================================"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git branch -M main
fi

# Add all files
echo "📝 Adding files to Git..."
git add .

# Commit
echo "💾 Creating commit..."
read -p "Enter commit message (default: 'Update PixelAudit'): " commit_msg
commit_msg=${commit_msg:-"Update PixelAudit"}
git commit -m "$commit_msg"

# Check if remote exists
if ! git remote | grep -q 'origin'; then
    echo "🔗 Adding GitHub remote..."
    read -p "Enter GitHub repository URL: " repo_url
    git remote add origin "$repo_url"
fi

# Push to GitHub
echo "⬆️  Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Go to https://app.netlify.com/"
echo "2. Click 'New site from Git'"
echo "3. Choose GitHub and select your repo"
echo "4. Click 'Deploy site'"
echo "5. Your site will be live in 30 seconds!"
echo ""
echo "🌐 You'll get a URL like: https://pixelaudit-abc123.netlify.app"
echo ""
