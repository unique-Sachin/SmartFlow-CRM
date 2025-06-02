import { Router } from 'express';
import { ContactController } from '../controllers/contactController';
import { validate } from '../utils/validator';
import {
  createContactValidation,
  updateContactValidation,
  addInteractionValidation,
  validateContactId
} from '../middleware/contactValidation';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Create contact
router.post('/', validate(createContactValidation), ContactController.create);
// Get all contacts
router.get('/', ContactController.getAll);
// Get contact by ID
router.get('/:id', validateContactId, ContactController.getById);
// Update contact
router.put('/:id', authenticate, authorize('super_admin', 'sales_manager', 'sales_representative'), validateContactId, validate(updateContactValidation), ContactController.update);
// Delete contact
router.delete('/:id', authenticate, authorize('super_admin', 'sales_manager', 'sales_representative'), validateContactId, ContactController.delete);
// Add interaction to contact
router.post('/:id/interactions', validateContactId, validate(addInteractionValidation), ContactController.addInteraction);

export default router; 