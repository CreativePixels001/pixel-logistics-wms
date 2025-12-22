#!/bin/bash

# FTP Upload Script with new credentials
# Host: 68.178.157.215
# User: akshay@creativepixels.in
# Password: _ad,B;7}FZhC

# Load credentials from .ftpconfig if available
if [ -f .ftpconfig ]; then
    source .ftpconfig
else
    HOST="68.178.157.215"
    USER="akshay@creativepixels.in"
    PASS="_ad,B;7}FZhC"
fi

echo "🚀 Uploading to FTP Server: $HOST"
echo ""

# Test FTP connection first
echo "📡 Testing FTP connection..."
ftp -n $HOST <<END_SCRIPT
quote USER $USER
quote PASS $PASS
pwd
ls
quit
END_SCRIPT

echo ""
echo "✅ Connection test complete!"
