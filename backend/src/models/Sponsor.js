import mongoose from 'mongoose';

const sponsorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Sponsor name is required'],
      trim: true,
    },
    logoUrl: {
      type: String,
      required: [true, 'Sponsor logo is required'],
      trim: true,
    },
    logoPublicId: {
      type: String,
      trim: true,
    },
    tagline: {
      type: String,
      required: [true, 'Tagline is required'],
      trim: true,
    },
    discount: {
      type: String,
      required: [true, 'Discount information is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    benefits: {
      type: [String],
      required: [true, 'At least one benefit is required'],
      validate: {
        validator: function(v) {
          return v && v.length > 0;
        },
        message: 'At least one benefit is required'
      }
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      lowercase: true,
      trim: true,
    },
    validUntil: {
      type: String,
      required: [true, 'Valid until date is required'],
    },
    color: {
      type: String,
      required: [true, 'Color is required'],
      default: '#dc2626',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
sponsorSchema.index({ category: 1, isActive: 1 });
sponsorSchema.index({ order: 1 });

const Sponsor = mongoose.model('Sponsor', sponsorSchema);

export default Sponsor;
