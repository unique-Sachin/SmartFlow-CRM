import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smartflow-crm';
    await mongoose.connect(mongoURI);
    logger.info('MongoDB Connected...');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    throw error;
  }
}; 