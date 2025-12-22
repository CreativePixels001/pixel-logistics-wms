# WMS Production Deployment Guide
**Target:** wms.creativepixels.in  
**Date:** December 7, 2025  
**Purpose:** Deploy WMS Application for Client Demo

---

## 🎯 Deployment Overview

### What We're Deploying
- **Complete WMS Application** with all 70+ HTML pages
- **Blog System** with 12 detailed articles and Unsplash grayscale images
- **CSS/JS Assets** for functionality and styling
- **Images & Icons** for professional UI
- **Landing Page** for client demonstration

### Target Server
- **Host:** 68.178.157.215
- **Protocol:** FTP
- **Directory:** `/wms.creativepixels.in/`
- **Live URL:** http://wms.creativepixels.in/

---

## 📋 Step-by-Step Deployment Process

### **Step 1: Pre-Deployment Preparation** ✅

**Check your current directory:**
```bash
pwd
# Should show: /Users/ashishkumar2/Documents/Deloitte/DEV Project./Pixel ecosystem
```

**Navigate to project root if needed:**
```bash
cd "/Users/ashishkumar2/Documents/Deloitte/DEV Project./Pixel ecosystem"
```

**Verify files exist:**
```bash
ls frontend/WMS/*.html | wc -l
# Should show 70+ HTML files

ls frontend/css/*.css | wc -l
# Should show CSS files

ls frontend/js/*.js | wc -l
# Should show JavaScript files
```

---

### **Step 2: Choose Deployment Method**

#### **Option A: Full Deployment Script (Recommended for first-time)**
```bash
chmod +x deploy-wms-to-cpx.sh
./deploy-wms-to-cpx.sh
```

**What this does:**
- ✅ Creates deployment package
- ✅ Shows file summary
- ✅ Asks for confirmation
- ✅ Uploads all files with progress
- ✅ Provides detailed output
- ✅ Shows success/failure for each file

**Duration:** 3-5 minutes (depending on connection)

---

#### **Option B: Quick Deployment (Faster)**
```bash
chmod +x quick-deploy-wms.sh
./quick-deploy-wms.sh
```

**What this does:**
- ✅ Fast automated upload
- ✅ Minimal output
- ✅ No confirmation needed

**Duration:** 1-2 minutes

---

#### **Option C: Manual FTP Upload (For specific files)**

**Test connection first:**
```bash
curl --user "akshay@creativepixels.in:_ad,B;7}FZhC" \
  ftp://68.178.157.215/wms.creativepixels.in/ -s
```

**Upload single file:**
```bash
curl --ftp-create-dirs \
  -T frontend/WMS/landing.html \
  --user "akshay@creativepixels.in:_ad,B;7}FZhC" \
  ftp://68.178.157.215/wms.creativepixels.in/landing.html
```

**Upload directory:**
```bash
cd frontend/WMS
for file in *.html; do
  curl --ftp-create-dirs -T "$file" \
    --user "akshay@creativepixels.in:_ad,B;7}FZhC" \
    ftp://68.178.157.215/wms.creativepixels.in/$file
done
```

---

### **Step 3: Verify Deployment**

**Check uploaded files on server:**
```bash
curl --user "akshay@creativepixels.in:_ad,B;7}FZhC" \
  ftp://68.178.157.215/wms.creativepixels.in/ -s | grep ".html"
```

**Check CSS directory:**
```bash
curl --user "akshay@creativepixels.in:_ad,B;7}FZhC" \
  ftp://68.178.157.215/wms.creativepixels.in/css/ -s
```

**Check JS directory:**
```bash
curl --user "akshay@creativepixels.in:_ad,B;7}FZhC" \
  ftp://68.178.157.215/wms.creativepixels.in/js/ -s
```

---

### **Step 4: Test the Live Application**

#### **Access Points:**
1. **Landing Page:** http://wms.creativepixels.in/landing.html
2. **Login Page:** http://wms.creativepixels.in/login.html
3. **Dashboard:** http://wms.creativepixels.in/index.html
4. **Blog System:** http://wms.creativepixels.in/blogs.html

#### **Test Checklist:**
- [ ] Landing page loads with animations
- [ ] Navigation menu works
- [ ] Login page displays correctly
- [ ] Dashboard opens after login
- [ ] Sidebar navigation functional
- [ ] Blog listing page shows all 12 blogs with grayscale images
- [ ] Individual blog articles open correctly
- [ ] Audio player works on blog posts
- [ ] All CSS/JS assets load (check browser console)
- [ ] Images display correctly
- [ ] Mobile responsiveness works

---

## 🎨 What's Being Deployed

### **HTML Pages (70+ files)**
```
Landing & Auth:
- landing.html (Main entry point)
- login.html
- register.html

Dashboard:
- index.html (Main dashboard)
- unified-dashboard.html
- analytics-dashboard.html

Warehouse Operations:
- inventory.html
- receiving.html
- putaway.html
- picking.html
- packing.html
- shipping.html
- cycle-count.html
- replenishment.html
- returns.html

Orders & Shipments:
- orders.html
- create-order.html
- shipment-tracking.html
- track-shipment.html

Advanced Features:
- kitting.html
- crossdock.html
- slotting.html
- yard-management.html
- dock-scheduling.html

Mobile Apps:
- mobile-picking.html
- mobile-receiving.html
- mobile-count.html

Blogs (NEW):
- blogs.html (Listing with grayscale images)
- blog-detail.html (12 complete articles)

Admin:
- user-management.html
- reports.html
- settings pages...
```

### **CSS Files**
```
frontend/css/
- styles.css (Main stylesheet)
- responsive.css
- animations.css
- blog-styles.css
- dashboard.css
- mobile.css
- ... and more
```

### **JavaScript Files**
```
frontend/js/
- main.js
- auth.js
- dashboard.js
- sidebar.js
- blog.js
- enhanced-table.js
- ... and more
```

### **Assets**
```
frontend/images/
- logos
- icons
- illustrations

frontend/assets/
- fonts
- animations
- additional resources
```

---

## 🔧 Troubleshooting

### **Issue: Files not uploading**
**Solution:**
```bash
# Check FTP connection
curl -v --user "akshay@creativepixels.in:_ad,B;7}FZhC" \
  ftp://68.178.157.215/ 2>&1 | grep "230"

# Should see: "230 OK. Current restricted directory is /"
```

### **Issue: CSS/JS not loading on live site**
**Solution:**
1. Check file paths in HTML are relative (not absolute)
2. Verify CSS/JS directories uploaded correctly
3. Check browser console for 404 errors
4. Ensure directory structure matches local

### **Issue: Images not displaying**
**Solution:**
1. Verify images directory uploaded
2. Check image paths in HTML/CSS
3. Ensure Unsplash URLs are accessible (for blog images)
4. Test image URLs directly in browser

### **Issue: 404 on landing page**
**Solution:**
```bash
# Create .htaccess for default page
echo 'DirectoryIndex landing.html index.html' > .htaccess

# Upload .htaccess
curl --ftp-create-dirs -T .htaccess \
  --user "akshay@creativepixels.in:_ad,B;7}FZhC" \
  ftp://68.178.157.215/wms.creativepixels.in/.htaccess
```

---

## 📱 Client Demo Preparation

### **Demo URLs to Share:**
```
Main Application:
http://wms.creativepixels.in/landing.html

Login (Demo):
http://wms.creativepixels.in/login.html
Email: demo@creativepixels.in
Password: demo123

Dashboard:
http://wms.creativepixels.in/index.html

Blog System:
http://wms.creativepixels.in/blogs.html
```

### **Demo Flow Suggestion:**
1. **Start at Landing Page** - Show professional design
2. **Navigate to Login** - Demonstrate authentication
3. **Dashboard Tour** - Show key metrics and analytics
4. **Warehouse Operations** - Demo inventory, receiving, picking
5. **Blog System** - Show 12 detailed articles with images
6. **Mobile Apps** - Demonstrate responsive design
7. **Reports & Analytics** - Show business intelligence

### **Key Selling Points:**
- ✅ **Complete WMS Solution** - All warehouse operations covered
- ✅ **Professional Design** - Black & white theme, modern UI
- ✅ **Blog System** - 12 detailed industry articles (~24,000 words)
- ✅ **Mobile Ready** - Responsive design + dedicated mobile apps
- ✅ **Rich Features** - 70+ pages covering every aspect
- ✅ **Real-time Updates** - Live dashboards and analytics
- ✅ **Educational Content** - Demonstrates expertise

---

## 🔄 Update Process (After Initial Deployment)

### **Update Single Page:**
```bash
curl --ftp-create-dirs \
  -T frontend/WMS/[filename].html \
  --user "akshay@creativepixels.in:_ad,B;7}FZhC" \
  ftp://68.178.157.215/wms.creativepixels.in/[filename].html
```

### **Update Blog System:**
```bash
# Update blog listing
curl --ftp-create-dirs -T frontend/WMS/blogs.html \
  --user "akshay@creativepixels.in:_ad,B;7}FZhC" \
  ftp://68.178.157.215/wms.creativepixels.in/blogs.html

# Update blog detail page
curl --ftp-create-dirs -T frontend/WMS/blog-detail.html \
  --user "akshay@creativepixels.in:_ad,B;7}FZhC" \
  ftp://68.178.157.215/wms.creativepixels.in/blog-detail.html
```

### **Update CSS/JS:**
```bash
# Upload updated CSS
curl --ftp-create-dirs -T frontend/css/styles.css \
  --user "akshay@creativepixels.in:_ad,B;7}FZhC" \
  ftp://68.178.157.215/wms.creativepixels.in/css/styles.css

# Upload updated JS
curl --ftp-create-dirs -T frontend/js/main.js \
  --user "akshay@creativepixels.in:_ad,B;7}FZhC" \
  ftp://68.178.157.215/wms.creativepixels.in/js/main.js
```

---

## ✅ Post-Deployment Checklist

- [ ] All HTML pages accessible
- [ ] CSS styling applied correctly
- [ ] JavaScript functionality working
- [ ] Images loading properly
- [ ] Blog images (Unsplash) displaying with grayscale
- [ ] Navigation between pages smooth
- [ ] Mobile responsive design working
- [ ] No console errors in browser
- [ ] Demo credentials working
- [ ] Shared demo URL with team

---

## 📊 Deployment Statistics

**Total Files:**
- HTML: ~70 pages
- CSS: ~25 files
- JS: ~30 files
- Images: ~50+ files
- Blog Content: 12 articles (~24,000 words)

**Total Size:** ~15-20 MB

**Deployment Time:** 3-5 minutes

**Live URL:** http://wms.creativepixels.in/

---

## 🎉 Success Criteria

✅ **Application Deployed Successfully**  
✅ **All Pages Accessible**  
✅ **Blog System with 12 Articles Live**  
✅ **Professional Grayscale Images Working**  
✅ **Ready for Client Demonstration**  
✅ **Demo Link Shareable**

---

**Last Updated:** December 7, 2025  
**Deployment Target:** wms.creativepixels.in  
**Status:** Ready for Production Deployment
