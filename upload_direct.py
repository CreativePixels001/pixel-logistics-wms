#!/usr/bin/env python3
"""
Upload to root public_html (no subdirectory) to test
"""

from ftplib import FTP
import os

FTP_HOST = "68.178.157.215"
FTP_USER = "akshay@creativepixels.in"
FTP_PASS = "_ad,B;7}FZhC"
LOCAL_DIR = "./PixelNotes"

print("🚀 Uploading directly to public_html root...")

try:
    ftp = FTP(FTP_HOST)
    ftp.login(FTP_USER, FTP_PASS)
    print("✅ Connected!")
    
    # Go to public_html
    ftp.cwd('public_html')
    print(f"📂 Current: {ftp.pwd()}")
    
    # Create Notes subdirectory
    try:
        ftp.mkd('Notes')
        print("✅ Created Notes directory")
    except:
        print("⚠️  Notes directory already exists")
    
    ftp.cwd('Notes')
    print(f"📂 Now in: {ftp.pwd()}")
    
    # Upload files
    files = ['login.html', 'dashboard.html', 'editor.html', 'landing.html']
    
    print("\n📤 Uploading files...")
    for filename in files:
        filepath = os.path.join(LOCAL_DIR, filename)
        if os.path.exists(filepath):
            with open(filepath, 'rb') as f:
                ftp.storbinary(f'STOR {filename}', f)
            print(f"   ✅ {filename}")
    
    # List what's there
    print("\n📁 Files in Notes directory:")
    files = []
    ftp.retrlines('LIST', files.append)
    for f in files:
        print(f"   {f}")
    
    # Get full path
    print(f"\n🎯 Full server path: {ftp.pwd()}")
    print(f"🌐 URL should be: https://creativepixels.in/Notes/login.html")
    
    ftp.quit()
    print("\n✅ Done!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
