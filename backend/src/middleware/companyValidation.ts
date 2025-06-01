import { Request, Response, NextFunction } from 'express';
import { body, ValidationChain } from 'express-validator';
import { validate } from '../utils/validator';

export const createCompanyValidation: ValidationChain[] = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ max: 200 })
    .withMessage('Company name cannot exceed 200 characters'),

  body('industry')
    .trim()
    .notEmpty()
    .withMessage('Industry is required')
    .isLength({ max: 100 })
    .withMessage('Industry name cannot exceed 100 characters'),

  body('size')
    .notEmpty()
    .withMessage('Company size is required')
    .isIn(['startup', 'small', 'medium', 'large', 'enterprise'])
    .withMessage('Invalid company size'),

  body('revenue.amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Revenue amount must be a positive number'),

  body('revenue.currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-letter code')
    .isUppercase()
    .withMessage('Currency must be uppercase'),

  body('revenue.year')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage('Invalid year'),

  body('website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Invalid website URL'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),

  body('status')
    .optional()
    .isIn(['active', 'inactive', 'prospect', 'customer', 'churned'])
    .withMessage('Invalid company status'),

  body('addresses')
    .optional()
    .isArray()
    .withMessage('Addresses must be an array'),

  body('addresses.*.type')
    .optional()
    .isIn(['headquarters', 'branch', 'billing', 'shipping'])
    .withMessage('Invalid address type'),

  body('addresses.*.street')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Street address is required')
    .isLength({ max: 200 })
    .withMessage('Street address cannot exceed 200 characters'),

  body('addresses.*.city')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('City is required')
    .isLength({ max: 100 })
    .withMessage('City name cannot exceed 100 characters'),

  body('addresses.*.country')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Country is required')
    .isLength({ max: 100 })
    .withMessage('Country name cannot exceed 100 characters'),

  body('addresses.*.postalCode')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Postal code is required')
    .isLength({ max: 20 })
    .withMessage('Postal code cannot exceed 20 characters'),

  body('contacts')
    .optional()
    .isArray()
    .withMessage('Contacts must be an array'),

  body('contacts.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid contact ID'),

  body('primaryContact')
    .optional()
    .isMongoId()
    .withMessage('Invalid primary contact ID'),

  body('accountManager')
    .optional()
    .isMongoId()
    .withMessage('Invalid account manager ID'),

  body('communicationPreferences.preferredLanguage')
    .optional()
    .isLength({ min: 2, max: 5 })
    .withMessage('Invalid language code'),

  body('communicationPreferences.preferredContactMethod')
    .optional()
    .isIn(['email', 'phone', 'mail'])
    .withMessage('Invalid contact method'),

  body('socialProfiles.linkedin')
    .optional()
    .isURL()
    .withMessage('Invalid LinkedIn URL'),

  body('socialProfiles.twitter')
    .optional()
    .isURL()
    .withMessage('Invalid Twitter URL'),

  body('socialProfiles.facebook')
    .optional()
    .isURL()
    .withMessage('Invalid Facebook URL'),

  body('socialProfiles.instagram')
    .optional()
    .isURL()
    .withMessage('Invalid Instagram URL'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),

  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters')
];

export const updateCompanyValidation: ValidationChain[] = [
  ...createCompanyValidation.map(validation => validation.optional())
];

export const addActivityValidation: ValidationChain[] = [
  body('type')
    .notEmpty()
    .withMessage('Activity type is required')
    .isIn(['email', 'call', 'meeting', 'note', 'task', 'other'])
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

  body('performedBy')
    .notEmpty()
    .withMessage('Performer ID is required')
    .isMongoId()
    .withMessage('Invalid performer ID')
];

export const updateEngagementScoreValidation: ValidationChain[] = [
  body('score')
    .notEmpty()
    .withMessage('Engagement score is required')
    .isInt({ min: 0, max: 100 })
    .withMessage('Score must be between 0 and 100')
];

export const addRelationshipValidation: ValidationChain[] = [
  body('companyId')
    .notEmpty()
    .withMessage('Related company ID is required')
    .isMongoId()
    .withMessage('Invalid company ID'),

  body('type')
    .notEmpty()
    .withMessage('Relationship type is required')
    .isIn(['parent', 'subsidiary', 'partner', 'competitor', 'vendor', 'client'])
    .withMessage('Invalid relationship type'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

// Middleware to validate company ID parameter
export const validateCompanyId = (req: Request, res: Response, next: NextFunction) => {
  const companyId = req.params.id;
  if (!companyId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ error: 'Invalid company ID format' });
  }
  next();
}; 