import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const audienceRegistrationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional - can allow guest registrations
  },
  event: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event is required']
  },
  
  // Personal Information
  personalInfo: {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    }
  },

  // Payment Information
  paymentInfo: {
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
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
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    paymentMethod: {
      type: String,
      trim: true
    },
    paidAt: {
      type: Date
    }
  },

  // Coupon Information
  coupon: {
    code: {
      type: String,
      trim: true,
      uppercase: true
    },
    discount: {
      type: Number,
      default: 0
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'fixed'
    }
  },

  // Registration Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },

  // Ticket Information
  ticketNumber: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  ticketUrl: {
    type: String,
    trim: true
  },
  qrCode: {
    type: String,
    trim: true
  },

  // Communication Status
  emailSent: {
    type: Boolean,
    default: false
  },
  whatsappSent: {
    type: Boolean,
    default: false
  },

  // Cancellation Information
  cancellationReason: {
    type: String,
    trim: true
  },
  cancelledAt: {
    type: Date
  },

  // Notes (Admin use)
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
audienceRegistrationSchema.index({ event: 1, createdAt: -1 });
audienceRegistrationSchema.index({ 'personalInfo.email': 1 });
audienceRegistrationSchema.index({ 'personalInfo.phoneNumber': 1 });
audienceRegistrationSchema.index({ ticketNumber: 1 });
audienceRegistrationSchema.index({ status: 1 });
audienceRegistrationSchema.index({ 'paymentInfo.paymentStatus': 1 });

// Generate ticket number before save
audienceRegistrationSchema.pre('save', async function(next) {
  if (!this.ticketNumber && this.status === 'confirmed') {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    this.ticketNumber = `AUD-${timestamp}-${random}`;
  }
  next();
});

// Virtual for total amount after discount
audienceRegistrationSchema.virtual('finalAmount').get(function() {
  if (!this.coupon || !this.coupon.discount) {
    return this.paymentInfo.amount;
  }
  
  if (this.coupon.discountType === 'percentage') {
    return this.paymentInfo.amount - (this.paymentInfo.amount * this.coupon.discount / 100);
  }
  
  return this.paymentInfo.amount - this.coupon.discount;
});

const AudienceRegistration = model('AudienceRegistration', audienceRegistrationSchema);

export default AudienceRegistration;
