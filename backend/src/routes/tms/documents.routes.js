/**
 * Document Routes
 * Endpoints for document management
 */

const express = require('express');
const router = express.Router();
const documentController = require('../../controllers/document.controller');
const {
  uploadSingle,
  uploadMultiple,
  handleUploadError
} = require('../../middleware/upload.middleware');

/**
 * @route   POST /api/v1/tms/documents/upload
 * @desc    Upload single document
 * @access  Private
 */
router.post(
  '/upload',
  uploadSingle,
  handleUploadError,
  documentController.uploadDocument
);

/**
 * @route   POST /api/v1/tms/documents/upload-multiple
 * @desc    Upload multiple documents
 * @access  Private
 */
router.post(
  '/upload-multiple',
  uploadMultiple,
  handleUploadError,
  documentController.uploadMultipleDocuments
);

/**
 * @route   GET /api/v1/tms/documents
 * @desc    Get all documents with filtering
 * @query   category, documentType, status, entityType, entityId, page, limit, sort
 * @access  Private
 */
router.get('/', documentController.getDocuments);

/**
 * @route   GET /api/v1/tms/documents/expiring
 * @desc    Get documents expiring soon
 * @query   days (default: 30)
 * @access  Private
 */
router.get('/expiring', documentController.getExpiringDocuments);

/**
 * @route   GET /api/v1/tms/documents/expired
 * @desc    Get expired documents
 * @access  Private
 */
router.get('/expired', documentController.getExpiredDocuments);

/**
 * @route   GET /api/v1/tms/documents/:id
 * @desc    Get document by ID
 * @access  Private
 */
router.get('/:id', documentController.getDocumentById);

/**
 * @route   GET /api/v1/tms/documents/:id/download
 * @desc    Download document
 * @access  Private
 */
router.get('/:id/download', documentController.downloadDocument);

/**
 * @route   PUT /api/v1/tms/documents/:id
 * @desc    Update document metadata
 * @access  Private
 */
router.put('/:id', documentController.updateDocument);

/**
 * @route   DELETE /api/v1/tms/documents/:id
 * @desc    Delete document
 * @access  Private
 */
router.delete('/:id', documentController.deleteDocument);

module.exports = router;
