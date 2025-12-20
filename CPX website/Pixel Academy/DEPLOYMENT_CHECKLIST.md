# Production Deployment Checklist

## 🎯 Pre-Deployment

### Backend Setup
- [ ] PostgreSQL database created and configured
- [ ] Environment variables set in `.env`
- [ ] Google OAuth credentials configured
- [ ] Admin emails added to `ADMIN_EMAILS`
- [ ] JWT secret changed from example (min 32 characters)
- [ ] Database seeded with course content
- [ ] Dependencies installed (`npm install`)
- [ ] Server tested locally (`npm run dev`)

### Frontend Integration
- [ ] Update API base URL in frontend
- [ ] Google Sign-In button configured with Client ID
- [ ] Replace `localStorage` calls with API calls
- [ ] Add authentication checks to all pages
- [ ] Update file upload to use FormData
- [ ] Test login flow end-to-end

## 🔐 Security Checklist

- [ ] Change `JWT_SECRET` to strong random string
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS (SSL certificate)
- [ ] Configure CORS for production domain
- [ ] Review and restrict file upload types
- [ ] Set strong database password
- [ ] Enable database connection encryption
- [ ] Add rate limiting (already included)
- [ ] Review admin email list
- [ ] Set up backup strategy

## 🚀 Deployment Steps

### 1. Database Migration

```bash
# Create production database
createdb pixel_academy_production

# Run migrations (or let Sequelize sync)
npm run migrate

# Seed course data
npm run seed
```

### 2. Environment Configuration

```env
NODE_ENV=production
PORT=3000
DB_HOST=your-db-host
DB_NAME=pixel_academy_production
DB_USER=postgres
DB_PASSWORD=strong-secure-password
JWT_SECRET=your-production-jwt-secret-min-32-chars
GOOGLE_CLIENT_ID=production-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=production-client-secret
FRONTEND_URL=https://academy.yourdomain.com
ADMIN_EMAILS=admin@yourdomain.com
```

### 3. Google OAuth Production Setup

1. Add production domain to Google Cloud Console
2. Authorized JavaScript origins: `https://academy.yourdomain.com`
3. Authorized redirect URIs: `https://academy.yourdomain.com/login.html`
4. Update Client ID in frontend

### 4. File Storage Migration

**Option A: AWS S3 (Recommended)**

```bash
npm install aws-sdk
```

Update `routes/assignments.js`:
```javascript
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
});
```

**Option B: Keep local storage**
- Ensure uploads directory is persistent
- Configure backup for uploads folder

### 5. Deploy Backend

**Heroku:**
```bash
heroku create pixel-academy-api
heroku addons:create heroku-postgresql:mini
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
# ... add all env vars
git push heroku main
```

**Railway:**
```bash
railway init
railway add postgresql
railway up
```

**AWS EC2:**
- Launch instance
- Install Node.js and PostgreSQL
- Configure nginx as reverse proxy
- Set up PM2 for process management
- Configure SSL with Let's Encrypt

### 6. Deploy Frontend

**Netlify:**
```bash
# Add to netlify.toml
[build]
  publish = "."
  
[[redirects]]
  from = "/api/*"
  to = "https://your-backend-url.com/api/:splat"
  status = 200
```

**Vercel:**
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://your-backend-url.com/api/$1" }
  ]
}
```

## 📊 Post-Deployment

### Testing
- [ ] Test user registration (Google OAuth)
- [ ] Test admin login
- [ ] Test course enrollment
- [ ] Test chapter completion
- [ ] Test assignment submission with files
- [ ] Test assignment approval/rejection
- [ ] Test admin dashboard
- [ ] Test analytics page
- [ ] Test file downloads
- [ ] Test on mobile devices

### Monitoring
- [ ] Set up error logging (Sentry, LogRocket)
- [ ] Configure uptime monitoring
- [ ] Set up database backups
- [ ] Monitor API response times
- [ ] Track user analytics

### Documentation
- [ ] Update API base URL in documentation
- [ ] Document admin user creation process
- [ ] Create user guide
- [ ] Document backup procedures

## 🔄 Ongoing Maintenance

### Daily
- [ ] Monitor error logs
- [ ] Check server health

### Weekly
- [ ] Review pending assignments
- [ ] Check user activity
- [ ] Monitor disk space

### Monthly
- [ ] Database backup verification
- [ ] Security updates
- [ ] Performance optimization review

## 🆘 Rollback Plan

If deployment fails:

1. Keep old version running
2. Test new version in staging
3. Database: Keep backups before migration
4. Quick rollback: `git revert` + redeploy

## 📞 Support Contacts

- **Database Issues**: Your DB provider support
- **Hosting Issues**: Your hosting provider support
- **Google OAuth**: Google Cloud Console support
- **Code Issues**: GitHub issues or team contact

---

## ✅ Final Checks Before Going Live

- [ ] All tests passing
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] SSL certificate active
- [ ] Domain configured
- [ ] Error pages set up
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Admin accounts created
- [ ] Test user accounts created
- [ ] Load testing completed

**Ready to deploy!** 🚀
