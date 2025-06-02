import { Schema, model, Document, Types } from 'mongoose';

export interface IEmailLog extends Document {
  to: string;
  subject: string;
  body: string;
  sentBy: Types.ObjectId;
  sentAt: Date;
  status: 'sent' | 'failed';
  type: 'manual' | 'bulk' | 'template' | 'ai';
  relatedEntity?: { type: string; id: Types.ObjectId };
  error?: string;
}

const emailLogSchema = new Schema<IEmailLog>({
  to: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  sentBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sentAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['sent', 'failed'], default: 'sent' },
  type: { type: String, enum: ['manual', 'bulk', 'template', 'ai'], default: 'manual' },
  relatedEntity: {
    type: { type: String },
    id: { type: Schema.Types.ObjectId }
  },
  error: String,
}, { timestamps: true });

export const EmailLog = model<IEmailLog>('EmailLog', emailLogSchema); 