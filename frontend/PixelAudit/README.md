# 🎯 PixelAudit - Smart Audit Management Platform

**Audit Anything, Anywhere, Anytime**

A mobile-first audit management platform for businesses. Assign audits via WhatsApp, complete checklists on mobile, and generate professional PDF reports instantly.

![Version](https://img.shields.io/badge/version-1.0.0-black)
![Status](https://img.shields.io/badge/status-production--ready-success)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## ✨ Features

- 🔐 **Google OAuth & Email Login** - Secure authentication
- 📱 **Mobile-First Design** - Works perfectly on phones
- 📷 **Photo Upload** - Capture evidence with camera
- 📊 **Real-time Scoring** - Instant compliance calculation
- 🎯 **9 Templates** - Restaurant, Warehouse, Retail, Hotel, etc.
- 💾 **Firebase Backend** - Real-time database & storage
- 📈 **Analytics Dashboard** - Track performance & trends
- 📄 **PDF Reports** - Professional audit reports
- ⚡ **Offline Support** - Work without internet

---

## 🚀 Quick Start

### For Users (Marketing Link)

**Live Demo:** [https://pixelaudit.netlify.app](https://pixelaudit.netlify.app)

1. Click **"Start Free Trial"**
2. Sign in with Google
3. Get 1-hour free trial
4. Upgrade for ₹1 (lifetime access to 9 audits)

---

### For Developers (Setup Locally)

**1. Clone Repository**
```bash
git clone https://github.com/YOUR_USERNAME/pixelaudit.git
cd pixelaudit
```

**2. Setup Firebase**
- Follow instructions in `FIREBASE_SETUP.md`
- Get config from Firebase Console
- Update `assets/js/firebase-config.js`

**3. Test Locally**
```bash
# Open index.html in browser
open index.html

# Or use live server
python -m http.server 8000
# Visit: http://localhost:8000
```

**4. Deploy to Netlify**
```bash
./deploy.sh
```

---

## 📂 Project Structure

```
PixelAudit/
├── index.html                 # Landing page
├── login.html                 # Authentication
├── dashboard.html             # Main dashboard
├── templates.html             # Audit templates
├── audit-form.html            # Dynamic audit form
├── clients.html               # Client management
├── auditors.html              # Auditor management
├── reports.html               # Analytics & reports
├── settings.html              # Account settings
│
├── assets/
│   ├── css/
│   │   ├── global.css         # Theme & variables
│   │   └── landing.css        # Landing page styles
│   │
│   ├── js/
│   │   ├── firebase-config.js # Firebase setup
│   │   └── components.js      # Reusable components
│   │
│   └── images/                # Icons & illustrations
│
├── templates/
│   ├── restaurant-safety.json # 40-item checklist
│   ├── warehouse-compliance.json
│   └── retail-store.json
│
├── FIREBASE_SETUP.md          # Firebase configuration guide
├── deploy.sh                  # Deployment script
└── README.md                  # This file
```

---

## 🎨 Tech Stack

**Frontend:**
- HTML5, CSS3, JavaScript (Vanilla)
- Black & White minimal design
- Mobile-first responsive

**Backend:**
- Firebase Authentication (Google OAuth)
- Cloud Firestore (NoSQL database)
- Firebase Storage (Photo uploads)
- Firebase Hosting (optional)

**Deployment:**
- Netlify (recommended)
- Vercel (alternative)
- Firebase Hosting (alternative)

---

## 💰 Pricing

| Plan | Price | Audits | Features |
|------|-------|--------|----------|
| **Free Trial** | ₹0 | Unlimited (1 hour) | All features |
| **Lifetime** | ₹1 | 9 audits | All templates, Photo upload |
| **Professional** | ₹100 | 100 audits | + Analytics, PDF export |
| **Enterprise** | ₹1,000 | Unlimited | + Custom templates, API access |

---

## 📱 Screenshots

### Landing Page
Clean, professional design that converts visitors to users.

### Dashboard
Quick stats, recent audits, category selection.

### Audit Form
Mobile-optimized checklist with Pass/Fail/N/A buttons and photo upload.

### Reports
Analytics with filters, score tracking, and export options.

---

## 🔧 Configuration

### Firebase Config
Update `assets/js/firebase-config.js` with your Firebase credentials:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### Firestore Collections
- `users` - User profiles & trial info
- `clients` - Customer database
- `auditors` - Team members
- `audits` - Audit records with responses
- `templates` - Checklist templates

---

## 📖 Usage

### For Audit Managers (Web)
1. Login to dashboard
2. Select audit category
3. Choose template
4. Assign to auditor (WhatsApp link)
5. Review completed audits
6. Approve & generate PDF

### For Auditors (Mobile)
1. Click WhatsApp link
2. Open audit form
3. Answer checklist (Yes/No/N/A)
4. Upload photos
5. Add notes
6. Submit audit

---

## 🚀 Deployment

### Deploy to Netlify (Recommended)

**Option 1: Drag & Drop**
1. Go to [Netlify](https://netlify.com)
2. Drag `PixelAudit` folder
3. Live in 30 seconds!

**Option 2: GitHub Integration**
```bash
./deploy.sh
# Follow prompts
```

Then:
1. Go to Netlify → New site from Git
2. Connect GitHub repo
3. Deploy!

### Custom Domain
1. Buy domain (₹800/year)
2. Add to Netlify
3. SSL auto-configured ✅

---

## 📈 Marketing Strategy

### Target Audience
- Audit firms
- Compliance managers
- Quality assurance teams
- Restaurant/Hotel owners
- Warehouse managers
- Retail chains

### Marketing Channels
1. **LinkedIn** - Post demo video
2. **Google Ads** - Target "audit software"
3. **Email** - Reach out to audit firms
4. **WhatsApp Business** - Direct outreach
5. **SEO** - Blog about audit best practices

### Demo Credentials
```
Email: demo@pixelaudit.com
Password: demo123
```

---

## 🔐 Security

- ✅ Firebase Authentication (Google OAuth)
- ✅ Firestore Security Rules (user-based access)
- ✅ Storage Rules (5MB file limit, images only)
- ✅ HTTPS enforced (via Netlify/Firebase)
- ✅ XSS protection (input sanitization)

---

## 📞 Support

**Email:** support@pixelaudit.com  
**WhatsApp:** +91 XXXXX XXXXX  
**Docs:** [FIREBASE_SETUP.md](FIREBASE_SETUP.md)

---

## 📝 License

MIT License - Free to use for personal and commercial projects.

---

## 🙏 Credits

**Built by:** Pixel Ecosystem Team  
**Design:** Black & White minimal theme  
**Icons:** Feather Icons  
**Fonts:** Inter (Google Fonts)

---

## 🎯 Roadmap

### Phase 1 (Current) ✅
- [x] Landing page
- [x] Authentication
- [x] Dashboard
- [x] 9 Templates
- [x] Dynamic audit form
- [x] Photo upload
- [x] Real-time scoring
- [x] Firebase integration

### Phase 2 (Next) 🚧
- [ ] PDF report generation
- [ ] Email notifications
- [ ] WhatsApp integration
- [ ] Custom template builder
- [ ] Advanced analytics
- [ ] Mobile app (React Native)

### Phase 3 (Future) 📋
- [ ] API access
- [ ] Integrations (Zapier, etc.)
- [ ] White-label solution
- [ ] Multi-language support
- [ ] AI-powered insights

---

## 🎉 Go Live!

**You're ready to launch!**

1. ✅ Setup Firebase (15 min) - Follow `FIREBASE_SETUP.md`
2. ✅ Deploy to Netlify (5 min) - Run `./deploy.sh`
3. ✅ Share your link - Start marketing!

**Your live URL:** `https://pixelaudit.netlify.app`

---

**Made with ❤️ by Pixel Ecosystem**
