import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  review: {
    type: String,
    required: [true, 'Review is required'],
    trim: true,
    maxlength: [1000, 'Review cannot exceed 1000 characters']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    default: 5
  },
  image: {
    type: String,
    required: [true, 'Image is required']
  },
  imagePublicId: {
    type: String
  },
  role: {
    type: String,
    trim: true,
    maxlength: [100, 'Role cannot exceed 100 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for sorting
testimonialSchema.index({ displayOrder: 1, createdAt: -1 });

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

export default Testimonial;
