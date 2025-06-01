import { Request, Response } from 'express';
import { Document, IDocument } from '../models/Document';
import { getFileUrl, deleteFile } from '../utils/fileStorage';
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

export class DocumentController {
  // Upload new document
  static async upload(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const fileUrl = getFileUrl(req, req.file.filename);
      
      const documentData = {
        ...req.body,
        fileUrl,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        uploadedBy: new Types.ObjectId(req.user!.id),
        lastModifiedBy: new Types.ObjectId(req.user!.id)
      };

      const document = new Document(documentData);
      await document.save();

      logger.info(`Document uploaded: ${document.title}`);
      res.status(201).json(document);
    } catch (error) {
      logger.error('Error uploading document:', error);
      res.status(500).json({ error: 'Error uploading document' });
    }
  }

  // Get all documents with filtering and pagination
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const filter: FilterQuery<IDocument> = {};

      // Apply filters
      if (req.query.status) filter.status = req.query.status;
      if (req.query.type) filter.fileType = req.query.type;
      if (req.query.search) {
        filter.$or = [
          { title: new RegExp(req.query.search as string, 'i') },
          { description: new RegExp(req.query.search as string, 'i') },
          { tags: new RegExp(req.query.search as string, 'i') }
        ];
      }

      // Add access control filter
      filter.$or = [
        { 'accessControl.isPublic': true },
        { 'accessControl.roles': { $in: [req.user!.role] } },
        { 'accessControl.users': new Types.ObjectId(req.user!.id) },
        { uploadedBy: new Types.ObjectId(req.user!.id) }
      ];

      const [documents, total] = await Promise.all([
        Document.find(filter)
          .sort({ 'metadata.createdAt': -1 })
          .skip(skip)
          .limit(limit)
          .populate('uploadedBy', 'firstName lastName email')
          .populate('lastModifiedBy', 'firstName lastName email'),
        Document.countDocuments(filter)
      ]);

      res.json({
        documents,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      });
    } catch (error) {
      logger.error('Error fetching documents:', error);
      res.status(500).json({ error: 'Error fetching documents' });
    }
  }

  // Get document by ID
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const document = await Document.findById(req.params.id)
        .populate('uploadedBy', 'firstName lastName email')
        .populate('lastModifiedBy', 'firstName lastName email');

      if (!document) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }

      // Check access permission
      if (!document.hasAccess(new Types.ObjectId(req.user!.id), [req.user!.role])) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      res.json(document);
    } catch (error) {
      logger.error('Error fetching document:', error);
      res.status(500).json({ error: 'Error fetching document' });
    }
  }

  // Download document
  static async download(req: Request, res: Response): Promise<void> {
    try {
      const document = await Document.findById(req.params.id);

      if (!document) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }

      // Check access permission
      if (!document.hasAccess(new Types.ObjectId(req.user!.id), [req.user!.role])) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      // Increment download count
      await document.incrementDownloadCount();

      // Extract filename from URL
      const filename = document.fileUrl.split('/').pop();
      if (!filename) {
        res.status(404).json({ error: 'File not found' });
        return;
      }

      res.download(filename, document.fileName);
    } catch (error) {
      logger.error('Error downloading document:', error);
      res.status(500).json({ error: 'Error downloading document' });
    }
  }

  // Update document metadata
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const document = await Document.findById(req.params.id);

      if (!document) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }

      // Check access permission
      if (!document.hasAccess(new Types.ObjectId(req.user!.id), [req.user!.role])) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      // Update allowed fields
      const allowedUpdates = ['title', 'description', 'tags', 'accessControl', 'status'];
      Object.keys(req.body).forEach(key => {
        if (allowedUpdates.includes(key)) {
          (document as any)[key] = req.body[key];
        }
      });

      document.lastModifiedBy = new Types.ObjectId(req.user!.id);
      await document.save();

      logger.info(`Document updated: ${document.title}`);
      res.json(document);
    } catch (error) {
      logger.error('Error updating document:', error);
      res.status(500).json({ error: 'Error updating document' });
    }
  }

  // Delete document
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const document = await Document.findById(req.params.id);

      if (!document) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }

      // Check access permission (only owner or admin can delete)
      const isOwner = document.uploadedBy.equals(new Types.ObjectId(req.user!.id));
      const isAdmin = req.user!.role === 'admin';
      
      if (!isOwner && !isAdmin) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      // Extract filename from URL and delete file
      const filename = document.fileUrl.split('/').pop();
      if (filename) {
        await deleteFile(filename);
      }

      await Document.findByIdAndDelete(req.params.id);

      logger.info(`Document deleted: ${document.title}`);
      res.json({ message: 'Document deleted successfully' });
    } catch (error) {
      logger.error('Error deleting document:', error);
      res.status(500).json({ error: 'Error deleting document' });
    }
  }

  // Add new version
  static async addVersion(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const document = await Document.findById(req.params.id);

      if (!document) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }

      // Check access permission
      if (!document.hasAccess(new Types.ObjectId(req.user!.id), [req.user!.role])) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      const fileUrl = getFileUrl(req, req.file.filename);
      
      await document.addVersion(
        fileUrl,
        req.file.size,
        new Types.ObjectId(req.user!.id),
        req.body.changeDescription
      );

      logger.info(`New version added to document: ${document.title}`);
      res.json(document);
    } catch (error) {
      logger.error('Error adding version:', error);
      res.status(500).json({ error: 'Error adding version' });
    }
  }
} 