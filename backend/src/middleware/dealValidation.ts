import { Request, Response, NextFunction } from 'express';
import { body, ValidationChain } from 'express-validator';
import { validate } from '../utils/validator';

export const createDealValidation: ValidationChain[] = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Deal title is required')
    .isLength({ max: 100 })
    .withMessage('Deal title cannot exceed 100 characters'),

  body('value')
    .notEmpty()
    .withMessage('Deal value is required')
    .isFloat({ min: 0 })
    .withMessage('Deal value must be a positive number'),

  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-letter code')
    .isUppercase()
    .withMessage('Currency must be uppercase'),

  body('stage')
    .optional()
    .isIn(['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'])
    .withMessage('Invalid deal stage'),

  body('probability')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Probability must be between 0 and 100'),

  body('expectedCloseDate')
    .notEmpty()
    .withMessage('Expected close date is required')
    .isISO8601()
    .withMessage('Invalid date format'),

  body('contact')
    .notEmpty()
    .withMessage('Contact is required')
    .isMongoId()
    .withMessage('Invalid contact ID'),

  body('company')
    .optional()
    .isMongoId()
    .withMessage('Invalid company ID'),

  body('assignedTo')
    .notEmpty()
    .withMessage('Assigned user is required')
    .isMongoId()
    .withMessage('Invalid user ID'),

  body('products')
    .optional()
    .isArray()
    .withMessage('Products must be an array'),

  body('products.*.name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 100 })
    .withMessage('Product name cannot exceed 100 characters'),

  body('products.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),

  body('products.*.unitPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a positive number'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority level'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),

  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Each tag must be between 1 and 20 characters'),

  body('competitors')
    .optional()
    .isArray()
    .withMessage('Competitors must be an array'),

  body('competitors.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Each competitor name must be between 1 and 100 characters')
];

export const updateDealValidation: ValidationChain[] = [
  ...createDealValidation.map(validation => validation.optional())
];

export const updateStageValidation: ValidationChain[] = [
  body('stage')
    .notEmpty()
    .withMessage('New stage is required')
    .isIn(['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'])
    .withMessage('Invalid deal stage'),

  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters')
];

export const addActivityValidation: ValidationChain[] = [
  body('type')
    .notEmpty()
    .withMessage('Activity type is required')
    .isIn(['note', 'email', 'call', 'meeting', 'task'])
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
    .withMessage('Outcome cannot exceed 500 characters'),

  body('nextAction')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Next action cannot exceed 500 characters')
];

// Middleware to validate deal ID parameter
export const validateDealId = (req: Request, res: Response, next: NextFunction) => {
  const dealId = req.params.id;
  if (!dealId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ error: 'Invalid deal ID format' });
  }
  next();
}; 