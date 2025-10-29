import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const teamMemberSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  role: {
    type: String,
    trim: true,
    maxlength: [100, 'Role cannot exceed 100 characters']
  },
  memberType: {
    type: String,
    enum: ['core', 'rider'],
    required: [true, 'Member type is required'],
    default: 'rider'
  },
  imgUrl: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [1000, 'Bio cannot exceed 1000 characters']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true
  },
  social: {
    instagram: {
      type: String,
      trim: true
    },
    youtube: {
      type: String,
      trim: true
    },
    facebook: {
      type: String,
      trim: true
    },
    twitter: {
      type: String,
      trim: true
    },
    linkedin: {
      type: String,
      trim: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  isLeadership: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
teamMemberSchema.index({ isActive: 1, displayOrder: 1 });
teamMemberSchema.index({ memberType: 1 });
teamMemberSchema.index({ isLeadership: 1 });

export default model('TeamMember', teamMemberSchema);