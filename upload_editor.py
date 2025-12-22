import ftplib
import os

FTP_HOST = '68.178.157.215'
FTP_USER = 'akshay@creativepixels.in'
FTP_PASS = '_ad,B;7}FZhC'

print('Uploading Editor.html')
print('=' * 60)

try:
    ftp = ftplib.FTP(FTP_HOST, FTP_USER, FTP_PASS)
    print('Connected to FTP')
    
    ftp.cwd('frontend/PixelNotes')
    
    # Upload editor.html
    print('\nUploading editor.html...')
    local_path = 'frontend/PixelNotes/editor.html'
    size = os.path.getsize(local_path)
    print(f'Size: {size:,} bytes')
    
    with open(local_path, 'rb') as f:
        ftp.storbinary('STOR editor.html', f)
    print('Upload complete!')
    
    ftp.quit()
    
    print('\n' + '=' * 60)
    print('SUCCESS!')
    print('Test: https://creativepixels.in/frontend/PixelNotes/editor.html')
    
except Exception as e:
    print(f'Error: {str(e)}')
    exit(1)
