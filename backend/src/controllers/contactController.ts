import { Request, Response } from 'express';
import { Contact } from '../models/Contact';
import { Types } from 'mongoose';

export class ContactController {
  // Create a new contact
  static async create(req: Request, res: Response) {
    try {
      const contact = new Contact(req.body);
      await contact.save();
      res.status(201).json(contact);
    } catch (error) {
      res.status(500).json({ error: 'Error creating contact', details: error });
    }
  }

  // Get all contacts (with basic pagination)
  static async getAll(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
      const filter: any = {};
      if (req.query.status) filter.status = req.query.status;
      if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
      if (req.query.search) {
        filter.$or = [
          { firstName: new RegExp(req.query.search as string, 'i') },
          { lastName: new RegExp(req.query.search as string, 'i') },
          { email: new RegExp(req.query.search as string, 'i') },
          { company: new RegExp(req.query.search as string, 'i') }
        ];
      }
      const [contacts, total] = await Promise.all([
        Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Contact.countDocuments(filter)
      ]);
      res.json({ contacts, total, page, totalPages: Math.ceil(total / limit) });
    } catch (error) {
      res.status(500).json({ error: 'Error fetching contacts', details: error });
    }
  }

  // Get contact by ID
  static async getById(req: Request, res: Response) {
    try {
      const contact = await Contact.findById(req.params.id);
      if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
      }
      res.json(contact);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching contact', details: error });
    }
  }

  // Update contact
  static async update(req: Request, res: Response) {
    try {
      const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
      }
      res.json(contact);
    } catch (error) {
      res.status(500).json({ error: 'Error updating contact', details: error });
    }
  }

  // Delete contact
  static async delete(req: Request, res: Response) {
    try {
      const contact = await Contact.findByIdAndDelete(req.params.id);
      if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
      }
      res.json({ message: 'Contact deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error deleting contact', details: error });
    }
  }

  // Add interaction to contact
  static async addInteraction(req: Request, res: Response) {
    try {
      const contact = await Contact.findById(req.params.id);
      if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
      }
      const { type, summary, outcome } = req.body;
      await contact.addInteraction(type, summary, outcome);
      res.json(contact);
    } catch (error) {
      res.status(500).json({ error: 'Error adding interaction', details: error });
    }
  }
} 