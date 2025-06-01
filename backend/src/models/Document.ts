import { Schema, model, Document as MongoDocument, Types } from 'mongoose';

export interface IDocument extends MongoDocument {
  title: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedBy: Types.ObjectId;
  lastModifiedBy: Types.ObjectId;
  relatedTo?: {
    model: 'Company' | 'Contact' | 'Deal' | 'Lead';
    id: Types.ObjectId;
  };
  tags: string[];
  accessControl: {
    roles: string[];
    users: Types.ObjectId[];
    isPublic: boolean;
  };
  version: number;
  versions: Array<{
    fileUrl: string;
    fileSize: number;
    modifiedBy: Types.ObjectId;
    modifiedAt: Date;
    changeDescription?: string;
  }>;
  metadata: {
    createdAt: Date;
    lastModifiedAt: Date;
    lastAccessedAt: Date;
    downloadCount: number;
  };
  status: 'active' | 'archived' | 'deleted';
  hasAccess(userId: Types.ObjectId, userRoles: string[]): boolean;
  incrementDownloadCount(): Promise<void>;
  addVersion(fileUrl: string, fileSize: number, modifiedBy: Types.ObjectId, changeDescription?: string): Promise<void>;
}

const documentSchema = new Schema<IDocument>({
  title: {
    type: String,
    required: [true, 'Document title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required']
  },
  fileName: {
    type: String,
    required: [true, 'File name is required'],
    trim: true
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required'],
    max: [26214400, 'File size cannot exceed 25MB'] // 25MB in bytes
  },
  fileType: {
    type: String,
    required: [true, 'File type is required'],
    validate: {
      validator: function(v: string) {
        const allowedTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'image/jpeg',
          'image/png',
          'text/plain',
          'text/csv'
        ];
        return allowedTypes.includes(v);
      },
      message: 'Unsupported file type'
    }
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  relatedTo: {
    model: {
      type: String,
      enum: ['Company', 'Contact', 'Deal', 'Lead']
    },
    id: {
      type: Schema.Types.ObjectId,
      refPath: 'relatedTo.model'
    }
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot be more than 50 characters']
  }],
  accessControl: {
    roles: [{
      type: String,
      enum: ['admin', 'manager', 'sales', 'user']
    }],
    users: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    isPublic: {
      type: Boolean,
      default: false
    }
  },
  version: {
    type: Number,
    default: 1
  },
  versions: [{
    fileUrl: String,
    fileSize: Number,
    modifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    modifiedAt: Date,
    changeDescription: String
  }],
  metadata: {
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastModifiedAt: {
      type: Date,
      default: Date.now
    },
    lastAccessedAt: Date,
    downloadCount: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
documentSchema.index({ title: 1 });
documentSchema.index({ 'relatedTo.model': 1, 'relatedTo.id': 1 });
documentSchema.index({ tags: 1 });
documentSchema.index({ status: 1 });
documentSchema.index({ 'metadata.createdAt': 1 });

// Pre-save middleware to update lastModifiedAt
documentSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.metadata.lastModifiedAt = new Date();
  }
  next();
});

// Method to check if user has access
documentSchema.methods.hasAccess = function(userId: Types.ObjectId, userRoles: string[]): boolean {
  if (this.accessControl.isPublic) return true;
  
  const hasRoleAccess = this.accessControl.roles.some((role: string) => userRoles.includes(role));
  const hasUserAccess = this.accessControl.users.some((user: Types.ObjectId) => user.equals(userId));
  const isOwner = this.uploadedBy.equals(userId);
  
  return hasRoleAccess || hasUserAccess || isOwner;
};

// Method to increment download count
documentSchema.methods.incrementDownloadCount = async function(): Promise<void> {
  this.metadata.downloadCount += 1;
  this.metadata.lastAccessedAt = new Date();
  await this.save();
};

// Method to add new version
documentSchema.methods.addVersion = async function(
  fileUrl: string,
  fileSize: number,
  modifiedBy: Types.ObjectId,
  changeDescription?: string
): Promise<void> {
  this.versions.push({
    fileUrl: this.fileUrl,
    fileSize: this.fileSize,
    modifiedBy: this.lastModifiedBy,
    modifiedAt: this.metadata.lastModifiedAt,
    changeDescription: changeDescription
  });

  this.fileUrl = fileUrl;
  this.fileSize = fileSize;
  this.lastModifiedBy = modifiedBy;
  this.version += 1;
  
  await this.save();
};

export const Document = model<IDocument>('Document', documentSchema); 