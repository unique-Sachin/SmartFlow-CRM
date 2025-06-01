import { Request, Response } from 'express';
import { Company, ICompany } from '../models/Company';
import { FilterQuery, Types } from 'mongoose';
import winston from 'winston';

// Create logger instance
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

export class CompanyController {
  // Create a new company
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const companyData = {
        ...req.body,
        metadata: {
          ...req.body.metadata,
          createdBy: new Types.ObjectId(req.user!.id),
          lastModifiedBy: new Types.ObjectId(req.user!.id)
        }
      };

      const company = new Company(companyData);
      await company.save();

      logger.info(`Company created: ${company.name}`);
      res.status(201).json(company);
    } catch (error) {
      logger.error('Error creating company:', error);
      res.status(500).json({ error: 'Error creating company' });
    }
  }

  // Get all companies with filtering and pagination
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const filter: FilterQuery<ICompany> = {};

      // Apply filters if provided
      if (req.query.status) filter.status = req.query.status;
      if (req.query.industry) filter.industry = req.query.industry;
      if (req.query.size) filter.size = req.query.size;
      if (req.query.search) {
        filter.$or = [
          { name: new RegExp(req.query.search as string, 'i') },
          { industry: new RegExp(req.query.search as string, 'i') }
        ];
      }

      const [companies, total] = await Promise.all([
        Company.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('primaryContact', 'firstName lastName email')
          .populate('accountManager', 'firstName lastName email'),
        Company.countDocuments(filter)
      ]);

      res.json({
        companies,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total
      });
    } catch (error) {
      logger.error('Error fetching companies:', error);
      res.status(500).json({ error: 'Error fetching companies' });
    }
  }

  // Get company by ID
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const company = await Company.findById(req.params.id)
        .populate('primaryContact', 'firstName lastName email')
        .populate('accountManager', 'firstName lastName email')
        .populate('contacts', 'firstName lastName email')
        .populate('deals', 'name value status')
        .populate('leads', 'firstName lastName email status');

      if (!company) {
        res.status(404).json({ error: 'Company not found' });
        return;
      }

      res.json(company);
    } catch (error) {
      logger.error('Error fetching company:', error);
      res.status(500).json({ error: 'Error fetching company' });
    }
  }

  // Update company
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const updateData = {
        ...req.body,
        'metadata.lastModifiedBy': new Types.ObjectId(req.user!.id)
      };

      const company = await Company.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!company) {
        res.status(404).json({ error: 'Company not found' });
        return;
      }

      logger.info(`Company updated: ${company.name}`);
      res.json(company);
    } catch (error) {
      logger.error('Error updating company:', error);
      res.status(500).json({ error: 'Error updating company' });
    }
  }

  // Delete company
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const company = await Company.findByIdAndDelete(req.params.id);

      if (!company) {
        res.status(404).json({ error: 'Company not found' });
        return;
      }

      logger.info(`Company deleted: ${company.name}`);
      res.json({ message: 'Company deleted successfully' });
    } catch (error) {
      logger.error('Error deleting company:', error);
      res.status(500).json({ error: 'Error deleting company' });
    }
  }

  // Add activity to company
  static async addActivity(req: Request, res: Response): Promise<void> {
    try {
      const company = await Company.findById(req.params.id);

      if (!company) {
        res.status(404).json({ error: 'Company not found' });
        return;
      }

      const activity = {
        type: req.body.type,
        date: new Date(),
        description: req.body.description,
        outcome: req.body.outcome,
        performedBy: new Types.ObjectId(req.user!.id)
      };

      company.activities.push(activity);
      company.metadata.lastActivityDate = new Date();
      await company.save();

      logger.info(`Activity added to company: ${company.name}`);
      res.json(company);
    } catch (error) {
      logger.error('Error adding activity:', error);
      res.status(500).json({ error: 'Error adding activity' });
    }
  }

  // Update engagement score
  static async updateEngagementScore(req: Request, res: Response): Promise<void> {
    try {
      const company = await Company.findById(req.params.id);

      if (!company) {
        res.status(404).json({ error: 'Company not found' });
        return;
      }

      if (req.body.score < 0 || req.body.score > 100) {
        res.status(400).json({ error: 'Score must be between 0 and 100' });
        return;
      }

      company.metadata.engagementScore = req.body.score;
      await company.save();

      logger.info(`Engagement score updated for company: ${company.name}`);
      res.json({ score: company.metadata.engagementScore });
    } catch (error) {
      logger.error('Error updating engagement score:', error);
      res.status(500).json({ error: 'Error updating engagement score' });
    }
  }

  // Add relationship
  static async addRelationship(req: Request, res: Response): Promise<void> {
    try {
      const company = await Company.findById(req.params.id);

      if (!company) {
        res.status(404).json({ error: 'Company not found' });
        return;
      }

      const relatedCompany = await Company.findById(req.body.companyId);
      if (!relatedCompany) {
        res.status(404).json({ error: 'Related company not found' });
        return;
      }

      company.relationships = company.relationships || [];
      company.relationships.push({
        companyId: new Types.ObjectId(req.body.companyId),
        type: req.body.type,
        notes: req.body.notes
      });

      await company.save();

      logger.info(`Relationship added between ${company.name} and ${relatedCompany.name}`);
      res.json(company);
    } catch (error) {
      logger.error('Error adding relationship:', error);
      res.status(500).json({ error: 'Error adding relationship' });
    }
  }

  // Get company statistics
  static async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      const [
        totalCompanies,
        statusCounts,
        industryDistribution,
        sizeDistribution
      ] = await Promise.all([
        Company.countDocuments(),
        Company.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        Company.aggregate([
          { $group: { _id: '$industry', count: { $sum: 1 } } }
        ]),
        Company.aggregate([
          { $group: { _id: '$size', count: { $sum: 1 } } }
        ])
      ]);

      res.json({
        totalCompanies,
        statusDistribution: statusCounts,
        industryDistribution,
        sizeDistribution
      });
    } catch (error) {
      logger.error('Error fetching company statistics:', error);
      res.status(500).json({ error: 'Error fetching company statistics' });
    }
  }
} 