import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { dealCoach, personaProfile, objectionHandler, winLossExplainer, generateEmail } from '../controllers/aiController';

const router = Router();

// GET /api/ai/deal-coach/:dealId
router.get('/deal-coach/:dealId', authenticate, dealCoach);

// GET /api/ai/persona/:leadId
router.get('/persona/:leadId', authenticate, personaProfile);

// POST /api/ai/objection-handler
router.post('/objection-handler', authenticate, objectionHandler);

// GET /api/ai/win-loss-explainer/:dealId
router.get('/win-loss-explainer/:dealId', authenticate, winLossExplainer);

// POST /api/ai/coach
router.post('/coach', authenticate, require('../controllers/aiController').aiCoach);

// POST /api/ai/generate-email
router.post('/generate-email', authenticate, generateEmail);

export default router; 