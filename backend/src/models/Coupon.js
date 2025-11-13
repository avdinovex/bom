import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    minlength: [3, 'Coupon code must be at least 3 characters'],
    maxlength: [20, 'Coupon code must not exceed 20 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description must not exceed 200 characters']
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: [true, 'Discount type is required'],
    default: 'percentage'
  },
  discountValue: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: [0, 'Discount value must be positive'],
    validate: {
      validator: function(value) {
        if (this.discountType === 'percentage' && value > 100) {
          return false;
        }
        return true;
      },
      message: 'Percentage discount cannot exceed 100%'
    }
  },
  minOrderAmount: {
    type: Number,
    default: 0,
    min: [0, 'Minimum order amount must be positive']
  },
  maxDiscount: {
    type: Number,
    default: null,
    min: [0, 'Maximum discount must be positive']
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Expiry date must be in the future'
    }
  },
  usageLimit: {
    type: Number,
    required: [true, 'Usage limit is required'],
    min: [1, 'Usage limit must be at least 1'],
    default: 1
  },
  usedCount: {
    type: Number,
    default: 0,
    min: [0, 'Used count cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicableFor: {
    type: String,
    enum: ['all', 'individual', 'group'],
    default: 'all'
  },
  minGroupSize: {
    type: Number,
    default: null,
    min: [2, 'Minimum group size must be at least 2'],
    validate: {
      validator: function(value) {
        // Only validate if applicableFor is 'group' and value is provided
        if (this.applicableFor === 'group' && value !== null && value !== undefined) {
          return value >= 2;
        }
        return true;
      },
      message: 'Minimum group size must be at least 2 for group coupons'
    }
  },
  maxGroupSize: {
    type: Number,
    default: null,
    min: [2, 'Maximum group size must be at least 2'],
    validate: {
      validator: function(value) {
        // Only validate if minGroupSize is set
        if (this.minGroupSize && value !== null && value !== undefined) {
          return value >= this.minGroupSize;
        }
        return true;
      },
      message: 'Maximum group size must be greater than or equal to minimum group size'
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  usedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    usedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for faster queries
couponSchema.index({ code: 1 });
couponSchema.index({ expiryDate: 1, isActive: 1 });

// Virtual for checking if coupon is expired
couponSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiryDate;
});

// Virtual for checking if usage limit reached
couponSchema.virtual('isUsageLimitReached').get(function() {
  return this.usedCount >= this.usageLimit;
});

// Virtual for availability
couponSchema.virtual('isAvailable').get(function() {
  return this.isActive && !this.isExpired && !this.isUsageLimitReached;
});

// Method to validate coupon
couponSchema.methods.validateCoupon = function(userId, bookingType, amount, groupSize = 1) {
  const errors = [];

  if (!this.isActive) {
    errors.push('Coupon is not active');
  }

  if (this.isExpired) {
    errors.push('Coupon has expired');
  }

  if (this.isUsageLimitReached) {
    errors.push('Coupon usage limit has been reached');
  }

  if (this.applicableFor !== 'all' && this.applicableFor !== bookingType) {
    errors.push(`Coupon is only applicable for ${this.applicableFor} bookings`);
  }

  // Validate group size for group coupons
  if (this.applicableFor === 'group' || (this.applicableFor === 'all' && bookingType === 'group')) {
    if (this.minGroupSize && groupSize < this.minGroupSize) {
      errors.push(`Minimum group size of ${this.minGroupSize} members required`);
    }
    if (this.maxGroupSize && groupSize > this.maxGroupSize) {
      errors.push(`Maximum group size of ${this.maxGroupSize} members allowed`);
    }
  }

  if (amount < this.minOrderAmount) {
    errors.push(`Minimum order amount of ₹${this.minOrderAmount} required`);
  }

  // Removed: Check if user already used this coupon
  // Users can now use the same coupon multiple times as long as usage limit allows

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Method to calculate discount
couponSchema.methods.calculateDiscount = function(amount, groupSize = 1, bookingType = 'individual') {
  let discount = 0;

  if (this.discountType === 'percentage') {
    discount = (amount * this.discountValue) / 100;
  } else {
    // For fixed discount in group bookings, multiply by group size
    if (bookingType === 'group' && groupSize > 1) {
      discount = this.discountValue * groupSize;
    } else {
      discount = this.discountValue;
    }
  }

  // Apply max discount limit if set
  if (this.maxDiscount && discount > this.maxDiscount) {
    discount = this.maxDiscount;
  }

  // Discount cannot exceed the amount
  if (discount > amount) {
    discount = amount;
  }

  return Math.round(discount * 100) / 100; // Round to 2 decimal places
};

// Method to increment usage
couponSchema.methods.incrementUsage = function(userId, bookingId) {
  this.usedCount += 1;
  this.usedBy.push({
    user: userId,
    booking: bookingId,
    usedAt: new Date()
  });
  return this.save();
};

// Pre-save middleware to ensure code is uppercase
couponSchema.pre('save', function(next) {
  if (this.isModified('code')) {
    this.code = this.code.toUpperCase();
  }
  next();
});

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;
