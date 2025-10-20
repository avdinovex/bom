import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const upcomingRideSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Ride title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slogan: {
    type: String,
    trim: true,
    maxlength: [300, 'Slogan cannot exceed 300 characters']
  },
  venue: {
    type: String,
    required: [true, 'Venue is required'],
    trim: true
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date
  },
  registeredCount: {
    type: Number,
    default: 0,
    min: [0, 'Registered count cannot be negative']
  },
  maxCapacity: {
    type: Number,
    default: 50,
    min: [1, 'Max capacity must be at least 1']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  currency: {
    type: String,
    default: 'INR'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard', 'Expert'],
    default: 'Medium'
  },
  distance: {
    type: Number, // in kilometers
    min: [0, 'Distance cannot be negative']
  },
  imgUrl: {
    type: String,
    trim: true
  },
  riders: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  route: {
    startLocation: String,
    endLocation: String,
    waypoints: [String]
  },
  requirements: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  organizer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Migration tracking fields
  migratedAt: {
    type: Date
  },
  migratedToCompletedRide: {
    type: Schema.Types.ObjectId,
    ref: 'CompletedRide'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
upcomingRideSchema.index({ startTime: 1, isActive: 1 });
upcomingRideSchema.index({ venue: 1 });
upcomingRideSchema.index({ difficulty: 1 });
upcomingRideSchema.index({ price: 1 });
upcomingRideSchema.index({ isFeatured: 1, isActive: 1 });

// Virtual for available spots
upcomingRideSchema.virtual('availableSpots').get(function() {
  return this.maxCapacity - this.registeredCount;
});

// Virtual for is full
upcomingRideSchema.virtual('isFull').get(function() {
  return this.registeredCount >= this.maxCapacity;
});

// Validate end time is after start time
upcomingRideSchema.pre('save', function(next) {
  if (this.endTime && this.endTime < this.startTime) {
    next(new Error('End time must be after start time'));
  }
  next();
});

// Ensure registered count doesn't exceed max capacity
upcomingRideSchema.pre('save', function(next) {
  if (this.registeredCount > this.maxCapacity) {
    next(new Error('Registered count cannot exceed max capacity'));
  }
  next();
});

export default model('UpcomingRide', upcomingRideSchema);