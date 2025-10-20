import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const eventSchema = new Schema({
  // Basic Event Info
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  subtitle: {
    type: String,
    trim: true,
    maxlength: [300, 'Subtitle cannot exceed 300 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // Dynamic Content Sections
  contentSections: [{
    sectionTitle: {
      type: String,
      required: [true, 'Section title is required'],
      trim: true,
      maxlength: [100, 'Section title cannot exceed 100 characters']
    },
    subheading: {
      type: String,
      trim: true,
      maxlength: [50, 'Subheading cannot exceed 50 characters']
    },
    heading: {
      type: String,
      required: [true, 'Section heading is required'],
      trim: true,
      maxlength: [200, 'Heading cannot exceed 200 characters']
    },
    content: {
      type: String,
      required: [true, 'Section content is required'],
      trim: true,
      maxlength: [2000, 'Content cannot exceed 2000 characters']
    },
    imageUrl: {
      type: String,
      trim: true
    },
    imageAlt: {
      type: String,
      trim: true,
      maxlength: [100, 'Image alt text cannot exceed 100 characters']
    },
    order: {
      type: Number,
      default: 0
    },
    layout: {
      type: String,
      enum: ['image-left', 'image-right'],
      default: 'image-left'
    }
  }],
  
  // Legacy fields for backward compatibility
  imgUrl: {
    type: String,
    trim: true
  },
  details: {
    type: String,
    trim: true,
    maxlength: [2000, 'Details cannot exceed 2000 characters']
  },
  
  // Event Logistics
  location: {
    type: String,
    trim: true
  },
  venue: {
    name: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    pincode: {
      type: String,
      trim: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Event Timing
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  duration: {
    days: {
      type: Number,
      default: 1,
      min: [1, 'Duration must be at least 1 day']
    },
    hours: {
      type: Number,
      default: 0,
      min: [0, 'Hours cannot be negative']
    }
  },
  
  // Event Classification
  category: {
    type: String,
    enum: ['mumbai-bikers-mania', 'ride', 'workshop', 'meetup', 'competition', 'other'],
    default: 'other'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Event Status & Visibility
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  eventType: {
    type: String,
    enum: ['upcoming', 'past', 'ongoing'],
    default: 'upcoming'
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed', 'postponed'],
    default: 'draft'
  },
  
  // Organizer Info
  organizer: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  coOrganizers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Registration & Booking
  registrationInfo: {
    isRequired: {
      type: Boolean,
      default: true
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    deadline: {
      type: Date
    },
    instructions: {
      type: String,
      trim: true,
      maxlength: [1000, 'Registration instructions cannot exceed 1000 characters']
    }
  },
  
  // Pricing
  pricing: {
    isFree: {
      type: Boolean,
      default: false
    },
    basePrice: {
      type: Number,
      default: 0,
      min: [0, 'Base price cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR'
    },
    earlyBirdPrice: {
      type: Number,
      min: [0, 'Early bird price cannot be negative']
    },
    earlyBirdDeadline: {
      type: Date
    },
    groupDiscounts: [{
      minParticipants: {
        type: Number,
        min: [2, 'Minimum participants for group discount must be at least 2']
      },
      discountPercent: {
        type: Number,
        min: [0, 'Discount percentage cannot be negative'],
        max: [100, 'Discount percentage cannot exceed 100']
      }
    }]
  },
  
  // Legacy pricing field for backward compatibility
  price: {
    type: Number,
    default: 0,
    min: [0, 'Price cannot be negative']
  },
  
  // Capacity Management
  capacity: {
    maxParticipants: {
      type: Number,
      default: 100,
      min: [1, 'Maximum participants must be at least 1']
    },
    currentParticipants: {
      type: Number,
      default: 0,
      min: [0, 'Current participants cannot be negative']
    },
    waitlistEnabled: {
      type: Boolean,
      default: true
    },
    maxWaitlist: {
      type: Number,
      default: 50,
      min: [0, 'Maximum waitlist cannot be negative']
    }
  },
  
  // Legacy capacity fields for backward compatibility
  maxParticipants: {
    type: Number,
    default: 100,
    min: [1, 'Maximum participants must be at least 1']
  },
  currentParticipants: {
    type: Number,
    default: 0,
    min: [0, 'Current participants cannot be negative']
  },
  registrationDeadline: {
    type: Date
  },
  isBookingEnabled: {
    type: Boolean,
    default: true
  },
  
  // Event Requirements & Guidelines
  requirements: {
    ageLimit: {
      min: {
        type: Number,
        min: [0, 'Minimum age cannot be negative']
      },
      max: {
        type: Number,
        min: [0, 'Maximum age cannot be negative']
      }
    },
    licenseRequired: {
      type: Boolean,
      default: false
    },
    bikeRequired: {
      type: Boolean,
      default: false
    },
    helmetMandatory: {
      type: Boolean,
      default: true
    },
    equipmentNeeded: [{
      item: String,
      isRequired: {
        type: Boolean,
        default: false
      },
      description: String
    }],
    skillLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'all'],
      default: 'all'
    }
  },
  
  // Additional Event Info
  highlights: [{
    type: String,
    trim: true,
    maxlength: [200, 'Highlight cannot exceed 200 characters']
  }],
  
  itinerary: [{
    time: String,
    activity: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    location: String,
    duration: Number // in minutes
  }],
  
  // Contact & Support
  contactInfo: {
    primaryContact: {
      name: String,
      phone: String,
      email: String
    },
    emergencyContact: {
      name: String,
      phone: String
    },
    supportEmail: String,
    supportPhone: String
  },
  
  // Social & Media
  socialLinks: {
    website: String,
    facebook: String,
    instagram: String,
    twitter: String,
    youtube: String,
    whatsapp: String
  },
  
  // SEO & Marketing
  seo: {
    metaTitle: {
      type: String,
      maxlength: [60, 'Meta title cannot exceed 60 characters']
    },
    metaDescription: {
      type: String,
      maxlength: [160, 'Meta description cannot exceed 160 characters']
    },
    keywords: [String]
  },
  
  // Analytics & Tracking
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    registrations: {
      type: Number,
      default: 0
    },
    completions: {
      type: Number,
      default: 0
    },
    ratings: {
      average: {
        type: Number,
        min: [0, 'Rating cannot be negative'],
        max: [5, 'Rating cannot exceed 5']
      },
      count: {
        type: Number,
        default: 0
      }
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
eventSchema.index({ category: 1, isActive: 1 });
eventSchema.index({ startDate: 1 });
eventSchema.index({ eventType: 1, isActive: 1, isPublished: 1 });
eventSchema.index({ status: 1, isActive: 1 });
eventSchema.index({ 'venue.city': 1, startDate: 1 });
eventSchema.index({ tags: 1 });
eventSchema.index({ isFeatured: 1, isPublished: 1, startDate: 1 });
eventSchema.index({ title: 'text', description: 'text', details: 'text' });

// Virtual for computed fields
eventSchema.virtual('isRegistrationOpen').get(function() {
  const now = new Date();
  const registrationStart = this.registrationInfo?.startDate;
  const registrationEnd = this.registrationInfo?.endDate || this.registrationInfo?.deadline;
  
  if (registrationStart && registrationStart > now) return false;
  if (registrationEnd && registrationEnd < now) return false;
  
  return this.isBookingEnabled && this.status === 'published';
});

eventSchema.virtual('spotsAvailable').get(function() {
  const maxCapacity = this.capacity?.maxParticipants || this.maxParticipants || 0;
  const current = this.capacity?.currentParticipants || this.currentParticipants || 0;
  return Math.max(0, maxCapacity - current);
});

eventSchema.virtual('isSoldOut').get(function() {
  return this.spotsAvailable === 0;
});

eventSchema.virtual('currentPrice').get(function() {
  if (this.pricing?.isFree) return 0;
  
  const now = new Date();
  const earlyBirdDeadline = this.pricing?.earlyBirdDeadline;
  
  if (earlyBirdDeadline && now <= earlyBirdDeadline && this.pricing?.earlyBirdPrice) {
    return this.pricing.earlyBirdPrice;
  }
  
  return this.pricing?.basePrice || this.price || 0;
});

// Pre-save validation and processing
eventSchema.pre('save', function(next) {
  // Validate end date is after start date
  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    return next(new Error('End date must be after start date'));
  }
  
  // Validate registration dates
  if (this.registrationInfo?.startDate && this.registrationInfo?.endDate) {
    if (this.registrationInfo.endDate < this.registrationInfo.startDate) {
      return next(new Error('Registration end date must be after start date'));
    }
  }
  
  // Validate early bird pricing
  if (this.pricing?.earlyBirdPrice && this.pricing?.basePrice) {
    if (this.pricing.earlyBirdPrice >= this.pricing.basePrice) {
      return next(new Error('Early bird price must be less than base price'));
    }
  }
  
  // Auto-set event type based on dates
  if (this.startDate) {
    const now = new Date();
    if (this.startDate > now) {
      this.eventType = 'upcoming';
    } else if (this.endDate && this.endDate < now) {
      this.eventType = 'past';
      if (this.status === 'published') {
        this.status = 'completed';
      }
    } else {
      this.eventType = 'ongoing';
    }
  }
  
  // Sync legacy fields with new structure
  if (this.pricing?.basePrice !== undefined) {
    this.price = this.pricing.basePrice;
  }
  if (this.capacity?.maxParticipants !== undefined) {
    this.maxParticipants = this.capacity.maxParticipants;
  }
  if (this.capacity?.currentParticipants !== undefined) {
    this.currentParticipants = this.capacity.currentParticipants;
  }
  
  // Sort content sections by order
  if (this.contentSections && this.contentSections.length > 0) {
    this.contentSections.sort((a, b) => (a.order || 0) - (b.order || 0));
  }
  
  // Generate SEO fields if not provided
  if (!this.seo?.metaTitle && this.title) {
    this.seo = this.seo || {};
    this.seo.metaTitle = this.title.substring(0, 60);
  }
  
  if (!this.seo?.metaDescription && this.description) {
    this.seo = this.seo || {};
    this.seo.metaDescription = this.description.substring(0, 160);
  }
  
  next();
});

// Post-save hook to update participant counts
eventSchema.post('save', async function(doc) {
  // This will be used to sync with EventBooking model
  // Can be implemented when needed for real-time participant count updates
});

export default model('Event', eventSchema);