import { Router } from 'express';
import { ContactController } from '../controllers/contactController';
import { validate } from '../utils/validator';
import {
  createContactValidation,
  updateContactValidation,
  addInteractionValidation,
  validateContactId
} from '../middleware/contactValidation';

const router = Router();

// Create contact
router.post('/', validate(createContactValidation), ContactController.create);
// Get all contacts
router.get('/', ContactController.getAll);
// Get contact by ID
router.get('/:id', validateContactId, ContactController.getById);
// Update contact
router.put('/:id', validateContactId, validate(updateContactValidation), ContactController.update);
// Delete contact
router.delete('/:id', validateContactId, ContactController.delete);
// Add interaction to contact
router.post('/:id/interactions', validateContactId, validate(addInteractionValidation), ContactController.addInteraction);

export default router; 