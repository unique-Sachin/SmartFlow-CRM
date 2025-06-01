import { Router } from 'express';
import dealController from '../controllers/dealController';
import { authenticate, authorize } from '../middleware/auth';
import { dealCoach } from '../controllers/aiController';
// Add validation middleware as needed

const router = Router();

// Create deal (restricted)
router.post('/', authenticate, authorize('super_admin', 'sales_manager', 'sales_representative'), dealController.create);
// Get all deals
router.get('/', dealController.getAll);
// Get deal by ID
router.get('/:id', dealController.getById);
// Update deal (restricted)
router.patch('/:id', authenticate, authorize('super_admin', 'sales_manager', 'sales_representative'), dealController.update);
// Delete deal (restricted)
router.delete('/:id', authenticate, authorize('super_admin', 'sales_manager', 'sales_representative'), dealController.delete);
// Update deal stage
router.post('/:id/stage', dealController.updateStage);
// Add activity to deal
router.post('/:id/activities', dealController.addActivity);

// AI Deal Coach endpoint
router.get('/ai/deal-coach/:dealId', authenticate, dealCoach);

export default router; 