import mongoose, { Document, Schema } from 'mongoose';

export interface ILead extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  source: 'website' | 'referral' | 'social' | 'event' | 'cold_outreach' | 'other';
  status: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted' | 'lost';
  score: number;
  assignedTo: mongoose.Types.ObjectId;
  budget?: {
    amount: number;
    currency: string;
    timeframe?: string;
  };
  requirements?: string;
  interests: string[];
  timeline?: 'immediate' | '1_3_months' | '3_6_months' | '6_12_months' | 'future';
  leadMagnet?: string;
  campaign?: string;
  nurturingSequence?: string;
  activities: Array<{
    type: 'email' | 'call' | 'meeting' | 'note' | 'social' | 'website_visit';
    date: Date;
    description: string;
    outcome?: string;
  }>;
  customFields?: Record<string, any>;
  tags: string[];
  location?: {
    country: string;
    state?: string;
    city?: string;
  };
  socialProfiles?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  qualificationCriteria?: {
    budget: boolean;
    authority: boolean;
    need: boolean;
    timeline: boolean;
  };
  conversionDetails?: {
    convertedAt: Date;
    dealId?: mongoose.Types.ObjectId;
    value?: number;
  };
  metadata: {
    firstTouchpoint: string;
    lastTouchpoint: string;
    totalTouchpoints: number;
    conversionTime?: number; // in days
  };
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<ILead>({
  firstName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  lastName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    lowercase: true 
  },
  phone: { 
    type: String, 
    trim: true 
  },
  company: { 
    type: String, 
    trim: true 
  },
  jobTitle: { 
    type: String, 
    trim: true 
  },
  source: { 
    type: String,
    required: true,
    enum: ['website', 'referral', 'social', 'event', 'cold_outreach', 'other'],
    default: 'other'
  },
  status: { 
    type: String,
    required: true,
    enum: ['new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost'],
    default: 'new'
  },
  score: { 
    type: Number,
    required: true,
    default: 0,
    min: 0,
    max: 100
  },
  assignedTo: { 
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  budget: {
    amount: Number,
    currency: { 
      type: String, 
      default: 'USD' 
    },
    timeframe: String
  },
  requirements: { 
    type: String,
    trim: true 
  },
  interests: [{ 
    type: String,
    trim: true 
  }],
  timeline: { 
    type: String,
    enum: ['immediate', '1_3_months', '3_6_months', '6_12_months', 'future']
  },
  leadMagnet: String,
  campaign: String,
  nurturingSequence: String,
  activities: [{
    type: { 
      type: String,
      required: true,
      enum: ['email', 'call', 'meeting', 'note', 'social', 'website_visit']
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
    outcome: String
  }],
  customFields: {
    type: Map,
    of: Schema.Types.Mixed
  },
  tags: [{ 
    type: String,
    trim: true 
  }],
  location: {
    country: { 
      type: String,
      required: function() { return !!this.location; }
    },
    state: String,
    city: String
  },
  socialProfiles: {
    linkedin: String,
    twitter: String,
    facebook: String
  },
  qualificationCriteria: {
    budget: { 
      type: Boolean,
      default: false 
    },
    authority: { 
      type: Boolean,
      default: false 
    },
    need: { 
      type: Boolean,
      default: false 
    },
    timeline: { 
      type: Boolean,
      default: false 
    }
  },
  conversionDetails: {
    convertedAt: Date,
    dealId: { 
      type: Schema.Types.ObjectId,
      ref: 'Deal'
    },
    value: Number
  },
  metadata: {
    firstTouchpoint: { 
      type: String,
      required: true 
    },
    lastTouchpoint: { 
      type: String,
      required: true 
    },
    totalTouchpoints: { 
      type: Number,
      default: 0 
    },
    conversionTime: Number
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes for performance
leadSchema.index({ email: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ score: -1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ 'activities.date': -1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ source: 1 });
leadSchema.index({ 'conversionDetails.convertedAt': -1 });

// Virtual for full name
leadSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Method to update lead score
leadSchema.methods.updateScore = async function(
  criteria: {
    engagement?: number;    // 0-30 points
    qualification?: number; // 0-30 points
    interest?: number;      // 0-20 points
    budget?: number;        // 0-20 points
  }
) {
  const newScore = Math.min(
    100,
    (criteria.engagement || 0) +
    (criteria.qualification || 0) +
    (criteria.interest || 0) +
    (criteria.budget || 0)
  );
  
  this.score = newScore;
  await this.save();
  return newScore;
};

// Method to add an activity
leadSchema.methods.addActivity = async function(
  type: ILead['activities'][0]['type'],
  description: string,
  outcome?: string
) {
  this.activities.push({
    type,
    date: new Date(),
    description,
    outcome
  });
  
  // Update metadata
  this.metadata.lastTouchpoint = description;
  this.metadata.totalTouchpoints++;
  
  await this.save();
};

// Method to convert lead to deal
leadSchema.methods.convertToDeal = async function(dealId: mongoose.Types.ObjectId, value?: number) {
  this.status = 'converted';
  this.conversionDetails = {
    convertedAt: new Date(),
    dealId,
    value
  };
  
  // Calculate conversion time in days
  const conversionTime = Math.floor(
    (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  this.metadata.conversionTime = conversionTime;
  
  await this.save();
};

export const Lead = mongoose.model<ILead>('Lead', leadSchema); 