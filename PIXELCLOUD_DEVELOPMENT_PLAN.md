# PixelCloud Development Plan
*Complete SSL Automation & Cloud Management Platform*

---

## 📋 Project Overview

**Vision**: Build a complete cloud hosting control panel with automated SSL certificate generation (HTTP-01 & DNS-01), server provisioning, domain management, and customer billing.

**Core Technologies**:
- **Frontend**: Bootstrap 5.3.0, Vanilla JavaScript, Socket.IO Client
- **Backend**: Node.js, Express.js, Socket.IO Server
- **Database**: SQLite (MVP) → PostgreSQL (Scale)
- **SSL Automation**: Refactored POSH-ACME integration (from friend's system)
- **DNS Integration**: Technitium DNS Server API (for DNS-01 wildcard validation)
- **Server Management**: nginx, Windows IIS (via PowerShell remoting)

---

## 🎯 Development Phases

### **Phase 1: Frontend Completion** ✅ (90% Complete)
**Timeline**: 2 days  
**Status**: In Progress

#### Completed Screens
- ✅ Landing Page (index.html)
- ✅ Dashboard Shell (sidebar, navigation, routing)
- ✅ Overview Section (stats, server status, activity feed)
- ✅ SSL Certificate Manager (table, generation modal, HTTP-01/DNS-01 selector)
- ✅ Server Management (3 server cards with metrics)
- ✅ Domain Management (placeholder)
- ✅ Billing Section (invoices, payment methods, stats)
- ✅ Support Section (tickets, live chat, stats)
- ✅ Settings Section (profile, security, notifications, API keys)

#### Remaining Tasks
- [ ] Backups Section (automated backup schedules, restore points, download archives)
- [ ] Monitoring Section (real-time CPU/RAM/disk graphs, uptime charts, alert history)
- [ ] Mobile responsive refinements (test on iOS/Android)
- [ ] Add loading states and error messages to all forms
- [ ] Implement client-side form validation

**Deliverables**:
- Complete UI with all 9 dashboard sections
- Responsive design (desktop, tablet, mobile)
- Mock data for all tables and charts

---

### **Phase 2: Backend API Foundation** 🔄
**Timeline**: 5 days  
**Status**: Not Started

#### Subtasks

**2.1 Project Structure Setup** (1 day)
```
PixelCloud-backend/
├── src/
│   ├── config/
│   │   ├── database.js       # SQLite/PostgreSQL connection
│   │   ├── environment.js    # Environment variables
│   │   └── nginx.js          # nginx paths, templates
│   ├── models/
│   │   ├── User.js
│   │   ├── Server.js
│   │   ├── Domain.js
│   │   ├── SSLCertificate.js
│   │   └── Invoice.js
│   ├── services/
│   │   ├── sslService.js     # Core SSL automation logic
│   │   ├── nginxService.js   # Server block management
│   │   ├── dnsService.js     # Technitium DNS API integration
│   │   ├── serverService.js  # Server provisioning
│   │   └── emailService.js   # Notification emails
│   ├── routes/
│   │   ├── auth.js
│   │   ├── ssl.js
│   │   ├── servers.js
│   │   ├── domains.js
│   │   └── billing.js
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication
│   │   ├── errorHandler.js
│   │   └── rateLimiter.js
│   └── index.js              # Express server entry point
├── tests/
├── .env.example
├── package.json
└── README.md
```

**2.2 Database Schema** (1 day)
```sql
-- Users Table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    company TEXT,
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Servers Table
CREATE TABLE servers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    hostname TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    platform TEXT NOT NULL, -- 'nginx' or 'iis'
    status TEXT DEFAULT 'active', -- 'active', 'maintenance', 'offline'
    cpu_usage REAL DEFAULT 0,
    ram_usage REAL DEFAULT 0,
    disk_usage REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Domains Table
CREATE TABLE domains (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    server_id INTEGER NOT NULL,
    domain_name TEXT UNIQUE NOT NULL,
    root_path TEXT NOT NULL,
    has_ssl BOOLEAN DEFAULT 0,
    auto_renew_ssl BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (server_id) REFERENCES servers(id)
);

-- SSL Certificates Table
CREATE TABLE ssl_certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    domain_id INTEGER NOT NULL,
    domain_name TEXT NOT NULL,
    cert_type TEXT NOT NULL, -- 'standard' or 'wildcard'
    validation_method TEXT NOT NULL, -- 'http-01' or 'dns-01'
    issuer TEXT DEFAULT 'Let''s Encrypt',
    issue_date DATETIME NOT NULL,
    expiry_date DATETIME NOT NULL,
    auto_renew BOOLEAN DEFAULT 1,
    cert_path TEXT,
    key_path TEXT,
    status TEXT DEFAULT 'active', -- 'active', 'expired', 'revoked'
    last_renewal_attempt DATETIME,
    FOREIGN KEY (domain_id) REFERENCES domains(id)
);

-- Deployment Logs Table
CREATE TABLE deployment_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    domain_id INTEGER NOT NULL,
    action TEXT NOT NULL, -- 'ssl_generate', 'ssl_renew', 'nginx_reload', etc.
    status TEXT NOT NULL, -- 'success', 'failed'
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (domain_id) REFERENCES domains(id)
);

-- Invoices Table
CREATE TABLE invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    invoice_number TEXT UNIQUE NOT NULL,
    description TEXT,
    amount REAL NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'overdue'
    due_date DATETIME,
    paid_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Support Tickets Table
CREATE TABLE support_tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    ticket_number TEXT UNIQUE NOT NULL,
    subject TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
    status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
    category TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**2.3 Express Server Setup** (1 day)
- Install dependencies: `express`, `socket.io`, `bcrypt`, `jsonwebtoken`, `dotenv`, `cors`, `helmet`, `express-rate-limit`
- Configure middleware (CORS, body parser, security headers, rate limiting)
- Setup Socket.IO for real-time SSL generation progress updates
- Create basic health check endpoint (`GET /api/health`)
- Configure logging (winston or morgan)

**2.4 Authentication System** (1 day)
- User registration endpoint (`POST /api/auth/register`)
- User login with JWT tokens (`POST /api/auth/login`)
- Password reset flow (`POST /api/auth/forgot-password`, `POST /api/auth/reset-password`)
- JWT middleware for protected routes
- Session management

**2.5 Basic CRUD APIs** (1 day)
- Server management endpoints:
  - `GET /api/servers` - List all user servers
  - `POST /api/servers` - Add new server
  - `GET /api/servers/:id` - Get server details
  - `PUT /api/servers/:id` - Update server
  - `DELETE /api/servers/:id` - Remove server
- Domain management endpoints:
  - `GET /api/domains` - List all domains
  - `POST /api/domains` - Add new domain
  - `PUT /api/domains/:id` - Update domain
  - `DELETE /api/domains/:id` - Remove domain

**Deliverables**:
- Working Express server with database
- Authentication (register, login, JWT)
- Basic server & domain CRUD APIs
- Socket.IO real-time connection ready

---

### **Phase 3: SSL Automation Core** 🚀
**Timeline**: 7 days  
**Status**: Not Started (High Priority)

#### 3.1 Refactor Friend's SSL System (2 days)

**Current Issues**:
- 3,306-line monolithic `index.js` (maintenance nightmare)
- Hard-coded paths (`C:\nginx`, `C:\inetpub\wwwroot`)
- No modular separation of concerns
- Difficult to test and debug

**Refactoring Plan**:

**File: `src/services/sslService.js`** (SSL Certificate Generation)
```javascript
class SSLService {
  async generateCertificate(domain, type, validationMethod) {
    // 1. Validate domain ownership
    // 2. Request certificate from Let's Encrypt
    // 3. Handle HTTP-01 or DNS-01 challenge
    // 4. Download certificate files
    // 5. Store in database
    // 6. Return certificate details
  }

  async renewCertificate(certificateId) {
    // 1. Check expiry date (renew if < 30 days)
    // 2. Re-run generation process
    // 3. Update database
    // 4. Deploy to nginx/IIS
  }

  async revokeCertificate(certificateId) {
    // 1. Call Let's Encrypt revoke API
    // 2. Update database status
    // 3. Remove from nginx/IIS
  }
}
```

**File: `src/services/nginxService.js`** (nginx Server Block Management)
```javascript
class NginxService {
  async createServerBlock(domain, sslCertPath, sslKeyPath) {
    // 1. Generate nginx server block from template
    // 2. Write to /etc/nginx/sites-available/{domain}
    // 3. Create symlink to sites-enabled
    // 4. Test nginx configuration (nginx -t)
    // 5. Reload nginx (systemctl reload nginx)
  }

  async removeServerBlock(domain) {
    // 1. Remove symlink from sites-enabled
    // 2. Delete config file
    // 3. Reload nginx
  }

  async testConfiguration() {
    // Run nginx -t and return result
  }

  async reloadNginx() {
    // systemctl reload nginx
  }
}
```

**File: `src/services/dnsService.js`** (Technitium DNS API Integration)
```javascript
class DNSService {
  async createCNAMERecord(domain, target) {
    // 1. Call Technitium DNS API
    // 2. Create _acme-challenge CNAME record
    // 3. Return success/failure
  }

  async verifyCNAMERecord(domain) {
    // 1. Query DNS for CNAME record
    // 2. Verify it points to correct target
    // 3. Return true/false
  }

  async deleteCNAMERecord(domain) {
    // 1. Remove CNAME after validation complete
  }
}
```

#### 3.2 HTTP-01 Validation (Standard SSL) (2 days)
- Implement ACME HTTP-01 challenge handler
- Create `.well-known/acme-challenge/` directory structure
- Auto-deploy challenge files to web root
- Verify Let's Encrypt can reach challenge URL
- Download and install certificate
- Update nginx server block with SSL config
- Test SSL certificate with `curl -I https://domain.com`

#### 3.3 DNS-01 Validation (Wildcard SSL) (2 days)
- Integrate with Technitium DNS API
- Create TXT record for `_acme-challenge.domain.com`
- Wait for DNS propagation (30-60 seconds)
- Verify DNS record with `dig _acme-challenge.domain.com TXT`
- Complete ACME validation
- Download wildcard certificate
- Apply to nginx server block
- Test wildcard subdomains (`*.domain.com`)

#### 3.4 Real-Time Progress Updates (1 day)
- Emit Socket.IO events during SSL generation:
  - `ssl:progress` - Step-by-step progress (0-100%)
  - `ssl:log` - Console logs for debugging
  - `ssl:success` - Certificate generated successfully
  - `ssl:error` - Error message if generation fails
- Update frontend `ssl-manager.js` to listen for events
- Display progress bar and live logs in modal

**Deliverables**:
- Working SSL generation for HTTP-01 (standard certs)
- Working SSL generation for DNS-01 (wildcard certs)
- Real-time progress updates via Socket.IO
- Auto-renewal cron job (runs daily at 3 AM)
- Email notifications for expiry warnings

---

### **Phase 4: Server & Domain Management** 🖥️
**Timeline**: 4 days  
**Status**: Not Started

#### 4.1 Server Provisioning Wizard (2 days)
- Frontend wizard UI (4-step form):
  1. Server details (name, IP, platform)
  2. SSH/RDP credentials
  3. Software installation (nginx, PHP, MySQL, etc.)
  4. Firewall & security settings
- Backend server provisioning logic:
  - Test SSH/RDP connection
  - Install required software via package managers
  - Configure firewall (UFW for Linux, Windows Firewall for IIS)
  - Create deployment user account
  - Return server status

#### 4.2 Domain Registration & DNS (2 days)
- Domain registration form (link to registrar API in future)
- DNS zone editor:
  - A records (point domain to server IP)
  - CNAME records (subdomain aliases)
  - MX records (email)
  - TXT records (SPF, DKIM)
- DNS propagation checker (query public DNS servers)
- Auto-create nginx server block when domain added

**Deliverables**:
- Server provisioning wizard (frontend + backend)
- DNS zone editor with A/CNAME/MX/TXT record management
- Automated server block creation for new domains

---

### **Phase 5: Billing & Payments** 💳
**Timeline**: 3 days  
**Status**: Not Started

#### 5.1 Invoice System (1 day)
- Auto-generate monthly invoices for active servers
- Invoice PDF generation (using `pdfkit` or `puppeteer`)
- Email invoices to customers (using `nodemailer`)
- Invoice download endpoint (`GET /api/invoices/:id/download`)

#### 5.2 Payment Gateway Integration (2 days)
**Options**: Stripe, PayPal, or Razorpay

**Stripe Integration**:
- Install `stripe` npm package
- Setup Stripe API keys (test & production)
- Payment flow:
  1. Customer adds credit card (`POST /api/payment-methods`)
  2. Store Stripe customer ID in database
  3. Charge card on invoice due date (`POST /api/invoices/:id/pay`)
  4. Webhook to handle payment success/failure
  5. Send payment receipt email

**Deliverables**:
- Automated monthly invoicing
- Stripe payment integration
- Payment method management (add/remove cards)
- Payment history view

---

### **Phase 6: Monitoring & Alerts** 📊
**Timeline**: 4 days  
**Status**: Not Started

#### 6.1 Server Metrics Collection (2 days)
- Install metrics collector on each server:
  - **Linux**: `node-exporter` (Prometheus) or custom script
  - **Windows**: PowerShell script to query performance counters
- Collect metrics every 60 seconds:
  - CPU usage (%)
  - RAM usage (GB / %)
  - Disk usage (GB / %)
  - Network I/O (Mbps)
  - Uptime (hours)
- Store metrics in database (time-series table)
- API endpoint: `GET /api/servers/:id/metrics?range=1h|24h|7d|30d`

#### 6.2 Real-Time Monitoring Dashboard (1 day)
- Frontend charts using Chart.js or ApexCharts
- Display CPU, RAM, disk graphs
- Auto-refresh every 5 seconds via Socket.IO
- Alert badges for resources > 80% usage

#### 6.3 Alert System (1 day)
- Alert rules:
  - SSL certificate expiring in < 30 days
  - Server CPU > 80% for > 5 minutes
  - Server disk usage > 90%
  - Server offline (failed health check)
- Notification channels:
  - Email (immediate)
  - Dashboard alert banner
  - (Optional) SMS via Twilio
- Alert history table

**Deliverables**:
- Real-time server metrics dashboard
- CPU/RAM/disk usage charts
- Email/SMS alerts for critical issues
- SSL expiry notifications (30 days before)

---

### **Phase 7: Support & Documentation** 📚
**Timeline**: 2 days  
**Status**: Not Started

#### 7.1 Support Ticket System (1 day)
- Ticket creation form (already built in frontend)
- Backend endpoints:
  - `POST /api/tickets` - Create new ticket
  - `GET /api/tickets` - List all user tickets
  - `GET /api/tickets/:id` - View ticket details
  - `PUT /api/tickets/:id` - Update ticket status
  - `POST /api/tickets/:id/messages` - Add reply
- Email notifications for new replies
- Admin panel to view all tickets

#### 7.2 Live Chat Integration (1 day)
**Options**: Tawk.to (free), Intercom, Zendesk Chat

**Tawk.to Integration**:
- Create Tawk.to account
- Add JavaScript widget to dashboard
- Configure canned responses for common questions
- Connect to mobile app for team notifications

**Deliverables**:
- Functional support ticket system
- Live chat widget in dashboard
- Email notifications for ticket updates

---

### **Phase 8: Testing & Deployment** 🚀
**Timeline**: 5 days  
**Status**: Not Started

#### 8.1 Testing (3 days)
**Unit Tests** (1 day)
- Test SSL service functions
- Test nginx service functions
- Test DNS service functions
- Use Jest or Mocha + Chai

**Integration Tests** (1 day)
- Test full SSL generation flow (HTTP-01 & DNS-01)
- Test server provisioning
- Test domain creation with auto SSL
- Use Supertest for API testing

**Security Audit** (1 day)
- SQL injection prevention (use parameterized queries)
- XSS protection (sanitize user inputs)
- CSRF tokens for forms
- Rate limiting on login endpoint
- Secure password storage (bcrypt with 12 rounds)
- HTTPS enforcement (redirect HTTP to HTTPS)
- Content Security Policy (CSP) headers

#### 8.2 Production Deployment (2 days)
**Backend Deployment** (1 day)
- Setup production server (Ubuntu 22.04 LTS)
- Install Node.js 20.x, nginx, PostgreSQL
- Clone repository
- Configure environment variables (`.env`)
- Run database migrations
- Setup PM2 for Node.js process management
- Configure nginx reverse proxy
- Enable SSL for API (Let's Encrypt)
- Setup log rotation

**Frontend Deployment** (0.5 day)
- Deploy to Netlify or Vercel
- Configure API endpoint URLs for production
- Setup custom domain

**Database Migration** (0.5 day)
- Migrate from SQLite to PostgreSQL
- Backup existing data
- Import to PostgreSQL
- Update database connection config

**Deliverables**:
- Complete test suite (unit + integration)
- Security audit report
- Production server running on HTTPS
- Frontend deployed to CDN
- PostgreSQL database configured

---

## 🔐 Security Considerations

1. **Environment Variables**:
   - Never commit `.env` files to Git
   - Store sensitive keys in environment variables
   - Use different keys for development/production

2. **Authentication**:
   - JWT tokens expire after 7 days
   - Secure cookies with `httpOnly`, `secure`, `sameSite` flags
   - Password reset tokens expire after 1 hour

3. **API Security**:
   - Rate limiting: Max 100 requests/minute per IP
   - Input validation on all endpoints
   - Parameterized SQL queries (prevent injection)
   - CORS restricted to frontend domain only

4. **SSL Certificates**:
   - Private keys stored with 600 permissions (owner read/write only)
   - Never expose private keys via API
   - Auto-backup certificates to separate storage

5. **Server Access**:
   - SSH keys only (no password authentication)
   - Fail2ban to prevent brute force attacks
   - Firewall blocks all ports except 80, 443, 22

---

## 📊 Success Metrics

**Technical KPIs**:
- SSL generation success rate: > 95%
- Average SSL generation time: < 2 minutes
- Server uptime: > 99.9%
- API response time: < 500ms (95th percentile)
- Auto-renewal success rate: > 99%

**Business KPIs**:
- Customer signup conversion: > 20%
- Monthly recurring revenue (MRR) growth
- Support ticket resolution time: < 24 hours
- Customer churn rate: < 5%

---

## 🛠️ Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Bootstrap 5.3.0 | UI framework |
| **Frontend** | Vanilla JavaScript | Client-side logic |
| **Frontend** | Socket.IO Client | Real-time updates |
| **Backend** | Node.js 20.x | Runtime |
| **Backend** | Express.js | REST API framework |
| **Backend** | Socket.IO Server | WebSocket server |
| **Database** | SQLite → PostgreSQL | Data storage |
| **SSL** | POSH-ACME (PowerShell) | Let's Encrypt integration |
| **DNS** | Technitium DNS API | DNS-01 validation |
| **Server Management** | nginx | Web server |
| **Server Management** | PowerShell Remoting | Windows IIS control |
| **Monitoring** | Custom metrics collector | Server monitoring |
| **Payments** | Stripe API | Payment processing |
| **Email** | Nodemailer + SMTP | Notifications |
| **Deployment** | PM2 | Process management |
| **Deployment** | nginx Reverse Proxy | API gateway |

---

## 📅 Timeline Summary

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| **Phase 1**: Frontend Completion | 2 days | None |
| **Phase 2**: Backend API Foundation | 5 days | Phase 1 |
| **Phase 3**: SSL Automation Core | 7 days | Phase 2 |
| **Phase 4**: Server & Domain Management | 4 days | Phase 3 |
| **Phase 5**: Billing & Payments | 3 days | Phase 2 |
| **Phase 6**: Monitoring & Alerts | 4 days | Phase 4 |
| **Phase 7**: Support & Documentation | 2 days | Phase 2 |
| **Phase 8**: Testing & Deployment | 5 days | All phases |
| **Total** | **32 days** (~6.5 weeks) | |

---

## 🚀 Next Immediate Actions

1. **Complete frontend screens** (backups, monitoring) - **TODAY**
2. **Setup backend project structure** - **Day 2**
3. **Create database schema and migrations** - **Day 3**
4. **Refactor friend's SSL automation code into modules** - **Days 4-5**
5. **Implement HTTP-01 SSL generation** - **Days 6-7**
6. **Implement DNS-01 wildcard SSL** - **Days 8-9**
7. **Connect frontend to backend APIs** - **Days 10-12**
8. **Testing and bug fixes** - **Days 13-15**
9. **Deploy to production** - **Days 16-17**

---

## 📝 Notes

- **Friend's SSL system** provides excellent reference code for POSH-ACME integration
- **Modular architecture** will make code maintainable and testable
- **Real-time updates** via Socket.IO enhance user experience during SSL generation
- **Auto-renewal** ensures customers never face SSL expiry downtime
- **Monitoring** provides early warning for server issues
- **Stripe integration** enables automated billing and revenue generation

---

**Last Updated**: December 2024  
**Project Lead**: Ashish Kumar  
**Status**: Phase 1 (90% complete) → Moving to Phase 2
