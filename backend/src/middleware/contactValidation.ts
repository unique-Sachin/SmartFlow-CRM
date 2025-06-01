import { Request, Response, NextFunction } from 'express';
import { body, ValidationChain } from 'express-validator';
import { validate } from '../utils/validator';

export const createContactValidation: ValidationChain[] = [
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
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'lead', 'customer'])
    .withMessage('Invalid status'),
  
  body('source')
    .notEmpty()
    .withMessage('Source is required')
    .isIn(['referral', 'website', 'social', 'direct', 'other'])
    .withMessage('Invalid source'),
  
  body('assignedTo')
    .notEmpty()
    .withMessage('Assigned user is required')
    .isMongoId()
    .withMessage('Invalid assigned user ID'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Each tag must be between 1 and 20 characters'),
  
  body('address')
    .optional()
    .isObject()
    .withMessage('Address must be an object'),
  
  body('socialProfiles')
    .optional()
    .isObject()
    .withMessage('Social profiles must be an object'),
  
  body('preferences')
    .optional()
    .isObject()
    .withMessage('Preferences must be an object'),
  
  body('preferences.communicationChannel')
    .optional()
    .isIn(['email', 'phone', 'both'])
    .withMessage('Invalid communication channel'),
  
  body('preferences.frequency')
    .optional()
    .isIn(['daily', 'weekly', 'monthly', 'quarterly'])
    .withMessage('Invalid frequency'),
  
  body('preferences.newsletter')
    .optional()
    .isBoolean()
    .withMessage('Newsletter preference must be boolean'),
];

export const updateContactValidation: ValidationChain[] = [
  ...createContactValidation.map(validation => validation.optional()),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
];

export const addInteractionValidation: ValidationChain[] = [
  body('type')
    .notEmpty()
    .withMessage('Interaction type is required')
    .isIn(['email', 'call', 'meeting', 'note'])
    .withMessage('Invalid interaction type'),
  
  body('summary')
    .notEmpty()
    .withMessage('Summary is required')
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Summary cannot exceed 1000 characters'),
  
  body('outcome')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Outcome cannot exceed 500 characters'),
];

// Middleware to validate contact ID parameter
export const validateContactId = (req: Request, res: Response, next: NextFunction) => {
  const contactId = req.params.id;
  if (!contactId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ error: 'Invalid contact ID format' });
  }
  next();
}; 