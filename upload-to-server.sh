#!/bin/bash

# Upload WMS files to production server
# Server: 68.178.157.215
# User: akshay@creativepixels.in

echo "🚀 Starting file upload to production server..."
echo "Server: 68.178.157.215"
echo ""

# Upload frontend folder
echo "📁 Uploading frontend folder..."
scp -r "frontend" akshay@creativepixels.in@68.178.157.215:/var/www/html/

# Upload CPX website folder
echo "📁 Uploading CPX website folder..."
scp -r "CPX website" akshay@creativepixels.in@68.178.157.215:/var/www/html/

echo ""
echo "✅ Upload complete!"
echo "🌐 Your site should now be live at:"
echo "   - http://68.178.157.215/frontend/landing.html"
echo "   - http://68.178.157.215/frontend/login.html"
echo "   - http://68.178.157.215/CPX%20website/ecosystem.html"
