const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// Middleware for authentication
const auth = require('../middleware/authSimple');
const adminAuth = require('../middleware/adminAuth');

// Mock database (replace with actual DB calls)
let users = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@pixellogistics.com',
    password: '$2a$10$YourHashedPasswordHere', // 'admin123'
    role: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    phone: '+91-9876543210',
    status: 'active',
    warehouse: 'WH-001',
    permissions: ['all'],
    createdAt: new Date(),
    lastLogin: new Date()
  }
];

/**
 * @route   POST /api/users/register
 * @desc    Register new user
 * @access  Admin
 */
router.post('/register',
  adminAuth,
  [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['admin', 'manager', 'supervisor', 'operator', 'viewer']).withMessage('Invalid role')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password, role, firstName, lastName, phone, warehouse } = req.body;

      // Check if user exists
      const userExists = users.find(u => u.email === email || u.username === username);
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const newUser = {
        id: users.length + 1,
        username,
        email,
        password: hashedPassword,
        role,
        firstName,
        lastName,
        phone,
        warehouse,
        status: 'active',
        permissions: role === 'admin' ? ['all'] : ['read'],
        createdAt: new Date(),
        lastLogin: null
      };

      users.push(newUser);

      // Don't send password in response
      const { password: _, ...userResponse } = newUser;

      res.status(201).json({
        message: 'User created successfully',
        user: userResponse
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error during registration' });
    }
  }
);

/**
 * @route   POST /api/users/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login',
  [
    body('username').trim().notEmpty().withMessage('Username required'),
    body('password').notEmpty().withMessage('Password required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, password } = req.body;

      // Find user
      const user = users.find(u => u.username === username || u.email === username);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check if user is active
      if (user.status !== 'active') {
        return res.status(403).json({ message: 'Account is inactive' });
      }

      // Update last login
      user.lastLogin = new Date();

      // Generate JWT token
      const payload = {
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          permissions: user.permissions
        }
      };

      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '8h' }
      );

      // Don't send password
      const { password: _, ...userResponse } = user;

      res.json({
        message: 'Login successful',
        token,
        user: userResponse
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  }
);

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Admin
 */
router.get('/', adminAuth, async (req, res) => {
  try {
    const { role, status, warehouse, search } = req.query;

    let filteredUsers = [...users];

    // Apply filters
    if (role) {
      filteredUsers = filteredUsers.filter(u => u.role === role);
    }
    if (status) {
      filteredUsers = filteredUsers.filter(u => u.status === status);
    }
    if (warehouse) {
      filteredUsers = filteredUsers.filter(u => u.warehouse === warehouse);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(u =>
        u.username.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower) ||
        u.firstName?.toLowerCase().includes(searchLower) ||
        u.lastName?.toLowerCase().includes(searchLower)
      );
    }

    // Remove passwords from response
    const usersResponse = filteredUsers.map(({ password, ...user }) => user);

    res.json({
      total: usersResponse.length,
      users: usersResponse
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Admin/Self
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const user = users.find(u => u.id === parseInt(req.params.id));

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is admin or viewing their own profile
    if (req.user.role !== 'admin' && req.user.id !== user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { password, ...userResponse } = user;
    res.json(userResponse);

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error fetching user' });
  }
});

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Admin/Self (limited)
 */
router.put('/:id',
  auth,
  [
    body('email').optional().isEmail().withMessage('Valid email required'),
    body('role').optional().isIn(['admin', 'manager', 'supervisor', 'operator', 'viewer'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));

      if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isAdmin = req.user.role === 'admin';
      const isSelf = req.user.id === users[userIndex].id;

      if (!isAdmin && !isSelf) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const { email, firstName, lastName, phone, role, status, warehouse, permissions } = req.body;

      // Non-admins can only update their own basic info
      if (!isAdmin && (role || status || warehouse || permissions)) {
        return res.status(403).json({ message: 'Cannot modify role/status/warehouse/permissions' });
      }

      // Update allowed fields
      if (email) users[userIndex].email = email;
      if (firstName) users[userIndex].firstName = firstName;
      if (lastName) users[userIndex].lastName = lastName;
      if (phone) users[userIndex].phone = phone;
      
      // Admin-only updates
      if (isAdmin) {
        if (role) users[userIndex].role = role;
        if (status) users[userIndex].status = status;
        if (warehouse) users[userIndex].warehouse = warehouse;
        if (permissions) users[userIndex].permissions = permissions;
      }

      users[userIndex].updatedAt = new Date();

      const { password, ...userResponse } = users[userIndex];

      res.json({
        message: 'User updated successfully',
        user: userResponse
      });

    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ message: 'Server error updating user' });
    }
  }
);

/**
 * @route   PUT /api/users/:id/password
 * @desc    Change user password
 * @access  Admin/Self
 */
router.put('/:id/password',
  auth,
  [
    body('currentPassword').if((value, { req }) => req.user.id === parseInt(req.params.id))
      .notEmpty().withMessage('Current password required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));

      if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isAdmin = req.user.role === 'admin';
      const isSelf = req.user.id === users[userIndex].id;

      if (!isAdmin && !isSelf) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // If changing own password, verify current password
      if (isSelf) {
        const isMatch = await bcrypt.compare(req.body.currentPassword, users[userIndex].password);
        if (!isMatch) {
          return res.status(401).json({ message: 'Current password incorrect' });
        }
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.newPassword, salt);
      
      users[userIndex].password = hashedPassword;
      users[userIndex].updatedAt = new Date();

      res.json({ message: 'Password updated successfully' });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Server error changing password' });
    }
  }
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (soft delete - set status to inactive)
 * @access  Admin
 */
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));

    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting yourself
    if (req.user.id === users[userIndex].id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    // Soft delete - set status to inactive
    users[userIndex].status = 'inactive';
    users[userIndex].deletedAt = new Date();

    res.json({ message: 'User deactivated successfully' });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
});

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile/me', auth, async (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { password, ...userResponse } = user;
    res.json(userResponse);

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

/**
 * @route   GET /api/users/roles
 * @desc    Get all available roles
 * @access  Admin
 */
router.get('/system/roles', adminAuth, async (req, res) => {
  const roles = [
    { value: 'admin', label: 'Administrator', permissions: ['all'] },
    { value: 'manager', label: 'Warehouse Manager', permissions: ['read', 'write', 'approve'] },
    { value: 'supervisor', label: 'Supervisor', permissions: ['read', 'write'] },
    { value: 'operator', label: 'Warehouse Operator', permissions: ['read', 'execute'] },
    { value: 'viewer', label: 'Viewer', permissions: ['read'] }
  ];

  res.json({ roles });
});

module.exports = router;
