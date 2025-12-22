# 🚀 Quick Setup: Government API Integration

## Get Your API Keys (5 minutes)

### 1. Data.gov.in API Key (REQUIRED)

**Steps:**
1. Go to: https://data.gov.in/
2. Click **"Sign Up"** (top right)
3. Fill form:
   - Name
   - Email
   - Password
4. Verify email (check inbox)
5. Login → Click **"My Account"** → **"API Key"**
6. **Copy your API key**

**Add to config:**
```javascript
// Open: js/api/config.js
// Find line 13:
apiKey: 'YOUR_API_KEY_HERE'
// Replace with your actual key:
apiKey: 'abc123xyz456...'
```

---

### 2. Unsplash API Key (OPTIONAL - for better images)

**Steps:**
1. Go to: https://unsplash.com/developers
2. **Join as a Developer**
3. Create account (or login)
4. **New Application** → Fill app details:
   - Name: "Pi-Trip"
   - Description: "Road trip planning app"
5. Accept terms
6. **Copy "Access Key"**

**Add to config:**
```javascript
// js/api/config.js line 32
accessKey: 'YOUR_UNSPLASH_KEY_HERE'
```

---

## Test It!

1. Save `config.js`
2. Open `trip-details.html` in browser
3. Open **DevTools Console** (F12)
4. Look for:
   ```
   ✅ Loaded from Government API: Manali
   ```

---

## Without API Keys?

**App will still work!** It will use fallback templates.

To disable API attempts:
```javascript
// js/api/config.js
features: {
    useGovernmentAPI: false  // Set to false
}
```

---

## 📖 Full Documentation

See: `GOVERNMENT_API_INTEGRATION.md` for complete guide

---

## 🆘 Help

**API not working?**
- Check console for error messages
- Verify API key is correct
- Check data.gov.in is accessible
- Try clearing cache: `localStorage.clear()`

**Need support?**
- Check: https://data.gov.in/help
- Email: data[dot]gov[dot]in[at]nic[dot]in
