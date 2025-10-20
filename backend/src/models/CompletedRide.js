import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const completedRideSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Ride title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  imgUrl: {
    type: String,
    trim: true
  },
  gallery: [{
    type: String,
    trim: true
  }],
  date: {
    type: Date,
    required: [true, 'Ride date is required']
  },
  details: {
    type: String,
    trim: true,
    maxlength: [3000, 'Details cannot exceed 3000 characters']
  },
  venue: {
    type: String,
    required: [true, 'Venue is required'],
    trim: true
  },
  distance: {
    type: Number, // in kilometers
    min: [0, 'Distance cannot be negative']
  },
  duration: {
    type: String, // e.g., "4 hours", "2 days"
    trim: true
  },
  participants: {
    type: Number,
    min: [0, 'Participants cannot be negative'],
    default: 0
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard', 'Expert'],
    default: 'Medium'
  },
  highlights: [String],
  organizer: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  route: {
    startLocation: String,
    endLocation: String,
    waypoints: [String]
  },
  weather: {
    type: String,
    trim: true
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  tags: [String],
  stats: {
    averageSpeed: Number,
    totalElevation: Number,
    maxSpeed: Number
  }
}, {
  timestamps: true
});

// Indexes for better query performance
completedRideSchema.index({ date: -1 });
completedRideSchema.index({ venue: 1 });
completedRideSchema.index({ difficulty: 1 });
completedRideSchema.index({ isFeatured: 1, isPublished: 1 });
completedRideSchema.index({ tags: 1 });

export default model('CompletedRide', completedRideSchema);