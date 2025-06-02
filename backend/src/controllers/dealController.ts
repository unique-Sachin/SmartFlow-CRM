import { Request as ExpressRequest, Response } from 'express';
import { Deal } from '../models/Deal';
import { Types } from 'mongoose';
import type { Server as SocketIOServer } from 'socket.io';

interface CustomRequest extends ExpressRequest {
  app: ExpressRequest['app'] & { io?: SocketIOServer };
}

const create = async (req: CustomRequest, res: Response) => {
  try {
    const deal = new Deal(req.body);
    await deal.save();
    // Emit socket event
    req.app.io?.emit('dealCreated', deal);
    res.status(201).json(deal);
  } catch (error) {
    res.status(500).json({ error: 'Error creating deal', details: error });
  }
};

const getAll = async (req: ExpressRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const filter: any = {};
    if (req.query.stage) filter.stage = req.query.stage;
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
    if (req.query.contact) filter.contact = req.query.contact;
    if (req.query.company) filter.company = req.query.company;
    if (req.query.search) {
      filter.$or = [
        { title: new RegExp(req.query.search as string, 'i') },
        { notes: new RegExp(req.query.search as string, 'i') },
        { tags: new RegExp(req.query.search as string, 'i') }
      ];
    }
    const [deals, total] = await Promise.all([
      Deal.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Deal.countDocuments(filter)
    ]);
    res.json({ deals, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching deals', details: error });
  }
};

const getById = async (req: ExpressRequest, res: Response) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('contact', 'firstName lastName email');
    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }
    res.json(deal);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching deal', details: error });
  }
};

const update = async (req: CustomRequest, res: Response) => {
  try {
    const deal = await Deal.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }
    // Emit socket event
    req.app.io?.emit('dealUpdated', deal);
    res.json(deal);
  } catch (error) {
    res.status(500).json({ error: 'Error updating deal', details: error });
  }
};

const del = async (req: ExpressRequest, res: Response) => {
  try {
    const deal = await Deal.findByIdAndDelete(req.params.id);
    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }
    res.json({ message: 'Deal deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting deal', details: error });
  }
};

const updateStage = async (req: ExpressRequest, res: Response) => {
  try {
    const { stage, reason } = req.body;
    const deal = await Deal.findById(req.params.id);
    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }
    await deal.updateStage(stage, reason);
    res.json(deal);
  } catch (error) {
    res.status(500).json({ error: 'Error updating deal stage', details: error });
  }
};

const addActivity = async (req: ExpressRequest, res: Response) => {
  try {
    const { type, description, outcome, nextAction } = req.body;
    const deal = await Deal.findById(req.params.id);
    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }
    await deal.addActivity(type, description, outcome, nextAction);
    res.json(deal);
  } catch (error) {
    res.status(500).json({ error: 'Error adding activity', details: error });
  }
};

export default {
  create,
  getAll,
  getById,
  update,
  delete: del,
  updateStage,
  addActivity
}; 