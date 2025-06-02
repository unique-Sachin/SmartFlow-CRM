import { Router } from 'express';
import * as leadController from '../controllers/leadController';
import { authenticate, authorize } from '../middleware/auth';
import { createLeadValidation } from '../middleware/leadValidation';
import { validate } from '../utils/validator';
import { convertLead } from '../controllers/leadController';

const router = Router();

// CRUD
router.post('/', authenticate, authorize('super_admin', 'sales_manager', 'lead_specialist'), validate(createLeadValidation), leadController.createLead);
router.get('/', authenticate, leadController.getLeads);
router.get('/:id', authenticate, leadController.getLeadById);
router.put('/:id', authenticate, authorize('super_admin', 'sales_manager', 'lead_specialist'), leadController.updateLead);
router.delete('/:id', authenticate, authorize('super_admin', 'sales_manager'), leadController.deleteLead);

// Assignment
router.patch('/:id/assign', authenticate, authorize('super_admin', 'sales_manager', 'lead_specialist'), leadController.assignLead);
// Scoring
router.patch('/:id/score', authenticate, authorize('super_admin', 'sales_manager', 'lead_specialist'), leadController.updateScore);
// Nurturing
router.patch('/:id/nurturing', authenticate, authorize('super_admin', 'sales_manager', 'lead_specialist'), leadController.updateNurturing);

// Convert Lead to Deal/Contact
router.post('/:id/convert', authenticate, authorize('super_admin', 'sales_manager', 'sales_representative'), convertLead);

// Bulk import leads
router.post('/import', authenticate, authorize('super_admin', 'sales_manager', 'lead_specialist'), leadController.importLeads);

// Send email to lead
router.post('/:id/send-email', authenticate, authorize('super_admin', 'sales_manager', 'lead_specialist'), leadController.sendEmailToLead);

export default router; 