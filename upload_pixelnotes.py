#!/usr/bin/env python3
"""
PixelNotes FTP Upload Script
Uploads to: creativepixels.in/Notes/
"""

from ftplib import FTP
import os
import sys

# FTP Configuration
FTP_HOST = "68.178.157.215"
FTP_USER = "akshay@creativepixels.in"
FTP_PASS = "_ad,B;7}FZhC"
REMOTE_DIR = "/Projects/Notes"  # Upload to Projects/Notes folder
LOCAL_DIR = "./PixelNotes"

# Files to upload
FILES = [
    "login.html",
    "dashboard.html",
    "editor.html",
    "landing.html"
]

print("🚀 PixelNotes FTP Upload")
print("=" * 50)
print(f"📡 Connecting to {FTP_HOST}...")

try:
    # Connect to FTP server
    ftp = FTP(FTP_HOST)
    ftp.login(FTP_USER, FTP_PASS)
    print("✅ Connected successfully!")
    
    # Show current directory
    print(f"📂 Current directory: {ftp.pwd()}")
    
    # Navigate to target directory
    print(f"📁 Navigating to {REMOTE_DIR}...")
    
    # Split path and navigate
    dirs = REMOTE_DIR.strip('/').split('/')
    for directory in dirs:
        try:
            ftp.cwd(directory)
            print(f"   ✅ Entered: {directory}")
        except:
            # Directory doesn't exist, create it
            print(f"   📁 Creating: {directory}")
            ftp.mkd(directory)
            ftp.cwd(directory)
            print(f"   ✅ Created and entered: {directory}")
    
    print(f"\n📤 Uploading files from {LOCAL_DIR}/...")
    print("-" * 50)
    
    # Upload each file
    uploaded = 0
    for filename in FILES:
        filepath = os.path.join(LOCAL_DIR, filename)
        
        if not os.path.exists(filepath):
            print(f"   ⚠️  File not found: {filename}")
            continue
        
        try:
            filesize = os.path.getsize(filepath)
            print(f"   ⬆️  Uploading {filename} ({filesize:,} bytes)...", end=" ")
            
            with open(filepath, 'rb') as f:
                ftp.storbinary(f'STOR {filename}', f)
            
            print("✅")
            uploaded += 1
            
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print("-" * 50)
    print(f"\n✅ Upload complete! {uploaded}/{len(FILES)} files uploaded")
    
    # List uploaded files
    print("\n📋 Files on server:")
    files = []
    ftp.retrlines('LIST', files.append)
    for f in files:
        if '.html' in f:
            print(f"   {f}")
    
    # Close connection
    ftp.quit()
    print("\n👋 Disconnected from server")
    
    print("\n" + "=" * 50)
    print("🎉 Deployment Successful!")
    print("=" * 50)
    print("\n🌐 Access your app at:")
    print("   https://creativepixels.in/Notes/login.html")
    print("\n🎯 Try Demo Mode:")
    print("   Click 'Try Demo Mode (No Login Required)'")
    print("\n🔐 Or setup Google OAuth:")
    print("   1. Go to: https://console.cloud.google.com/apis/credentials")
    print("   2. Edit Client: 264150556588-j05rnbhdtpsv0ha0la7g1v4479v5cm9l")
    print("   3. Add Authorized JavaScript origins:")
    print("      • https://creativepixels.in")
    print("   4. Add Authorized redirect URIs:")
    print("      • https://creativepixels.in/Notes/login.html")
    print("      • https://creativepixels.in/Notes/dashboard.html")
    print("   5. Save changes")
    print("\n✨ Done!\n")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    print("\nTroubleshooting:")
    print("• Check internet connection")
    print("• Verify FTP credentials")
    print("• Make sure PixelNotes folder exists")
    sys.exit(1)
