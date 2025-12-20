const express = require('express');
const { body } = require('express-validator');
const { createFeedback, getAllFeedback, updateFeedbackStatus } = require('../controllers/feedbackController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Public route - anyone can submit feedback
router.post(
  '/',
  [
    body('name').notEmpty().trim().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').optional({ nullable: true }).trim(),
    body('category').isIn(['post_office', 'user_support', 'developer', 'feedback']).withMessage('Invalid category'),
    body('subject').notEmpty().trim().withMessage('Subject is required'),
    body('message').notEmpty().trim().withMessage('Message is required'),
  ],
  createFeedback
);

// Admin routes (optional - for future admin dashboard)
router.get('/all', authMiddleware, getAllFeedback);
router.patch('/:id/status', authMiddleware, updateFeedbackStatus);

module.exports = router;

