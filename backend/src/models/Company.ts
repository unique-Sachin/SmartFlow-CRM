import { Schema, model, Document, Types } from 'mongoose';

interface IActivity {
  type: string;
  date: Date;
  description: string;
  outcome?: string;
  performedBy: Types.ObjectId;
}

interface IRelationship {
  companyId: Types.ObjectId;
  type: string;
  notes?: string;
}

interface IMetadata {
  createdBy: Types.ObjectId;
  lastModifiedBy: Types.ObjectId;
  lastActivityDate?: Date;
  engagementScore?: number;
}

export interface ICompany extends Document {
  _id: Types.ObjectId;
  name: string;
  industry: string;
  size: string;
  status: string;
  website?: string;
  description?: string;
  addresses: {
    type: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isPrimary: boolean;
  }[];
  contacts: Types.ObjectId[];
  primaryContact?: Types.ObjectId;
  accountManager?: Types.ObjectId;
  deals: Types.ObjectId[];
  leads: Types.ObjectId[];
  activities: IActivity[];
  relationships: IRelationship[];
  metadata: IMetadata;
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<ICompany>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  industry: {
    type: String,
    required: true
  },
  size: {
    type: String,
    enum: ['small', 'medium', 'large', 'enterprise'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'prospect', 'churned'],
    default: 'prospect'
  },
  website: String,
  description: String,
  addresses: [{
    type: {
      type: String,
      required: true,
      enum: ['billing', 'shipping', 'headquarters']
    },
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    postalCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  contacts: [{
    type: Schema.Types.ObjectId,
    ref: 'Contact'
  }],
  primaryContact: {
    type: Schema.Types.ObjectId,
    ref: 'Contact'
  },
  accountManager: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  deals: [{
    type: Schema.Types.ObjectId,
    ref: 'Deal'
  }],
  leads: [{
    type: Schema.Types.ObjectId,
    ref: 'Lead'
  }],
  activities: [{
    type: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    description: {
      type: String,
      required: true
    },
    outcome: String,
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],
  relationships: [{
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    type: {
      type: String,
      required: true
    },
    notes: String
  }],
  metadata: {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    lastModifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    lastActivityDate: Date,
    engagementScore: {
      type: Number,
      min: 0,
      max: 100
    }
  }
}, {
  timestamps: true
});

// Create indexes for better performance
companySchema.index({ name: 1 });
companySchema.index({ industry: 1 });
companySchema.index({ status: 1 });
companySchema.index({ 'metadata.lastActivityDate': -1 });
companySchema.index({ 'metadata.engagementScore': -1 });

export const Company = model<ICompany>('Company', companySchema); 