import { Request, Response, NextFunction } from 'express';
import { body, ValidationChain } from 'express-validator';
import { validate } from '../utils/validator';

export const createLeadValidation: ValidationChain[] = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),

  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),

  body('phone')
    .optional()
    .trim()
    .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/)
    .withMessage('Invalid phone number format'),

  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company name cannot exceed 100 characters'),

  body('jobTitle')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Job title cannot exceed 100 characters'),

  body('source')
    .optional()
    .isIn(['website', 'referral', 'social', 'event', 'cold_outreach', 'other'])
    .withMessage('Invalid lead source'),

  body('status')
    .optional()
    .isIn(['new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost'])
    .withMessage('Invalid lead status'),

  body('score')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Score must be between 0 and 100'),

  body('assignedTo')
    .custom((value) => {
      if (!value) return true; // allow empty or undefined (unassigned)
      // Only validate as MongoId if value is present
      return /^[0-9a-fA-F]{24}$/.test(value);
    })
    .withMessage('Invalid user ID'),

  body('budget.amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Budget amount must be a positive number'),

  body('budget.currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-letter code')
    .isUppercase()
    .withMessage('Currency must be uppercase'),

  body('requirements')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Requirements cannot exceed 1000 characters'),

  body('interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array'),

  body('interests.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each interest must be between 1 and 50 characters'),

  body('timeline')
    .optional()
    .isIn(['immediate', '1_3_months', '3_6_months', '6_12_months', 'future'])
    .withMessage('Invalid timeline'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),

  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Each tag must be between 1 and 20 characters'),

  body('location')
    .optional()
    .isObject()
    .withMessage('Location must be an object'),

  body('location.country')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Country is required when location is provided'),

  body('socialProfiles')
    .optional()
    .isObject()
    .withMessage('Social profiles must be an object')
];

export const updateLeadValidation: ValidationChain[] = [
  ...createLeadValidation.map(validation => validation.optional())
];

export const updateScoreValidation: ValidationChain[] = [
  body('engagement')
    .optional()
    .isInt({ min: 0, max: 30 })
    .withMessage('Engagement score must be between 0 and 30'),

  body('qualification')
    .optional()
    .isInt({ min: 0, max: 30 })
    .withMessage('Qualification score must be between 0 and 30'),

  body('interest')
    .optional()
    .isInt({ min: 0, max: 20 })
    .withMessage('Interest score must be between 0 and 20'),

  body('budget')
    .optional()
    .isInt({ min: 0, max: 20 })
    .withMessage('Budget score must be between 0 and 20')
];

export const addActivityValidation: ValidationChain[] = [
  body('type')
    .notEmpty()
    .withMessage('Activity type is required')
    .isIn(['email', 'call', 'meeting', 'note', 'social', 'website_visit'])
    .withMessage('Invalid activity type'),

  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('outcome')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Outcome cannot exceed 500 characters')
];

export const convertToDealValidation: ValidationChain[] = [
  body('dealId')
    .notEmpty()
    .withMessage('Deal ID is required')
    .isMongoId()
    .withMessage('Invalid deal ID'),

  body('value')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Value must be a positive number')
];

// Middleware to validate lead ID parameter
export const validateLeadId = (req: Request, res: Response, next: NextFunction) => {
  const leadId = req.params.id;
  if (!leadId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ error: 'Invalid lead ID format' });
  }
  next();
}; 