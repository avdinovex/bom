import express from 'express';
import EventBooking from '../models/EventBooking.js';
import Event from '../models/Event.js';
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
import { generateEventTicket } from '../services/ticketService.js';
import logger from '../config/logger.js';
import mongoose from 'mongoose';

const router = express.Router();

// @route   POST /api/event-bookings/validate-coupon
// @desc    Validate a coupon code
// @access  Private
router.post('/validate-coupon', authenticate, validate(schemas.validateEventCoupon), asyncHandler(async (req, res) => {
  const { couponCode, eventId, bookingType, groupSize } = req.body;

  if (!couponCode) {
    throw new ApiError(400, 'Coupon code is required');
  }

  if (!eventId) {
    throw new ApiError(400, 'Event ID is required');
  }

  if (!bookingType) {
    throw new ApiError(400, 'Booking type is required');
  }

  // Find the coupon
  const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

  if (!coupon) {
    throw new ApiError(404, 'Invalid coupon code');
  }

  // Find the event to get the price
  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  // Calculate amount based on booking type - Use early bird pricing if available
  const memberCount = bookingType === 'group' ? (groupSize || 1) : 1;
  
  let basePrice = event.price; // Default to legacy price field
  
  // Check if event has pricing structure with early bird
  if (event.pricing && !event.pricing.isFree) {
    const now = new Date();
    const earlyBirdDeadline = event.pricing.earlyBirdDeadline;
    
    // Use early bird price if deadline hasn't passed
    if (earlyBirdDeadline && now <= new Date(earlyBirdDeadline) && event.pricing.earlyBirdPrice) {
      basePrice = event.pricing.earlyBirdPrice;
    } else if (event.pricing.basePrice) {
      basePrice = event.pricing.basePrice;
    }
  }
  
  const totalAmount = basePrice * memberCount;

  // Validate coupon with group size
  const validation = coupon.validateCoupon(req.user._id, bookingType, totalAmount, memberCount);

  if (!validation.isValid) {
    throw new ApiError(400, validation.errors.join(', '));
  }

  // Calculate discount - pass groupSize and bookingType for proper fixed discount calculation
  const discountAmount = coupon.calculateDiscount(totalAmount, memberCount, bookingType);
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

// @route   POST /api/event-bookings/create-order
// @desc    Create a complete event booking order with Razorpay integration
// @access  Private
router.post('/create-order', authenticate, validate(schemas.createEventBookingOrder), asyncHandler(async (req, res) => {
  const { 
    eventId, 
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
  if (!eventId) {
    throw new ApiError(400, 'Event ID is required');
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
    // Find the event
    const event = await Event.findOne({ 
      _id: eventId, 
      isActive: true,
      isBookingEnabled: true 
    }).session(session);

    if (!event) {
      throw new ApiError(404, 'Event not found or booking is not enabled');
    }

    // Check if event is upcoming (can only book for upcoming events)
    if (event.eventType !== 'upcoming') {
      throw new ApiError(400, 'Cannot book for past events');
    }

    // Check if registration deadline has passed
    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      throw new ApiError(400, 'Registration deadline has passed');
    }

    // Calculate required capacity
    const requiredCapacity = bookingType === 'group' ? groupInfo.members.length : 1;

    // Check if event has enough capacity
    if (event.currentParticipants + requiredCapacity > event.maxParticipants) {
      throw new ApiError(400, `Not enough spots available. Only ${event.maxParticipants - event.currentParticipants} spots left.`);
    }

    // Check if user has a pending booking for this event and cancel it
    const existingBooking = await EventBooking.findOne({
      user: req.user._id,
      event: eventId,
      status: 'created' // Only check for pending bookings
    }).session(session);

    if (existingBooking) {
      // If there's a pending 'created' booking (payment not completed), cancel it
      existingBooking.status = 'cancelled';
      existingBooking.cancelledAt = new Date();
      existingBooking.cancellationReason = 'New booking attempt - previous payment not completed';
      await existingBooking.save({ session });
    }

    // Calculate amount - Use early bird pricing if available and valid
    let basePrice = event.price; // Default to legacy price field
    
    // Check if event has pricing structure with early bird
    if (event.pricing && !event.pricing.isFree) {
      const now = new Date();
      const earlyBirdDeadline = event.pricing.earlyBirdDeadline;
      
      // Use early bird price if deadline hasn't passed
      if (earlyBirdDeadline && now <= new Date(earlyBirdDeadline) && event.pricing.earlyBirdPrice) {
        basePrice = event.pricing.earlyBirdPrice;
      } else if (event.pricing.basePrice) {
        basePrice = event.pricing.basePrice;
      }
    }
    
    let originalAmount = basePrice * requiredCapacity;
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

      // Calculate discount - pass groupSize and bookingType for proper fixed discount calculation
      discountAmount = coupon.calculateDiscount(originalAmount, requiredCapacity, bookingType);
      finalAmount = originalAmount - discountAmount;
      appliedCoupon = coupon;
    }

    // Create booking with complete information (status: created for payment pending)
    const bookingData = {
      user: req.user._id,
      event: eventId,
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

    const booking = new EventBooking(bookingData);
    await booking.save({ session });

    // Create Razorpay order
    const razorpayOrder = await createOrder({
      amount: finalAmount || 0,
      currency: 'INR',
      receipt: booking._id.toString(),
      notes: {
        eventId: event._id.toString(),
        userId: req.user._id.toString(),
        eventTitle: event.title,
        bookingType: bookingType,
        groupSize: requiredCapacity
      }
    });

    // Update booking with Razorpay order ID
    booking.razorpayOrderId = razorpayOrder.id;
    await booking.save({ session });

    await session.commitTransaction();

    res.status(201).json(
      new ApiResponse(201, {
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
        event: {
          id: event._id,
          title: event.title,
          location: event.location,
          startDate: event.startDate,
          price: event.price
        },
        coupon: appliedCoupon ? {
          code: appliedCoupon.code,
          discountAmount
        } : null
      }, 'Event booking order created successfully')
    );

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}));

// @route   POST /api/event-bookings/verify-payment
// @desc    Verify Razorpay payment and update booking status
// @access  Private
router.post('/verify-payment', authenticate, asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, 'Missing payment verification data');
  }

  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Verify payment with Razorpay
    const isValid = verifyPayment({
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      signature: razorpay_signature
    });

    if (!isValid) {
      throw new ApiError(400, 'Payment verification failed');
    }

    // Find the booking
    const booking = await EventBooking.findOne({
      razorpayOrderId: razorpay_order_id,
      user: req.user._id
    })
    .populate('event', 'title startDate endDate location imgUrl price')
    .populate('user', 'fullName email')
    .session(session);

    if (!booking) {
      throw new ApiError(404, 'Booking not found');
    }

    if (booking.status === 'paid') {
      throw new ApiError(400, 'Payment already verified');
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

    // Update event - increment current participants
    const event = await Event.findById(booking.event).session(session);
    if (event) {
      // For group bookings, increment by group size
      const increment = booking.bookingType === 'group' ? booking.groupInfo.groupSize : 1;
      
      // Increment both legacy and new capacity fields to ensure compatibility
      await Event.findByIdAndUpdate(
        booking.event,
        { 
          $inc: { 
            currentParticipants: increment,
            'capacity.currentParticipants': increment
          } 
        },
        { session, new: true }
      );
    }

    await session.commitTransaction();

    // Send event booking confirmation email (async, don't wait)
    emailService.sendEventBookingConfirmation(booking.user.email, {
      fullName: booking.user.fullName,
      bookingNumber: booking.bookingNumber,
      eventTitle: booking.event.title,
      location: booking.event.location,
      startDate: booking.event.startDate,
      endDate: booking.event.endDate,
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
    }).catch(err => console.error('Failed to send event booking confirmation email:', err));

    // Generate and send ticket via WhatsApp (async, don't wait)
    (async () => {
      try {
        // Generate ticket image
        const ticketBuffer = await generateEventTicket({
          bookingNumber: booking.bookingNumber,
          userName: booking.personalInfo.fullName,
          eventName: booking.event.title,
          location: booking.event.location,
          startDate: booking.event.startDate,
          endDate: booking.event.endDate,
          amount: booking.amount,
          bookingType: booking.bookingType,
          groupSize: booking.bookingType === 'group' ? booking.groupInfo.groupSize : 1,
          motorcycleInfo: booking.motorcycleInfo,
          qrData: JSON.stringify({
            bookingNumber: booking.bookingNumber,
            bookingId: booking._id.toString(),
            userName: booking.personalInfo.fullName,
            eventName: booking.event.title,
            startDate: booking.event.startDate,
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
            eventName: booking.event.title,
            amount: booking.amount
          }
        );

        logger.info(`Event ticket sent via WhatsApp for booking ${booking.bookingNumber}`);
      } catch (error) {
        logger.error('Failed to send event ticket via WhatsApp:', error.message);
        // Don't throw error - ticket generation/sending is not critical for payment verification
      }
    })();

    res.status(200).json(
      new ApiResponse(200, {
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
        event: {
          id: booking.event._id,
          title: booking.event.title,
          location: booking.event.location,
          startDate: booking.event.startDate
        }
      }, 'Payment verified and booking confirmed successfully')
    );

  } catch (error) {
    await session.abortTransaction();
    
    // If payment verification fails, update booking status
    await EventBooking.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id, user: req.user._id },
      { 
        status: 'failed',
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature
      }
    );

    throw error;
  } finally {
    session.endSession();
  }
}));

// @route   GET /api/event-bookings/my-bookings
// @desc    Get current user's event bookings
// @access  Private
router.get('/my-bookings', authenticate, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
  
  const { skip, limitNum } = getPagination(page, limit);
  const sort = getSortOptions(sortBy, sortOrder);

  // Build filter
  const filter = { user: req.user._id };
  if (status) {
    filter.status = status;
  }

  // Get bookings with populated event details
  const bookings = await EventBooking.find(filter)
    .populate('event', 'title startDate endDate location imgUrl eventType price maxParticipants')
    .sort(sort)
    .skip(skip)
    .limit(limitNum);

  const totalBookings = await EventBooking.countDocuments(filter);
  const pagination = getPaginationResult(page, limit, totalBookings);

  res.status(200).json(
    new ApiResponse(200, {
      bookings,
      pagination
    }, 'Event bookings retrieved successfully')
  );
}));

// @route   GET /api/event-bookings/:id
// @desc    Get specific event booking details
// @access  Private
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const booking = await EventBooking.findOne({
    _id: id,
    user: req.user._id
  }).populate('event', 'title startDate endDate location imgUrl details eventType price maxParticipants');

  if (!booking) {
    throw new ApiError(404, 'Event booking not found');
  }

  res.status(200).json(
    new ApiResponse(200, { booking }, 'Event booking retrieved successfully')
  );
}));

// @route   PUT /api/event-bookings/:id/cancel
// @desc    Cancel an event booking
// @access  Private
router.put('/:id/cancel', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { cancellationReason } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await EventBooking.findOne({
      _id: id,
      user: req.user._id
    }).populate('event').session(session);

    if (!booking) {
      throw new ApiError(404, 'Event booking not found');
    }

    if (booking.status === 'cancelled') {
      throw new ApiError(400, 'Booking is already cancelled');
    }

    if (booking.status === 'refunded') {
      throw new ApiError(400, 'Cannot cancel a refunded booking');
    }

    // Check if event has already started (cannot cancel after event starts)
    const now = new Date();
    if (booking.event.startDate && now >= booking.event.startDate) {
      throw new ApiError(400, 'Cannot cancel booking after event has started');
    }

    // Update booking status
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancellationReason = cancellationReason || 'Cancelled by user';

    await booking.save({ session });

    // Decrement current participants count based on booking type
    if (booking.status === 'paid') {
      const decrement = booking.bookingType === 'group' ? booking.groupInfo.groupSize : 1;
      await Event.findByIdAndUpdate(
        booking.event._id,
        { 
          $inc: { 
            currentParticipants: -decrement,
            'capacity.currentParticipants': -decrement
          } 
        },
        { session, new: true }
      );
    }

    await session.commitTransaction();

    res.status(200).json(
      new ApiResponse(200, { booking }, 'Event booking cancelled successfully')
    );

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}));

// @route   POST /api/event-bookings/:id/resend-ticket
// @desc    Resend event ticket to user via WhatsApp
// @access  Private
router.post('/:id/resend-ticket', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const booking = await EventBooking.findOne({
    _id: id,
    user: req.user._id
  })
    .populate('event', 'title startDate endDate location')
    .populate('user', 'fullName email');

  if (!booking) {
    throw new ApiError(404, 'Event booking not found');
  }

  if (booking.status !== 'paid') {
    throw new ApiError(400, 'Ticket can only be resent for confirmed bookings');
  }

  try {
    // Generate ticket image
    const ticketBuffer = await generateEventTicket({
      bookingNumber: booking.bookingNumber,
      userName: booking.personalInfo.fullName,
      eventName: booking.event.title,
      location: booking.event.location,
      startDate: booking.event.startDate,
      endDate: booking.event.endDate,
      amount: booking.amount,
      bookingType: booking.bookingType,
      groupSize: booking.bookingType === 'group' ? booking.groupInfo.groupSize : 1,
      motorcycleInfo: booking.motorcycleInfo,
      qrData: JSON.stringify({
        bookingNumber: booking.bookingNumber,
        bookingId: booking._id.toString(),
        userName: booking.personalInfo.fullName,
        eventName: booking.event.title,
        startDate: booking.event.startDate,
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
        eventName: booking.event.title,
        amount: booking.amount
      }
    );

    logger.info(`Event ticket resent via WhatsApp for booking ${booking.bookingNumber}`);

    res.status(200).json(
      new ApiResponse(200, {
        message: 'Ticket sent successfully to your WhatsApp',
        phoneNumber: booking.personalInfo.contactNumber
      }, 'Event ticket resent successfully')
    );

  } catch (error) {
    logger.error('Failed to resend event ticket:', error.message);
    throw new ApiError(500, `Failed to send ticket: ${error.message}`);
  }
}));

export default router;