const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { Assignment, AssignmentFile, User, Module } = require('../models');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    const userDir = path.join(uploadDir, req.user.id);
    
    try {
      await fs.mkdir(userDir, { recursive: true });
      cb(null, userDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: (req, file, cb) => {
    // Allow specific file types
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|txt|zip/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images, PDFs, documents, and ZIP files are allowed'));
  }
});

/**
 * POST /api/assignments
 * Submit an assignment
 */
router.post('/', authenticateToken, upload.array('files', 5), async (req, res) => {
  try {
    const { courseId, moduleId, caseStudy } = req.body;

    if (!moduleId || !caseStudy) {
      return res.status(400).json({ 
        error: 'moduleId and caseStudy are required' 
      });
    }

    // Check if module exists
    const module = await Module.findByPk(moduleId);
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    // Create assignment
    const assignment = await Assignment.create({
      userId: req.user.id,
      moduleId,
      caseStudy,
      status: 'pending',
      submittedAt: new Date()
    });

    // Save file information
    if (req.files && req.files.length > 0) {
      const fileRecords = req.files.map(file => ({
        assignmentId: assignment.id,
        filename: file.filename,
        originalName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype
      }));

      await AssignmentFile.bulkCreate(fileRecords);
    }

    // Fetch complete assignment with files
    const completeAssignment = await Assignment.findByPk(assignment.id, {
      include: [
        { model: AssignmentFile, as: 'files' },
        { model: Module, as: 'module' }
      ]
    });

    res.status(201).json({ 
      message: 'Assignment submitted successfully',
      assignment: completeAssignment
    });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ error: 'Failed to submit assignment' });
  }
});

/**
 * GET /api/assignments
 * Get assignments (filtered by role)
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, moduleId, page = 1, limit = 20 } = req.query;

    const where = {};

    // Students can only see their own assignments
    if (req.user.role === 'student') {
      where.userId = req.user.id;
    }

    if (status) where.status = status;
    if (moduleId) where.moduleId = moduleId;

    const offset = (page - 1) * limit;

    const { rows: assignments, count } = await Assignment.findAndCountAll({
      where,
      include: [
        { 
          model: User, 
          as: 'student',
          attributes: ['id', 'name', 'email', 'profilePhoto']
        },
        { model: Module, as: 'module' },
        { model: AssignmentFile, as: 'files' },
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'name'],
          required: false
        }
      ],
      order: [['submittedAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      assignments,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

/**
 * GET /api/assignments/pending
 * Get all pending assignments (admin only)
 */
router.get('/pending', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const assignments = await Assignment.findAll({
      where: { status: 'pending' },
      include: [
        { 
          model: User, 
          as: 'student',
          attributes: ['id', 'name', 'email', 'profilePhoto']
        },
        { model: Module, as: 'module' },
        { model: AssignmentFile, as: 'files' }
      ],
      order: [['submittedAt', 'ASC']]
    });

    res.json({ assignments });
  } catch (error) {
    console.error('Get pending assignments error:', error);
    res.status(500).json({ error: 'Failed to fetch pending assignments' });
  }
});

/**
 * GET /api/assignments/:id
 * Get assignment by ID
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findByPk(id, {
      include: [
        { 
          model: User, 
          as: 'student',
          attributes: ['id', 'name', 'email', 'profilePhoto']
        },
        { model: Module, as: 'module' },
        { model: AssignmentFile, as: 'files' },
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'name'],
          required: false
        }
      ]
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Students can only view their own assignments
    if (req.user.role === 'student' && assignment.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ assignment });
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ error: 'Failed to fetch assignment' });
  }
});

/**
 * PUT /api/assignments/:id/approve
 * Approve an assignment (admin only)
 */
router.put('/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback = '' } = req.body;

    const assignment = await Assignment.findByPk(id);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    if (assignment.status !== 'pending') {
      return res.status(400).json({ error: 'Assignment already reviewed' });
    }

    await assignment.update({
      status: 'approved',
      feedback,
      reviewedBy: req.user.id,
      reviewedAt: new Date()
    });

    // Mark module as completed in progress
    const Progress = require('../models').Progress;
    await Progress.findOrCreate({
      where: {
        userId: assignment.userId,
        moduleId: assignment.moduleId,
        chapterId: null
      },
      defaults: {
        courseId: (await Module.findByPk(assignment.moduleId)).courseId,
        completed: true,
        completedAt: new Date()
      }
    });

    const updatedAssignment = await Assignment.findByPk(id, {
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'reviewer', attributes: ['id', 'name'] },
        { model: Module, as: 'module' }
      ]
    });

    res.json({ 
      message: 'Assignment approved successfully',
      assignment: updatedAssignment
    });
  } catch (error) {
    console.error('Approve assignment error:', error);
    res.status(500).json({ error: 'Failed to approve assignment' });
  }
});

/**
 * PUT /api/assignments/:id/reject
 * Reject an assignment (admin only)
 */
router.put('/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;

    if (!feedback) {
      return res.status(400).json({ error: 'Feedback is required for rejection' });
    }

    const assignment = await Assignment.findByPk(id);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    if (assignment.status !== 'pending') {
      return res.status(400).json({ error: 'Assignment already reviewed' });
    }

    await assignment.update({
      status: 'rejected',
      feedback,
      reviewedBy: req.user.id,
      reviewedAt: new Date()
    });

    const updatedAssignment = await Assignment.findByPk(id, {
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'reviewer', attributes: ['id', 'name'] },
        { model: Module, as: 'module' }
      ]
    });

    res.json({ 
      message: 'Assignment rejected',
      assignment: updatedAssignment
    });
  } catch (error) {
    console.error('Reject assignment error:', error);
    res.status(500).json({ error: 'Failed to reject assignment' });
  }
});

/**
 * GET /api/assignments/files/:fileId
 * Download assignment file
 */
router.get('/files/:fileId', authenticateToken, async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await AssignmentFile.findByPk(fileId, {
      include: {
        model: Assignment,
        as: 'assignment'
      }
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Students can only download their own files, admins can download any
    if (req.user.role === 'student' && file.assignment.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.download(file.filePath, file.originalName);
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

module.exports = router;
