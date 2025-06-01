import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { body } from 'express-validator';
import * as userController from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';
import { User } from '../models/User';

const router = Router();

// Registration validation middleware
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
  body('role').isIn(['super_admin', 'sales_manager', 'sales_representative', 'lead_specialist']),
];

// Password reset validation middleware
const resetPasswordValidation = [
  body('password').isLength({ min: 8 }),
];

// Registration and authentication routes
router.post('/register', registerValidation, userController.register);
router.post('/login', userController.login);

// Email verification routes
router.get('/verify-email/:token', userController.verifyEmail);
router.post('/resend-verification', userController.resendVerification);

// Password reset routes
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password/:token', resetPasswordValidation, userController.resetPassword);

// Protected routes
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);

// Admin only routes
const getUsers: RequestHandler = async (req, res, next) => {
  try {
    const users = await User.find({}, '_id firstName lastName email role');
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

router.get('/', authenticate, authorize('super_admin', 'sales_manager'), getUsers);

router.post(
  '/',
  authenticate,
  authorize('super_admin'),
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('firstName').notEmpty().trim(),
    body('lastName').notEmpty().trim(),
    body('role').isIn(['super_admin', 'sales_manager', 'sales_representative', 'lead_specialist']),
  ],
  userController.adminCreateUser
);

export default router; 