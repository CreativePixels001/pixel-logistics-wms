# Pixel Music - Deployment Guide

## Files to Upload to creativepixels.in

Upload these files to your FTP server:

```
✅ index.html       (Main app page)
✅ style.css        (All styling)
✅ app.js           (Application logic)
✅ auth.js          (Authentication)
✅ config.js        (API keys - IMPORTANT!)
✅ README.md        (Documentation)
```

**DO NOT upload:**
- `.gitignore`
- `config.example.js`

---

## FTP Upload Instructions

### Using FileZilla (Recommended):

1. **Download FileZilla**: https://filezilla-project.org/

2. **Connect to Server**:
   - Host: `68.178.157.215`
   - Username: `akshay@creativepixels.in`
   - Password: `_ad,B;7}FZhC`
   - Port: `21`

3. **Create Folder Structure**:
   - Navigate to your web root (usually `public_html` or `www`)
   - Create a new folder: `pixel-music` or `music`

4. **Upload Files**:
   - Drag and drop all 6 files listed above into the folder

5. **Set Permissions** (if needed):
   - All files should be `644` (readable)

---

## After Upload - Configure Google Cloud

### 1. Update YouTube API Restrictions

Go to: https://console.cloud.google.com/apis/credentials

1. Find your API key: `PixelMusic`
2. Under **"Application restrictions"** → **"Websites"**
3. Add:
   ```
   https://creativepixels.in/*
   https://www.creativepixels.in/*
   ```
4. Click **Save**
5. Wait 2-3 minutes for changes to propagate

### 2. Update OAuth Authorized Origins

1. Find OAuth Client ID: `469366716838-3140k3fu6lqrrj7uvfv11u8a29jdsrvb`
2. Under **"Authorized JavaScript origins"**, add:
   ```
   https://creativepixels.in
   https://www.creativepixels.in
   ```
3. Under **"Authorized redirect URIs"**, add:
   ```
   https://creativepixels.in
   https://www.creativepixels.in
   ```
4. Click **Save**

---

## Access Your App

Once uploaded, access at:
- `https://creativepixels.in/pixel-music/` (or whatever folder you created)
- Or `https://creativepixels.in/music/`

---

## Testing Checklist

After deployment, test these features:

- ✅ Google Login works
- ✅ YouTube search returns results
- ✅ Songs play properly
- ✅ Local file upload works
- ✅ Fullscreen mode works
- ✅ All controls function (play/pause, volume, etc.)

---

## Troubleshooting

**If YouTube search doesn't work:**
1. Wait 5-10 minutes for API restrictions to update
2. Check browser console for detailed error messages
3. Verify domain is added to API restrictions

**If Google Login doesn't work:**
1. Verify authorized origins are set correctly
2. Clear browser cache
3. Try in incognito mode

---

## Support

All features work on production server!
The localhost errors will NOT appear on creativepixels.in.
