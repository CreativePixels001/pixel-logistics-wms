const express = require('express');
const router = express.Router();
const { User, Course, Module, Enrollment, Progress, Assignment } = require('../models');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { Op } = require('sequelize');

/**
 * GET /api/analytics/overview
 * Get overall analytics (admin only)
 */
router.get('/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Total students
    const totalStudents = await User.count({ where: { role: 'student' } });

    // Active students (logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeStudents = await User.count({
      where: {
        role: 'student',
        lastLogin: { [Op.gte]: thirtyDaysAgo }
      }
    });

    // Total enrollments
    const totalEnrollments = await Enrollment.count();

    // Completed courses
    const completedCourses = await Enrollment.count({
      where: { status: 'completed' }
    });

    // Average completion rate
    const enrollments = await Enrollment.findAll({
      attributes: ['completionPercentage']
    });
    const avgCompletion = enrollments.length > 0
      ? enrollments.reduce((sum, e) => sum + e.completionPercentage, 0) / enrollments.length
      : 0;

    // Assignment stats
    const pendingAssignments = await Assignment.count({ where: { status: 'pending' } });
    const approvedAssignments = await Assignment.count({ where: { status: 'approved' } });
    const rejectedAssignments = await Assignment.count({ where: { status: 'rejected' } });
    const totalAssignments = pendingAssignments + approvedAssignments + rejectedAssignments;
    
    const approvalRate = totalAssignments > 0
      ? Math.round((approvedAssignments / totalAssignments) * 100)
      : 0;

    res.json({
      students: {
        total: totalStudents,
        active: activeStudents
      },
      enrollments: {
        total: totalEnrollments,
        completed: completedCourses,
        avgCompletion: Math.round(avgCompletion)
      },
      assignments: {
        total: totalAssignments,
        pending: pendingAssignments,
        approved: approvedAssignments,
        rejected: rejectedAssignments,
        approvalRate
      }
    });
  } catch (error) {
    console.error('Get analytics overview error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

/**
 * GET /api/analytics/courses/:courseId
 * Get analytics for a specific course (admin only)
 */
router.get('/courses/:courseId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findByPk(courseId, {
      include: [
        {
          model: Module,
          as: 'modules',
          include: [
            {
              model: Assignment,
              as: 'assignments'
            },
            {
              model: Progress,
              as: 'progress'
            }
          ]
        }
      ]
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Enrollment stats
    const totalEnrolled = await Enrollment.count({ where: { courseId } });
    const completed = await Enrollment.count({ 
      where: { courseId, status: 'completed' } 
    });

    // Module completion rates
    const moduleStats = await Promise.all(
      course.modules.map(async (module) => {
        const completedCount = await Progress.count({
          where: {
            moduleId: module.id,
            chapterId: null, // Module-level completion
            completed: true
          }
        });

        const assignmentCount = await Assignment.count({
          where: { moduleId: module.id }
        });

        const approvedCount = await Assignment.count({
          where: { moduleId: module.id, status: 'approved' }
        });

        return {
          moduleId: module.id,
          title: module.title,
          studentsCompleted: completedCount,
          completionRate: totalEnrolled > 0 
            ? Math.round((completedCount / totalEnrolled) * 100) 
            : 0,
          assignments: {
            total: assignmentCount,
            approved: approvedCount
          }
        };
      })
    );

    res.json({
      course: {
        id: course.id,
        title: course.title
      },
      enrollment: {
        total: totalEnrolled,
        completed,
        completionRate: totalEnrolled > 0 
          ? Math.round((completed / totalEnrolled) * 100) 
          : 0
      },
      modules: moduleStats
    });
  } catch (error) {
    console.error('Get course analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch course analytics' });
  }
});

/**
 * GET /api/analytics/students
 * Get student analytics (admin only)
 */
router.get('/students', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const students = await User.findAll({
      where: { role: 'student' },
      include: [
        {
          model: Enrollment,
          as: 'enrollments',
          include: ['course']
        },
        {
          model: Progress,
          as: 'progress',
          where: { completed: true },
          required: false
        },
        {
          model: Assignment,
          as: 'assignments'
        }
      ]
    });

    const studentStats = students.map(student => {
      const completedChapters = student.progress.length;
      const totalAssignments = student.assignments.length;
      const approvedAssignments = student.assignments.filter(a => a.status === 'approved').length;
      
      const avgProgress = student.enrollments.length > 0
        ? student.enrollments.reduce((sum, e) => sum + e.completionPercentage, 0) / student.enrollments.length
        : 0;

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        enrollments: student.enrollments.length,
        avgProgress: Math.round(avgProgress),
        completedChapters,
        assignments: {
          total: totalAssignments,
          approved: approvedAssignments,
          pending: student.assignments.filter(a => a.status === 'pending').length
        },
        lastLogin: student.lastLogin
      };
    });

    res.json({ students: studentStats });
  } catch (error) {
    console.error('Get student analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch student analytics' });
  }
});

/**
 * GET /api/analytics/modules
 * Get module-level analytics (admin only)
 */
router.get('/modules', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const modules = await Module.findAll({
      include: [
        { model: Course, as: 'course' },
        {
          model: Progress,
          as: 'progress',
          where: { completed: true, chapterId: null },
          required: false
        },
        {
          model: Assignment,
          as: 'assignments'
        }
      ]
    });

    const moduleStats = modules.map(module => {
      const studentsStarted = module.progress.length;
      const assignments = module.assignments;
      const avgTime = module.progress.length > 0
        ? module.progress.reduce((sum, p) => sum + p.timeSpent, 0) / module.progress.length
        : 0;

      return {
        id: module.id,
        title: module.title,
        course: module.course.title,
        studentsCompleted: studentsStarted,
        avgTimeMinutes: Math.round(avgTime / 60),
        assignments: {
          total: assignments.length,
          pending: assignments.filter(a => a.status === 'pending').length,
          approved: assignments.filter(a => a.status === 'approved').length,
          rejected: assignments.filter(a => a.status === 'rejected').length
        }
      };
    });

    res.json({ modules: moduleStats });
  } catch (error) {
    console.error('Get module analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch module analytics' });
  }
});

module.exports = router;
