import { Router } from 'express';
import { CompanyController } from '../controllers/companyController';
import {
  createCompanyValidation,
  updateCompanyValidation,
  addActivityValidation,
  updateEngagementScoreValidation,
  addRelationshipValidation,
  validateCompanyId
} from '../middleware/companyValidation';
import { authenticate } from '../middleware/auth';
import { checkRole } from '../middleware/roleCheck';
import { validate } from '../utils/validator';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Get company statistics - Admin and Sales Manager only
router.get('/statistics', checkRole(['admin', 'sales_manager']), CompanyController.getStatistics);

// Get all companies with filtering and pagination
router.get('/', CompanyController.getAll);

// Get company by ID
router.get('/:id', validateCompanyId, CompanyController.getById);

// Create new company - Admin and Sales Manager only
router.post(
  '/',
  checkRole(['admin', 'sales_manager']),
  createCompanyValidation,
  validate,
  CompanyController.create
);

// Update company
router.put(
  '/:id',
  validateCompanyId,
  updateCompanyValidation,
  validate,
  CompanyController.update
);

// Delete company - Admin only
router.delete(
  '/:id',
  checkRole(['admin']),
  validateCompanyId,
  CompanyController.delete
);

// Add activity to company
router.post(
  '/:id/activities',
  validateCompanyId,
  addActivityValidation,
  validate,
  CompanyController.addActivity
);

// Update engagement score
router.post(
  '/:id/engagement',
  validateCompanyId,
  updateEngagementScoreValidation,
  validate,
  CompanyController.updateEngagementScore
);

// Add relationship between companies
router.post(
  '/:id/relationships',
  validateCompanyId,
  addRelationshipValidation,
  validate,
  CompanyController.addRelationship
);

export default router; 