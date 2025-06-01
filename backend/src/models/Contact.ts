import mongoose, { Document, Schema } from 'mongoose';

export interface IContact extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  status: 'active' | 'inactive' | 'lead' | 'customer';
  source: 'referral' | 'website' | 'social' | 'direct' | 'other';
  assignedTo: mongoose.Types.ObjectId;
  tags: string[];
  notes: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  socialProfiles?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  interactions: Array<{
    type: 'email' | 'call' | 'meeting' | 'note';
    date: Date;
    summary: string;
    outcome?: string;
  }>;
  preferences?: {
    communicationChannel: 'email' | 'phone' | 'both';
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    newsletter: boolean;
  };
  lastContactDate?: Date;
  nextFollowUp?: Date;
  createdAt: Date;
  updatedAt: Date;
  addInteraction: (
    type: 'email' | 'call' | 'meeting' | 'note',
    summary: string,
    outcome?: string
  ) => Promise<void>;
}

const contactSchema = new Schema<IContact>({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  company: { type: String, trim: true },
  position: { type: String, trim: true },
  status: {
    type: String,
    enum: ['active', 'inactive', 'lead', 'customer'],
    default: 'lead'
  },
  source: {
    type: String,
    enum: ['referral', 'website', 'social', 'direct', 'other'],
    required: true
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{ type: String, trim: true }],
  notes: { type: String, default: '' },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  socialProfiles: {
    linkedin: String,
    twitter: String,
    facebook: String
  },
  interactions: [{
    type: {
      type: String,
      enum: ['email', 'call', 'meeting', 'note'],
      required: true
    },
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    summary: {
      type: String,
      required: true
    },
    outcome: String
  }],
  preferences: {
    communicationChannel: {
      type: String,
      enum: ['email', 'phone', 'both'],
      default: 'email'
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly'],
      default: 'monthly'
    },
    newsletter: {
      type: Boolean,
      default: true
    }
  },
  lastContactDate: Date,
  nextFollowUp: Date
}, {
  timestamps: true,
  versionKey: false
});

// Indexes for performance
contactSchema.index({ email: 1 });
contactSchema.index({ assignedTo: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ 'interactions.date': -1 });
contactSchema.index({ lastContactDate: -1 });
contactSchema.index({ nextFollowUp: 1 });

// Virtual for full name
contactSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Method to add an interaction
contactSchema.methods.addInteraction = async function(
  type: 'email' | 'call' | 'meeting' | 'note',
  summary: string,
  outcome?: string
) {
  this.interactions.push({
    type,
    date: new Date(),
    summary,
    outcome
  });
  this.lastContactDate = new Date();
  await this.save();
};

export const Contact = mongoose.model<IContact>('Contact', contactSchema); 