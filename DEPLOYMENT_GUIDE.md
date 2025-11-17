# Pixel Logistics WMS - Deployment Guide
**Version:** 1.0 Production  
**Date:** November 17, 2025  
**Target:** DevOps, IT Teams, System Administrators

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Deployment Options](#deployment-options)
3. [Cloud Deployment (Recommended)](#cloud-deployment)
4. [On-Premise Deployment](#on-premise-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Security Hardening](#security-hardening)
7. [Performance Optimization](#performance-optimization)
8. [Monitoring & Maintenance](#monitoring-maintenance)
9. [Backup & Recovery](#backup-recovery)
10. [Troubleshooting](#troubleshooting)

---

## ✅ Pre-Deployment Checklist

### Infrastructure Requirements

**Minimum Specifications:**
- **Server:** 2 CPU cores, 4GB RAM, 20GB storage
- **Network:** 5 Mbps bandwidth, static IP
- **SSL Certificate:** Required for production
- **Domain:** Configured DNS (e.g., wms.yourcompany.com)

**Recommended Specifications:**
- **Server:** 4 CPU cores, 8GB RAM, 50GB SSD
- **Network:** 25+ Mbps, CDN integration
- **Load Balancer:** For high availability
- **Database:** PostgreSQL 14+ or MySQL 8+ (for Phase 13)

### Software Prerequisites

```bash
# Web Server (Choose one)
- Nginx 1.20+ (Recommended)
- Apache 2.4+
- Node.js 16+ (for development)

# Optional (for build optimization)
- npm 8+
- Git 2.30+
```

### Accounts & Access

- [x] Cloud provider account (AWS/Azure/GCP)
- [x] SSL certificate authority access
- [x] DNS management access
- [x] Email service (for notifications)
- [x] Monitoring service (optional)

---

## 🌐 Deployment Options

### Option 1: Static Cloud Hosting (Fastest) ⭐ RECOMMENDED

**Best For:** Quick deployment, low maintenance  
**Providers:** Netlify, Vercel, AWS S3 + CloudFront  
**Cost:** $0-$50/month  
**Time to Deploy:** 10 minutes

### Option 2: Traditional Server Hosting

**Best For:** On-premise requirements, full control  
**Providers:** AWS EC2, Azure VM, DigitalOcean  
**Cost:** $20-$200/month  
**Time to Deploy:** 1-2 hours

### Option 3: Container Deployment

**Best For:** Scalability, microservices architecture  
**Providers:** Docker, Kubernetes, AWS ECS  
**Cost:** $50-$500/month  
**Time to Deploy:** 2-4 hours

---

## 🚀 Cloud Deployment (Recommended)

### Method 1: Netlify (Easiest)

**Step 1: Prepare the codebase**
```bash
cd "/path/to/DLT WMS/frontend"

# Create netlify.toml configuration
cat > netlify.toml << 'EOF'
[build]
  publish = "."
  command = "echo 'No build needed'"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "*.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
EOF
```

**Step 2: Deploy via Netlify CLI**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

**Step 3: Configure Custom Domain**
```bash
# In Netlify dashboard:
# 1. Go to Domain Settings
# 2. Add custom domain (e.g., wms.yourcompany.com)
# 3. Enable HTTPS (automatic via Let's Encrypt)
# 4. Configure DNS records as instructed
```

---

### Method 2: AWS S3 + CloudFront

**Step 1: Create S3 Bucket**
```bash
# Install AWS CLI
pip install awscli

# Configure AWS credentials
aws configure

# Create bucket
aws s3 mb s3://pixellogistics-wms --region us-east-1

# Enable static website hosting
aws s3 website s3://pixellogistics-wms/ \
  --index-document index.html \
  --error-document index.html
```

**Step 2: Upload Files**
```bash
cd "/path/to/DLT WMS/frontend"

# Sync files to S3
aws s3 sync . s3://pixellogistics-wms/ \
  --exclude ".git/*" \
  --exclude "*.md" \
  --cache-control "public, max-age=31536000"

# Set HTML files with no-cache
aws s3 sync . s3://pixellogistics-wms/ \
  --exclude "*" \
  --include "*.html" \
  --cache-control "public, max-age=0, must-revalidate"
```

**Step 3: Create CloudFront Distribution**
```bash
# Create distribution configuration
cat > cloudfront-config.json << 'EOF'
{
  "CallerReference": "pixel-wms-$(date +%s)",
  "Comment": "Pixel Logistics WMS CDN",
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [{
      "Id": "S3-pixellogistics-wms",
      "DomainName": "pixellogistics-wms.s3.amazonaws.com",
      "S3OriginConfig": {
        "OriginAccessIdentity": ""
      }
    }]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-pixellogistics-wms",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"]
    },
    "MinTTL": 0,
    "MaxTTL": 31536000,
    "DefaultTTL": 86400
  },
  "Enabled": true
}
EOF

# Create distribution
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

**Step 4: Configure SSL & Custom Domain**
```bash
# Request SSL certificate in ACM (us-east-1 required for CloudFront)
aws acm request-certificate \
  --domain-name wms.yourcompany.com \
  --validation-method DNS \
  --region us-east-1

# Update Route 53 DNS
# Point CNAME to CloudFront distribution domain
```

---

### Method 3: Vercel

**Step 1: Install Vercel CLI**
```bash
npm install -g vercel

# Login
vercel login
```

**Step 2: Deploy**
```bash
cd "/path/to/DLT WMS/frontend"

# Create vercel.json
cat > vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "**/*.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
EOF

# Deploy to production
vercel --prod
```

---

## 🖥️ On-Premise Deployment

### Method 1: Nginx Server

**Step 1: Install Nginx**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx

# macOS
brew install nginx
```

**Step 2: Configure Nginx**
```bash
# Create site configuration
sudo nano /etc/nginx/sites-available/pixellogistics-wms

# Add configuration:
server {
    listen 80;
    server_name wms.yourcompany.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name wms.yourcompany.com;
    
    # SSL Configuration
    ssl_certificate /etc/ssl/certs/wms.crt;
    ssl_certificate_key /etc/ssl/private/wms.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Document root
    root /var/www/pixellogistics-wms;
    index index.html;
    
    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/javascript application/json application/xml;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # HTML files - no cache
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }
    
    # Service worker - no cache
    location = /sw.js {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }
    
    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/pixellogistics-wms /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

**Step 3: Deploy Files**
```bash
# Create web directory
sudo mkdir -p /var/www/pixellogistics-wms

# Copy files
sudo cp -r /path/to/DLT\ WMS/frontend/* /var/www/pixellogistics-wms/

# Set permissions
sudo chown -R www-data:www-data /var/www/pixellogistics-wms
sudo chmod -R 755 /var/www/pixellogistics-wms
```

---

### Method 2: Apache Server

**Step 1: Install Apache**
```bash
# Ubuntu/Debian
sudo apt install apache2

# Enable required modules
sudo a2enmod rewrite ssl headers deflate
```

**Step 2: Configure Virtual Host**
```bash
# Create configuration
sudo nano /etc/apache2/sites-available/pixellogistics-wms.conf

# Add:
<VirtualHost *:80>
    ServerName wms.yourcompany.com
    Redirect permanent / https://wms.yourcompany.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName wms.yourcompany.com
    DocumentRoot /var/www/pixellogistics-wms
    
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/wms.crt
    SSLCertificateKeyFile /etc/ssl/private/wms.key
    
    <Directory /var/www/pixellogistics-wms>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    # Security Headers
    Header always set X-Frame-Options "DENY"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    
    # Compression
    AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript
    
    # Caching
    <FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg)$">
        Header set Cache-Control "max-age=31536000, public"
    </FilesMatch>
    
    <FilesMatch "\.html$">
        Header set Cache-Control "no-cache, no-store, must-revalidate"
    </FilesMatch>
    
    ErrorLog ${APACHE_LOG_DIR}/wms-error.log
    CustomLog ${APACHE_LOG_DIR}/wms-access.log combined
</VirtualHost>

# Enable site
sudo a2ensite pixellogistics-wms.conf
sudo systemctl reload apache2
```

---

### Method 3: Docker Container

**Step 1: Create Dockerfile**
```dockerfile
# Create Dockerfile in frontend directory
FROM nginx:alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy application files
COPY . /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

**Step 2: Create nginx.conf**
```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    sendfile on;
    keepalive_timeout 65;
    gzip on;
    
    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;
        
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

**Step 3: Build and Run**
```bash
# Build image
docker build -t pixellogistics-wms:1.0 .

# Run container
docker run -d \
  --name pixellogistics-wms \
  -p 80:80 \
  --restart unless-stopped \
  pixellogistics-wms:1.0

# Verify
docker ps
curl http://localhost
```

**Step 4: Docker Compose (Optional)**
```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    build: .
    image: pixellogistics-wms:1.0
    container_name: pixellogistics-wms
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/ssl:ro
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 3s
      retries: 3

# Deploy
docker-compose up -d
```

---

## ⚙️ Environment Configuration

### Environment Variables

Create `.env` file for backend integration (Phase 13):

```bash
# Application
APP_NAME="Pixel Logistics WMS"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://wms.yourcompany.com

# Database (for Phase 13)
DB_HOST=your-db-host
DB_PORT=5432
DB_DATABASE=pixellogistics_wms
DB_USERNAME=wms_user
DB_PASSWORD=secure_password_here

# API Configuration
API_URL=https://api.wms.yourcompany.com
API_KEY=your_api_key_here

# Email Service
MAIL_HOST=smtp.yourprovider.com
MAIL_PORT=587
MAIL_USERNAME=notifications@yourcompany.com
MAIL_PASSWORD=email_password_here

# Session
SESSION_LIFETIME=120
SESSION_SECURE_COOKIE=true

# Security
CSRF_SECRET=generate_random_secret_key
ENCRYPTION_KEY=generate_random_encryption_key
```

---

## 🔒 Security Hardening

### SSL/TLS Configuration

**Option 1: Let's Encrypt (Free)**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d wms.yourcompany.com

# Auto-renewal (already configured)
sudo certbot renew --dry-run
```

**Option 2: Commercial Certificate**
```bash
# Generate CSR
openssl req -new -newkey rsa:2048 -nodes \
  -keyout wms.key -out wms.csr

# Submit CSR to CA, receive certificate
# Install certificate in web server configuration
```

### Security Headers

Add to web server configuration:
```nginx
# Nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

### Firewall Configuration

```bash
# UFW (Ubuntu)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Fail2ban (protection against brute force)
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

---

## ⚡ Performance Optimization

### Enable HTTP/2

```nginx
# Nginx
listen 443 ssl http2;
```

### Configure Caching

```nginx
# Browser caching
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Server-side caching (optional)
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=wms_cache:10m max_size=1g inactive=60m;
```

### Compression

```nginx
# Nginx gzip
gzip on;
gzip_vary on;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml application/javascript application/json;
```

### CDN Integration

**CloudFlare Setup:**
1. Add domain to CloudFlare
2. Update nameservers at registrar
3. Enable "Auto Minify" for HTML/CSS/JS
4. Enable "Brotli" compression
5. Set caching rules
6. Enable "Always Use HTTPS"

---

## 📊 Monitoring & Maintenance

### Health Checks

```bash
# Create health check endpoint
cat > /var/www/pixellogistics-wms/health.html << 'EOF'
<!DOCTYPE html>
<html>
<head><title>Health Check</title></head>
<body>OK</body>
</html>
EOF

# Monitor script
#!/bin/bash
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://wms.yourcompany.com/health.html)
if [ $STATUS -ne 200 ]; then
    echo "WMS is down! Status: $STATUS"
    # Send alert
fi
```

### Uptime Monitoring

**Recommended Services:**
- UptimeRobot (free)
- Pingdom
- StatusCake
- DataDog

**Setup:**
1. Create account
2. Add URL: https://wms.yourcompany.com
3. Set check interval: 5 minutes
4. Configure alerts (email/SMS)

### Log Management

```bash
# Nginx access logs
tail -f /var/log/nginx/wms-access.log

# Error logs
tail -f /var/log/nginx/wms-error.log

# Log rotation (automatic with logrotate)
cat > /etc/logrotate.d/wms << 'EOF'
/var/log/nginx/wms-*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 `cat /var/run/nginx.pid`
    endscript
}
EOF
```

---

## 💾 Backup & Recovery

### Backup Strategy

**Daily Backups:**
```bash
#!/bin/bash
# backup-wms.sh

BACKUP_DIR="/backups/wms"
DATE=$(date +%Y%m%d_%H%M%S)
SOURCE="/var/www/pixellogistics-wms"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup files
tar -czf $BACKUP_DIR/wms-backup-$DATE.tar.gz -C $SOURCE .

# Keep only last 30 days
find $BACKUP_DIR -name "wms-backup-*.tar.gz" -mtime +30 -delete

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR/wms-backup-$DATE.tar.gz s3://your-backup-bucket/wms/
```

**Schedule with cron:**
```bash
# Run daily at 2 AM
0 2 * * * /usr/local/bin/backup-wms.sh
```

### Recovery Procedure

```bash
# 1. Stop web server
sudo systemctl stop nginx

# 2. Restore from backup
cd /var/www
sudo tar -xzf /backups/wms/wms-backup-YYYYMMDD_HHMMSS.tar.gz -C pixellogistics-wms

# 3. Verify permissions
sudo chown -R www-data:www-data pixellogistics-wms

# 4. Restart web server
sudo systemctl start nginx

# 5. Verify
curl -I https://wms.yourcompany.com
```

---

## 🔧 Troubleshooting

### Common Issues

**Issue 1: 404 Not Found on page refresh**
```nginx
# Solution: Add SPA fallback to Nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

**Issue 2: CORS errors**
```nginx
# Solution: Add CORS headers
add_header Access-Control-Allow-Origin "*" always;
add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
```

**Issue 3: Slow page load**
```bash
# Solution 1: Enable gzip
gzip on;

# Solution 2: Enable browser caching
expires 1y;

# Solution 3: Use CDN
```

**Issue 4: Service worker not updating**
```javascript
// Solution: Increment version in sw.js
const CACHE_VERSION = 'v2'; // Increment this
```

### Debug Commands

```bash
# Check Nginx configuration
sudo nginx -t

# View error logs
sudo tail -f /var/log/nginx/error.log

# Test SSL certificate
openssl s_client -connect wms.yourcompany.com:443

# Check port availability
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# Restart services
sudo systemctl restart nginx

# Check service status
sudo systemctl status nginx
```

---

## 📞 Support

**For deployment assistance:**
- Email: devops@pixellogistics.com
- Documentation: docs.pixellogistics.com
- Slack: pixellogistics.slack.com

**Emergency Support:**
- 24/7 Hotline: 1-800-PIXEL-911
- On-call Engineer: oncall@pixellogistics.com

---

**Document Version:** 1.0  
**Last Updated:** November 17, 2025  
**Next Review:** Quarterly or after major updates
