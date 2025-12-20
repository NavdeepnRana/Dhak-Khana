const express = require('express');
const { body } = require('express-validator');
const { authMiddleware } = require('../middleware/authMiddleware');
const { getProfile, loginAdmin, loginCustomer, loginWithOtp, registerCustomer, googleAuthCallback, googleAuthInitiate } = require('../controllers/authController');
const { sendOTP, verifyOTPEndpoint } = require('../controllers/otpController');

const router = express.Router();

router.post(
  '/admin/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password is required'),
  ],
  loginAdmin
);

router.post(
  '/customers/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').optional({ nullable: true, checkFalsy: true }).isEmail().withMessage('Valid email required'),
    body('phone').optional({ nullable: true, checkFalsy: true }).isString(),
    body('password').optional({ nullable: true, checkFalsy: true }).isLength({ min: 6 }).withMessage('Password should be at least 6 characters'),
    body('gender').optional({ nullable: true, checkFalsy: true }).isIn(['male', 'female', 'prefer_not_say']).withMessage('Invalid gender'),
  ],
  registerCustomer
);

router.post(
  '/customers/login',
  [
    body('email').optional({ nullable: true, checkFalsy: true }).isEmail().withMessage('Valid email required'),
    body('password').optional({ nullable: true, checkFalsy: true }).isLength({ min: 6 }).withMessage('Password is required'),
  ],
  loginCustomer
);

router.post(
  '/customers/login/otp',
  [
    body('name').notEmpty().trim().withMessage('Name is required'),
    body('phone').optional({ nullable: true, checkFalsy: true }).trim().isString().withMessage('Phone must be a string'),
    body('email').optional({ nullable: true, checkFalsy: true }).trim().isEmail().withMessage('Valid email required'),
    body('otp').notEmpty().trim().withMessage('OTP is required'),
  ],
  loginWithOtp
);

// OTP routes
router.post('/otp/send', sendOTP);
router.post('/otp/verify', verifyOTPEndpoint);

// Google OAuth routes
router.get('/customers/google', googleAuthInitiate);
router.get('/customers/google/callback', googleAuthCallback);
router.post('/customers/google/callback', googleAuthCallback);

router.get('/me', authMiddleware, getProfile);

module.exports = router;

