import express from 'express';
import Booking from '../models/Booking.js';
import UpcomingRide from '../models/UpcomingRide.js';
import Coupon from '../models/Coupon.js';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { createOrder, verifyPayment } from '../services/razorpayService.js';
import { getPagination, getPaginationResult, getSortOptions } from '../utils/pagination.js';
import emailService from '../services/emailService.js';
import whatsappService from '../services/whatsappService.js';
import { generateRideTicket } from '../services/ticketService.js';
import logger from '../config/logger.js';
import mongoose from 'mongoose';

const router = express.Router();

// @route   POST /api/bookings/validate-coupon
// @desc    Validate a coupon code
// @access  Private
router.post('/validate-coupon', authenticate, validate(schemas.validateCoupon), asyncHandler(async (req, res) => {
  const { couponCode, rideId, bookingType, groupSize } = req.body;

  if (!couponCode) {
    throw new ApiError(400, 'Coupon code is required');
  }

  if (!rideId) {
    throw new ApiError(400, 'Ride ID is required');
  }

  if (!bookingType) {
    throw new ApiError(400, 'Booking type is required');
  }

  // Find the coupon
  const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

  if (!coupon) {
    throw new ApiError(404, 'Invalid coupon code');
  }

  // Find the ride to get the price
  const ride = await UpcomingRide.findById(rideId);
  if (!ride) {
    throw new ApiError(404, 'Ride not found');
  }

  // Calculate amount based on booking type
  const memberCount = bookingType === 'group' ? (groupSize || 1) : 1;
  const totalAmount = ride.price * memberCount;

  // Validate coupon with group size
  const validation = coupon.validateCoupon(req.user._id, bookingType, totalAmount, memberCount);

  if (!validation.isValid) {
    throw new ApiError(400, validation.errors.join(', '));
  }

  // Calculate discount
  const discountAmount = coupon.calculateDiscount(totalAmount);
  const finalAmount = totalAmount - discountAmount;

  res.json(new ApiResponse(200, {
    coupon: {
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minGroupSize: coupon.minGroupSize,
      maxGroupSize: coupon.maxGroupSize
    },
    originalAmount: totalAmount,
    discountAmount,
    finalAmount,
    savings: discountAmount
  }, 'Coupon applied successfully'));
}));

// @route   POST /api/bookings/create-order
// @desc    Create a complete booking order with Razorpay integration
// @access  Private
router.post('/create-order', authenticate, validate(schemas.createBookingOrder), asyncHandler(async (req, res) => {
  const { 
    rideId, 
    bookingType,
    groupInfo,
    personalInfo, 
    motorcycleInfo, 
    emergencyContact, 
    medicalHistory, 
    agreements,
    couponCode
  } = req.body;

  // Validation
  if (!rideId) {
    throw new ApiError(400, 'Ride ID is required');
  }

  if (!bookingType || !['individual', 'group'].includes(bookingType)) {
    throw new ApiError(400, 'Valid booking type (individual/group) is required');
  }

  // Validate group booking
  if (bookingType === 'group') {
    if (!groupInfo || !groupInfo.groupName || !groupInfo.members || groupInfo.members.length < 2) {
      throw new ApiError(400, 'Group bookings require group name and at least 2 members');
    }
  }

  if (!personalInfo || !motorcycleInfo || !emergencyContact || !medicalHistory || !agreements) {
    throw new ApiError(400, 'All booking information is required');
  }

  // Validate agreements
  const requiredAgreements = ['foodAndRefreshments', 'informationAccuracy', 'noContrabands', 'rulesAndRegulations'];
  for (const agreement of requiredAgreements) {
    if (!agreements[agreement]) {
      throw new ApiError(400, `${agreement} agreement is required`);
    }
  }

  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the ride
    const ride = await UpcomingRide.findOne({ 
      _id: rideId, 
      isActive: true,
      startTime: { $gte: new Date() }
    }).session(session);

    if (!ride) {
      throw new ApiError(404, 'Ride not found or booking is closed');
    }

    // Calculate required capacity
    const requiredCapacity = bookingType === 'group' ? groupInfo.members.length : 1;

    // Check if ride has enough capacity
    if (ride.registeredCount + requiredCapacity > ride.maxCapacity) {
      throw new ApiError(400, `Not enough spots available. Only ${ride.maxCapacity - ride.registeredCount} spots left.`);
    }

    // Check if user already booked this ride
    const existingBooking = await Booking.findOne({
      user: req.user._id,
      ride: rideId,
      status: { $in: ['created', 'paid'] }
    }).session(session);

    if (existingBooking) {
      // If there's an existing 'paid' booking, don't allow duplicate
      if (existingBooking.status === 'paid') {
        throw new ApiError(400, 'You have already booked this ride');
      }
      
      // If there's a pending 'created' booking (payment not completed), cancel it
      if (existingBooking.status === 'created') {
        existingBooking.status = 'cancelled';
        existingBooking.cancelledAt = new Date();
        existingBooking.cancellationReason = 'New booking attempt - previous payment not completed';
        await existingBooking.save({ session });
      }
    }

    // Calculate amount
    let originalAmount = ride.price * requiredCapacity;
    let finalAmount = originalAmount;
    let discountAmount = 0;
    let appliedCoupon = null;

    // Apply coupon if provided
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() }).session(session);
      
      if (!coupon) {
        throw new ApiError(404, 'Invalid coupon code');
      }

      // Validate coupon with group size
      const validation = coupon.validateCoupon(req.user._id, bookingType, originalAmount, requiredCapacity);
      
      if (!validation.isValid) {
        throw new ApiError(400, validation.errors.join(', '));
      }

      // Calculate discount
      discountAmount = coupon.calculateDiscount(originalAmount);
      finalAmount = originalAmount - discountAmount;
      appliedCoupon = coupon;
    }

    // Create booking with complete information (status: created for payment pending)
    const bookingData = {
      user: req.user._id,
      ride: rideId,
      bookingType,
      personalInfo,
      motorcycleInfo,
      emergencyContact,
      medicalHistory,
      agreements,
      originalAmount,
      amount: finalAmount,
      discountAmount,
      currency: 'INR',
      status: 'created' // Will be updated to 'paid' after payment verification
    };

    // Add group info if group booking
    if (bookingType === 'group') {
      bookingData.groupInfo = {
        groupName: groupInfo.groupName,
        groupSize: groupInfo.members.length,
        members: groupInfo.members
      };
    }

    // Add coupon info if applied
    if (appliedCoupon) {
      bookingData.couponCode = appliedCoupon.code;
      bookingData.coupon = appliedCoupon._id;
    }

    const booking = new Booking(bookingData);
    await booking.save({ session });

    // Create Razorpay order
    const razorpayOrder = await createOrder({
      amount: finalAmount || 0,
      currency: 'INR',
      receipt: booking._id.toString(),
      notes: {
        rideId: ride._id.toString(),
        userId: req.user._id.toString(),
        rideTitle: ride.title,
        bookingType: bookingType,
        groupSize: requiredCapacity
      }
    });

    // Update booking with Razorpay order ID
    booking.razorpayOrderId = razorpayOrder.id;
    await booking.save({ session });

    await session.commitTransaction();

    res.status(201).json(new ApiResponse(201, {
      booking: {
        id: booking._id,
        amount: booking.amount,
        originalAmount: booking.originalAmount,
        discountAmount: booking.discountAmount,
        currency: booking.currency,
        status: booking.status,
        bookingNumber: booking.bookingNumber,
        bookingType: booking.bookingType,
        groupSize: requiredCapacity
      },
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_1234567890'
      },
      ride: {
        id: ride._id,
        title: ride.title,
        venue: ride.venue,
        startTime: ride.startTime,
        price: ride.price
      },
      coupon: appliedCoupon ? {
        code: appliedCoupon.code,
        discountAmount
      } : null
    }, 'Booking order created successfully'));

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}));

// @route   POST /api/bookings/create-complete
// @desc    Create a complete booking with all details (Old UTR method)
// @access  Private
router.post('/create-complete', authenticate, validate(schemas.createCompleteBooking), asyncHandler(async (req, res) => {
  const { 
    rideId, 
    personalInfo, 
    motorcycleInfo, 
    emergencyContact, 
    medicalHistory, 
    paymentUtr, 
    agreements 
  } = req.body;

  // Validation
  if (!rideId) {
    throw new ApiError(400, 'Ride ID is required');
  }

  if (!personalInfo || !motorcycleInfo || !emergencyContact || !medicalHistory || !agreements) {
    throw new ApiError(400, 'All booking information is required');
  }

  // For create-complete (UTR method), paymentUtr is required
  if (!paymentUtr) {
    throw new ApiError(400, 'Payment UTR/Transaction detail is required for manual booking');
  }

  // Validate agreements
  const requiredAgreements = ['foodAndRefreshments', 'informationAccuracy', 'noContrabands', 'rulesAndRegulations'];
  for (const agreement of requiredAgreements) {
    if (!agreements[agreement]) {
      throw new ApiError(400, `${agreement} agreement is required`);
    }
  }

  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the ride
    const ride = await UpcomingRide.findOne({ 
      _id: rideId, 
      isActive: true,
      startTime: { $gte: new Date() }
    }).session(session);

    if (!ride) {
      throw new ApiError(404, 'Ride not found or booking is closed');
    }

    // Check if ride is full
    if (ride.registeredCount >= ride.maxCapacity) {
      throw new ApiError(400, 'Ride is fully booked');
    }

    // Check if user already booked this ride
    const existingBooking = await Booking.findOne({
      user: req.user._id,
      ride: rideId,
      status: { $in: ['created', 'paid'] }
    }).session(session);

    if (existingBooking) {
      throw new ApiError(400, 'You have already booked this ride');
    }

    // Create booking with complete information
    const booking = new Booking({
      user: req.user._id,
      ride: rideId,
      personalInfo,
      motorcycleInfo,
      emergencyContact,
      medicalHistory,
      paymentUtr,
      agreements,
      amount: ride.price || 0,
      currency: 'INR',
      status: 'paid' // Since payment UTR is provided, mark as paid
    });

    await booking.save({ session });

    // Update ride - increment registered count and add user to riders
    ride.registeredCount += 1;
    if (!ride.riders.includes(req.user._id)) {
      ride.riders.push(req.user._id);
    }
    await ride.save({ session });

    await session.commitTransaction();

    res.status(201).json(new ApiResponse(201, {
      booking: {
        id: booking._id,
        bookingNumber: booking.bookingNumber,
        status: booking.status,
        amount: booking.amount
      },
      ride: {
        id: ride._id,
        title: ride.title,
        venue: ride.venue,
        startTime: ride.startTime
      }
    }, 'Booking created successfully'));

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}));

// @route   POST /api/bookings/create
// @desc    Create a booking and Razorpay order (old method)
// @access  Private
router.post('/create', authenticate, asyncHandler(async (req, res) => {
  const { rideId } = req.body;

  if (!rideId) {
    throw new ApiError(400, 'Ride ID is required');
  }

  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the ride
    const ride = await UpcomingRide.findOne({ 
      _id: rideId, 
      isActive: true,
      startTime: { $gte: new Date() }
    }).session(session);

    if (!ride) {
      throw new ApiError(404, 'Ride not found or booking is closed');
    }

    // Check if ride is full
    if (ride.registeredCount >= ride.maxCapacity) {
      throw new ApiError(400, 'Ride is fully booked');
    }

    // Check if user already booked this ride
    const existingBooking = await Booking.findOne({
      user: req.user._id,
      ride: rideId,
      status: { $in: ['created', 'paid'] }
    }).session(session);

    if (existingBooking) {
      throw new ApiError(400, 'You have already booked this ride');
    }

    // Create booking
    const booking = new Booking({
      user: req.user._id,
      ride: rideId,
      amount: ride.price,
      currency: ride.currency || 'INR'
    });

    await booking.save({ session });

    // Create Razorpay order
    const razorpayOrder = await createOrder({
      amount: ride.price,
      currency: ride.currency || 'INR',
      receipt: booking._id.toString(),
      notes: {
        rideId: ride._id.toString(),
        userId: req.user._id.toString(),
        rideTitle: ride.title
      }
    });

    // Update booking with Razorpay order ID
    booking.razorpayOrderId = razorpayOrder.id;
    await booking.save({ session });

    await session.commitTransaction();

    res.status(201).json(new ApiResponse(201, {
      booking: {
        id: booking._id,
        amount: booking.amount,
        currency: booking.currency,
        status: booking.status,
        bookingNumber: booking.bookingNumber
      },
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID
      },
      ride: {
        id: ride._id,
        title: ride.title,
        venue: ride.venue,
        startTime: ride.startTime
      }
    }, 'Booking created successfully'));

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}));

// @route   POST /api/bookings/verify-payment
// @desc    Verify Razorpay payment
// @access  Private
router.post('/verify-payment', authenticate, validate(schemas.verifyPayment), asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, 'Missing payment verification parameters');
  }

  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the booking
    const booking = await Booking.findOne({ 
      razorpayOrderId: razorpay_order_id,
      user: req.user._id 
    })
    .populate('ride', 'title venue startTime endTime price')
    .populate('user', 'fullName email')
    .session(session);

    if (!booking) {
      throw new ApiError(404, 'Booking not found');
    }

    if (booking.status === 'paid') {
      throw new ApiError(400, 'Payment already verified');
    }

    // Verify payment with Razorpay
    const isPaymentValid = verifyPayment({
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      signature: razorpay_signature
    });

    if (!isPaymentValid) {
      // Update booking status to failed
      booking.status = 'failed';
      await booking.save({ session });
      throw new ApiError(400, 'Payment verification failed');
    }

    // Update booking
    booking.status = 'paid';
    booking.razorpayPaymentId = razorpay_payment_id;
    booking.razorpaySignature = razorpay_signature;
    booking.paidAt = new Date();
    await booking.save({ session });

    // If coupon was used, increment its usage count
    if (booking.coupon) {
      const coupon = await Coupon.findById(booking.coupon).session(session);
      if (coupon) {
        await coupon.incrementUsage(req.user._id, booking._id);
      }
    }

    // Update ride - increment registered count and add user to riders
    const ride = await UpcomingRide.findById(booking.ride).session(session);
    if (ride) {
      // For group bookings, increment by group size
      const increment = booking.bookingType === 'group' ? booking.groupInfo.groupSize : 1;
      ride.registeredCount += increment;
      if (!ride.riders.includes(req.user._id)) {
        ride.riders.push(req.user._id);
      }
      await ride.save({ session });
    }

    await session.commitTransaction();

    // Send booking confirmation email (async, don't wait)
    emailService.sendRideBookingConfirmation(booking.user.email, {
      fullName: booking.user.fullName,
      bookingNumber: booking.bookingNumber,
      rideTitle: booking.ride.title,
      venue: booking.ride.venue,
      startTime: booking.ride.startTime,
      endTime: booking.ride.endTime,
      amount: booking.amount,
      originalAmount: booking.originalAmount,
      discountAmount: booking.discountAmount,
      bookingType: booking.bookingType,
      groupSize: booking.bookingType === 'group' ? booking.groupInfo.groupSize : 1,
      personalInfo: booking.personalInfo,
      motorcycleInfo: booking.motorcycleInfo,
      couponCode: booking.couponCode,
      paymentId: razorpay_payment_id,
      paidAt: booking.paidAt
    }).catch(err => console.error('Failed to send booking confirmation email:', err));

    // Generate and send ticket via WhatsApp (async, don't wait)
    (async () => {
      try {
        // Generate ticket image
        const ticketBuffer = await generateRideTicket({
          bookingNumber: booking.bookingNumber,
          userName: booking.personalInfo.fullName,
          rideName: booking.ride.title,
          venue: booking.ride.venue,
          startTime: booking.ride.startTime,
          amount: booking.amount,
          bookingType: booking.bookingType,
          groupSize: booking.bookingType === 'group' ? booking.groupInfo.groupSize : 1,
          motorcycleInfo: booking.motorcycleInfo,
          qrData: JSON.stringify({
            bookingNumber: booking.bookingNumber,
            bookingId: booking._id.toString(),
            userName: booking.personalInfo.fullName,
            rideName: booking.ride.title,
            startTime: booking.ride.startTime,
            bookingType: booking.bookingType,
            verificationUrl: `${process.env.FRONTEND_URL}/verify-ticket/${booking.bookingNumber}`
          })
        });

        // Send ticket via WhatsApp
        await whatsappService.sendTicket(
          booking.personalInfo.contactNumber,
          ticketBuffer,
          {
            userName: booking.personalInfo.fullName,
            bookingNumber: booking.bookingNumber,
            rideName: booking.ride.title,
            amount: booking.amount
          }
        );

        logger.info(`Ticket sent via WhatsApp for booking ${booking.bookingNumber}`);
      } catch (error) {
        logger.error('Failed to send ticket via WhatsApp:', error.message);
        // Don't throw error - ticket generation/sending is not critical for payment verification
      }
    })();

    res.json(new ApiResponse(200, {
      booking: {
        id: booking._id,
        bookingNumber: booking.bookingNumber,
        status: booking.status,
        amount: booking.amount,
        paidAt: booking.paidAt,
        personalInfo: booking.personalInfo,
        motorcycleInfo: booking.motorcycleInfo,
        emergencyContact: booking.emergencyContact
      },
      ride: {
        id: booking.ride._id,
        title: booking.ride.title,
        venue: booking.ride.venue,
        startTime: booking.ride.startTime
      }
    }, 'Payment verified successfully'));

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}));

// @route   GET /api/bookings/my-bookings
// @desc    Get current user's bookings
// @access  Private
router.get('/my-bookings', authenticate, validate(schemas.pagination, 'query'), asyncHandler(async (req, res) => {
  const { page, limit, sortBy, sortOrder, status } = req.query;
  const { skip, limit: limitNumber, page: pageNumber } = getPagination(page, limit);
  
  // Build filter
  const filter = { user: req.user._id };
  if (status) filter.status = status;

  // Get sort options
  const sort = getSortOptions(sortBy || 'createdAt', sortOrder);

  // Execute queries
  const [bookings, totalCount] = await Promise.all([
    Booking.find(filter)
      .populate('ride', 'title venue startTime imgUrl difficulty')
      .sort(sort)
      .skip(skip)
      .limit(limitNumber),
    Booking.countDocuments(filter)
  ]);

  const result = getPaginationResult(bookings, totalCount, pageNumber, limitNumber);

  res.json(new ApiResponse(200, result, 'Bookings retrieved successfully'));
}));

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ 
    _id: req.params.id, 
    user: req.user._id 
  })
    .populate('ride', 'title venue startTime endTime imgUrl difficulty description')
    .populate('user', 'fullName email');

  if (!booking) {
    return res.status(404).json({
      status: 'error',
      message: 'Booking not found'
    });
  }

  res.json(new ApiResponse(200, { booking }, 'Booking retrieved successfully'));
}));

// @route   POST /api/bookings/:id/cancel
// @desc    Cancel a booking
// @access  Private
router.post('/:id/cancel', authenticate, asyncHandler(async (req, res) => {
  const { reason } = req.body;
  
  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await Booking.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    }).session(session);

    if (!booking) {
      throw new ApiError(404, 'Booking not found');
    }

    if (booking.status === 'cancelled') {
      throw new ApiError(400, 'Booking is already cancelled');
    }

    if (booking.status === 'refunded') {
      throw new ApiError(400, 'Booking is already refunded');
    }

    // Get the ride to check cancellation policy
    const ride = await UpcomingRide.findById(booking.ride).session(session);
    if (!ride) {
      throw new ApiError(404, 'Associated ride not found');
    }

    // Check if cancellation is allowed (e.g., at least 24 hours before ride)
    const hoursUntilRide = (new Date(ride.startTime) - new Date()) / (1000 * 60 * 60);
    if (hoursUntilRide < 24) {
      throw new ApiError(400, 'Cancellation not allowed within 24 hours of the ride');
    }

    // Update booking
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancellationReason = reason;
    await booking.save({ session });

    // Update ride - decrement registered count and remove user from riders
    if (booking.status === 'paid') {
      ride.registeredCount = Math.max(0, ride.registeredCount - 1);
      ride.riders = ride.riders.filter(riderId => !riderId.equals(req.user._id));
      await ride.save({ session });
    }

    await session.commitTransaction();

    res.json(new ApiResponse(200, { booking }, 'Booking cancelled successfully'));

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}));

// @route   POST /api/bookings/:id/resend-ticket
// @desc    Resend ticket to user via WhatsApp
// @access  Private
router.post('/:id/resend-ticket', authenticate, asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ 
    _id: req.params.id, 
    user: req.user._id 
  })
    .populate('ride', 'title venue startTime endTime')
    .populate('user', 'fullName email');

  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  if (booking.status !== 'paid') {
    throw new ApiError(400, 'Ticket can only be resent for confirmed bookings');
  }

  try {
    // Generate ticket image
    const ticketBuffer = await generateRideTicket({
      bookingNumber: booking.bookingNumber,
      userName: booking.personalInfo.fullName,
      rideName: booking.ride.title,
      venue: booking.ride.venue,
      startTime: booking.ride.startTime,
      amount: booking.amount,
      bookingType: booking.bookingType,
      groupSize: booking.bookingType === 'group' ? booking.groupInfo.groupSize : 1,
      motorcycleInfo: booking.motorcycleInfo,
      qrData: JSON.stringify({
        bookingNumber: booking.bookingNumber,
        bookingId: booking._id.toString(),
        userName: booking.personalInfo.fullName,
        rideName: booking.ride.title,
        startTime: booking.ride.startTime,
        bookingType: booking.bookingType,
        verificationUrl: `${process.env.FRONTEND_URL}/verify-ticket/${booking.bookingNumber}`
      })
    });

    // Send ticket via WhatsApp
    await whatsappService.sendTicket(
      booking.personalInfo.contactNumber,
      ticketBuffer,
      {
        userName: booking.personalInfo.fullName,
        bookingNumber: booking.bookingNumber,
        rideName: booking.ride.title,
        amount: booking.amount
      }
    );

    logger.info(`Ticket resent via WhatsApp for booking ${booking.bookingNumber}`);

    res.json(new ApiResponse(200, {
      message: 'Ticket sent successfully to your WhatsApp',
      phoneNumber: booking.personalInfo.contactNumber
    }, 'Ticket resent successfully'));

  } catch (error) {
    logger.error('Failed to resend ticket:', error.message);
    throw new ApiError(500, `Failed to send ticket: ${error.message}`);
  }
}));

export default router;