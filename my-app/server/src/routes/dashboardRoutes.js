const express = require('express');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');
const { getAdminStats, getCustomerStats } = require('../controllers/dashboardController');

const router = express.Router();

router.use(authMiddleware);

router.get('/admin', authorizeRoles('admin'), getAdminStats);
router.get('/customer', authorizeRoles('customer'), getCustomerStats);

module.exports = router;

