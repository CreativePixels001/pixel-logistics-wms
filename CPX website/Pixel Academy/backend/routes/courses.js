const express = require('express');
const router = express.Router();
const { Course, Module, Chapter, Enrollment } = require('../models');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

/**
 * GET /api/courses
 * Get all published courses
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const where = { isPublished: true };

    const courses = await Course.findAll({
      where,
      include: [
        {
          model: Module,
          as: 'modules',
          where: { isPublished: true },
          required: false,
          include: [
            {
              model: Chapter,
              as: 'chapters',
              where: { isPublished: true },
              required: false
            }
          ]
        }
      ],
      order: [
        ['createdAt', 'DESC'],
        [{ model: Module, as: 'modules' }, 'order', 'ASC'],
        [{ model: Module, as: 'modules' }, { model: Chapter, as: 'chapters' }, 'order', 'ASC']
      ]
    });

    res.json({ courses });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

/**
 * GET /api/courses/:slug
 * Get course by slug
 */
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const { slug } = req.params;

    const course = await Course.findOne({
      where: { slug, isPublished: true },
      include: [
        {
          model: Module,
          as: 'modules',
          where: { isPublished: true },
          required: false,
          include: [
            {
              model: Chapter,
              as: 'chapters',
              where: { isPublished: true },
              required: false
            }
          ]
        }
      ],
      order: [
        [{ model: Module, as: 'modules' }, 'order', 'ASC'],
        [{ model: Module, as: 'modules' }, { model: Chapter, as: 'chapters' }, 'order', 'ASC']
      ]
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ course });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

/**
 * POST /api/courses/:courseId/enroll
 * Enroll in a course
 */
router.post('/:courseId/enroll', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findByPk(courseId);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      where: { userId: req.user.id, courseId }
    });

    if (existingEnrollment) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }

    const enrollment = await Enrollment.create({
      userId: req.user.id,
      courseId,
      status: 'active'
    });

    res.json({ 
      message: 'Enrolled successfully',
      enrollment 
    });
  } catch (error) {
    console.error('Enroll error:', error);
    res.status(500).json({ error: 'Failed to enroll' });
  }
});

/**
 * GET /api/courses/:courseId/my-progress
 * Get user's progress in a course
 */
router.get('/:courseId/my-progress', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;

    const enrollment = await Enrollment.findOne({
      where: { userId: req.user.id, courseId },
      include: ['course']
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'Not enrolled in this course' });
    }

    const Progress = require('../models').Progress;
    const progress = await Progress.findAll({
      where: { userId: req.user.id, courseId },
      include: ['module', 'chapter']
    });

    res.json({ 
      enrollment,
      progress 
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

module.exports = router;
