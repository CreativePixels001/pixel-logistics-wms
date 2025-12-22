#!/usr/bin/env python3
"""
Check FTP directory structure and upload to correct path
"""

from ftplib import FTP
import os

FTP_HOST = "68.178.157.215"
FTP_USER = "akshay@creativepixels.in"
FTP_PASS = "_ad,B;7}FZhC"

print("🔍 Checking FTP directory structure...")

try:
    ftp = FTP(FTP_HOST)
    ftp.login(FTP_USER, FTP_PASS)
    print("✅ Connected!")
    
    print(f"\n📂 Current directory: {ftp.pwd()}")
    
    print("\n📁 Listing root directory:")
    files = []
    ftp.retrlines('LIST', files.append)
    for f in files:
        print(f"   {f}")
    
    # Try to find public_html
    print("\n🔍 Looking for public_html or web directories...")
    
    try:
        ftp.cwd('public_html')
        print(f"✅ Found public_html at: {ftp.pwd()}")
        files = []
        ftp.retrlines('LIST', files.append)
        print("\n📁 Contents of public_html:")
        for f in files:
            print(f"   {f}")
    except:
        print("⚠️  No public_html in root")
        
        # Try www
        try:
            ftp.cwd('/')
            ftp.cwd('www')
            print(f"✅ Found www at: {ftp.pwd()}")
        except:
            print("⚠️  No www in root")
            
            # Try htdocs
            try:
                ftp.cwd('/')
                ftp.cwd('htdocs')
                print(f"✅ Found htdocs at: {ftp.pwd()}")
            except:
                print("⚠️  No htdocs in root")
    
    ftp.quit()
    
except Exception as e:
    print(f"❌ Error: {e}")
