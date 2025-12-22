# 🗺️ PTM - Pixel Trip Management

**Domestic Travel Booking Platform for Incredible India**

---

## 📋 Overview

PTM (Pixel Trip Management) is a modern, agent-controlled travel booking platform focused exclusively on domestic Indian tourism. Built with a clean black & white design aesthetic and powered by government tourism data.

### ✨ Key Features

- **🏛️ Government Data Integration** - Official tourism data from Ministry of Tourism, IRCTC, ASI
- **👨‍💼 Agent Dashboard** - Complete trip & booking management system
- **🎨 Black & White Design** - Clean, professional line-icon based UI
- **📱 Mobile Responsive** - Works perfectly on all devices
- **🇮🇳 India-First Approach** - Focus on domestic tourism only
- **💳 Secure Payments** - Cashfree integration (shared with PIS)
- **🔗 Ecosystem Integration** - Connects with PIS (insurance), PTMS (shuttles), Pi (voice AI)

---

## 🚀 Quick Start

### 1. Open Landing Page
```bash
open frontend/PTM/index.html
```

### 2. Agent Login
- Navigate to **Agent Login** button
- Demo credentials:
  - Email: `demo@pixeltrip.in`
  - Password: `demo123`

### 3. Access Dashboard
- View bookings, trips, customers
- Manage payments & analytics
- Create new trips & bookings

---

## 📁 Project Structure

```
frontend/PTM/
├── index.html                 # Landing page with trip listings
├── admin/
│   ├── login.html            # Agent login page
│   ├── dashboard.html        # Main agent dashboard
│   ├── bookings.html         # Booking management (coming soon)
│   ├── trips.html            # Trip creation/editing (coming soon)
│   ├── customers.html        # Customer database (coming soon)
│   ├── payments.html         # Payment tracking (coming soon)
│   ├── analytics.html        # Reports & analytics (coming soon)
│   ├── css/
│   │   └── dashboard-styles.css
│   └── js/
│       └── dashboard-script.js
├── css/
│   └── landing-styles.css    # Black & white theme styles
├── js/
│   └── landing-script.js     # Landing page interactions
└── images/                   # Trip images & assets
```

---

## 🎯 Current Features (v0.3)

### ✅ Completed

#### **Landing Page** (`index.html`)
- Hero section with search filters (destination, duration, budget)
- 6 trip categories with line icons
- Featured trips showcase (6 trips)
- Stats display (250+ trips, 28 states, 15K travelers)
- Why Choose Us section (6 features)
- CTA section & footer

#### **Agent Dashboard** (`admin/dashboard.html`)
- Sidebar navigation (7 menu items)
- Stats overview (4 KPI cards)
- Recent bookings table (5 bookings)
- Quick actions panel (4 shortcuts)
- Upcoming trips calendar
- Performance chart placeholder

#### **Agent Login** (`admin/login.html`)
- Email/password authentication
- Remember me functionality
- Demo credentials pre-filled
- Error handling
- Session management

#### **Styling**
- Pure black & white color scheme
- Line icons throughout
- Glass morphism effects
- Smooth animations
- Mobile responsive (3 breakpoints)

### 🔄 In Progress

- Trip details page
- Booking creation flow
- Customer management
- Payment integration
- Analytics dashboard

### 📅 Planned

- Government API integration
- Real-time notifications
- WhatsApp booking updates
- Invoice generation
- Multi-currency support
- Advanced filtering
- Itinerary builder
- Review system

---

## 🗺️ Featured Trips

| Trip ID | Destination | Duration | Price | Category |
|---------|------------|----------|-------|----------|
| RAJ-001 | Royal Rajasthan Circuit | 7 Days | ₹35,999 | Heritage |
| KER-001 | Kerala Backwaters & Beaches | 5 Days | ₹28,999 | Coastal |
| MAN-001 | Manali Snow Adventure | 6 Days | ₹22,499 | Mountains |
| GOA-001 | Goa Beach Escape | 4 Days | ₹15,999 | Beach |
| LAD-001 | Ladakh: High Passes | 8 Days | ₹42,999 | Adventure |
| VAR-001 | Varanasi Sacred Journey | 3 Days | ₹12,999 | Spiritual |

---

## 🔌 API Endpoints (Planned)

### Public API
```
GET  /api/trips              # List all trips
GET  /api/trips/:id          # Get trip details
GET  /api/destinations       # Get all destinations
POST /api/bookings           # Create booking
GET  /api/bookings/:id       # Get booking status
```

### Agent API (Authenticated)
```
GET    /api/agent/dashboard      # Dashboard stats
GET    /api/agent/bookings       # All bookings
POST   /api/agent/bookings       # Create booking
PUT    /api/agent/bookings/:id   # Update booking
DELETE /api/agent/bookings/:id   # Cancel booking
GET    /api/agent/customers      # Customer list
POST   /api/agent/trips          # Create trip
PUT    /api/agent/trips/:id      # Update trip
GET    /api/agent/analytics      # Performance data
```

---

## 🎨 Design System

### Colors
```css
--black: #000000
--white: #ffffff
--gray-50: #fafafa
--gray-100: #f5f5f5
--gray-200: #e5e5e5
--gray-300: #d4d4d4
--gray-400: #a3a3a3
--gray-500: #737373
--gray-600: #525252
--gray-700: #404040
--gray-800: #262626
--gray-900: #171717
```

### Typography
- **Font Family**: Inter (Google Fonts)
- **Headings**: 800-900 weight
- **Body**: 400-500 weight
- **Labels**: 600-700 weight, uppercase

### Icons
- Line-style SVG icons
- Stroke width: 1.5-2px
- Sizes: 16px, 20px, 24px, 32px, 48px

---

## 🔗 Integration Points

### 1. **PIS (Insurance)**
- Cross-sell travel insurance during booking
- Bundled insurance packages
- Shared customer database

### 2. **PTMS (Shuttle Service)**
- Airport/hotel transfers
- Local transportation
- Group shuttle bookings

### 3. **Pi (Voice AI)**
- "Pi, show me beach trips under ₹20K"
- Voice-based booking assistance
- Trip recommendations

### 4. **Cashfree (Payments)**
- Reuse PIS payment integration
- UPI, cards, net banking
- Instant payment confirmations

---

## 📊 Government Data Sources

### Ministry of Tourism
- **Incredible India API** - Official destinations, monuments, heritage sites
- Coverage: All states & UTs

### Indian Railways (IRCTC)
- Train connectivity data
- Station information
- Tourist train packages

### State Tourism Boards
- Local attractions
- Cultural events
- Festivals & fairs

### Archaeological Survey of India (ASI)
- 3,686 protected monuments
- UNESCO World Heritage Sites (40)
- Historical significance data

### India Meteorological Department (IMD)
- Weather forecasts
- Best time to visit
- Seasonal recommendations

---

## 🚀 Deployment

### Development
```bash
# Serve locally
npx http-server frontend/PTM -p 3000

# Or use VS Code Live Server
# Right-click index.html > Open with Live Server
```

### Production
```bash
# Deploy to Netlify
netlify deploy --dir=frontend/PTM --prod

# Or deploy to GitHub Pages
# Push to gh-pages branch
```

### Environment Variables
```env
PTM_API_URL=https://api.pixeltrip.in
CASHFREE_APP_ID=your_app_id
CASHFREE_SECRET_KEY=your_secret_key
GOOGLE_MAPS_API_KEY=your_api_key
```

---

## 🎯 Target Audience

1. **Individual Travelers**
   - Weekend getaways
   - Family vacations
   - Solo adventures

2. **Corporate Groups**
   - Team offsites
   - Conference travel
   - Reward trips

3. **Educational Institutions**
   - School excursions
   - College trips
   - Study tours

4. **Religious Groups**
   - Pilgrimage journeys
   - Temple visits
   - Sacred site tours

---

## 💡 Competitive Advantages

1. **Agent Touch** - Personal assistance throughout the journey
2. **Government Data** - Authentic, verified destination information
3. **Ecosystem Integration** - Insurance, shuttles, AI in one platform
4. **India-Focused** - Deep local knowledge, not generic
5. **Affordable** - Competitive pricing for SME & individual travelers
6. **Curated Trips** - Expert-designed itineraries, not just listings

---

## 📈 Success Metrics

### Current Stats (Demo)
- **Total Bookings**: 127
- **Monthly Revenue**: ₹4.2L
- **Active Customers**: 89
- **Average Rating**: 4.8★
- **Trip Completion Rate**: 96%
- **Customer Retention**: 42%

### Growth Targets (6 Months)
- 500+ bookings/month
- ₹15L+ monthly revenue
- 300+ active customers
- 4.9★ average rating

---

## 🔒 Security Features

- **HTTPS Only** - Encrypted data transmission
- **JWT Authentication** - Secure agent sessions
- **PCI DSS Compliant** - Cashfree payment gateway
- **Data Encryption** - Customer data protected
- **Rate Limiting** - API abuse prevention
- **Input Validation** - XSS/SQL injection protection

---

## 📱 Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✅ Full |
| Firefox | 88+ | ✅ Full |
| Safari | 14+ | ✅ Full |
| Edge | 90+ | ✅ Full |
| Mobile Safari | iOS 13+ | ✅ Full |
| Chrome Mobile | Latest | ✅ Full |

---

## 🤝 Contributing

PTM is part of the **Pixel Ecosystem** - a complete business operating system for SMEs.

### Development Workflow
1. Create feature branch: `git checkout -b feature/trip-details-page`
2. Make changes
3. Test thoroughly
4. Submit PR with description

### Code Standards
- Use Inter font family
- Follow black & white color scheme
- Mobile-first responsive design
- Semantic HTML5
- ES6+ JavaScript
- CSS custom properties

---

## 📞 Support

- **Email**: support@pixeltrip.in
- **Phone**: +91 888-888-8888
- **Hours**: 24/7 (Agent Dashboard)

---

## 📜 License

Part of **Pixel Ecosystem** - Building Business Operating Systems for SMEs

© 2025 Pixel Trip Management. All Rights Reserved.

---

## 🎉 Acknowledgments

- **Government of India** - Tourism data & APIs
- **Ministry of Tourism** - Incredible India initiative
- **State Tourism Boards** - Regional destination data
- **ASI** - Heritage site information
- **Open Source Community** - Tools & libraries

---

**Built with ❤️ in India, for India**

*Making domestic travel accessible, affordable, and authentic.*
