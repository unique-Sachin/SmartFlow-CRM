import { Router } from 'express';
import { DocumentController } from '../controllers/documentController';
import { upload } from '../utils/fileStorage';
import { authenticate } from '../middleware/auth';
import { validateObjectId } from '../middleware/validation';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticate);

// Upload new document
router.post(
  '/',
  upload.single('file'),
  DocumentController.upload
);

// Get all documents with filtering and pagination
router.get('/', DocumentController.getAll);

// Get document by ID
router.get(
  '/:id',
  validateObjectId,
  DocumentController.getById
);

// Download document
router.get(
  '/:id/download',
  validateObjectId,
  DocumentController.download
);

// Update document metadata
router.put(
  '/:id',
  validateObjectId,
  DocumentController.update
);

// Delete document
router.delete(
  '/:id',
  validateObjectId,
  DocumentController.delete
);

// Add new version
router.post(
  '/:id/version',
  validateObjectId,
  upload.single('file'),
  DocumentController.addVersion
);

export default router; 