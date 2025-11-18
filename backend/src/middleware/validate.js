import Joi from 'joi';
import { ApiError } from '../utils/ApiError.js';

export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[source], { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      throw new ApiError(400, 'Validation error', errors);
    }
    
    next();
  };
};

// Common validation schemas
export const schemas = {
  // Auth schemas
  register: Joi.object({
    fullName: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(50).required(),
    primaryBike: Joi.string().trim().min(2).max(50).required(),
    experienceLevel: Joi.string().valid('Beginner', 'Intermediate', 'Advanced').required()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  // OTP verification schemas
  verifyRegistrationOTP: Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).pattern(/^\d+$/).required()
  }),

  resendOTP: Joi.object({
    email: Joi.string().email().required(),
    type: Joi.string().valid('registration', 'forgot-password').required()
  }),

  // Forgot password schemas
  forgotPassword: Joi.object({
    email: Joi.string().email().required()
  }),

  verifyForgotPasswordOTP: Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).pattern(/^\d+$/).required()
  }),

  resetPassword: Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).pattern(/^\d+$/).required(),
    newPassword: Joi.string().min(6).max(50).required()
  }),

  // User schemas
  updateProfile: Joi.object({
    fullName: Joi.string().trim().min(2).max(100),
    primaryBike: Joi.string().trim().min(2).max(50),
    experienceLevel: Joi.string().valid('Beginner', 'Intermediate', 'Advanced'),
    phone: Joi.string().pattern(/^[0-9]{10}$/).allow('', null)
  }),

  // Event schemas
  createEvent: Joi.object({
    title: Joi.string().trim().min(5).max(200).required(),
    details: Joi.string().trim().max(2000).allow(''),
    location: Joi.string().trim().max(100),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')),
    category: Joi.string().valid('ride', 'workshop', 'meetup', 'competition', 'other')
  }),

  // Ride schemas
  createRide: Joi.object({
    title: Joi.string().trim().min(5).max(200).required(),
    slogan: Joi.string().trim().max(300),
    venue: Joi.string().trim().min(3).max(100).required(),
    startTime: Joi.date().iso().min('now').required(),
    endTime: Joi.date().iso().min(Joi.ref('startTime')),
    maxCapacity: Joi.number().integer().min(1).max(500).required(),
    price: Joi.number().min(0).required(),
    description: Joi.string().trim().max(2000),
    difficulty: Joi.string().valid('Easy', 'Medium', 'Hard', 'Expert'),
    distance: Joi.number().min(0),
    requirements: Joi.array().items(Joi.string().trim())
  }),

  // Blog schemas
  createBlog: Joi.object({
    title: Joi.string().trim().min(5).max(200).required(),
    content: Joi.string().trim().min(100).required(),
    excerpt: Joi.string().trim().max(300),
    category: Joi.string().valid('rides', 'tips', 'gear', 'maintenance', 'safety', 'news', 'other'),
    tags: Joi.array().items(Joi.string().trim()),
    isPublished: Joi.boolean()
  }),

  // Team member schemas
  createTeamMember: Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    position: Joi.string().trim().min(2).max(100).required(),
    bio: Joi.string().trim().max(1000),
    email: Joi.string().email(),
    phone: Joi.string().pattern(/^[0-9]{10}$/),
    skills: Joi.array().items(Joi.string().trim()),
    department: Joi.string().valid('leadership', 'technical', 'marketing', 'operations', 'other')
  }),

  // Query parameters
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  }),

  // Events query parameters
  eventQuery: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    category: Joi.string().valid('mumbai-bikers-mania', 'ride', 'workshop', 'meetup', 'competition', 'other'),
    search: Joi.string().trim(),
    city: Joi.string().trim(),
    state: Joi.string().trim(),
    priceMin: Joi.number().min(0),
    priceMax: Joi.number().min(0),
    dateFrom: Joi.date().iso(),
    dateTo: Joi.date().iso(),
    tags: Joi.alternatives().try(
      Joi.string().trim(),
      Joi.array().items(Joi.string().trim())
    ),
    skillLevel: Joi.string().valid('beginner', 'intermediate', 'advanced', 'all'),
    isFree: Joi.string().valid('true', 'false')
  }),

  // Blog query parameters
  blogQuery: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    category: Joi.string().valid('rides', 'tips', 'gear', 'maintenance', 'safety', 'news', 'other'),
    search: Joi.string().trim(),
    featured: Joi.string().valid('true', 'false')
  }),

  // Completed rides query parameters
  completedRideQuery: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    difficulty: Joi.string().valid('Easy', 'Medium', 'Hard', 'Expert'),
    search: Joi.string().trim(),
    featured: Joi.string().valid('true', 'false')
  }),

  // Booking schemas
  createBookingOrder: Joi.object({
    rideId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    bookingType: Joi.string().valid('individual', 'group').default('individual'),
    personalInfo: Joi.object({
      email: Joi.string().email().required(),
      fullName: Joi.string().trim().min(2).max(100).required(),
      address: Joi.string().trim().min(3).max(500).required(),
      contactNumber: Joi.string().pattern(/^[+]?[0-9]{8,15}$/).required(),
      gender: Joi.string().valid('Male', 'Female').required(),
      dateOfBirth: Joi.date().required(),
      bloodGroup: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').required(),
      foodPreference: Joi.string().valid('Veg', 'Non-Veg').required()
    }).required(),
    motorcycleInfo: Joi.object({
      modelName: Joi.string().trim().min(2).max(100).required(),
      motorcycleNumber: Joi.string().trim().min(4).max(20).uppercase().required()
    }).required(),
    emergencyContact: Joi.object({
      personName: Joi.string().trim().min(2).max(100).required(),
      number: Joi.string().pattern(/^[+]?[0-9]{8,15}$/).required()
    }).required(),
    medicalHistory: Joi.string().trim().max(1000).required(),
    agreements: Joi.object({
      foodAndRefreshments: Joi.boolean().valid(true).required(),
      informationAccuracy: Joi.boolean().valid(true).required(),
      noContrabands: Joi.boolean().valid(true).required(),
      rulesAndRegulations: Joi.boolean().valid(true).required()
    }).required(),
    groupInfo: Joi.object({
      groupName: Joi.string().trim().min(2).max(100).required(),
      members: Joi.array().items(
        Joi.object({
          name: Joi.string().trim().min(2).max(100).required(),
          contactNumber: Joi.string().pattern(/^[+]?[0-9]{8,15}$/).required(),
          emergencyContact: Joi.string().pattern(/^[+]?[0-9]{8,15}$/).required(),
          address: Joi.string().trim().min(3).max(500).required(),
          foodPreference: Joi.string().valid('Veg', 'Non-Veg').required()
        })
      ).min(2).required()
    }).when('bookingType', {
      is: 'group',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    couponCode: Joi.string().trim().uppercase().optional(),
    paymentUtr: Joi.string().trim().optional() // Optional for Razorpay orders
  }),

  // Complete booking with UTR (legacy method)
  createCompleteBooking: Joi.object({
    rideId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    personalInfo: Joi.object({
      email: Joi.string().email().required(),
      fullName: Joi.string().trim().min(2).max(100).required(),
      address: Joi.string().trim().min(5).max(500).required(),
      contactNumber: Joi.string().pattern(/^[+]?[0-9]{8,15}$/).required(),
      gender: Joi.string().valid('Male', 'Female').required(),
      dateOfBirth: Joi.date().required(),
      bloodGroup: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').required(),
      foodPreference: Joi.string().valid('Veg', 'Non-Veg').required()
    }).required(),
    motorcycleInfo: Joi.object({
      modelName: Joi.string().trim().min(2).max(100).required(),
      motorcycleNumber: Joi.string().trim().min(4).max(20).required()
    }).required(),
    emergencyContact: Joi.object({
      personName: Joi.string().trim().min(2).max(100).required(),
      number: Joi.string().pattern(/^[+]?[0-9]{8,15}$/).required()
    }).required(),
    medicalHistory: Joi.string().trim().max(1000).required(),
    agreements: Joi.object({
      foodAndRefreshments: Joi.boolean().valid(true).required(),
      informationAccuracy: Joi.boolean().valid(true).required(),
      noContrabands: Joi.boolean().valid(true).required(),
      rulesAndRegulations: Joi.boolean().valid(true).required()
    }).required(),
    paymentUtr: Joi.string().trim().required() // Required for UTR method
  }),

  // Event booking schemas
  createEventBookingOrder: Joi.object({
    eventId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    bookingType: Joi.string().valid('individual', 'group').default('individual'),
    personalInfo: Joi.object({
      email: Joi.string().email().required(),
      fullName: Joi.string().trim().min(2).max(100).required(),
      address: Joi.string().trim().min(3).max(500).required(),
      contactNumber: Joi.string().pattern(/^[+]?[0-9]{8,15}$/).required(),
      gender: Joi.string().valid('Male', 'Female').required(),
      dateOfBirth: Joi.date().required(),
      bloodGroup: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').required(),
      foodPreference: Joi.string().valid('Veg', 'Non-Veg').required(),
      tshirtSize: Joi.string().valid('XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL').required()
    }).required(),
    motorcycleInfo: Joi.object({
      modelName: Joi.string().trim().min(2).max(100).required(),
      motorcycleNumber: Joi.string().trim().min(4).max(20).uppercase().required()
    }).required(),
    emergencyContact: Joi.object({
      personName: Joi.string().trim().min(2).max(100).required(),
      number: Joi.string().pattern(/^[+]?[0-9]{8,15}$/).required()
    }).required(),
    medicalHistory: Joi.string().trim().max(1000).required(),
    agreements: Joi.object({
      foodAndRefreshments: Joi.boolean().valid(true).required(),
      informationAccuracy: Joi.boolean().valid(true).required(),
      noContrabands: Joi.boolean().valid(true).required(),
      rulesAndRegulations: Joi.boolean().valid(true).required()
    }).required(),
    groupInfo: Joi.object({
      groupName: Joi.string().trim().min(2).max(100).required(),
      members: Joi.array().items(
        Joi.object({
          name: Joi.string().trim().min(2).max(100).required(),
          contactNumber: Joi.string().pattern(/^[+]?[0-9]{8,15}$/).required(),
          emergencyContact: Joi.string().pattern(/^[+]?[0-9]{8,15}$/).required(),
          address: Joi.string().trim().min(3).max(500).required(),
          foodPreference: Joi.string().valid('Veg', 'Non-Veg').required(),
          tshirtSize: Joi.string().valid('XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL').required()
        })
      ).min(2).required()
    }).when('bookingType', {
      is: 'group',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    couponCode: Joi.string().trim().uppercase().optional(),
    paymentUtr: Joi.string().trim().optional() // Optional for Razorpay orders
  }),

  // Coupon validation schema
  validateCoupon: Joi.object({
    couponCode: Joi.string().trim().uppercase().required(),
    rideId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    bookingType: Joi.string().valid('individual', 'group').default('individual'),
    groupSize: Joi.number().integer().min(1).optional()
  }),

  // Event coupon validation schema
  validateEventCoupon: Joi.object({
    couponCode: Joi.string().trim().uppercase().required(),
    eventId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    bookingType: Joi.string().valid('individual', 'group').default('individual'),
    groupSize: Joi.number().integer().min(1).optional()
  }),

  // Payment verification schema
  verifyPayment: Joi.object({
    razorpay_order_id: Joi.string().required(),
    razorpay_payment_id: Joi.string().required(),
    razorpay_signature: Joi.string().required()
  }),

  objectId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
};