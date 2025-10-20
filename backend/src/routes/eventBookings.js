import express from 'express';
import EventBooking from '../models/EventBooking.js';
import Event from '../models/Event.js';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { createOrder, verifyPayment } from '../services/razorpayService.js';
import { getPagination, getPaginationResult, getSortOptions } from '../utils/pagination.js';
import mongoose from 'mongoose';

const router = express.Router();

// @route   POST /api/event-bookings/create-order
// @desc    Create a complete event booking order with Razorpay integration
// @access  Private
router.post('/create-order', authenticate, validate(schemas.createEventBookingOrder), asyncHandler(async (req, res) => {
  const { 
    eventId, 
    personalInfo, 
    motorcycleInfo, 
    emergencyContact, 
    medicalHistory, 
    agreements 
  } = req.body;

  // Validation
  if (!eventId) {
    throw new ApiError(400, 'Event ID is required');
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

    // Check if event is full
    if (event.currentParticipants >= event.maxParticipants) {
      throw new ApiError(400, 'Event is full. No more bookings available');
    }

    // Check if user has already booked this event
    const existingBooking = await EventBooking.findOne({
      user: req.user._id,
      event: eventId,
      status: { $in: ['created', 'paid'] }
    }).session(session);

    if (existingBooking) {
      throw new ApiError(400, 'You have already booked this event');
    }

    // Create Razorpay order
    const orderData = {
      amount: event.price * 100, // Convert to paise
      currency: 'INR',
      receipt: `event_${eventId}_${req.user._id}_${Date.now()}`
    };

    const razorpayOrder = await createOrder(orderData);

    // Create booking record
    const booking = new EventBooking({
      user: req.user._id,
      event: eventId,
      personalInfo,
      motorcycleInfo,
      emergencyContact,
      medicalHistory,
      agreements,
      amount: event.price,
      razorpayOrderId: razorpayOrder.id,
      status: 'created'
    });

    await booking.save({ session });

    // Increment current participants count
    await Event.findByIdAndUpdate(
      eventId,
      { $inc: { currentParticipants: 1 } },
      { session }
    );

    await session.commitTransaction();

    res.status(201).json(
      new ApiResponse(201, {
        booking: {
          _id: booking._id,
          bookingNumber: booking.bookingNumber,
          amount: booking.amount,
          currency: booking.currency,
          status: booking.status
        },
        razorpayOrder: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency
        },
        event: {
          _id: event._id,
          title: event.title,
          startDate: event.startDate,
          location: event.location
        }
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

  try {
    // Verify payment with Razorpay
    const isValid = verifyPayment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    });

    if (!isValid) {
      throw new ApiError(400, 'Payment verification failed');
    }

    // Find and update booking
    const booking = await EventBooking.findOne({
      razorpayOrderId: razorpay_order_id,
      user: req.user._id
    }).populate('event', 'title startDate location imgUrl');

    if (!booking) {
      throw new ApiError(404, 'Booking not found');
    }

    // Update booking with payment details
    booking.razorpayPaymentId = razorpay_payment_id;
    booking.razorpaySignature = razorpay_signature;
    booking.status = 'paid';
    booking.paidAt = new Date();

    await booking.save();

    res.status(200).json(
      new ApiResponse(200, {
        booking: {
          _id: booking._id,
          bookingNumber: booking.bookingNumber,
          status: booking.status,
          amount: booking.amount,
          paidAt: booking.paidAt
        },
        event: booking.event
      }, 'Payment verified and booking confirmed successfully')
    );

  } catch (error) {
    // If payment verification fails, update booking status
    await EventBooking.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id, user: req.user._id },
      { 
        status: 'failed',
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature
      }
    );

    throw new ApiError(400, 'Payment verification failed. Please try again or contact support.');
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

    // Decrement current participants count
    await Event.findByIdAndUpdate(
      booking.event._id,
      { $inc: { currentParticipants: -1 } },
      { session }
    );

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

export default router;