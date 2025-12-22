/**
 * Quotes Routes
 * API endpoints for quote generation and management
 */

const express = require('express');
const router = express.Router();
const quotesController = require('../../controllers/pis/quotes.controller');

// Generate new quotes
router.post('/', quotesController.generateQuotes);

// Get all quotes
router.get('/', quotesController.getAllQuotes);

// Get quotes analytics
router.get('/analytics', quotesController.getQuotesAnalytics);

// Get quote by quote number
router.get('/number/:quoteNumber', quotesController.getQuoteByNumber);

// Get quote by ID
router.get('/:id', quotesController.getQuoteById);

// Select a quote from available options
router.post('/:id/select', quotesController.selectQuote);

module.exports = router;
