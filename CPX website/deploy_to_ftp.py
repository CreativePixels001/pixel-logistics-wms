#!/usr/bin/env python3
"""
CPX Website FTP Deployment Script
Uploads website files to CreativePixels hosting server
"""

from ftplib import FTP
import os
import sys
from pathlib import Path

# FTP Configuration
FTP_HOST = "68.178.157.215"
FTP_USER = "akshay@creativepixels.in"
FTP_PASS = "_ad,B;7}FZhC"
REMOTE_DIR = "/public_html"  # Target directory on server

# Local paths
CURRENT_DIR = Path(__file__).parent

# Files and directories to upload
FILES_TO_UPLOAD = [
    # Core HTML files
    "index.html",
    "ecosystem.html",
    "studio.html",
    "pixel-world.html",
    "pixelgram.html",
    "pixelverse.html",
    "home.html",
    "get-in-touch.html",
    
    # Solution pages
    "wms-solution.html",
    "tms-solution.html",
    "pis-solution.html",
    
    # Design pages
    "ancient-design.html",
    "color-theory.html",
    "styles.html",
    "vedic-wisdom.html",
    
    # Config files
    ".htaccess",
    "site.webmanifest",
    
    # Favicons
    "favicon.ico",
    "favicon-16x16.png",
    "favicon-32x32.png",
    "apple-touch-icon.png",
    "android-chrome-192x192.png",
    "android-chrome-512x512.png",
]

DIRS_TO_UPLOAD = [
    "css",
    "js",
    "images",
]

# Files to skip
SKIP_FILES = [
    ".DS_Store",
    ".git",
    "node_modules",
    "__pycache__",
    "*.py",
    "*.pyc",
    "*.md",
    "*.sh",
    "archive",
    "Low",
    "Projects",
]

def should_skip(path):
    """Check if file/directory should be skipped"""
    name = os.path.basename(path)
    for skip in SKIP_FILES:
        if skip.startswith('*'):
            if name.endswith(skip[1:]):
                return True
        elif name == skip:
            return True
    return False

def upload_file(ftp, local_path, remote_path):
    """Upload a single file to FTP"""
    try:
        with open(local_path, 'rb') as f:
            ftp.storbinary(f'STOR {remote_path}', f)
        file_size = os.path.getsize(local_path)
        print(f"  ✅ {remote_path} ({file_size:,} bytes)")
        return True
    except Exception as e:
        print(f"  ❌ {remote_path} - Error: {e}")
        return False

def upload_directory(ftp, local_dir, remote_dir):
    """Recursively upload directory to FTP"""
    uploaded = 0
    failed = 0
    
    print(f"\n📁 Uploading directory: {local_dir}")
    
    # Create remote directory if it doesn't exist
    try:
        ftp.mkd(remote_dir)
        print(f"  📂 Created: {remote_dir}")
    except:
        pass  # Directory might already exist
    
    # Get all files in directory
    for item in os.listdir(local_dir):
        if should_skip(item):
            continue
            
        local_path = os.path.join(local_dir, item)
        remote_path = f"{remote_dir}/{item}"
        
        if os.path.isfile(local_path):
            if upload_file(ftp, local_path, remote_path):
                uploaded += 1
            else:
                failed += 1
        elif os.path.isdir(local_path):
            # Recursively upload subdirectory
            sub_uploaded, sub_failed = upload_directory(ftp, local_path, remote_path)
            uploaded += sub_uploaded
            failed += sub_failed
    
    return uploaded, failed

def deploy_website():
    """Main deployment function"""
    print("=" * 70)
    print("🚀 CPX WEBSITE DEPLOYMENT TO FTP")
    print("=" * 70)
    print(f"Source: {CURRENT_DIR}")
    print(f"Target: {FTP_HOST}{REMOTE_DIR}")
    print("=" * 70)
    
    total_uploaded = 0
    total_failed = 0
    
    try:
        # Connect to FTP
        print("\n🔌 Connecting to FTP server...")
        ftp = FTP(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)
        print("✅ Connected successfully!\n")
        
        # Change to target directory
        try:
            ftp.cwd(REMOTE_DIR)
            print(f"📂 Changed to directory: {REMOTE_DIR}\n")
        except:
            print(f"⚠️  Could not change to {REMOTE_DIR}, using root directory\n")
        
        # Upload individual files
        print("📄 Uploading HTML and config files...")
        print("-" * 70)
        for filename in FILES_TO_UPLOAD:
            local_path = CURRENT_DIR / filename
            if local_path.exists():
                if upload_file(ftp, str(local_path), filename):
                    total_uploaded += 1
                else:
                    total_failed += 1
            else:
                print(f"  ⚠️  Skipped: {filename} (not found)")
        
        # Upload directories
        for dirname in DIRS_TO_UPLOAD:
            local_dir = CURRENT_DIR / dirname
            if local_dir.exists() and local_dir.is_dir():
                uploaded, failed = upload_directory(ftp, str(local_dir), dirname)
                total_uploaded += uploaded
                total_failed += failed
            else:
                print(f"\n⚠️  Skipped directory: {dirname} (not found)")
        
        # Close FTP connection
        ftp.quit()
        
        # Summary
        print("\n" + "=" * 70)
        print("📊 DEPLOYMENT SUMMARY")
        print("=" * 70)
        print(f"✅ Files uploaded successfully: {total_uploaded}")
        print(f"❌ Files failed: {total_failed}")
        print(f"📈 Success rate: {(total_uploaded/(total_uploaded+total_failed)*100):.1f}%" if (total_uploaded + total_failed) > 0 else "N/A")
        print("=" * 70)
        
        if total_failed == 0:
            print("\n🎉 DEPLOYMENT SUCCESSFUL!")
            print(f"\n🌐 Your website should be live at:")
            print(f"   http://creativepixels.in")
            print(f"   or check the IP: http://{FTP_HOST}")
        else:
            print(f"\n⚠️  DEPLOYMENT COMPLETED WITH {total_failed} ERRORS")
            print("   Please check the error messages above")
        
        print("\n" + "=" * 70)
        return total_failed == 0
        
    except Exception as e:
        print(f"\n❌ DEPLOYMENT FAILED: {e}")
        print("=" * 70)
        return False

if __name__ == "__main__":
    success = deploy_website()
    sys.exit(0 if success else 1)
