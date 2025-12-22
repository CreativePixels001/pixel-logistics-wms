#!/usr/bin/env python3
"""
Find the correct web root directory
"""

from ftplib import FTP

FTP_HOST = "68.178.157.215"
FTP_USER = "akshay@creativepixels.in"
FTP_PASS = "_ad,B;7}FZhC"

print("🔍 Finding correct web directory...")

try:
    ftp = FTP(FTP_HOST)
    ftp.login(FTP_USER, FTP_PASS)
    
    print(f"\n📂 Root directory: {ftp.pwd()}")
    print("\n📁 Root contents:")
    files = []
    ftp.retrlines('LIST', files.append)
    for f in files:
        print(f"   {f}")
    
    # Check common web directories
    web_dirs = ['public_html', 'www', 'htdocs', 'html', 'web', 'public']
    
    print("\n🔍 Checking for web directories...")
    for dir_name in web_dirs:
        try:
            ftp.cwd('/')
            ftp.cwd(dir_name)
            print(f"\n✅ Found: {dir_name} at {ftp.pwd()}")
            
            # List contents
            files = []
            ftp.retrlines('LIST', files.append)
            print(f"📁 Contents of {dir_name}:")
            for f in files[:10]:  # Show first 10 items
                print(f"   {f}")
            
            # Check if index.html or other files exist
            if any('index.html' in f or 'index.php' in f for f in files):
                print(f"\n🎯 This looks like the web root!")
                
        except:
            print(f"   ❌ No {dir_name}")
    
    # Check current Notes folder
    print("\n🔍 Checking uploaded Notes folder...")
    try:
        ftp.cwd('/')
        ftp.cwd('public_html/Notes')
        print(f"✅ Found Notes at: {ftp.pwd()}")
        files = []
        ftp.retrlines('LIST', files.append)
        print("📁 Files in Notes:")
        for f in files:
            print(f"   {f}")
    except Exception as e:
        print(f"❌ Error accessing Notes: {e}")
    
    ftp.quit()
    
except Exception as e:
    print(f"❌ Error: {e}")
