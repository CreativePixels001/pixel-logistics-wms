import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as apiController from '../controllers/api.controller';

const router = Router();

// All API routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/gov-api/sources
 * @desc    Get available government data sources
 * @access  Private
 */
router.get('/sources', apiController.getDataSources);

/**
 * @route   GET /api/v1/gov-api/categories
 * @desc    Get data categories
 * @access  Private
 */
router.get('/categories', apiController.getCategories);

/**
 * @route   GET /api/v1/gov-api/analytics
 * @desc    Get query analytics
 * @access  Private (Admin)
 */
router.get('/analytics', apiController.getAnalytics);

export default router;
