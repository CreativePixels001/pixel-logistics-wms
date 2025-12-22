import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as chatController from '../controllers/chat.controller';

const router = Router();

/**
 * @route   POST /api/v1/chat/query
 * @desc    Send a query and get AI response
 * @access  Public (authentication optional)
 */
router.post('/query', chatController.sendQuery);

/**
 * @route   GET /api/v1/chat/conversations
 * @desc    Get user's conversations
 * @access  Private
 */
router.get('/conversations', chatController.getConversations);

/**
 * @route   GET /api/v1/chat/conversations/:id
 * @desc    Get conversation by ID
 * @access  Private
 */
router.get('/conversations/:id', chatController.getConversationById);

/**
 * @route   DELETE /api/v1/chat/conversations/:id
 * @desc    Delete conversation
 * @access  Private
 */
router.delete('/conversations/:id', chatController.deleteConversation);

/**
 * @route   POST /api/v1/chat/feedback
 * @desc    Submit feedback for a message
 * @access  Private
 */
router.post('/feedback', chatController.submitFeedback);

export default router;
