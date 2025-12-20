const express = require('express');
const router = express.Router();
const { Progress, Enrollment, Module, Chapter } = require('../models');
const { authenticateToken } = require('../middleware/auth');

/**
 * POST /api/progress/chapter
 * Mark a chapter as complete
 */
router.post('/chapter', authenticateToken, async (req, res) => {
  try {
    const { courseId, moduleId, chapterId, timeSpent = 0 } = req.body;

    if (!courseId || !moduleId || !chapterId) {
      return res.status(400).json({ 
        error: 'courseId, moduleId, and chapterId are required' 
      });
    }

    // Check enrollment
    const enrollment = await Enrollment.findOne({
      where: { userId: req.user.id, courseId }
    });

    if (!enrollment) {
      return res.status(403).json({ error: 'Not enrolled in this course' });
    }

    // Find or create progress entry
    const [progress, created] = await Progress.findOrCreate({
      where: {
        userId: req.user.id,
        courseId,
        moduleId,
        chapterId
      },
      defaults: {
        completed: true,
        timeSpent,
        completedAt: new Date()
      }
    });

    // If already exists, update it
    if (!created && !progress.completed) {
      await progress.update({
        completed: true,
        timeSpent: progress.timeSpent + timeSpent,
        completedAt: new Date()
      });
    }

    // Update enrollment completion percentage
    await updateEnrollmentProgress(req.user.id, courseId);

    res.json({ 
      message: 'Chapter marked as complete',
      progress 
    });
  } catch (error) {
    console.error('Mark chapter complete error:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

/**
 * POST /api/progress/module
 * Mark a module as complete
 */
router.post('/module', authenticateToken, async (req, res) => {
  try {
    const { courseId, moduleId, timeSpent = 0 } = req.body;

    if (!courseId || !moduleId) {
      return res.status(400).json({ 
        error: 'courseId and moduleId are required' 
      });
    }

    // Check enrollment
    const enrollment = await Enrollment.findOne({
      where: { userId: req.user.id, courseId }
    });

    if (!enrollment) {
      return res.status(403).json({ error: 'Not enrolled in this course' });
    }

    // Find or create progress entry for module
    const [progress, created] = await Progress.findOrCreate({
      where: {
        userId: req.user.id,
        courseId,
        moduleId,
        chapterId: null // null for module-level progress
      },
      defaults: {
        completed: true,
        timeSpent,
        completedAt: new Date()
      }
    });

    if (!created && !progress.completed) {
      await progress.update({
        completed: true,
        timeSpent: progress.timeSpent + timeSpent,
        completedAt: new Date()
      });
    }

    // Update enrollment completion percentage
    await updateEnrollmentProgress(req.user.id, courseId);

    res.json({ 
      message: 'Module marked as complete',
      progress 
    });
  } catch (error) {
    console.error('Mark module complete error:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

/**
 * GET /api/progress/:courseId
 * Get user's progress for a course
 */
router.get('/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;

    const progress = await Progress.findAll({
      where: { 
        userId: req.user.id, 
        courseId 
      },
      include: [
        { model: Module, as: 'module' },
        { model: Chapter, as: 'chapter' }
      ],
      order: [['createdAt', 'DESC']]
    });

    const enrollment = await Enrollment.findOne({
      where: { userId: req.user.id, courseId }
    });

    res.json({ 
      progress,
      completionPercentage: enrollment ? enrollment.completionPercentage : 0
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

/**
 * Helper function to update enrollment completion percentage
 */
async function updateEnrollmentProgress(userId, courseId) {
  try {
    const Course = require('../models').Course;
    
    // Get total chapters in course
    const course = await Course.findByPk(courseId, {
      include: [
        {
          model: Module,
          as: 'modules',
          include: [
            { model: Chapter, as: 'chapters' }
          ]
        }
      ]
    });

    if (!course) return;

    let totalChapters = 0;
    course.modules.forEach(module => {
      totalChapters += module.chapters.length;
    });

    // Get completed chapters count
    const completedProgress = await Progress.count({
      where: {
        userId,
        courseId,
        chapterId: { [require('sequelize').Op.ne]: null }, // Only chapter-level progress
        completed: true
      }
    });

    const completionPercentage = totalChapters > 0 
      ? Math.round((completedProgress / totalChapters) * 100) 
      : 0;

    // Update enrollment
    await Enrollment.update(
      { 
        completionPercentage,
        lastAccessedAt: new Date(),
        ...(completionPercentage === 100 && { 
          status: 'completed',
          completedAt: new Date() 
        })
      },
      { where: { userId, courseId } }
    );
  } catch (error) {
    console.error('Update enrollment progress error:', error);
  }
}

module.exports = router;
