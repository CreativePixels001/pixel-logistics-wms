const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { User } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Admin emails list
const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());

/**
 * POST /api/auth/google
 * Authenticate with Google OAuth
 */
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Find or create user
    let user = await User.findOne({ where: { email } });

    if (!user) {
      // Determine role based on email
      const role = adminEmails.includes(email) ? 'admin' : 'student';

      user = await User.create({
        email,
        name,
        googleId,
        profilePhoto: picture,
        role,
        lastLogin: new Date()
      });

      console.log(`✓ New user created: ${email} (${role})`);
    } else {
      // Update existing user
      await user.update({
        googleId: googleId || user.googleId,
        profilePhoto: picture || user.profilePhoto,
        name: name || user.name,
        lastLogin: new Date()
      });
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profilePhoto: user.profilePhoto
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    
    if (error.message && error.message.includes('Token')) {
      return res.status(401).json({ error: 'Invalid Google token' });
    }
    
    res.status(500).json({ error: 'Authentication failed' });
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        profilePhoto: req.user.profilePhoto,
        lastLogin: req.user.lastLogin
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

/**
 * POST /api/auth/logout
 * Logout (client-side will remove token)
 */
router.post('/logout', authenticateToken, async (req, res) => {
  // In a stateless JWT setup, logout is handled client-side
  // Optionally, you could maintain a token blacklist
  res.json({ message: 'Logged out successfully' });
});

/**
 * POST /api/auth/refresh
 * Refresh JWT token
 */
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    const jwtToken = jwt.sign(
      { 
        userId: req.user.id, 
        email: req.user.email,
        role: req.user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({ token: jwtToken });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

module.exports = router;
