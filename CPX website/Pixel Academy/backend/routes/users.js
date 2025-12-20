const express = require('express');
const router = express.Router();
const { User, Enrollment, Progress, Assignment } = require('../models');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

/**
 * GET /api/users
 * Get all users (admin only)
 */
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { role, search, page = 1, limit = 50 } = req.query;

    const where = {};
    if (role) where.role = role;
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { rows: users, count } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['googleId'] }
    });

    res.json({
      users,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * GET /api/users/:id
 * Get user by ID with progress
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Students can only view their own profile, admins can view any
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findByPk(id, {
      attributes: { exclude: ['googleId'] },
      include: [
        {
          model: Enrollment,
          as: 'enrollments',
          include: ['course']
        },
        {
          model: Progress,
          as: 'progress'
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * PUT /api/users/:id
 * Update user
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, isActive } = req.body;

    // Students can only update their own name
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updates = {};
    if (name) updates.name = name;

    // Only admins can change role and active status
    if (req.user.role === 'admin') {
      if (role) updates.role = role;
      if (typeof isActive !== 'undefined') updates.isActive = isActive;
    }

    await user.update(updates);

    res.json({ 
      message: 'User updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

/**
 * DELETE /api/users/:id
 * Delete user (admin only)
 */
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.destroy();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

/**
 * GET /api/users/:id/dashboard
 * Get dashboard data for a user
 */
router.get('/:id/dashboard', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Students can only view their own dashboard
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const enrollments = await Enrollment.findAll({
      where: { userId: id },
      include: ['course']
    });

    const progress = await Progress.findAll({
      where: { userId: id, completed: true }
    });

    const assignments = await Assignment.findAll({
      where: { userId: id },
      include: ['module']
    });

    const pendingAssignments = assignments.filter(a => a.status === 'pending');
    const approvedAssignments = assignments.filter(a => a.status === 'approved');

    res.json({
      enrollments: enrollments.length,
      completedChapters: progress.length,
      assignments: {
        total: assignments.length,
        pending: pendingAssignments.length,
        approved: approvedAssignments.length
      },
      courses: enrollments
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;
