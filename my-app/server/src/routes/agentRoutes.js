const express = require('express');
const { body } = require('express-validator');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  loginAgent,
  getAllAgents,
  getAgent,
  createAgent,
  updateAgent,
  deleteAgent,
  toggleAgentStatus,
} = require('../controllers/agentController');

const router = express.Router();

// Agent login (public)
router.post(
  '/login',
  [
    body('agentId').optional().trim(),
    body('email').optional().trim().isEmail().withMessage('Valid email required'),
    body('mobile').optional().trim(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  loginAgent
);

// All routes below require authentication
router.use(authMiddleware);

// Get all agents (Admin only)
router.get('/', getAllAgents);

// Get single agent
router.get('/:id', getAgent);

// Create agent (Admin only)
router.post(
  '/',
  [
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('mobile').notEmpty().withMessage('Mobile number is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('agentId').optional().trim(),
    // Password is always auto-generated, no validation needed
  ],
  createAgent
);

// Update agent
router.put(
  '/:id',
  [
    body('email').optional().isEmail().withMessage('Valid email is required'),
    // Password updates are handled separately if needed, not through regular update
  ],
  updateAgent
);

// Delete agent (Admin only)
router.delete('/:id', deleteAgent);

// Toggle agent status (Admin only)
router.patch('/:id/toggle-status', toggleAgentStatus);

module.exports = router;

