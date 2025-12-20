# 🚀 AWS Deployment Guide for Pixel Academy

## 📋 AWS Account Setup Checklist

### Step 1: Create AWS Account
1. Go to https://aws.amazon.com
2. Click "Create an AWS Account"
3. **Account Details:**
   - Account name: **Creative Pixels**
   - Email: `ashish@creativepixels.in` (or company email)
   - Root user name: `creativepixels-admin`
   - Password: *Strong password (save securely)*

4. **Contact Information:**
   - Account Type: **Business**
   - Company Name: **Creative Pixels**
   - Phone: Your business phone
   - Country: India
   - Address: Your business address

5. **Payment Information:**
   - Add credit/debit card (won't be charged during free tier)
   - AWS verifies with small charge (~₹2) then refunds

6. **Identity Verification:**
   - Phone verification
   - Enter code received via SMS/call

7. **Support Plan:**
   - Select **Basic Support (Free)**
   - Can upgrade later if needed

---

## 🎯 What I Need From Your AWS Account

### After Account Creation, Provide:

#### 1. **AWS Access Keys** (for deployment automation)
Go to: IAM → Users → Create User → "pixel-academy-deploy"
- Permissions: AmazonEC2FullAccess, AmazonRDSFullAccess, AmazonS3FullAccess
- Get: **Access Key ID** and **Secret Access Key**

#### 2. **Region Selection**
Recommended regions for India:
- `ap-south-1` (Mumbai) - **BEST for Indian users**
- `ap-southeast-1` (Singapore) - Good alternative
- `us-east-1` (Virginia) - Cheapest, but higher latency

**Choose:** Mumbai (ap-south-1) for best performance

#### 3. **Domain Name** (if you have one)
- Example: `academy.creativepixels.in`
- Or use AWS-provided: `ec2-xx-xx-xx-xx.ap-south-1.compute.amazonaws.com`

---

## 💰 Cost Breakdown - AWS Free Tier (12 Months)

### ✅ What's FREE for 12 Months:
- **EC2 t2.micro**: 750 hours/month (24/7 for one instance)
- **RDS db.t2.micro**: 750 hours/month (PostgreSQL database)
- **S3 Storage**: 5GB storage
- **Data Transfer**: 15GB outbound per month
- **CloudFront**: 50GB data transfer

### 💵 After Free Tier (Estimated Monthly):
- EC2 t3.micro: ₹500-800/month
- RDS PostgreSQL: ₹1,200-1,500/month
- S3 + Bandwidth: ₹200-400/month
- **Total: ₹1,900-2,700/month (~$25-35)**

### 🎁 Alternative - AWS Lightsail (Simpler):
- **$5/month** (₹400): 512MB RAM, 20GB SSD, 1TB transfer
- **$10/month** (₹800): 1GB RAM, 40GB SSD, 2TB transfer ✅ **RECOMMENDED**
- **$20/month** (₹1,600): 2GB RAM, 60GB SSD, 3TB transfer
- Includes database + app server in one package

---

## 🏗️ Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│          PIXEL ACADEMY PRODUCTION                │
└─────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐
│   Your FTP       │         │   AWS Cloud      │
│   68.178.157.215 │         │   (Mumbai)       │
├──────────────────┤         ├──────────────────┤
│                  │         │                  │
│  Frontend Files  │────────▶│  EC2 Instance    │
│  • HTML/CSS/JS   │  API    │  • Node.js API   │
│  • Images        │  Calls  │  • Port 8080     │
│  • Static Assets │         │  • PM2 (manager) │
│                  │         │                  │
└──────────────────┘         │  RDS PostgreSQL  │
                             │  • Database      │
                             │  • Auto-backup   │
                             │                  │
                             │  S3 Bucket       │
                             │  • File uploads  │
                             │  • Assignments   │
                             │                  │
                             │  Route 53 (DNS)  │
                             │  • Domain setup  │
                             └──────────────────┘
```

---

## 📦 Services We'll Use

### 1. **EC2 (Elastic Compute Cloud)** - Backend Server
- **What**: Virtual server to run Node.js
- **Size**: t2.micro (FREE) or t3.micro (₹600/month)
- **OS**: Ubuntu 22.04 LTS
- **Ports**: 22 (SSH), 80 (HTTP), 443 (HTTPS), 8080 (API)

### 2. **RDS (Relational Database Service)** - PostgreSQL
- **What**: Managed PostgreSQL database
- **Size**: db.t2.micro (FREE) or db.t3.micro
- **Storage**: 20GB SSD (FREE tier)
- **Backups**: Automatic daily backups (7 days retention)

### 3. **S3 (Simple Storage Service)** - File Storage
- **What**: Store uploaded files (assignments, profile photos)
- **Cost**: ₹1.60 per GB/month
- **Benefit**: Unlimited scalability, CDN integration

### 4. **Route 53** (Optional) - DNS Management
- **What**: Connect your domain
- **Cost**: ₹40/month per hosted zone
- **Benefit**: Professional domain (academy.creativepixels.in)

### 5. **CloudFront** (Optional) - CDN
- **What**: Faster delivery worldwide
- **Cost**: First 50GB FREE, then ₹0.60/GB
- **Benefit**: Faster page loads globally

---

## 🎯 Recommended Setup for You

### **Option A: AWS Lightsail** (EASIEST) ⭐ **RECOMMENDED**

**Best for:**
- Quick deployment (30 minutes)
- Simple management
- Predictable pricing
- Perfect for startups

**What you get:**
- One-click Node.js + PostgreSQL
- Simple web console
- $10/month flat rate (₹800)
- Easy SSL certificate setup
- Automatic backups

**Steps:**
1. Create Lightsail instance (Node.js blueprint)
2. Attach Lightsail database (PostgreSQL)
3. Upload backend code via SFTP/Git
4. Configure environment variables
5. Install dependencies and start server
6. Done! ✅

---

### **Option B: EC2 + RDS** (POWERFUL)

**Best for:**
- Full AWS experience
- Better for scaling later
- More customization
- Free tier for 12 months

**What you get:**
- EC2 t2.micro instance (FREE)
- RDS db.t2.micro PostgreSQL (FREE)
- S3 for file storage
- Full control over everything

**Steps:**
1. Launch EC2 instance (Ubuntu 22.04)
2. Create RDS PostgreSQL database
3. Configure security groups
4. SSH into EC2, install Node.js
5. Clone/upload backend code
6. Set up PM2 process manager
7. Configure Nginx reverse proxy
8. Install SSL certificate
9. Done! ✅

---

## 🔑 Information I'll Need from You

### After AWS Account Setup:

```yaml
# AWS Account Details
AWS_ACCOUNT_ID: "Your 12-digit account ID"
AWS_REGION: "ap-south-1"  # Mumbai
AWS_ACCESS_KEY_ID: "AKIAxxxxxxxxxxxx"
AWS_SECRET_ACCESS_KEY: "xxxxxxxxxxxxxxxxxxxxxxxx"

# Domain (if you have one)
DOMAIN_NAME: "academy.creativepixels.in"  # or will use AWS domain

# Google OAuth
GOOGLE_CLIENT_ID: "your-app-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET: "GOCSPX-xxxxxxxxxxxxx"

# Admin Email
ADMIN_EMAIL: "admin@creativepixels.in"

# Database Password (choose strong one)
DB_PASSWORD: "YourStrongPassword123!"
```

---

## 📝 Step-by-Step Setup (I'll Help You)

### Phase 1: AWS Account Setup (YOU DO - 15 mins)
- [ ] Create AWS account
- [ ] Verify email
- [ ] Add payment method
- [ ] Complete phone verification
- [ ] Choose Mumbai region

### Phase 2: IAM User Creation (YOU DO - 5 mins)
- [ ] Go to IAM console
- [ ] Create user "pixel-academy-deploy"
- [ ] Attach policies (EC2, RDS, S3)
- [ ] Generate access keys
- [ ] Save keys securely

### Phase 3: Google OAuth Setup (YOU DO - 10 mins)
- [ ] Go to console.cloud.google.com
- [ ] Create new project "Pixel Academy"
- [ ] Enable Google+ API
- [ ] Create OAuth credentials
- [ ] Add authorized domains
- [ ] Save Client ID and Secret

### Phase 4: Deploy Backend (I DO - 30 mins)
- [ ] Create Lightsail/EC2 instance
- [ ] Set up PostgreSQL database
- [ ] Configure security groups
- [ ] Upload backend code
- [ ] Install dependencies
- [ ] Run database migrations
- [ ] Seed initial data
- [ ] Test API endpoints

### Phase 5: Configure Frontend (I DO - 15 mins)
- [ ] Update API URLs in frontend
- [ ] Add Google OAuth Client ID
- [ ] Test login flow
- [ ] Prepare files for FTP upload

### Phase 6: Upload to FTP (YOU DO - 10 mins)
- [ ] Upload frontend files to your FTP
- [ ] Test website loads
- [ ] Verify API calls work

### Phase 7: Final Testing (TOGETHER - 15 mins)
- [ ] Test login with Google
- [ ] Enroll in course
- [ ] Upload assignment
- [ ] Check admin dashboard
- [ ] Verify all features work

---

## 🎓 What to Learn (Optional but Helpful)

### AWS Console Basics:
- Navigating EC2 dashboard
- Viewing RDS databases
- Checking S3 buckets
- Reading CloudWatch logs

### Terminal Commands (I'll provide these):
```bash
# SSH into server
ssh -i key.pem ubuntu@your-server-ip

# Check server status
pm2 status

# View logs
pm2 logs

# Restart server
pm2 restart all
```

---

## ⚡ Quick Start Commands (After Setup)

### Check Backend Status:
```bash
curl https://your-api-url.com/health
```

### View Server Logs:
```bash
ssh ubuntu@your-server
pm2 logs backend
```

### Restart Backend:
```bash
ssh ubuntu@your-server
pm2 restart backend
```

### Database Backup:
```bash
# Automatic with RDS
# Manual backup available in AWS console
```

---

## 🆘 Support & Monitoring

### AWS Console Links:
- **EC2 Dashboard**: https://console.aws.amazon.com/ec2
- **RDS Dashboard**: https://console.aws.amazon.com/rds
- **S3 Console**: https://console.aws.amazon.com/s3
- **Billing**: https://console.aws.amazon.com/billing

### Monitoring:
- CloudWatch metrics (CPU, memory, disk)
- RDS monitoring (connections, queries)
- Cost Explorer (track spending)
- Billing alerts (set budget alerts)

---

## 💡 Pro Tips

1. **Enable MFA** on root account immediately
2. **Set billing alerts** at ₹500, ₹1000, ₹2000
3. **Use IAM users** - never use root for daily tasks
4. **Tag resources** - add tags like "project: pixel-academy"
5. **Enable backups** - RDS automatic backups ON
6. **Regular updates** - keep server packages updated
7. **Monitor costs** - check billing dashboard weekly

---

## 🎯 Next Steps

**Right now, you need to:**

1. ✅ **Create AWS Account** (15-20 minutes)
   - Go to aws.amazon.com
   - Sign up with Creative Pixels details
   - Verify email and phone
   - Add payment method

2. ✅ **Create IAM User** (5 minutes)
   - Name: `pixel-academy-deploy`
   - Get Access Key ID and Secret

3. ✅ **Set Up Google OAuth** (10 minutes)
   - console.cloud.google.com
   - Create project "Pixel Academy"
   - Get Client ID and Secret

**Once you have these, tell me:**
- ✅ AWS Account created
- ✅ Access keys ready
- ✅ Google OAuth credentials ready
- ✅ Preferred deployment: Lightsail or EC2+RDS

**Then I'll:**
- Set up infrastructure
- Deploy backend
- Configure database
- Prepare frontend
- Test everything
- Give you upload instructions

---

## 📞 Contact Info to Use

**AWS Account:**
- Business name: Creative Pixels
- Email: ashish@creativepixels.in (or company email)
- Phone: Your business number
- Address: Your registered address

**Google Cloud:**
- Project name: Pixel Academy
- Organization: Creative Pixels
- Support email: ashish@creativepixels.in

---

## 🔒 Security Checklist

- [ ] Strong passwords (min 16 chars)
- [ ] MFA enabled on AWS root account
- [ ] IAM users for daily use (never use root)
- [ ] Security groups properly configured
- [ ] SSL certificate installed
- [ ] Database not publicly accessible
- [ ] Regular security updates
- [ ] Backup strategy in place

---

**Ready to start! Let me know when you've completed Step 1 (AWS Account) and I'll guide you through the rest.** 🚀
