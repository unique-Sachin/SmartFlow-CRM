import mongoose, { Document, Schema } from 'mongoose';

export interface IDeal extends Document {
  title: string;
  value: number;
  currency: string;
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: number;
  expectedCloseDate: Date;
  actualCloseDate?: Date;
  contact: mongoose.Types.ObjectId;
  company?: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId;
  products?: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    description?: string;
  }>;
  activities: Array<{
    type: 'note' | 'email' | 'call' | 'meeting' | 'task';
    date: Date;
    description: string;
    outcome?: string;
    nextAction?: string;
  }>;
  notes: string;
  tags: string[];
  customFields?: Record<string, any>;
  priority: 'low' | 'medium' | 'high';
  lossReason?: string;
  winReason?: string;
  competitors?: string[];
  documents?: Array<{
    name: string;
    url: string;
    type: string;
    uploadedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
  updateStage: (
    newStage: IDeal['stage'],
    reason?: string
  ) => Promise<void>;
  addActivity: (
    type: IDeal['activities'][0]['type'],
    description: string,
    outcome?: string,
    nextAction?: string
  ) => Promise<void>;
}

const dealSchema = new Schema<IDeal>({
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  value: { 
    type: Number, 
    required: true,
    min: 0 
  },
  currency: { 
    type: String, 
    required: true,
    default: 'USD',
    uppercase: true,
    trim: true 
  },
  stage: { 
    type: String,
    required: true,
    enum: ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'],
    default: 'prospecting'
  },
  probability: { 
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0
  },
  expectedCloseDate: { 
    type: Date,
    required: true 
  },
  actualCloseDate: Date,
  contact: { 
    type: Schema.Types.ObjectId,
    ref: 'Contact',
    required: true 
  },
  company: { 
    type: Schema.Types.ObjectId,
    ref: 'Company' 
  },
  assignedTo: { 
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true 
  },
  products: [{
    name: { 
      type: String,
      required: true,
      trim: true 
    },
    quantity: { 
      type: Number,
      required: true,
      min: 1 
    },
    unitPrice: { 
      type: Number,
      required: true,
      min: 0 
    },
    totalPrice: { 
      type: Number,
      required: true,
      min: 0 
    },
    description: String
  }],
  activities: [{
    type: { 
      type: String,
      required: true,
      enum: ['note', 'email', 'call', 'meeting', 'task'] 
    },
    date: { 
      type: Date,
      required: true,
      default: Date.now 
    },
    description: { 
      type: String,
      required: true 
    },
    outcome: String,
    nextAction: String
  }],
  notes: { 
    type: String,
    default: '' 
  },
  tags: [{ 
    type: String,
    trim: true 
  }],
  customFields: {
    type: Map,
    of: Schema.Types.Mixed
  },
  priority: { 
    type: String,
    required: true,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  lossReason: String,
  winReason: String,
  competitors: [String],
  documents: [{
    name: { 
      type: String,
      required: true 
    },
    url: { 
      type: String,
      required: true 
    },
    type: { 
      type: String,
      required: true 
    },
    uploadedAt: { 
      type: Date,
      default: Date.now 
    }
  }]
}, {
  timestamps: true,
  versionKey: false
});

// Indexes for performance
dealSchema.index({ stage: 1 });
dealSchema.index({ assignedTo: 1 });
dealSchema.index({ contact: 1 });
dealSchema.index({ company: 1 });
dealSchema.index({ expectedCloseDate: 1 });
dealSchema.index({ value: -1 });
dealSchema.index({ probability: -1 });
dealSchema.index({ createdAt: -1 });

// Virtual for total deal value
dealSchema.virtual('totalValue').get(function() {
  if (!this.products?.length) return this.value;
  return this.products.reduce((total, product) => total + product.totalPrice, 0);
});

// Method to update deal stage
dealSchema.methods.updateStage = async function(
  newStage: IDeal['stage'],
  reason?: string
) {
  const oldStage = this.stage;
  this.stage = newStage;
  
  if (newStage === 'closed_won') {
    this.actualCloseDate = new Date();
    this.probability = 100;
    this.winReason = reason || '';
  } else if (newStage === 'closed_lost') {
    this.actualCloseDate = new Date();
    this.probability = 0;
    this.lossReason = reason || '';
  }

  // Add activity for stage change
  this.activities.push({
    type: 'note',
    date: new Date(),
    description: `Deal stage changed from ${oldStage} to ${newStage}${reason ? ': ' + reason : ''}`
  });

  await this.save();
};

// Method to add an activity
dealSchema.methods.addActivity = async function(
  type: IDeal['activities'][0]['type'],
  description: string,
  outcome?: string,
  nextAction?: string
) {
  this.activities.push({
    type,
    date: new Date(),
    description,
    outcome,
    nextAction
  });
  await this.save();
};

export const Deal = mongoose.model<IDeal>('Deal', dealSchema); 