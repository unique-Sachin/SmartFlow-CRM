import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { EmailLog } from '../models/EmailLog';
import { sendCustomEmail } from '../services/emailService';

const router = Router();

// List/search/filter sent emails
router.get('/', authenticate, async (req, res) => {
  const { search, status, type, to, sentBy } = req.query;
  const filter: any = {};
  if (search) filter.$or = [
    { subject: new RegExp(search as string, 'i') },
    { body: new RegExp(search as string, 'i') },
    { to: new RegExp(search as string, 'i') }
  ];
  if (status) filter.status = status;
  if (type) filter.type = type;
  if (to) filter.to = to;
  if (sentBy) filter.sentBy = sentBy;
  const emails = await EmailLog.find(filter).sort({ sentAt: -1 }).populate('sentBy', 'firstName lastName email');
  res.json({ emails });
});

// Bulk email endpoint
router.post('/bulk', authenticate, authorize('super_admin', 'sales_manager'), async (req, res) => {
  const { recipients, subject, body, type = 'bulk' } = req.body;
  if (!Array.isArray(recipients) || !subject || !body) return res.status(400).json({ error: 'Missing fields' });
  const results = [];
  for (const to of recipients) {
    try {
      // authenticate always sets req.user
      await sendCustomEmail(to, subject, body, (req.user as any).id, type);
      results.push({ to, status: 'sent' });
    } catch (error: any) {
      results.push({ to, status: 'failed', error: error.message });
    }
  }
  res.json({ results });
});

export default router; 