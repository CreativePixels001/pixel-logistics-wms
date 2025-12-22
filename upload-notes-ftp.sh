#!/bin/bash

# ================================================
# PixelNotes Deployment - Alternative Method
# ================================================

FTP_HOST="ftp.creativepixels.in"
FTP_USER="u258849571"
FTP_PASS="Deloitte@001"
REMOTE_DIR="domains/creativepixels.in/public_html/Notes"

echo "🚀 PixelNotes Deployment"
echo "Target: creativepixels.in/Notes/"
echo ""

# Create FTP command file
cat > /tmp/ftp_commands.txt << EOF
cd $REMOTE_DIR || mkdir $REMOTE_DIR
cd $REMOTE_DIR
lcd PixelNotes
binary
put login.html
put dashboard.html
put editor.html
put landing.html
ls -l
bye
EOF

echo "📤 Uploading via FTP..."
echo ""

ftp -n $FTP_HOST << END_FTP
quote USER $FTP_USER
quote PASS $FTP_PASS
$(cat /tmp/ftp_commands.txt)
END_FTP

# Cleanup
rm /tmp/ftp_commands.txt

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "🌐 Access at: https://creativepixels.in/Notes/login.html"
    echo ""
else
    echo ""
    echo "❌ Deployment may have issues. Let me try ncftp method..."
    echo ""
    
    # Try manual upload instructions
    echo "📋 Manual Upload Steps:"
    echo "1. Open FileZilla or any FTP client"
    echo "2. Connect to: $FTP_HOST"
    echo "3. Username: $FTP_USER"
    echo "4. Password: $FTP_PASS"
    echo "5. Navigate to: /domains/creativepixels.in/public_html/"
    echo "6. Create folder: Notes"
    echo "7. Upload these files from PixelNotes/ folder:"
    echo "   - login.html"
    echo "   - dashboard.html"
    echo "   - editor.html"
    echo "   - landing.html"
    echo ""
    echo "8. Access at: https://creativepixels.in/Notes/login.html"
fi
