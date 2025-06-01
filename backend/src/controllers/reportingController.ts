import { Request, Response, NextFunction } from 'express';
import { Deal } from '../models/Deal';
import { Lead } from '../models/Lead';
import { User } from '../models/User';
import { Contact } from '../models/Contact';
import { Parser } from 'json2csv';

export const getSalesMetrics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Total deals
    const totalDeals = await Deal.countDocuments();
    // Total value by currency
    const totalValueAgg = await Deal.aggregate([
      { $group: { _id: '$currency', sum: { $sum: '$value' } } }
    ]);
    const totalValue: Record<string, number> = {};
    totalValueAgg.forEach((row: any) => {
      totalValue[row._id] = row.sum;
    });

    // Won deals by currency
    const wonDealsAgg = await Deal.aggregate([
      { $match: { stage: 'closed_won' } },
      { $group: { _id: '$currency', count: { $sum: 1 }, sum: { $sum: '$value' } } }
    ]);
    const wonDeals: Record<string, { count: number, sum: number }> = {};
    wonDealsAgg.forEach((row: any) => {
      wonDeals[row._id] = { count: row.count, sum: row.sum };
    });

    // Lost deals by currency
    const lostDealsAgg = await Deal.aggregate([
      { $match: { stage: 'closed_lost' } },
      { $group: { _id: '$currency', count: { $sum: 1 }, sum: { $sum: '$value' } } }
    ]);
    const lostDeals: Record<string, { count: number, sum: number }> = {};
    lostDealsAgg.forEach((row: any) => {
      lostDeals[row._id] = { count: row.count, sum: row.sum };
    });

    res.json({
      totalDeals,
      totalValue,
      wonDeals,
      lostDeals
    });
  } catch (error) {
    next(error);
  }
};

export const getConversionAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Leads converted to deals, conversion rate
    const totalLeads = await Lead.countDocuments();
    const convertedLeads = await Lead.countDocuments({ status: 'converted' });
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
    res.json({
      totalLeads,
      convertedLeads,
      conversionRate
    });
  } catch (error) {
    next(error);
  }
};

export const getActivityTracking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Count activities by type across all leads
    const leads = await Lead.find({}, 'activities');
    const activityCounts: Record<string, number> = {};
    leads.forEach(lead => {
      (lead.activities || []).forEach((activity: any) => {
        activityCounts[activity.type] = (activityCounts[activity.type] || 0) + 1;
      });
    });
    res.json({ activityCounts });
  } catch (error) {
    next(error);
  }
};

export const getAIUsageStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Placeholder: return 0s until AI features are implemented
    res.json({ aiRequests: 0, aiSuccess: 0, aiFailure: 0 });
  } catch (error) {
    next(error);
  }
};

export const exportCSVReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { start, end, userId } = req.query;
    // Build date filter for deals
    const dealFilter: any = {};
    if (start || end) {
      dealFilter.expectedCloseDate = {};
      if (start) dealFilter.expectedCloseDate.$gte = new Date(start as string);
      if (end) dealFilter.expectedCloseDate.$lte = new Date(end as string);
    }
    if (userId) {
      dealFilter.assignedTo = userId;
    }
    // Build date filter for leads
    const leadFilter: any = {};
    if (start || end) {
      leadFilter.createdAt = {};
      if (start) leadFilter.createdAt.$gte = new Date(start as string);
      if (end) leadFilter.createdAt.$lte = new Date(end as string);
    }
    if (userId) {
      leadFilter.assignedTo = userId;
    }
    // Fetch deals and leads
    const deals = await Deal.find(dealFilter).populate('assignedTo', 'firstName lastName email');
    const leads = await Lead.find(leadFilter).populate('assignedTo', 'firstName lastName email');
    // Prepare CSV rows
    const rows: any[] = [];
    deals.forEach(deal => {
      rows.push({
        Type: 'Deal',
        Title: deal.title,
        Value: deal.value,
        Currency: deal.currency,
        Stage: deal.stage,
        Probability: deal.probability,
        ExpectedCloseDate: deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toISOString().slice(0, 10) : '',
        AssignedTo: deal.assignedTo ? (deal.assignedTo.firstName ? `${deal.assignedTo.firstName} ${deal.assignedTo.lastName} (${deal.assignedTo.email})` : deal.assignedTo.toString()) : '',
      });
    });
    leads.forEach(lead => {
      rows.push({
        Type: 'Lead',
        FirstName: lead.firstName,
        LastName: lead.lastName,
        Email: lead.email,
        Status: lead.status,
        Score: lead.score,
        AssignedTo: lead.assignedTo ? (lead.assignedTo.firstName ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName} (${lead.assignedTo.email})` : lead.assignedTo.toString()) : '',
        CreatedAt: lead.createdAt ? new Date(lead.createdAt).toISOString().slice(0, 10) : '',
      });
    });
    if (rows.length === 0) {
      rows.push({ Type: 'No data found for selected filters' });
    }
    const parser = new Parser();
    const csv = parser.parse(rows);
    res.header('Content-Type', 'text/csv');
    res.attachment('report.csv');
    return res.send(csv);
  } catch (error) {
    next(error);
  }
}; 