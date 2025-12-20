const express = require('express');
const {
  getAnnouncements,
  getOffices,
  getRateChart,
  getServices,
  getSiteContent,
} = require('../controllers/infoController');

const router = express.Router();

router.get('/services', getServices);
router.get('/offices', getOffices);
router.get('/announcements', getAnnouncements);
router.get('/rates', getRateChart);
router.get('/all', getSiteContent);

module.exports = router;

