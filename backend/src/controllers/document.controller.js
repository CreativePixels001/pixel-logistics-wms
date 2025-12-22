/**
 * Document Controller
 * Handles document upload, retrieval, and management
 */

const Document = require('../models/tms/Document');
const logger = require('../config/logger');
const path = require('path');
const fs = require('fs').promises;

/**
 * Upload single document
 */
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'No file uploaded'
        }
      });
    }

    const {
      documentType,
      category,
      entityType,
      entityId,
      entityName,
      expiryDate,
      issueDate,
      issuingAuthority,
      documentId,
      state,
      country,
      tags,
      notes
    } = req.body;

    // Create document record
    const document = new Document({
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      documentType: documentType || 'other',
      category: category || 'shipment',
      relatedEntity: entityType && entityId ? {
        entityType,
        entityId,
        entityName
      } : undefined,
      storage: {
        provider: 'local',
        path: req.file.path,
        url: `/uploads/${category}/${req.file.filename}`
      },
      metadata: {
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        issueDate: issueDate ? new Date(issueDate) : undefined,
        issuingAuthority,
        documentId,
        state,
        country,
        tags: tags ? (Array.isArray(tags) ? tags : tags.split(',')) : []
      },
      uploadedBy: {
        id: req.user?.id || 'system',
        name: req.user?.name || 'System',
        email: req.user?.email
      },
      notes
    });

    await document.save();

    res.status(201).json({
      success: true,
      data: document,
      message: 'Document uploaded successfully'
    });

  } catch (error) {
    logger.error('Document upload error:', error);
    
    // Clean up uploaded file if database save fails
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        logger.error('Failed to delete uploaded file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: error.message
      }
    });
  }
};

/**
 * Upload multiple documents
 */
exports.uploadMultipleDocuments = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILES',
          message: 'No files uploaded'
        }
      });
    }

    const { category, entityType, entityId, entityName } = req.body;
    const documents = [];

    for (const file of req.files) {
      const document = new Document({
        fileName: file.filename,
        originalName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        documentType: 'other',
        category: category || 'shipment',
        relatedEntity: entityType && entityId ? {
          entityType,
          entityId,
          entityName
        } : undefined,
        storage: {
          provider: 'local',
          path: file.path,
          url: `/uploads/${category}/${file.filename}`
        },
        uploadedBy: {
          id: req.user?.id || 'system',
          name: req.user?.name || 'System',
          email: req.user?.email
        }
      });

      await document.save();
      documents.push(document);
    }

    res.status(201).json({
      success: true,
      data: documents,
      message: `${documents.length} documents uploaded successfully`
    });

  } catch (error) {
    logger.error('Multiple documents upload error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: error.message
      }
    });
  }
};

/**
 * Get all documents with filtering
 */
exports.getDocuments = async (req, res) => {
  try {
    const {
      category,
      documentType,
      status,
      entityType,
      entityId,
      page = 1,
      limit = 20,
      sort = '-createdAt'
    } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (documentType) filter.documentType = documentType;
    if (status) filter.status = status;
    if (entityType) filter['relatedEntity.entityType'] = entityType;
    if (entityId) filter['relatedEntity.entityId'] = entityId;

    const documents = await Document.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Document.countDocuments(filter);

    res.json({
      success: true,
      data: documents,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    logger.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: error.message
      }
    });
  }
};

/**
 * Get document by ID
 */
exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Document not found'
        }
      });
    }

    res.json({
      success: true,
      data: document
    });

  } catch (error) {
    logger.error('Get document error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: error.message
      }
    });
  }
};

/**
 * Download document
 */
exports.downloadDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Document not found'
        }
      });
    }

    // Check if file exists
    try {
      await fs.access(document.storage.path);
    } catch {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: 'Physical file not found on server'
        }
      });
    }

    // Record download
    await document.recordDownload();

    // Send file
    res.download(document.storage.path, document.originalName);

  } catch (error) {
    logger.error('Download document error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DOWNLOAD_ERROR',
        message: error.message
      }
    });
  }
};

/**
 * Update document metadata
 */
exports.updateDocument = async (req, res) => {
  try {
    const {
      documentType,
      status,
      expiryDate,
      issueDate,
      issuingAuthority,
      tags,
      notes,
      isVerified,
      verificationNotes
    } = req.body;

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Document not found'
        }
      });
    }

    // Update fields
    if (documentType) document.documentType = documentType;
    if (status) document.status = status;
    if (expiryDate) document.metadata.expiryDate = new Date(expiryDate);
    if (issueDate) document.metadata.issueDate = new Date(issueDate);
    if (issuingAuthority) document.metadata.issuingAuthority = issuingAuthority;
    if (tags) document.metadata.tags = Array.isArray(tags) ? tags : tags.split(',');
    if (notes) document.notes = notes;

    // Handle verification
    if (typeof isVerified !== 'undefined') {
      document.verification.isVerified = isVerified;
      if (isVerified) {
        document.verification.verifiedBy = {
          id: req.user?.id || 'system',
          name: req.user?.name || 'System'
        };
        document.verification.verifiedAt = new Date();
        document.verification.notes = verificationNotes;
      }
    }

    document.updatedBy = {
      id: req.user?.id || 'system',
      name: req.user?.name || 'System'
    };

    await document.save();

    res.json({
      success: true,
      data: document,
      message: 'Document updated successfully'
    });

  } catch (error) {
    logger.error('Update document error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: error.message
      }
    });
  }
};

/**
 * Delete document
 */
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Document not found'
        }
      });
    }

    // Delete physical file
    try {
      await fs.unlink(document.storage.path);
    } catch (error) {
      logger.warn(`Failed to delete file: ${document.storage.path}`, error);
    }

    // Delete document record
    await Document.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    logger.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: error.message
      }
    });
  }
};

/**
 * Get expiring documents
 */
exports.getExpiringDocuments = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const documents = await Document.findExpiring(parseInt(days));

    res.json({
      success: true,
      data: documents,
      count: documents.length,
      message: `Found ${documents.length} documents expiring in ${days} days`
    });

  } catch (error) {
    logger.error('Get expiring documents error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: error.message
      }
    });
  }
};

/**
 * Get expired documents
 */
exports.getExpiredDocuments = async (req, res) => {
  try {
    const documents = await Document.findExpired();

    res.json({
      success: true,
      data: documents,
      count: documents.length,
      message: `Found ${documents.length} expired documents`
    });

  } catch (error) {
    logger.error('Get expired documents error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: error.message
      }
    });
  }
};

module.exports = exports;
