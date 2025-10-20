import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const teamMemberSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    trim: true,
    maxlength: [100, 'Position cannot exceed 100 characters']
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
    facebook: {
      type: String,
      trim: true
    },
    instagram: {
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
    },
    website: {
      type: String,
      trim: true
    }
  },
  skills: [String],
  experience: {
    type: String,
    trim: true
  },
  joinedDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  department: {
    type: String,
    enum: ['leadership', 'technical', 'marketing', 'operations', 'other'],
    default: 'other'
  },
  isFounder: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
teamMemberSchema.index({ isActive: 1, displayOrder: 1 });
teamMemberSchema.index({ department: 1 });
teamMemberSchema.index({ isFounder: 1 });

export default model('TeamMember', teamMemberSchema);