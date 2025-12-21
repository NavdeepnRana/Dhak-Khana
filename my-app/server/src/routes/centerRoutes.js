const express = require('express');
const router = express.Router();
const {
  getAllCenters,
  getCenter,
  createCenter,
  updateCenter,
  deleteCenter,
  searchCenters,
} = require('../controllers/centerController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

// Public: Search centers (for autocomplete)
router.get('/search', searchCenters);

// Public: Get all centers
router.get('/', getAllCenters);

// Public: Get single center (must be before /:id routes)
router.get('/:id', getCenter);

// All routes below require authentication
router.use(authMiddleware);

// Admin only: Create, update, delete
router.post('/', authorizeRoles('admin'), createCenter);
router.put('/:id', authorizeRoles('admin'), updateCenter);
router.delete('/:id', authorizeRoles('admin'), deleteCenter);

module.exports = router;


