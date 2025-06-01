import { Router } from 'express';
import * as reportingController from '../controllers/reportingController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/sales-metrics', authenticate, reportingController.getSalesMetrics);
router.get('/conversion-analytics', authenticate, reportingController.getConversionAnalytics);
router.get('/activity-tracking', authenticate, reportingController.getActivityTracking);
router.get('/ai-usage', authenticate, reportingController.getAIUsageStats);

// CSV export route
router.get('/export/csv', authenticate, reportingController.exportCSVReport);

export default router; 