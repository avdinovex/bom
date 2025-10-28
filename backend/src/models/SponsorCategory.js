import mongoose from 'mongoose';

const sponsorCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
    },
    value: {
      type: String,
      required: [true, 'Category value is required'],
      trim: true,
      unique: true,
      lowercase: true,
    },
    icon: {
      type: String,
      required: [true, 'Category icon is required'],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
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
sponsorCategorySchema.index({ isActive: 1, order: 1 });

const SponsorCategory = mongoose.model('SponsorCategory', sponsorCategorySchema);

export default SponsorCategory;
