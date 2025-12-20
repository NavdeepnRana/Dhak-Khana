const express = require('express');
const { body } = require('express-validator');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');
const {
  createParcel,
  createBookingRequest,
  getParcels,
  getMyParcels,
  getAssignedParcels,
  trackParcel,
  updateStatus,
  updateParcel,
  cancelBookingRequest,
  deleteParcel,
} = require('../controllers/parcelController');

const router = express.Router();

router.get('/track/:trackingId', trackParcel);

router.use(authMiddleware);

router.get('/', authorizeRoles('admin'), getParcels);
router.get('/assigned', authorizeRoles('admin', 'agent'), getAssignedParcels);
router.get('/mine', authorizeRoles('customer'), getMyParcels);

// Customer: Create booking request (Pending Approval)
router.post(
  '/request',
  [
    body('senderName').notEmpty().trim().withMessage('Sender name is required'),
    body('senderPhone').notEmpty().trim().withMessage('Sender phone is required'),
    body('receiverName').notEmpty().trim().withMessage('Receiver name is required'),
    body('receiverPhone').notEmpty().trim().withMessage('Receiver phone is required'),
    body('sourceCity').notEmpty().trim().withMessage('Source city is required'),
    body('destinationCity').notEmpty().trim().withMessage('Destination city is required'),
    body('serviceType').optional().isIn(['Speed Post', 'Registered Post', 'Parcel', 'Logistics', 'Money Order']),
    body('pickupMode').optional().isIn(['Pickup', 'Dropoff']),
    body('packageType').optional().isString(),
    body('weightKg').isFloat({ gt: 0 }).withMessage('Weight must be greater than 0'),
    body('costInr').optional().isFloat({ min: 0 }),
    body('paymentMethod').optional().isIn(['Cash', 'UPI', 'Net Banking', 'Card']),
  ],
  authorizeRoles('customer'),
  createBookingRequest
);

// Admin-only: Book a new shipment
router.post(
  '/',
  [
    body('senderName').notEmpty().trim().withMessage('Sender name is required'),
    body('senderPhone').notEmpty().trim().withMessage('Sender phone is required'),
    body('receiverName').notEmpty().trim().withMessage('Receiver name is required'),
    body('receiverPhone').notEmpty().trim().withMessage('Receiver phone is required'),
    body('sourceCity').notEmpty().trim().withMessage('Source city is required'),
    body('destinationCity').notEmpty().trim().withMessage('Destination city is required'),
    body('serviceType').optional().isIn(['Speed Post', 'Registered Post', 'Parcel', 'Logistics', 'Money Order']),
    body('pickupMode').optional().isIn(['Pickup', 'Dropoff']),
    body('packageType').optional().isString(),
    body('weightKg').isFloat({ gt: 0 }).withMessage('Weight must be greater than 0'),
    body('costInr').optional().isFloat({ min: 0 }),
    body('paymentMethod').optional().isIn(['Cash', 'UPI', 'Net Banking', 'Card']),
  ],
  authorizeRoles('admin'),
  createParcel
);

// Customer: Cancel own booking request
router.patch('/:id/cancel', authorizeRoles('customer'), cancelBookingRequest);

// Admin-only: Update shipment status
router.patch(
  '/:id/status',
  [
    body('status')
      .notEmpty()
      .isIn([
        'Pending Approval',
        'Booked',
        'Picked Up',
        'Arrived at Hub',
        'In Transit',
        'Out for Delivery',
        'Delivered',
        'Returned',
        'Failed Attempt',
        'On Hold',
        'Cancelled',
        'Cancelled by User',
      ]),
  ],
  authorizeRoles('admin', 'agent'),
  updateStatus
);

// Admin-only: Update shipment details
router.put('/:id', 
  [
    body('senderName').optional().trim(),
    body('receiverName').optional().trim(),
    body('sourceCity').optional().trim(),
    body('destinationCity').optional().trim(),
    body('weightKg').optional().isFloat({ gt: 0 }),
    body('pickupMode').optional().isIn(['Pickup', 'Dropoff']),
  ],
  authorizeRoles('admin'),
  updateParcel
);

router.delete('/:id', authorizeRoles('admin'), deleteParcel);

module.exports = router;

