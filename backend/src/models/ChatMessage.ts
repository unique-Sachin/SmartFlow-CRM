import mongoose, { Schema, Document } from 'mongoose';

export type MessageStatus = 'sent' | 'delivered' | 'read';
export interface IChatMessage extends Document {
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  content: string;
  timestamp: Date;
  status: MessageStatus;
}

const chatMessageSchema = new Schema<IChatMessage>({
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
});

export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema); 