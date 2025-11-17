# Authentication System Guide

## Overview
Complete authentication system implemented for DLT WMS with login, registration, session management, and user profile features.

## Demo Credentials

### Admin User
- **Username:** admin
- **Password:** admin123
- **Role:** Warehouse Manager
- **Email:** admin@dltwms.com

### Manager User
- **Username:** manager
- **Password:** manager123
- **Role:** Supervisor
- **Email:** manager@dltwms.com

### Worker User
- **Username:** worker
- **Password:** worker123
- **Role:** Warehouse Worker
- **Email:** worker@dltwms.com

## Features

### Login Page (`login.html`)
- Professional split-panel design
- Username/email and password fields
- Show/hide password toggle
- "Remember me" functionality
- Demo credentials (click to auto-fill)
- Forgot password link (placeholder)
- Link to registration page

### Registration Page (`register.html`)
- Full Name field
- Email and Username (side-by-side)
- Password and Confirm Password (side-by-side)
- Password strength indicator (Weak/Medium/Strong)
- Role selection dropdown:
  - Warehouse Manager
  - Supervisor
  - Warehouse Worker
  - Quality Inspector
  - Inventory Analyst
- Warehouse assignment dropdown:
  - WH-001 (Main Distribution Center)
  - WH-002 (East Coast Facility)
  - WH-003 (West Coast Facility)
  - WH-004 (Midwest Facility)
- Terms & Conditions checkbox
- Success message after registration
- Auto-redirect to login page

### Session Management
- **Storage:** localStorage
- **Key:** "currentUser"
- **Timeout:** 30 minutes
- **Activity Detection:** Automatically resets timeout on:
  - Mouse movement
  - Keyboard input
  - Mouse clicks
- **Auto-Logout:** Clears session and redirects to login after 30 minutes of inactivity

### User Menu (All Pages)
Every protected page includes a user dropdown menu in the header with:
- User name display
- Role display
- Profile menu with options:
  - My Profile (placeholder)
  - Change Password (placeholder)
  - Logout (functional)

### Page Protection
All 24 pages are protected with `auth.js`:
1. index.html (Dashboard)
2. receiving.html
3. asn-receipt.html
4. inspection.html
5. putaway.html
6. orders.html
7. picking.html
8. packing.html
9. shipping.html
10. inventory.html
11. location-management.html
12. lpn-management.html
13. quality-inspection.html
14. cycle-count.html
15. lot-traceability.html
16. kitting.html
17. labeling.html
18. crossdock.html
19. replenishment.html
20. task-management.html
21. returns.html
22. reports.html
23. search.html
24. create-order.html

## How to Test

### 1. Test Login
1. Open `login.html` in a browser
2. Click on any demo user box to auto-fill credentials
3. Click "Sign In"
4. Should redirect to `index.html` (Dashboard)
5. Verify user name and role appear in header

### 2. Test Registration
1. Open `register.html`
2. Fill out all required fields:
   - Full Name
   - Email
   - Username
   - Password (watch strength indicator)
   - Confirm Password
   - Select a Role
   - Select a Warehouse
   - Check "Terms & Conditions"
3. Click "Create Account"
4. Should show success message
5. Auto-redirect to login page after 2 seconds

### 3. Test Session Persistence
1. Login with demo credentials
2. Navigate to different pages (orders, inventory, etc.)
3. User info should persist in header
4. Refresh the page
5. Should remain logged in (session persists)

### 4. Test Unauthorized Access
1. Open browser in incognito/private mode
2. Try to access any page directly (e.g., `orders.html`)
3. Should automatically redirect to `login.html`

### 5. Test Logout
1. Login with demo credentials
2. Click on user avatar in header
3. Click "Logout" from dropdown
4. Should redirect to `login.html`
5. Session should be cleared

### 6. Test Auto-Logout (30-minute timeout)
1. Login with demo credentials
2. Wait 30 minutes without any interaction
3. System should auto-logout and redirect to login
4. (OR) Temporarily modify timeout in `js/auth.js` to test faster:
   ```javascript
   // Change line 16 from:
   const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
   // To:
   const SESSION_TIMEOUT = 60 * 1000; // 1 minute (for testing)
   ```

### 7. Test User Menu
1. Login with any demo user
2. Click on user avatar (top-right corner)
3. Dropdown should appear with 3 options
4. Click "My Profile" - should show placeholder alert
5. Click "Change Password" - should show placeholder alert
6. Click "Logout" - should logout and redirect

### 8. Test Dark Theme
1. Login and navigate to any page
2. Click theme toggle button (sun/moon icon)
3. Auth pages and user menu should adapt to dark theme
4. Test login/register pages in dark theme

## File Structure

```
frontend/
├── login.html              # Login page
├── register.html           # Registration page
├── css/
│   ├── auth.css           # Authentication styling (659 lines)
│   └── styles.css         # Updated with user menu styles
└── js/
    └── auth.js            # Authentication logic (331 lines)
```

## Security Notes

⚠️ **Development Only**: This is a frontend-only authentication system for development and demonstration purposes.

### Current Implementation:
- ✅ Session management with localStorage
- ✅ Client-side form validation
- ✅ Password strength checking
- ✅ Auto-logout after 30 minutes
- ✅ Protected page access

### For Production:
- ❌ No backend API integration
- ❌ No real password encryption (passwords stored in plain text in demo)
- ❌ No email verification
- ❌ No password reset functionality
- ❌ No JWT tokens or secure session storage
- ❌ No HTTPS requirement
- ❌ No rate limiting or brute-force protection

### Production Recommendations:
1. Integrate with backend authentication API
2. Use secure password hashing (bcrypt, Argon2)
3. Implement JWT or session tokens
4. Add email verification
5. Implement secure password reset flow
6. Use HTTPS only
7. Add rate limiting
8. Implement CSRF protection
9. Add two-factor authentication (2FA)
10. Use secure, httpOnly cookies

## Next Steps

### Immediate Enhancements:
1. **Profile Modal**: Create a modal to view/edit user profile
2. **Change Password Modal**: Implement password change functionality
3. **Forgot Password Flow**: Add email-based password reset (simulation)
4. **Role-Based UI**: Show/hide features based on user role
5. **User Management Page**: Admin page to manage all users

### Backend Integration (Future):
1. Create REST API for authentication
2. Implement secure session management
3. Add database integration
4. Implement proper password hashing
5. Add email service integration
6. Implement audit logging

## Troubleshooting

### Login not working:
- Check browser console for errors
- Verify `js/auth.js` is loaded
- Try clearing localStorage: `localStorage.clear()`
- Check that credentials match demo users exactly

### User menu not showing:
- Verify `css/styles.css` has user menu styles
- Check that `toggleUserMenu()` function exists
- Verify user-dropdown element exists in HTML

### Session not persisting:
- Check localStorage in browser DevTools (Application tab)
- Verify `currentUser` key exists
- Check browser console for auth errors

### Auto-logout not working:
- Verify activity listeners are attached
- Check SESSION_TIMEOUT value in auth.js
- Test with reduced timeout (1 minute) for faster verification

## Support

For issues or questions about the authentication system, refer to:
- `js/auth.js` - Main authentication logic
- `css/auth.css` - Authentication styling
- `login.html` & `register.html` - Page structure

---

**Last Updated:** January 2025  
**Version:** 1.0  
**Status:** ✅ Complete and Functional
