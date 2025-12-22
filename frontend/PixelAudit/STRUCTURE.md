# PixelAudit - Frontend Structure

**Created:** December 9, 2025  
**Theme:** Black/White Royal with 2-4px Border Radius

---

## 📁 Folder Structure

```
frontend/PixelAudit/
├── index.html                  (Landing Page - Marketing)
├── login.html                  (Google OAuth Login)
├── dashboard.html              (Admin Dashboard - Category Selection)
├── audit-library.html          (Audit Templates Library)
├── create-audit.html           (Start New Audit - Assignment)
├── audit-form.html             (Mobile Audit Form - For Auditors)
├── review-audit.html           (Admin Review & Approval)
├── clients.html                (Client Management)
├── reports.html                (Analytics & Reports)
├── pricing.html                (Payment Plans)
├── settings.html               (Account Settings)
│
├── assets/
│   ├── css/
│   │   ├── global.css          (Theme, Variables, Base Styles)
│   │   ├── landing.css         (Landing Page Styles)
│   │   ├── dashboard.css       (Dashboard Styles)
│   │   ├── audit-form.css      (Mobile Form Styles)
│   │   └── components.css      (Reusable Components)
│   │
│   ├── js/
│   │   ├── auth.js             (Google OAuth, JWT, Session)
│   │   ├── dashboard.js        (Dashboard Logic)
│   │   ├── audit-manager.js    (Create, Assign, Submit Audits)
│   │   ├── review.js           (Admin Review Logic)
│   │   ├── payment.js          (Razorpay Integration)
│   │   ├── utils.js            (Helper Functions)
│   │   └── toast.js            (Toast Notifications)
│   │
│   └── images/
│       ├── logo.svg
│       ├── icons/
│       └── illustrations/
│
└── templates/
    ├── restaurant-audit.json   (Restaurant Safety Checklist)
    ├── warehouse-audit.json    (Warehouse Compliance Checklist)
    └── retail-audit.json       (Retail Store Checklist)
```

---

## 📄 Page Breakdown (11 Pages)

### **1. index.html** (Landing Page)
**Purpose:** Marketing page to explain PixelAudit and convert visitors  
**Sections:**
- Hero (Audit Anything, Anywhere, Anytime)
- Features (6 key features with icons)
- How It Works (3 steps)
- Pricing (₹1, ₹100, ₹1,000)
- Testimonials
- Footer
**CTA:** "Start Free Trial" → login.html

---

### **2. login.html** (Authentication)
**Purpose:** Google OAuth sign-in with 1-hour trial timer  
**Features:**
- Google Sign-In button
- Trial timer starts on login
- Redirect to dashboard.html after auth
- No traditional email/password (Google only for MVP)

---

### **3. dashboard.html** (Admin Dashboard)
**Purpose:** Main dashboard with category selection  
**Layout:**
- Sidebar: Dashboard, Audits, Clients, Reports, Settings
- Header: User profile, notifications, trial timer
- Main Content:
  - Quick stats (Total Audits, Pending, Completed, Clients)
  - 5 Category cards:
    1. Travel ✈️ (App, Driver, Vehicle, Trip)
    2. Logistics 📦 (Warehouse, Driver, Vehicle, Trip, Safety)
    3. Enterprise 🏢 (Process, Employee, HR, IT, Security)
    4. Retail 🛒 (Store, Staff, Inventory, Customer)
    5. Admin 📋 (Document, Compliance, Finance, Legal)
  - Recent activity feed
**Action:** Click category → audit-library.html

---

### **4. audit-library.html** (Template Library)
**Purpose:** Show all audit templates for selected category  
**Layout:**
- Breadcrumb: Dashboard > Category > Templates
- Grid of audit templates (cards)
- Each card shows:
  - Template icon
  - Template name (e.g., "Restaurant Safety Audit")
  - Item count (40 items)
  - Description
  - "View" and "Start Audit" buttons
**Action:** Click "Start Audit" → create-audit.html

---

### **5. create-audit.html** (Assignment Form)
**Purpose:** Assign audit to auditor or self  
**Layout:**
- Modal overlay on audit-library.html
- Form fields:
  - Client (dropdown or add new)
  - Location/Address
  - Assign to (dropdown: auditors or "Self Audit")
  - Due date
  - Notes/Instructions
- Preview selected template checklist
**Actions:**
- "Cancel" → Back to library
- "Assign Audit" → Send WhatsApp → Confirmation toast → Dashboard

---

### **6. audit-form.html** (Mobile Audit Interface)
**Purpose:** Auditor completes audit on mobile browser (no login)  
**URL:** pixelaudit.com/audit/{unique-id}  
**Layout:**
- Header: Client name, location, assigned by
- Progress: 15/50 items completed (visual bar)
- Checklist:
  - Large checkboxes (Yes/No/N/A buttons)
  - Photo upload button (camera icon)
  - Notes field
  - Critical flag
- Floating "Save Progress" button
- "Submit Audit" button (after all mandatory items)
**Features:**
- Auto-save every 30 seconds (localStorage)
- Works offline (sync on network)
- Photo compression (max 1MB)
- Touch-optimized (44px minimum)

---

### **7. review-audit.html** (Admin Review)
**Purpose:** Admin reviews submitted audits and approves  
**Layout:**
- Left Panel: Audit details
  - Client, location, auditor, date
  - Pass/Fail/N/A summary
  - Overall progress
- Right Panel: Checklist with photos
  - Item-by-item review
  - Photos displayed inline
  - Admin comments on each item
- Bottom Actions:
  - "Approve" (generates PDF, emails client)
  - "Reject" (send feedback to auditor)
  - "Request Changes"

---

### **8. clients.html** (Client Management)
**Purpose:** Manage all clients (SBI, Mahindra, D-Mart, etc.)  
**Layout:**
- Table view:
  - Name, Email, Phone, Address, GST
  - Total Audits, Pending, Completed
  - Last Audit Date
- Actions: Add, Edit, Delete
- Search and filter
**Click client:** View profile with audit history

---

### **9. reports.html** (Analytics Dashboard)
**Purpose:** View audit analytics and insights  
**Charts:**
- Total audits over time (line chart)
- Pass rate by category (pie chart)
- Top issues/failures (bar chart)
- Auditor performance (table)
**Filters:** Date range, category, client, auditor  
**Export:** PDF or CSV download

---

### **10. pricing.html** (Payment Plans)
**Purpose:** Upgrade from free trial to paid tiers  
**Layout:**
- 3 pricing cards side-by-side:
  1. **Lifetime Access** - ₹1 (9 audits)
  2. **Professional** - ₹100 (100 audits)
  3. **Enterprise** - ₹1,000 (Unlimited + Custom)
- Feature comparison table
- "Upgrade Now" buttons → Razorpay checkout
**Triggers:**
- Trial expires (1 hour)
- Audit limit reached (9, 100)

---

### **11. settings.html** (Account Settings)
**Purpose:** Manage profile, team, integrations  
**Tabs:**
- Profile (name, email, photo)
- Team (add auditors, manage users)
- Notifications (email, WhatsApp preferences)
- Integrations (WhatsApp, email sync)
- Billing (payment history, upgrade)
- API Keys (for advanced users)

---

## 🎨 Design Theme Specification

### **Colors**
- **Primary:** #000000 (Black)
- **Background:** #FFFFFF (White)
- **Borders:** #DDDDDD (Light Gray)
- **Text:** #1A1A1A (Dark Gray)
- **Accents:** #FFD700 (Gold for premium)

### **Border Radius**
- **Small:** 2px (badges, inputs)
- **Medium:** 3px (buttons, cards)
- **Large:** 4px (modals, containers)

### **Typography**
- **Font:** Inter (Google Fonts)
- **Headings:** 800 weight (Black)
- **Body:** 400 weight (Regular)
- **Buttons:** 600 weight (SemiBold)

### **Spacing**
- Base unit: 4px
- Scale: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px

### **Components**
- Cards: White bg, 1px border, 4px radius, hover lift
- Buttons: Black bg, white text, 3px radius, hover scale
- Inputs: 1px border, 3px radius, focus outline
- Badges: 2px radius, uppercase, small

---

## 🔗 Page Flow (User Journeys)

### **Admin Journey (Vishal):**
```
Landing Page → Login (Google) → Dashboard
    ↓
Select Category (Logistics) → Audit Library
    ↓
Select Template (Warehouse Audit) → Create/Assign
    ↓
Fill form (Client: Mahindra, Auditor: Rajesh) → Send WhatsApp
    ↓
[Wait for auditor to complete]
    ↓
Review Audit → Approve → PDF Generated → Email to Client
```

### **Auditor Journey (Rajesh):**
```
WhatsApp Message → Click Link → Audit Form (Mobile)
    ↓
See Details (Client, Location, 50 items)
    ↓
Complete Checklist (Yes/No/N/A, Photos, Notes)
    ↓
Submit → Confirmation → Notify Admin
```

### **Trial to Paid Journey:**
```
Sign Up (Google) → 1hr Trial Starts → Use Features
    ↓
[Trial Expires] → Pricing Page → Pay ₹1 → Lifetime Access
    ↓
[9 Audits Used] → Pay ₹100 → Professional (100 audits)
    ↓
[101 Audits] → Pay ₹1,000 → Enterprise (Unlimited)
```

---

## ✅ Next Steps

**Today (Day 1):**
- [x] Create folder structure
- [x] Create global.css (theme variables, base styles)
- [ ] Create index.html (landing page structure)
- [ ] Create landing.css (landing page styles)
- [ ] Design category icons (5 SVGs)

**Tomorrow (Day 2):**
- [ ] Complete landing page (hero, features, pricing)
- [ ] Create login.html (Google OAuth button)
- [ ] Create dashboard.html structure
- [ ] Create dashboard.css

**This Week:**
- [ ] All 11 HTML pages structure complete
- [ ] Global theme applied to all pages
- [ ] Mobile responsive testing
- [ ] Start JavaScript functionality

---

**Theme:** Black/White Royal ✅  
**Border Radius:** 2-4px ✅  
**Pages:** 11 total ✅  
**Ready to build!** 🚀
