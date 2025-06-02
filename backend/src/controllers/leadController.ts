import { Request as ExpressRequest, Response, NextFunction } from 'express';
import { Lead } from '../models/Lead';
import { Deal } from '../models/Deal';
import { Contact } from '../models/Contact';
import type { Server as SocketIOServer } from 'socket.io';
import { sendCustomEmail } from '../services/emailService';

interface CustomRequest extends ExpressRequest {
  app: ExpressRequest['app'] & { io?: SocketIOServer };
}

export const createLead = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    // Sanitize assignedTo: if empty string, set to undefined
    if (req.body.assignedTo === '') {
      req.body.assignedTo = undefined;
    }
    const lead = new Lead(req.body);
    await lead.save();
    // Emit socket event
    req.app.io?.emit('leadCreated', lead);
    res.status(201).json(lead);
  } catch (error) {
    next(error);
  }
};

export const getLeads = async (req: ExpressRequest, res: Response, next: NextFunction) => {
  try {
    const filter: any = {};
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      filter.$or = [
        { firstName: new RegExp(req.query.search as string, 'i') },
        { lastName: new RegExp(req.query.search as string, 'i') },
        { email: new RegExp(req.query.search as string, 'i') },
        { company: new RegExp(req.query.search as string, 'i') },
      ];
    }
    const leads = await Lead.find(filter)
      .sort({ createdAt: -1 })
      .populate('assignedTo', 'firstName lastName email');
    res.json({ leads });
  } catch (error) {
    next(error);
  }
};

export const getLeadById = async (req: ExpressRequest, res: Response, next: NextFunction) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json(lead);
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    let updateQuery;
    if (req.body.assignedTo === '') {
      // Remove assignedTo from $set, and use $unset for assignedTo
      const { assignedTo, ...otherFields } = req.body;
      updateQuery = {
        $set: otherFields,
        $unset: { assignedTo: 1 }
      };
    } else {
      updateQuery = req.body;
    }
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      updateQuery,
      { new: true, runValidators: true }
    );
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    // Emit socket event
    req.app.io?.emit('leadUpdated', lead);
    res.json(lead);
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (req: ExpressRequest, res: Response, next: NextFunction) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const assignLead = async (req: ExpressRequest, res: Response, next: NextFunction) => {
  try {
    const { assignedTo } = req.body;
    const lead = await Lead.findByIdAndUpdate(req.params.id, { assignedTo }, { new: true });
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json(lead);
  } catch (error) {
    next(error);
  }
};

export const updateScore = async (req: ExpressRequest, res: Response, next: NextFunction) => {
  try {
    const { score } = req.body;
    const lead = await Lead.findByIdAndUpdate(req.params.id, { score }, { new: true });
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json(lead);
  } catch (error) {
    next(error);
  }
};

export const updateNurturing = async (req: ExpressRequest, res: Response, next: NextFunction) => {
  try {
    const { nurturingSequence, status } = req.body;
    const lead = await Lead.findByIdAndUpdate(req.params.id, { nurturingSequence, status }, { new: true });
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json(lead);
  } catch (error) {
    next(error);
  }
};

export const convertLead = async (req: ExpressRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) { res.status(404).json({ error: 'Lead not found' }); return; }
    if (lead.status === 'converted') { res.status(400).json({ error: 'Lead already converted' }); return; }

    // Optionally create a contact if not already exists
    let contact = await Contact.findOne({ email: lead.email });
    if (!contact) {
      contact = new Contact({
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        status: 'lead',
        assignedTo: lead.assignedTo,
        source: lead.source,
        tags: [],
        notes: '',
      });
      await contact.save();
    }

    // Create a new deal from the lead
    const dealData = {
      title: `${lead.firstName} ${lead.lastName} Deal`,
      value: req.body.value || 0,
      currency: req.body.currency || 'INR',
      stage: 'prospecting',
      probability: 10,
      expectedCloseDate: req.body.expectedCloseDate || new Date(Date.now() + 30*24*60*60*1000),
      assignedTo: lead.assignedTo,
      contact: contact._id,
      priority: 'medium',
      notes: req.body.notes || '',
      tags: [],
    };
    const deal = new Deal(dealData);
    await deal.save();

    // Update lead status and link deal
    await (lead as any).convertToDeal(deal._id, deal.value);

    res.status(201).json({ deal, contact });
    return;
  } catch (error) {
    next(error);
  }
};

export const importLeads = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const leads = req.body.leads;
    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({ error: 'No leads provided' });
    }
    const requiredFields = ['firstName', 'lastName', 'email', 'status', 'source'];
    const validLeads: any[] = [];
    const errors: any[] = [];
    leads.forEach((l: any, idx: number) => {
      const missing = requiredFields.filter(f => !l[f] || (typeof l[f] === 'string' && l[f].trim() === ''));
      if (missing.length > 0) {
        errors.push({ row: idx + 1, missingFields: missing, lead: l });
      } else {
        validLeads.push(l);
      }
    });
    let inserted = [];
    let insertError = null;
    if (validLeads.length > 0) {
      try {
        inserted = await Lead.insertMany(validLeads, { ordered: false });
      } catch (error: any) {
        insertError = error;
        console.error('Bulk insert error:', error);
        if (error.writeErrors) {
          error.writeErrors.forEach((e: any) => {
            errors.push({ row: e.index + 1, dbError: e.errmsg, lead: validLeads[e.index] });
          });
        }
      }
    }
    res.status(errors.length > 0 ? 207 : 201).json({
      imported: inserted.length,
      failed: errors.length,
      errors
    });
  } catch (error) {
    next(error);
  }
};

export const sendEmailToLead = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message are required' });
    }
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    await sendCustomEmail(lead.email, subject, message);
    // Log as activity
    if ((lead as any).addActivity) {
      await (lead as any).addActivity('email', `Sent email: ${subject}`);
    }
    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    next(error);
  }
}; 