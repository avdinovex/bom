import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const bookingSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  ride: {
    type: Schema.Types.ObjectId,
    ref: 'UpcomingRide',
    required: [true, 'Ride is required']
  },
  
  // Booking Type
  bookingType: {
    type: String,
    enum: ['individual', 'group'],
    default: 'individual',
    required: [true, 'Booking type is required']
  },

  // Group Information (only for group bookings)
  groupInfo: {
    groupName: {
      type: String,
      trim: true
    },
    groupSize: {
      type: Number,
      min: [2, 'Group must have at least 2 members'],
      max: [20, 'Group cannot exceed 20 members']
    },
    members: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      contactNumber: {
        type: String,
        required: true,
        trim: true
      },
      emergencyContact: {
        type: String,
        required: true,
        trim: true
      },
      address: {
        type: String,
        required: true,
        trim: true
      },
      tshirtSize: {
        type: String,
        required: true,
        enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
      },
      foodPreference: {
        type: String,
        required: true,
        enum: ['Veg', 'Non-Veg']
      }
    }]
  },
  
  // Personal Information (Group Leader info for group bookings)
  personalInfo: {
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: ['Male', 'Female']
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required']
    },
    bloodGroup: {
      type: String,
      required: [true, 'Blood group is required'],
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    tshirtSize: {
      type: String,
      required: [true, 'T-shirt size is required'],
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    },
    foodPreference: {
      type: String,
      required: [true, 'Food preference is required'],
      enum: ['Veg', 'Non-Veg']
    }
  },

  // Motorcycle Information
  motorcycleInfo: {
    modelName: {
      type: String,
      required: [true, 'Motorcycle model name is required'],
      trim: true
    },
    motorcycleNumber: {
      type: String,
      required: [true, 'Motorcycle number is required'],
      trim: true,
      uppercase: true
    }
  },

  // Emergency Contact
  emergencyContact: {
    personName: {
      type: String,
      required: [true, 'Emergency contact person name is required'],
      trim: true
    },
    number: {
      type: String,
      required: [true, 'Emergency contact number is required'],
      trim: true
    }
  },

  // Medical Information
  medicalHistory: {
    type: String,
    required: [true, 'Medical history information is required'],
    trim: true
  },

  // Payment Information
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  originalAmount: {
    type: Number,
    required: [true, 'Original amount is required'],
    min: [0, 'Original amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'INR'
  },
  
  // Coupon Information
  couponCode: {
    type: String,
    trim: true,
    uppercase: true
  },
  coupon: {
    type: Schema.Types.ObjectId,
    ref: 'Coupon'
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: [0, 'Discount amount cannot be negative']
  },
  
  paymentUtr: {
    type: String,
    trim: true
    // Made optional - will be validated in routes based on payment method
  },

  // Agreements
  agreements: {
    foodAndRefreshments: {
      type: Boolean,
      required: [true, 'Food and refreshments agreement is required'],
      default: false
    },
    informationAccuracy: {
      type: Boolean,
      required: [true, 'Information accuracy agreement is required'],
      default: false
    },
    noContrabands: {
      type: Boolean,
      required: [true, 'No contrabands agreement is required'],
      default: false
    },
    rulesAndRegulations: {
      type: Boolean,
      required: [true, 'Rules and regulations agreement is required'],
      default: false
    }
  },
  razorpayOrderId: {
    type: String,
    trim: true
  },
  razorpayPaymentId: {
    type: String,
    trim: true
  },
  razorpaySignature: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: {
      values: ['created', 'paid', 'failed', 'refunded', 'cancelled'],
      message: 'Status must be one of: created, paid, failed, refunded, cancelled'
    },
    default: 'created'
  },
  paymentMethod: {
    type: String,
    default: 'razorpay'
  },
  bookingNumber: {
    type: String,
    unique: true,
    trim: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  refundAmount: {
    type: Number,
    min: [0, 'Refund amount cannot be negative'],
    default: 0
  },
  refundReason: {
    type: String,
    trim: true
  },
  refundedAt: {
    type: Date
  },
  paidAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  cancellationReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance (bookingNumber index is created automatically by unique: true)
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ ride: 1, status: 1 });
bookingSchema.index({ razorpayOrderId: 1 });
bookingSchema.index({ razorpayPaymentId: 1 });
bookingSchema.index({ createdAt: -1 });
// Compound index for user + ride + status queries (NOT unique - users can book multiple times)
bookingSchema.index({ user: 1, ride: 1, status: 1 });

// Generate booking number before saving
bookingSchema.pre('save', async function(next) {
  if (!this.bookingNumber) {
    // Generate a unique booking number
    const timestamp = Date.now().toString();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const prefix = this.bookingType === 'group' ? 'GRP' : 'BK';
    this.bookingNumber = `${prefix}${timestamp}${randomNum}`;
  }
  
  // Set originalAmount if not set
  if (!this.originalAmount) {
    this.originalAmount = this.amount + (this.discountAmount || 0);
  }
  
  // Set timestamps based on status changes
  if (this.isModified('status')) {
    switch (this.status) {
      case 'paid':
        if (!this.paidAt) this.paidAt = new Date();
        break;
      case 'cancelled':
        if (!this.cancelledAt) this.cancelledAt = new Date();
        break;
      case 'refunded':
        if (!this.refundedAt) this.refundedAt = new Date();
        break;
    }
  }
  
  next();
});

export default model('Booking', bookingSchema);