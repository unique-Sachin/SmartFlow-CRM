import { Request } from 'express';
import { Types } from 'mongoose';

declare global {
  namespace Express {
    interface User {
      id: Types.ObjectId;
      role: string;
      email: string;
      firstName: string;
      lastName: string;
    }

    // Extend Request interface to include user property
    interface Request {
      user?: User;
    }
  }
} 